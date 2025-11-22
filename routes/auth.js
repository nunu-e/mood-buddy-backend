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
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and account management
 */

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
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: nunu123
 *               email:
 *                 type: string
 *                 example: nunu@example.com
 *               password:
 *                 type: string
 *                 example: pass1234
 */

router.post("/register", registerValidation, register);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and return token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: nunu@example.com
 *               password:
 *                 type: string
 *                 example: pass1234
 */

router.post("/login", loginValidation, login);
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get logged-in user info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data returned successfully
 *       401:
 *         description: Unauthorized - Token missing or invalid
 */

router.get("/me", protect, getMe);
/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                     example: Nunu
 *                   lastName:
 *                     type: string
 *                     example: Smith
 *                   gender:
 *                     type: string
 *                     enum: [male, female, other, prefer-not-to-say]
 *               settings:
 *                 type: object
 *                 properties:
 *                   theme:
 *                     type: string
 *                     enum: [light, dark, auto]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */

router.put("/profile", protect, profileValidation, updateProfile);
/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: oldPass123
 *               newPassword:
 *                 type: string
 *                 example: newPass456
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Unauthorized or wrong password
 */

router.put(
  "/change-password",
  protect,
  changePasswordValidation,
  changePassword
);
/**
 * @swagger
 * /api/auth/deactivate:
 *   put:
 *     summary: Deactivate user account
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deactivated successfully
 *       401:
 *         description: Unauthorized
 */

router.put("/deactivate", protect, deactivateAccount);

export default router;
