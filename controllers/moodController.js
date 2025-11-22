import { validationResult } from "express-validator";
import MoodEntry from "../models/MoodEntry.js";
import User from "../models/User.js";

export const getEntries = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    let query = { user: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await MoodEntry.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MoodEntry.countDocuments(query);

    res.status(200).json({
      success: true,
      count: entries.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: entries,
    });
  } catch (error) {
    next(error);
  }
};

export const getEntry = async (req, res, next) => {
  try {
    const entry = await MoodEntry.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Mood entry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};

export const createEntry = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    req.body.user = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingEntry = await MoodEntry.findOne({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: "Mood entry already exists for today",
      });
    }

    const entry = await MoodEntry.create(req.body);

    const user = await User.findById(req.user.id);
    const currentStreak = user.updateStreak();
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: "Mood entry created successfully",
      data: entry,
      streak: currentStreak,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEntry = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    let entry = await MoodEntry.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Mood entry not found",
      });
    }

    if (req.body.date) {
      const newDate = new Date(req.body.date);
      newDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(newDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const existingEntry = await MoodEntry.findOne({
        user: req.user.id,
        date: {
          $gte: newDate,
          $lt: nextDay,
        },
        _id: { $ne: req.params.id },
      });

      if (existingEntry) {
        return res.status(400).json({
          success: false,
          message: "Mood entry already exists for the selected date",
        });
      }
    }

    entry = await MoodEntry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Mood entry updated successfully",
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEntry = async (req, res, next) => {
  try {
    const entry = await MoodEntry.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Mood entry not found",
      });
    }

    await MoodEntry.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Mood entry deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getTodayEntry = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entry = await MoodEntry.findOne({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const moodStats = await MoodEntry.getMoodStats(req.user.id, parseInt(days));
    const activityStats = await MoodEntry.getActivityStats(
      req.user.id,
      parseInt(days)
    );

    const user = await User.findById(req.user.id);

    const averageIntensity = await MoodEntry.aggregate([
      {
        $match: {
          user: user._id,
          date: {
            $gte: new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: null,
          avgIntensity: { $avg: "$moodIntensity" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        moodDistribution: moodStats,
        activityFrequency: activityStats,
        streak: user.streak,
        averageMood:
          averageIntensity.length > 0
            ? Math.round(averageIntensity[0].avgIntensity * 10) / 10
            : 0,
        period: parseInt(days),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCalendar = async (req, res, next) => {
  try {
    const { year, month } = req.query;

    let startDate, endDate;

    if (year && month) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const entries = await MoodEntry.getEntriesByDateRange(
      req.user.id,
      startDate,
      endDate
    );

    const calendarData = entries.map((entry) => ({
      date: entry.formattedDate,
      mood: entry.mood,
      intensity: entry.moodIntensity,
      hasJournal: !!entry.journalEntry,
      activities: entry.activities,
    }));

    res.status(200).json({
      success: true,
      data: calendarData,
      period: {
        start: startDate,
        end: endDate,
      },
    });
  } catch (error) {
    next(error);
  }
};
