import express from "express";
import { Pothole } from "../models/Pothole.js";
import axios from "axios";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config();



const getLocation = async (latitude, longitude,) => {
    // console.log(process.env.API_KEY);
    const url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${process.env.API_KEY}`;
    const response = await axios.get(url);
    if (response) {
        return response.data[0]?.name;
    }
    return "Unknown";
}


router.post("/", async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      pothole_id,
      severity,
      pothole_detected,
      image_url,
    } = req.body;

    if (
      !latitude ||
      !longitude ||
      !severity ||
      pothole_detected === undefined ||
      !image_url ||
      !["low", "medium", "high"].includes(severity.toLowerCase()) ||
      !pothole_id
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const place = await getLocation(latitude, longitude);

    const pothole = new Pothole({
      latitude,
      longitude,
      pothole_id,
      place,
      severity: severity.toLowerCase(),
      pothole_detected,
      image_url,
    });

    await pothole.save();

    res.status(201).json({
      message: "Pothole data saved successfully",
      data: pothole,
    });
  } catch (error) {
    console.error("Error saving pothole data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const potholes = await Pothole.find();
    res.json(potholes);
  } catch (error) {
    res.status(500).json({ error: "Error fetching potholes" });
  }
});

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const potholes = await Pothole.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Pothole.countDocuments();

    res.json({
      potholes,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPotholes: total,
    });
  } catch (error) {
    console.error("Error fetching potholes:", error);
    res.status(500).json({ error: "Error fetching potholes" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pothole = await Pothole.findOne({
      pothole_id: parseInt(req.params.id),
    });
    if (!pothole) {
      return res.status(404).json({ error: "Pothole not found" });
    }
    res.json(pothole);
  } catch (error) {
    console.error("Error fetching pothole:", error);
    res.status(500).json({ error: "Error fetching pothole" });
  }
});

router.get("/filter/severity/:severity", async (req, res) => {
  try {
    const potholes = await Pothole.find({
      severity: req.params.severity.toLowerCase(),
    });
    res.json(potholes);
  } catch (error) {
    console.error("Error filtering potholes:", error);
    res.status(500).json({ error: "Error filtering potholes" });
  }
});

router.get("/nearby/search", async (req, res) => {
  try {
    const { lat, lng, maxDistance = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: "Latitude and longitude are required",
      });
    }

    const potholes = await Pothole.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
    });

    res.json(potholes);
  } catch (error) {
    console.error("Error finding nearby potholes:", error);
    res.status(500).json({ error: "Error finding nearby potholes" });
  }
});

export default router;
