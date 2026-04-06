const Workshop = require("../models/Workshop");
const Booking = require("../models/Booking");
const sendMail = require("../utils/sendMail");

const createBooking = async (req, res) => {
  console.log("📥 Neue Buchungsanfrage erhalten");
  console.log("📦 Body:", req.body);
  console.log("🔑 User aus Token:", req.user);
  console.log(req.user.role)
  const { workshopId, service, dateTime } = req.body;

  try {
    if (!workshopId || !service || !dateTime) {
      return res.status(400).json({ message: "Alle Felder sind erforderlich." });
    }

    const existingBooking = await Booking.findOne({ workshop: workshopId, dateTime });
    if (existingBooking) {
      return res.status(400).json({ message: "Dieser Termin ist bereits reserviert." });
    }

    const workshop = await Workshop.findById(workshopId).populate("owner", "email name");
    if (!workshop) {
      return res.status(404).json({ message: "Werkstatt nicht gefunden." });
    }

    const validService = workshop.services.find((s) => s.title === service?.title);
    if (!validService) {
      return res.status(400).json({ message: "Ungültiger Service für diese Werkstatt." });
    }

    const newBooking = new Booking({
      customer: req.user.id,
      workshop: workshopId,
      service: validService,
      dateTime,
      status: "pending",
    });

    await newBooking.save();

    await sendMail(
      req.user.email,
      "📅 Buchung empfangen – KFZ Buchungssystem",
      `<p>Hallo <strong>${req.user.name}</strong>,</p>
       <p>Ihre Buchung für <b>${validService.title}</b> am <b>${dateTime}</b> wurde empfangen.</p>
       <p>Status: <strong>Ausstehend</strong></p>`
    );

    await sendMail(
      workshop.owner.email,
      "📥 Neue Buchung erhalten – KFZ Buchungssystem",
      `<p>Hallo <strong>${workshop.owner.name}</strong>,</p>
       <p>Ein Kunde hat eine Buchung für <strong>${validService.title}</strong> am <strong>${dateTime}</strong> gemacht.</p>
       <p>Bitte überprüfen Sie Ihr Dashboard.</p>`
    );

    res.status(201).json({ message: "Buchung erfolgreich erstellt", booking: newBooking });

  } catch (err) {
    console.error("❗ Fehler beim Erstellen der Buchung:", err.message);
    res.status(500).json({ message: "Fehler beim Erstellen der Buchung", error: err.message });
  }
};

const getReservedSlots = async (req, res) => {
  try {
    const bookings = await Booking.find({
      workshop: req.params.id,
      status: { $ne: 'canceled' }
    }).select('dateTime');

    const reserved = bookings.map(b => b.dateTime.toISOString().slice(0, 16));
    res.json(reserved);
  } catch (err) {
    console.error('❗ Fehler beim Laden reservierter Termine:', err.message);
    res.status(500).json({ message: 'Fehler beim Laden reservierter Termine' });
  }
};

// Get all bookings for a specific workshop
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id }).populate(
      "workshop",
      "name address",
    );

    res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch bookings", error: err.message });
  }
};
// to allow customers to cancel their own bookings
const cancelMyBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Buchung nicht gefunden" });
    }

    // Check if the booking belongs to the logged-in user
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Nicht autorisiert, diese Buchung zu stornieren" });
    }

    booking.status = "canceled";
    await booking.save();

    res.json({ message: "Buchung wurde storniert", booking });
  } catch (err) {
    res.status(500).json({
      message: "Fehler beim Stornieren der Buchung",
      error: err.message,
    });
  }
};
const deleteMyCanceledBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Buchung nicht gefunden." });
    }

    // Überprüfen, ob die Buchung dem eingeloggten Kunden gehört
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Nicht autorisiert, diese Buchung zu löschen." });
    }

    // Nur stornierte Buchungen dürfen gelöscht werden
    if (booking.status !== "canceled") {
      return res.status(400).json({ message: "Nur stornierte Buchungen können gelöscht werden." });
    }

    await booking.deleteOne();

    res.json({ message: "Buchung erfolgreich gelöscht." });
  } catch (err) {
    console.error("❌ Fehler beim Löschen der Buchung:", err.message);
    res.status(500).json({ message: "Fehler beim Löschen der Buchung", error: err.message });
  }
};



// Get all bookings for a specific workshop
const getWorkshopBookings = async (req, res) => {
  try {
    const workshop = await Workshop.findOne({ owner: req.user.id });
    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    const bookings = await Booking.find({ workshop: workshop._id })
      .populate("customer", "name email")
      .sort({ dateTime: 1 });

    res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch bookings", error: err.message });
  }
};
// Update booking status for a specific workshop (admin only)
const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatus = ["pending", "confirmed", "canceled"];
  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const booking = await Booking.findById(id).populate("workshop");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if the logged-in service_provider owns this workshop
    const workshop = await Workshop.findOne({
      _id: booking.workshop._id,
      owner: req.user.id,
    });

    if (!workshop) {
      return res
        .status(403)
        .json({ message: "Access denied: not your booking" });
    }

    booking.status = status;
    await booking.save();
    // Send a confirmation email to the customer if booking is confirmed
    await sendMail(
      booking.customer.email,
      `🔔 Booking ${status} – KFZ Buchungssystem`,
      `<p>Hello,</p>
         <p>Your booking for <b>${booking.service.title}</b> on <b>${booking.dateTime}</b> has been <b>${status}</b>.</p>`,
    );

    res.json({ message: `Booking status updated to ${status}`, booking });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update status", error: err.message });
  }
};
// admin can see every booking in the system
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customer", "name email")
      .populate("workshop", "name address");

    res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch all bookings", error: err.message });
  }
};
//  admin can delete a booking
const deleteBookingByAdmin = async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking deleted by admin", deleted });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete booking", error: err.message });
  }
};
//  admin can update a booking status
const updateBookingStatusByAdmin = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatus = ["pending", "confirmed", "canceled"];
  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: `Status updated to ${status} by admin`, booking });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update status", error: err.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    let filter = {};
    let notifications = [];

    if (req.user.role === "customer") {
      filter = {
        customer: req.user.id,
        isNotified: false,
        status: { $in: ["confirmed", "canceled"] },
      };

      const bookings = await Booking.find(filter)
        .populate("workshop", "name")
        .sort({ dateTime: -1 })
        .limit(10);

      notifications = bookings.map((booking) => ({
        _id: booking._id,
        message: `Ihre Buchung für ${booking.service.title} bei ${booking.workshop?.name || "Werkstatt"} wurde ${booking.status}.`,
        read: booking.isNotified,
      }));
    }

    else if (req.user.role === "service_provider") {
      const workshop = await Workshop.findOne({ owner: req.user.id });
      if (!workshop)
        return res.status(404).json({ message: "Keine Werkstatt gefunden" });

      filter = {
        workshop: workshop._id,
        isNotified: false,
        status: "pending",
      };

      const bookings = await Booking.find(filter)
        .populate("customer", "name")
        .sort({ dateTime: -1 })
        .limit(10);

      notifications = bookings.map((booking) => ({
        _id: booking._id,
        message: `Neue Buchung von ${booking.customer?.name || "ein Kunde"} für ${booking.service.title}.`,
        read: booking.isNotified,
      }));
    }

    res.json(notifications);
  } catch (err) {
    console.error("Fehler beim Laden der Benachrichtigungen:", err.message);
    res.status(500).json({ message: "Fehler beim Laden der Benachrichtigungen" });
  }
};



const markNotificationsAsRead = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "customer") {
      filter = { customer: req.user.id, isNotified: false };
    } else if (req.user.role === "service_provider") {
      const workshop = await Workshop.findOne({ owner: req.user.id });
      if (!workshop) return res.status(404).json({ message: "Keine Werkstatt gefunden" });
      filter = { workshop: workshop._id, isNotified: false };
    }

    await Booking.updateMany(filter, { $set: { isNotified: true } });
    res.json({ message: "Benachrichtigungen als gelesen markiert" });
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Aktualisieren" });
  }
};


module.exports = {
  createBooking,
  getMyBookings,
  getWorkshopBookings,
  updateBookingStatus,
  getAllBookings,
  deleteBookingByAdmin,
  updateBookingStatusByAdmin,
  cancelMyBooking,
  getReservedSlots,
  deleteMyCanceledBooking,
  getNotifications,
  markNotificationsAsRead 
};
