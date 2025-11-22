import express from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deactivateAccount,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const registerValidation = [
  body("username")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").exists().withMessage("Password is required"),
];

const profileValidation = [
  body("profile.firstName")
    .optional()
    .isLength({ max: 50 })
    .withMessage("First name cannot exceed 50 characters"),
  body("profile.lastName")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Last name cannot exceed 50 characters"),
  body("profile.gender")
    .optional()
    .isIn(["male", "female", "other", "prefer-not-to-say"])
    .withMessage(
      "Gender must be one of: male, female, other, prefer-not-to-say"
    ),
  body("settings.theme")
    .optional()
    .isIn(["light", "dark", "auto"])
    .withMessage("Theme must be one of: light, dark, auto"),
];

const changePasswordValidation = [
  body("currentPassword").exists().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

router.get("/me", protect, getMe);
router.put("/profile", protect, profileValidation, updateProfile);
router.put(
  "/change-password",
  protect,
  changePasswordValidation,
  changePassword
);
router.put("/deactivate", protect, deactivateAccount);

export default router;
