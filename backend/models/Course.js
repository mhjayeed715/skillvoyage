const mongoose = require("mongoose")

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    youtube: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

module.exports = mongoose.models.Course || mongoose.model("Course", CourseSchema)
