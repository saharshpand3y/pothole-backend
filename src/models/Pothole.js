import mongoose from "mongoose";

const potholeSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    pothole_id: { type:Number, required: true },
    place: { type: String, required: true },
    severity: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
    },
    pothole_detected: { type: Boolean, required: true },
    image_url: { type: String, required: true },
    location: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
    },
  },
  { timestamps: true }
);

// Create geospatial index
potholeSchema.index({ location: "2dsphere" });

// Auto-generate location field from latitude/longitude
potholeSchema.pre("save", function (next) {
  this.location = {
    type: "Point",
    coordinates: [this.longitude, this.latitude],
  };
  next();
});

export const Pothole = mongoose.model("Pothole", potholeSchema);
