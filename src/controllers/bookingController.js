import Booking from "../models/booking.js";

const createBooking = async (req, res) => {
  const { postId } = req.params;
  const { date, details, name, email, travelers,  } = req.body; 

  if (!date || !details || !name || !email || !travelers) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const newBooking = new Booking({
    postId,
    userId: req.user.userId,
    name,
    email,
    date,
    details,
    travelers: travelers || 1,
  });

  try {
    const savedBooking = await newBooking.save();
    await savedBooking.populate("userId", "name");
    res.status(201).json({ message: "Booking created successfully", savedBooking });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  const { date, details, name, email, travelers, status } = req.body;

  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { date, details, name, email, travelers, status },
      { new: true }
    ).populate("userId", "name");

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res
      .status(200)
      .json({ message: "Booking updated successfully", updatedBooking });
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
    // Ensure only admins can approve
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Admin privileges required" });
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
