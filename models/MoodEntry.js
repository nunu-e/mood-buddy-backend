import mongoose from "mongoose";

const moodEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    mood: {
      type: String,
      required: [true, "Mood is required"],
      enum: {
        values: [
          "excited",
          "happy",
          "neutral",
          "sad",
          "anxious",
          "angry",
          "tired",
        ],
        message:
          "Mood must be one of: excited, happy, neutral, sad, anxious, angry, tired",
      },
    },
    moodIntensity: {
      type: Number,
      required: [true, "Mood intensity is required"],
      min: [1, "Mood intensity must be at least 1"],
      max: [10, "Mood intensity cannot exceed 10"],
      default: 5,
    },
    journalEntry: {
      type: String,
      maxlength: [2000, "Journal entry cannot exceed 2000 characters"],
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [20, "Tag cannot exceed 20 characters"],
      },
    ],
    activities: [
      {
        type: String,
        enum: [
          "exercise",
          "work",
          "social",
          "family",
          "hobby",
          "rest",
          "learning",
          "nature",
          "shopping",
          "cleaning",
          "cooking",
          "travel",
          "entertainment",
          "self-care",
        ],
      },
    ],
    sleepHours: {
      type: Number,
      min: [0, "Sleep hours cannot be negative"],
      max: [24, "Sleep hours cannot exceed 24"],
    },
    weather: {
      type: String,
      enum: ["sunny", "cloudy", "rainy", "snowy", "windy", "stormy"],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

moodEntrySchema.index({ user: 1, date: 1 }, { unique: true });

moodEntrySchema.index({ user: 1, createdAt: -1 });
moodEntrySchema.index({ mood: 1 });
moodEntrySchema.index({ date: 1 });

moodEntrySchema.virtual("formattedDate").get(function () {
  return this.date.toISOString().split("T")[0];
});

moodEntrySchema.virtual("dayOfWeek").get(function () {
  return this.date.getDay();
});

moodEntrySchema.statics.getEntriesByDateRange = function (
  userId,
  startDate,
  endDate
) {
  return this.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: -1 });
};

moodEntrySchema.statics.getMoodStats = async function (userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$mood",
        count: { $sum: 1 },
        avgIntensity: { $avg: "$moodIntensity" },
      },
    },
    {
      $project: {
        mood: "$_id",
        count: 1,
        avgIntensity: { $round: ["$avgIntensity", 2] },
        _id: 0,
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

moodEntrySchema.statics.getActivityStats = async function (userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate },
      },
    },
    {
      $unwind: "$activities",
    },
    {
      $group: {
        _id: "$activities",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        activity: "$_id",
        count: 1,
        _id: 0,
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

moodEntrySchema.methods.isFromToday = function () {
  const today = new Date();
  return this.date.toDateString() === today.toDateString();
};

moodEntrySchema.pre("save", function (next) {
  if (this.date > new Date()) {
    next(new Error("Entry date cannot be in the future"));
  }
  next();
});

const MoodEntry = mongoose.model("MoodEntry", moodEntrySchema);

export default MoodEntry;
