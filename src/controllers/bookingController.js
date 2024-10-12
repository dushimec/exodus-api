import Booking from "../models/booking.js";

const createBooking = async (req, res) => {
  console.log(req.user);
  const { postId } = req.params;
  const { date, details } = req.body;
  const userId = req.user.userId;

  if (!date || !details) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const newBooking = new Booking({
    postId,
    userId: userId,
    date,
    details,
  });

  try {
    const savedBooking = await newBooking.save().populate("userId", "name");
    res.status(201).json({ message: "Booking created successfully", savedBooking });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("userId", "name");
    res.status(200).json({ message: "Bookings found successfully", bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id).populate("userId", "name");
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

  try {
    const updatedBooking = await Booking.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("userId", "name");
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ updatedBooking });
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

export {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  cancelBooking,
  approveBooking,
};
