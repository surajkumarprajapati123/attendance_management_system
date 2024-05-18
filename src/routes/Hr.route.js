const express = require("express");
const { HrController } = require("../controllers");
const HRAuth = require("../middleware/HRAuth");
const upload = require("../middleware/multer");

const router = express.Router();

router
  .route("/avatar-update")
  .put(HRAuth, upload.single("avatar"), HrController.UpdateHrAvatar);
router.route("/update").put(HRAuth, HrController.UpdateUserWithID);
router.route("/search").get(HRAuth, HrController.SearchbyApplicationNumber);
router.route("/profile").get(HRAuth, HrController.GetProfile);
router.route("/reset-password").put(HRAuth, HrController.resetPassword);
router.route("/logout").post(HRAuth, HrController.LogoutUser);
router.route("/create").post(HRAuth, HrController.ApplyleaveApplictionByHR);
router.route("/leave-update").put(HRAuth, HrController.updateLeaveApplication);

module.exports = router;

// Get Profile
/**
 * @swagger
 * /hr/profile:
 *   get:
 *     summary: Get Hr profile
 *     description: Retrieve the profile of the authenticated user.
 *     tags: [Hr]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

// reset password
/**
 * @swagger
 * /hr/reset-password:
 *   put:
 *     summary: Reset password
 *     description: Reset the password for the hr.
 *     tags: [Hr]
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
// admin logout
/**
 * @swagger
 * /hr/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Hr]
 *     responses:
 *       200:
 *         description: User successfully logged out
 *       401:
 *         description: Unauthorized - User not logged in
 */

// Avatar image  updated
/**
 * @swagger
 * /hr/avatar-update:
 *   put:
 *     summary: Update profile image
 *     description: Update the user's profile image .
 *     tags: [Hr]
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
 *                 description: The profile image file to update
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

// Search Application

/**
 * @swagger
 * /hr/search:
 *   get:
 *     summary: Search for a leave application by application number
 *     tags: [Hr]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: applicationNumber
 *         required: true
 *         description: Application number of the leave application
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leave application found
 *       404:
 *         description: Leave application not found
 *       401:
 *         description: Unauthorized, invalid or expired token
 *       500:
 *         description: Internal server error
 */

// Apply Leave Application
/**
 * @swagger
 * /hr/create:
 *   post:
 *     summary: Apply for leave
 *     tags: [Hr]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the leave (DD/MM/YYYY)
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the leave (DD/MM/YYYY)
 *               reason:
 *                 type: string
 *                 description: Reason for the leave
 *                 example: "Family vacation"
 *             required:
 *               - startDate
 *               - endDate
 *               - reason
 *     responses:
 *       200:
 *         description: Leave application submitted successfully
 *       401:
 *         description: Unauthorized, invalid or expired token
 *       500:
 *         description: Internal server error
 */
// update Applicaiotn using id
/**
 * @swagger
 * /hr/leave-update:
 *   put:
 *     summary: Update leave application by ID
 *     tags: [Hr]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the leave
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the leave
 *               reason:
 *                 type: string
 *                 description: Reason for the leave
 *     responses:
 *       200:
 *         description: Leave application updated successfully
 *       401:
 *         description: Unauthorized, invalid, or expired token
 *       500:
 *         description: Internal server error
 */
