// routes/workshopRoutes.js
const express = require("express");
const router = express.Router();
const {
  createWorkshop,
  getMyWorkshops,
  getWorkshopById,
  updateWorkshop,
  deleteWorkshop,
  getAllWorkshops,
  getPublicWorkshops,
  submitReview

} = require("../controllers/workshopController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadmiddleware");

// Public route - für Kunden
router.get("/public", getPublicWorkshops);

// Für Werkstattbesitzer (Service Provider)
router.post(
  "/create",
  verifyToken,
  authorizeRoles("service_provider"),
  upload.array("images", 5),
  createWorkshop,
);
router.post(
  '/:id/reviews',
  verifyToken,
  authorizeRoles('customer'),
  submitReview
);
router.get(
  "/me",
  verifyToken,
  authorizeRoles("service_provider"),
  getMyWorkshops,
);

// Für Kunden (Workshop Details)
router.get(
  "/:id",
  getWorkshopById,
);

//  Werkstatt aktualisieren/löschen
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("service_provider"),
  updateWorkshop,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("service_provider"),
  deleteWorkshop,
);

//  Admin
router.get("/all", verifyToken, authorizeRoles("admin"), getAllWorkshops);

module.exports = router;
