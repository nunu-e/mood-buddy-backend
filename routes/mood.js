import express from "express";
import { body } from "express-validator";
import {
  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  getTodayEntry,
  getStats,
  getCalendar,
} from "../controllers/moodController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const moodEntryValidation = [
  body("mood")
    .isIn(["excited", "happy", "neutral", "sad", "anxious", "angry", "tired"])
    .withMessage(
      "Mood must be one of: excited, happy, neutral, sad, anxious, angry, tired"
    ),
  body("moodIntensity")
    .isInt({ min: 1, max: 10 })
    .withMessage("Mood intensity must be between 1 and 10"),
  body("journalEntry")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Journal entry cannot exceed 2000 characters"),
  body("tags.*")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Tag cannot exceed 20 characters"),
  body("activities.*")
    .optional()
    .isIn([
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
    ])
    .withMessage("Invalid activity"),
  body("sleepHours")
    .optional()
    .isInt({ min: 0, max: 24 })
    .withMessage("Sleep hours must be between 0 and 24"),
  body("weather")
    .optional()
    .isIn(["sunny", "cloudy", "rainy", "snowy", "windy", "stormy"])
    .withMessage(
      "Weather must be one of: sunny, cloudy, rainy, snowy, windy, stormy"
    ),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO 8601 date"),
];

router.use(protect);

router.route("/entries").get(getEntries).post(moodEntryValidation, createEntry);

router.route("/entries/today").get(getTodayEntry);

router
  .route("/entries/:id")
  .get(getEntry)
  .put(moodEntryValidation, updateEntry)
  .delete(deleteEntry);

router.route("/stats").get(getStats);

router.route("/calendar").get(getCalendar);

export default router;
