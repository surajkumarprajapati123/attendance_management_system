const express = require("express");
const Auth = require("../middleware/auth");
const { LeaveController } = require("../controllers");
const AdminAuth = require("../middleware/AdminAuth");

const router = express.Router();

router.route("/create").post(Auth, LeaveController.ApplyLeave);
router.route("/update_id").put(Auth, LeaveController.updateApplicationById);
router
  .route("/update_applicaiotn_no")
  .put(Auth, LeaveController.UpdateApplicationByAllicaitonNumber);
router
  .route("/pending")
  .get(AdminAuth, LeaveController.GetAllPendingApplicationList);
router
  .route("/reject")
  .get(AdminAuth, LeaveController.GetAllRejectApplicationList);
router
  .route("/approved")
  .get(AdminAuth, LeaveController.GetAllApprovedAppicationList);
router.route("/search").get(Auth, LeaveController.SerchByApplicationNumber);

module.exports = router;

// Leave Applicaiton Apply
/**
 * @swagger
 * tags:
 *   name: Leave
 *   description: API endpoints for managing leave applications
 */

/**
 * @swagger
 * /leave/create:
 *   post:
 *     summary: Apply for leave
 *     tags: [Leave]
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
 * /leave/update_id:
 *   put:
 *     summary: Update leave application by ID
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Define your request body properties here
 *     responses:
 *       200:
 *         description: Leave application updated successfully
 *       401:
 *         description: Unauthorized, invalid or expired token
 *       500:
 *         description: Internal server error
 */

// update applicaiotn using applicaiotn number
/**
 * @swagger
 * /leave/update_application_no:
 *   put:
 *     summary: Update leave application by application number
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Define your request body properties here
 *     responses:
 *       200:
 *         description: Leave application updated successfully
 *       401:
 *         description: Unauthorized, invalid or expired token
 *       500:
 *         description: Internal server error
 */

// Applicaiton Pending
/**
 * @swagger
 * /leave/pending:
 *   get:
 *     summary: Get all pending leave applications
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending leave applications
 *       401:
 *         description: Unauthorized, invalid or expired token
 *       500:
 *         description: Internal server error
 */
// Application Reject

/**
 * @swagger
 * /leave/reject:
 *   get:
 *     summary: Get all rejected leave applications
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rejected leave applications
 *       401:
 *         description: Unauthorized, invalid or expired token
 *       500:
 *         description: Internal server error
 */

// Application Reject

/**
 * @swagger
 * /leave/approved:
 *   get:
 *     summary: Get all approved leave applications
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of approved leave applications
 *       401:
 *         description: Unauthorized, invalid or expired token
 *       500:
 *         description: Internal server error
 */

// Appplication Search

/**
 * @swagger
 * /leave/search:
 *   get:
 *     summary: Search for a leave application by application number
 *     tags: [Leave]
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
