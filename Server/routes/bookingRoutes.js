const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getWorkshopBookings,
  updateBookingStatus,
  getAllBookings,
  deleteBookingByAdmin,
  updateBookingStatusByAdmin,
  cancelMyBooking,
  getReservedSlots, deleteMyCanceledBooking, getNotifications,
  markNotificationsAsRead

} = require("../controllers/bookingController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

//  Route for customer to create a booking
router.post("/create", verifyToken, authorizeRoles("customer"), createBooking);
//  Customer can view their own bookings
router.get(
  "/my-bookings",
  verifyToken,
  authorizeRoles("customer"),
  getMyBookings,
);

router.get(
  "/reserved/:id",
  verifyToken,
  authorizeRoles("customer", "service_provider", "admin"),
  getReservedSlots
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("customer"),
  deleteMyCanceledBooking
);

// Service provider: View all bookings for their workshop
router.get(
  "/workshop-bookings",
  verifyToken,
  authorizeRoles("service_provider"),
  getWorkshopBookings,
);

//  Update booking status (only service_provider who owns it)
router.patch(
  "/:id/status",
  verifyToken,
  authorizeRoles("service_provider"),
  updateBookingStatus,
);
// Admin Route : View all bookings
router.get("/all", verifyToken, authorizeRoles("admin"), getAllBookings);
//  Delete booking
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteBookingByAdmin,
);

// Update booking status
router.patch(
  "/:id/admin-status",
  verifyToken,
  authorizeRoles("admin"),
  updateBookingStatusByAdmin,
);

// Kunden dürfen eigene Buchung stornieren (Status = 'canceled')
router.patch(
  "/cancel/:id",
  verifyToken,
  authorizeRoles("customer"),
  cancelMyBooking
);
router.get(
  "/notifications",
  verifyToken,
  authorizeRoles("customer", "service_provider"),
  getNotifications
);
router.patch("/notifications/mark-read", verifyToken, markNotificationsAsRead);



module.exports = router;
