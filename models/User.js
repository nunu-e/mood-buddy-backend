import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    profile: {
      firstName: {
        type: String,
        trim: true,
        maxlength: [50, "First name cannot exceed 50 characters"],
      },
      lastName: {
        type: String,
        trim: true,
        maxlength: [50, "Last name cannot exceed 50 characters"],
      },
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ["male", "female", "other", "prefer-not-to-say"],
        default: "prefer-not-to-say",
      },
    },
    settings: {
      dailyReminder: {
        type: Boolean,
        default: true,
      },
      reminderTime: {
        type: String,
        default: "20:00",
      },
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "auto",
      },
      weekStartsOn: {
        type: String,
        enum: ["sunday", "monday"],
        default: "sunday",
      },
    },
    streak: {
      current: {
        type: Number,
        default: 0,
      },
      longest: {
        type: Number,
        default: 0,
      },
      lastEntryDate: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ "settings.dailyReminder": 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre("save", function (next) {
  if (this.isModified("lastLogin")) {
    this.lastLogin = new Date();
  }
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.updateStreak = function () {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (!this.streak.lastEntryDate) {
    this.streak.current = 1;
    this.streak.longest = 1;
  } else {
    const lastEntry = new Date(this.streak.lastEntryDate);
    const isConsecutive = lastEntry.toDateString() === yesterday.toDateString();

    if (isConsecutive) {
      this.streak.current += 1;
      this.streak.longest = Math.max(this.streak.longest, this.streak.current);
    } else if (lastEntry.toDateString() !== today.toDateString()) {
      this.streak.current = 1;
    }
  }

  this.streak.lastEntryDate = today;
  return this.streak.current;
};

userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true });
};

const User = mongoose.model("User", userSchema);

export default User;
