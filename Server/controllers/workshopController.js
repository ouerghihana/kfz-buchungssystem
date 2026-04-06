// controllers/workshopController.js
const Workshop = require("../models/Workshop");

const createWorkshop = async (req, res) => {
  try {
    const { name, address, phone, description } = req.body;
    const services = JSON.parse(req.body.services);
    const weeklyAvailability = JSON.parse(req.body.weeklyAvailability);

    if (!name || !address || !phone || !description || !services || !weeklyAvailability) {
      return res.status(400).json({ message: "Alle Felder sind erforderlich" });
    }

    const images = req.files?.map(file => file.filename) || [];

    const newWorkshop = new Workshop({
      owner: req.user.id,
      name,
      address,
      phone,
      description,
      images,
      services,
      weeklyAvailability,
    });

    await newWorkshop.save();

    res.status(201).json({ message: "Werkstatt erstellt", workshop: newWorkshop });
  } catch (err) {
    console.error("Fehler beim Speichern der Werkstatt:", err.message);
    res.status(500).json({ message: "Serverfehler", error: err.message });
  }
};


// Function to get the user's workshop
const getMyWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.find({ owner: req.user.id });
    if (!workshops || workshops.length === 0) {
      return res.status(404).json({ message: "Keine Werkstätten gefunden" });
    }
    res.json(workshops);
  } catch (err) {
    res.status(500).json({
      message: "Fehler beim Laden der Werkstätten",
      error: err.message,
    });
  }
};

// Function to update the user's workshop
const updateWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const workshop = await Workshop.findOne({ _id: id, owner: req.user.id });
    if (!workshop) {
      return res.status(404).json({ message: "Werkstatt nicht gefunden" });
    }

    const updates = req.body;
    const allowedFields = [
      "name",
      "address",
      "phone",
      "description",
      "images",
      "services",
      "weeklyavailability",
    ];

    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        workshop[key] = updates[key];
      }
    }

    await workshop.save();
    res.json({ message: "Werkstatt aktualisiert", workshop });
  } catch (err) {
    res.status(500).json({
      message: "Fehler beim Aktualisieren der Werkstatt",
      error: err.message,
    });
  }
};

// Function to delete the user's workshop
const deleteWorkshop = async (req, res) => {
  try {
    const deleted = await Workshop.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Werkstatt nicht gefunden" });
    }
    res.json({ message: "Werkstatt erfolgreich gelöscht" });
  } catch (err) {
    res.status(500).json({ message: "Serverfehler", error: err.message });
  }
};

// Function to get a workshop by ID
const getWorkshopById = async (req, res) => {
  try {
    console.log("Requested Workshop ID:", req.params.id); 
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: "Werkstatt nicht gefunden" });
    }
    res.status(200).json(workshop);
  } catch (error) {
    res.status(500).json({ message: "Serverfehler", error });
  }
};

// Function to get all workshops
const getAllWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.find().populate(
      "owner",
      "name email role",
    );
    res.status(200).json({ count: workshops.length, workshops });
  } catch (err) {
    res.status(500).json({
      message: "Fehler beim Abrufen der Werkstätten",
      error: err.message,
    });
  }
};

// Public route: Get all workshops
const getPublicWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.find();
    res.json(workshops);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Interner Serverfehler", error: err.message });
  }
};

// Advanced search with filtering
const getWorkshops = async (req, res) => {
  try {
    const { service, city, day, minPrice, maxPrice, sortBy } = req.query;
    const filter = {};

    if (service) {
      filter.services = {
        $elemMatch: { title: { $regex: service, $options: "i" } },
      };
    }

    if (city) {
      filter.address = { $regex: city, $options: "i" };
    }

    if (day) {
      filter.weeklyAvailability = {
        $elemMatch: { day: { $regex: day, $options: "i" } },
      };
    }

    if (minPrice || maxPrice) {
      const priceQuery = {};
      if (minPrice) priceQuery.$gte = Number(minPrice);
      if (maxPrice) priceQuery.$lte = Number(maxPrice);
      filter.services = {
        ...(filter.services || {}),
        $elemMatch: {
          ...(filter.services?.$elemMatch || {}),
          price: priceQuery,
        },
      };
    }

    let sortOption = {};
    if (sortBy === "price_asc") {
      sortOption = { "services.price": 1 };
    } else if (sortBy === "price_desc") {
      sortOption = { "services.price": -1 };
    }

    const workshops = await Workshop.find(filter)
      .select("name address description services weeklyAvailability images")
      .sort(sortOption);

    res.status(200).json(workshops);
  } catch (err) {
    res.status(500).json({
      message: "Fehler beim Filtern der Werkstätten",
      error: err.message,
    });
  }
};


const submitReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ message: 'Bewertung und Kommentar erforderlich' });
  }

  try {
    const workshop = await Workshop.findById(id);
    if (!workshop) return res.status(404).json({ message: 'Werkstatt nicht gefunden' });

    const review = {
      name: req.user.name,
      rating,
      comment
    };

    workshop.reviews.push(review);
    await workshop.save();

    res.status(201).json({ message: 'Bewertung gespeichert', review });
  } catch (err) {
    console.error('Fehler beim Speichern der Bewertung:', err.message);
    res.status(500).json({ message: 'Fehler beim Speichern der Bewertung' });
  }
};








module.exports = {
  createWorkshop,
  getMyWorkshops,
  updateWorkshop,
  deleteWorkshop,
  getAllWorkshops,
  getPublicWorkshops,
  getWorkshops,
  getWorkshopById,
  submitReview
};
