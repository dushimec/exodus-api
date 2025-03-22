import Booking from "../models/booking.js";
import sendEmail from "../utils/emailService.js";
import Post from "../models/post.js";

const createBooking = async (req, res) => {
  const { postId } = req.params;
  const { date, name, email, travelers, phone } = req.body;

  if (!date || !name || !email || !travelers || !phone) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const newBooking = new Booking({
    postId,
    userId: req.user.userId,
    name,
    email,
    date,
    travelers: travelers || 1,
    phone,
  });

  try {
    const savedBooking = await newBooking.save();
    await savedBooking.populate("userId", "name");
    await savedBooking.populate("postId","destination").execPopulate();

    // Send booking information to EMAIL_USER
    const adminSubject = "New Booking Created";
    const adminText = `Booking Details:\n\nName: ${name}\nEmail: ${email}\nDate: ${date}\nTravelers: ${travelers}\nPhone: ${phone}\nDestination: ${post.destination}\nStatus: ${savedBooking.status}\n\nBooking ID: ${savedBooking._id}\nUser ID: ${savedBooking.userId._id}\nPost ID: ${savedBooking.postId._id}\n\nPlease review the booking details and take necessary actions.`;
    await sendEmail(process.env.EMAIL_USER, process.env.EMAIL_USER, adminSubject, adminText);

    // Send confirmation email to user
    const userSubject = "Booking Confirmation";
    const userText = `Dear ${name},\n\nYour booking has been confirmed for Destination of ${post.destination}\nStatus: ${savedBooking.status} on ${date}.\n\nBooking ID: ${savedBooking._id}\nUser ID: ${savedBooking.userId._id}\nPost ID: ${savedBooking.postId._id}\n\nThank you for booking with us.`;
    await sendEmail(process.env.EMAIL_USER, email, userSubject, userText);

    res.status(201).json({ message: "Booking created successfully", savedBooking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name")
      .populate("postId", "destination");
    res.status(200).json({ message: "Bookings found successfully", bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id)
      .populate("userId", "name")
      .populate("postId", "destination");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBooking = async (req, res) => {
  const { id } = req.params;
  const { date, name, email, travelers, status } = req.body;

  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { date, name, email, travelers, status },
      { new: true }
    ).populate("userId", "name");

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking updated successfully", updatedBooking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBooking = await Booking.findByIdAndDelete(id);
    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cancelBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    booking.status = "canceled";
    await booking.save();
    res.json({ message: "Booking canceled successfully", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveBooking = async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin privileges required" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    booking.status = "approved";
    await booking.save();
    res.json({ message: "Booking approved successfully", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPerformanceOverview = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const bookingsByDate = await Booking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      totalBookings,
      bookingsByStatus,
      bookingsByDate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRecentBookings = async (req, res) => {
  const { limit = 10 } = req.query;

  try {
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate("userId", "name");

    res.status(200).json({ message: "Recent bookings fetched successfully", recentBookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  cancelBooking,
  approveBooking,
  getPerformanceOverview,
  getRecentBookings,
};

