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
/**
 * @openapi
 * tags:
 *   name: Mood
 *   description: Mood tracking routes
 */
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
/**
 * @swagger
 * /api/mood/entries:
 *   post:
 *     summary: Create a new mood entry
 *     tags: [Mood]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mood
 *               - moodIntensity
 *             properties:
 *               mood:
 *                 type: string
 *                 enum: [excited, happy, neutral, sad, anxious, angry, tired]
 *                 example: happy
 *               moodIntensity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 7
 *               journalEntry:
 *                 type: string
 *                 example: Had a productive day at work.
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["work", "exercise"]
 *               activities:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [exercise, work, social, family, hobby, rest, learning, nature, shopping, cleaning, cooking, travel, entertainment, self-care]
 *                 example: ["exercise", "social"]
 *               sleepHours:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 24
 *                 example: 8
 *               weather:
 *                 type: string
 *                 enum: [sunny, cloudy, rainy, snowy, windy, stormy]
 *                 example: sunny
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2025-11-22
 *     responses:
 *       201:
 *         description: Mood entry created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/mood/entries:
 *   get:
 *     summary: Get all mood entries of the logged-in user
 *     tags: [Mood]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of mood entries
 *       401:
 *         description: Unauthorized
 */

router.route("/entries").get(getEntries).post(moodEntryValidation, createEntry);

/**
 * @swagger
 * /api/mood/entries/today:
 *   get:
 *     summary: Get the mood entry for today
 *     tags: [Mood]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns today’s mood entry
 *       401:
 *         description: Unauthorized
 */

router.route("/entries/today").get(getTodayEntry);

/**
 * @swagger
 * /api/mood/entries/{id}:
 *   get:
 *     summary: Get a single mood entry by ID
 *     tags: [Mood]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Mood entry ID
 *     responses:
 *       200:
 *         description: Mood entry retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Entry not found
 */

/**
 * @swagger
 * /api/mood/entries/{id}:
 *   put:
 *     summary: Update a mood entry
 *     tags: [Mood]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Mood entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mood:
 *                 type: string
 *                 enum: [excited, happy, neutral, sad, anxious, angry, tired]
 *               moodIntensity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               journalEntry:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               activities:
 *                 type: array
 *                 items:
 *                   type: string
 *               sleepHours:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 24
 *               weather:
 *                 type: string
 *                 enum: [sunny, cloudy, rainy, snowy, windy, stormy]
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Mood entry updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Entry not found
 */

/**
 * @swagger
 * /api/mood/entries/{id}:
 *   delete:
 *     summary: Delete a mood entry
 *     tags: [Mood]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Mood entry ID
 *     responses:
 *       200:
 *         description: Entry deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Entry not found
 */

router
  .route("/entries/:id")
  .get(getEntry)
  .put(moodEntryValidation, updateEntry)
  .delete(deleteEntry);

/**
 * @swagger
 * /api/mood/stats:
 *   get:
 *     summary: Get mood statistics (e.g., average intensity, mood counts)
 *     tags: [Mood]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns mood statistics
 *       401:
 *         description: Unauthorized
 */

router.route("/stats").get(getStats);

/**
 * @swagger
 * /api/mood/calendar:
 *   get:
 *     summary: Get mood entries formatted for calendar view
 *     tags: [Mood]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns calendar-formatted entries
 *       401:
 *         description: Unauthorized
 */

router.route("/calendar").get(getCalendar);

export default router;
