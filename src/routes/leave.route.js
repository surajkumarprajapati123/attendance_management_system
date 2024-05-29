const express = require("express");
const Auth = require("../middleware/auth");
const { LeaveController } = require("../controllers");
const AdminAuth = require("../middleware/AdminAuth");

const router = express.Router();

router.route("/create").post(Auth, LeaveController.ApplyLeave);
router.route("/update_id").put(Auth, LeaveController.updateApplicationById);
router
  .route("/update_applicaiotn_no/:application_no")
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
router.route("/reject/:id").put(AdminAuth, LeaveController.RejectAppliction);
router.route("/approve/:id").put(AdminAuth, LeaveController.ApprovedAppliction);
router.route("/re-apply").put(Auth, LeaveController.ReApplicationApply);

router.route("/holidays").get(LeaveController.Holidyas);

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

// update applicaiotn using applicaiotn number

/**
 * @swagger
 * /leave/update_applicaiotn_no/{application_no}:
 *   put:
 *     summary: Update leave application by application number
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: application_no
 *         required: true
 *         description: Application number of the leave application to update
 *         schema:
 *           type: string
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
 *         name: application_no
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
 *         description: Unauthorized, invalid, or expired token
 *       500:
 *         description: Internal server error
 */

// Reject leave by admin
/**
 * @swagger
 * /leave/reject/{id}:
 *   put:
 *     summary: Reject leave application by ID (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the leave application to reject
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejecting the leave application
 *     responses:
 *       200:
 *         description: Leave application rejected successfully
 *       401:
 *         description: Unauthorized, invalid, or expired token
 *       404:
 *         description: Leave application not found
 *       500:
 *         description: Internal server error
 */

// approved Application by admin

/**
 * @swagger
 * /leave/approve/{id}:
 *   put:
 *     summary: Approve leave application by ID (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the leave application to approve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leave application approved successfully
 *       401:
 *         description: Unauthorized, invalid or expired token
 *       404:
 *         description: Leave application not found
 *       500:
 *         description: Internal server error
 */

// Reapply Leave Application
/**
 * @swagger
 * /leave/re-apply:
 *   put:
 *     summary: Re-Apply Leave Application
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
 *         description: Leave application approved successfully
 *       401:
 *         description: Unauthorized, invalid, or expired token
 *       404:
 *         description: Leave application not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /leave/holidays:
 *   get:
 *     summary: Get holiday data
 *     description: Retrieve holiday data for a specific year and optional month
 *     tags: [Holidays]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           format: int32
 *         required: true
 *         description: The year for which holiday data is requested
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           format: int32
 *         required: false
 *         description: The month for which holiday data is requested (optional)
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Holidays_Name:
 *                     type: string
 *                     description: The name of the holiday
 *                   Holidays_Date:
 *                     type: string
 *                     format: date-time
 *                     description: The date of the holiday
 *       '400':
 *         description: Invalid request parameters
 *       '404':
 *         description: No holiday data found
 *       '500':
 *         description: Internal server error
 */
