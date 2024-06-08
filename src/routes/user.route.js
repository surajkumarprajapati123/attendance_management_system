const express = require("express");
const { UserController } = require("../controllers");
const Auth = require("../middleware/auth");
const HRAuth = require("../middleware/HRAuth");
const validate = require("../middleware/validate");
const { UserValidation } = require("../validation");
const upload = require("../middleware/multer");

const router = express.Router();

router.route("/create").post(UserController.RegisterUser);
router.route("/login").post(UserController.LoginUser);
router.route("/forgot-link").post(UserController.ForgatePassword);
router.route("/reset/:token").post(UserController.ResetPassword);
router.route("/profile").get(Auth, UserController.GetProfile);
router.route("/update").put(Auth, UserController.updateProfile);
router.route("/verify-email").post(UserController.VerifyOtpUser);
router.route("/reset-password").put(Auth, UserController.ResetPassworItself);
router.route("/refresh-token").post(UserController.RefreshTokenController);
router.route("/logout").post(Auth, UserController.LogoutUser);
router
  .route("/avatar-update")
  .patch(Auth, upload.single("avatar"), UserController.UpdateAvater);

router.route("/department").post(HRAuth, UserController.FindAllDepartmentUser);

router.get("/test", Auth, (req, res) => {
  console.log(req.user);
  res.send("testin routng is working");
});

router
  .route("/avatar-upload")
  .patch(Auth, upload.single("avatar"), UserController.UploadAvatar);

module.exports = router;
// Register Schema

/**
 * @swagger
 * /user/avatar-upload:
 *   patch:
 *     summary: Upload user avatar
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Choose an image file for your avatar
 *     responses:
 *       "200":
 *         description: Avatar uploaded successfully
 *       "400":
 *         description: Bad request, check the request body
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /user/department:
 *   post:
 *     summary: Find all users by department only access for Department HR
 *     description: Retrieves all users belonging to a specific department.
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departmentName:
 *                 type: string
 *                 description: The name of the department to search users for.
 *     responses:
 *       200:
 *         description: Success. Returns users in the specified department.
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRegistration:
 *       type: object
 *       required:
 *         - name
 *         - username
 *         - email
 *         - password
 *         - departmentName
 *       properties:
 *         name:
 *           type: string
 *           description: The user's full name
 *         username:
 *           type: string
 *           description: The user's chosen username
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         password:
 *           type: string
 *           format: password
 *           description: The user's chosen password
 *         departmentName:
 *           type: string
 *           description: The name of the department the user belongs to
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the user account was created
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserLogin:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: The user's full name
 *         username:
 *           type: string
 *           description: The user's chosen username
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         password:
 *           type: string
 *           format: password
 *           description: The user's chosen password
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the user account was created
 */

// Register user  Swagger
/**
 * @swagger
 * /user/create:
 *   post:
 *     summary: Register as user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - username
 *               - departmentName  # Add departmentName to the required fields
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               departmentName:
 *                 type: string
 *                 description: The name of the department the user belongs to
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login
 *     tags: [User]
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
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             example:
 *               email: fake@example.com
 *               password: password1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "401":
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: Invalid email or password
 */

// logout
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *             example:
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJhYzUzNDk1NGI1NDEzOTgwNmMxMTIiLCJpYXQiOjE1ODkyOTg0ODQsImV4cCI6MTU4OTMwMDI4NH0.m1U63blB0MLej_WfB7yC2FTMnCziif9X8yzwDEfJXAg
 *     responses:
 *       "204":
 *         description: No content
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
// Verify email
/**
 * @swagger
 * /user/verify-email:
 *   post:
 *     summary: Send verification email
 *     description: An email will be sent with a token to verify the email. Include OTP in the request body for additional security.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *                 description: The one-time password (OTP) sent to the user's email for verification
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
// To Get Profile
/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the profile information of the authenticated user.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
// update user itself
/**
 * @swagger
 * /user/update:
 *   put:
 *     summary: Update user information
 *     description: Logged-in users can update their own user information. Only admins can update other users.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the user
 *               email:
 *                 type: string
 *                 format: email
 *                 description: New email address for the user
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: New password for the user. At least one number and one letter required.
 *               username:
 *                 type: string
 *                 description: New username for the user
 *             example:
 *               name: New Name
 *               email: newemail@example.com
 *               password: newpassword1
 *               username: newusername1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

// Send Reset Link using email
/**
 * @swagger
 * /user/forgot-link:
 *   post:
 *     summary: Send password reset link via email
 *     description: Send a password reset link to the user's email address.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to send the password reset link to.
 *             example:
 *               email: user@example.com
 *     responses:
 *       "204":
 *         description: No Content
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
// Set new password
/**
 * @swagger
 * /user/reset/{token}:
 *   post:
 *     summary: Set new password
 *     description: Set a new password for the user.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token for password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: New password for the user. At least one number and one letter required.
 *             example:
 *               password: newpassword1
 *     responses:
 *       "204":
 *         description: No Content
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
// Reset password itself
// reset password
/**
 * @swagger
 * /user/reset-password:
 *   put:
 *     summary: Reset password
 *     description: Reset the password for the user.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Old password of the user.
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: New password for the user. At least one number and one letter required.
 *             example:
 *               oldPassword: oldpassword
 *               newPassword: newpassword1
 *     responses:
 *       "204":
 *         description: No Content
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
// Refresh token
/**
 * @swagger
 * /user/refresh-token:
 *   post:
 *     summary: Refresh Access Token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               RefreshToken:
 *                 type: string
 *                 description: The refresh token to generate a new access token.
 *     responses:
 *       "200":
 *         description: Access token refreshed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message.
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: object
 *                       properties:
 *                         AccessToken:
 *                           type: string
 *                           description: The new access token.
 *                     RefreshToken:
 *                       type: object
 *                       properties:
 *                         NewRefreshToken:
 *                           type: string
 *                           description: The new refresh token.
 */
// Log out user
/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User successfully logged out
 *       401:
 *         description: Unauthorized - User not logged in
 */

// Update user avatar image profile
/**
 * @swagger
 * /user/avatar-update:
 *   put:
 *     summary: Update profile image
 *     description: Update the user's profile image.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profile_image:
 *                 type: string
 *                 format: binary
 *                 description: The profile image file to update
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "400":
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "401":
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "403":
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "404":
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
