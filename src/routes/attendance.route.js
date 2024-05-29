const express = require("express");
const { AttendanceController } = require("../controllers");
const Auth = require("../middleware/auth");

const router = express.Router();

router.route("/create").post(Auth, AttendanceController.TakingAttendance);
router.route("/month").get(Auth, AttendanceController.FindAttendaceByMonth);
router
  .route("/month/:monthName")
  .get(Auth, AttendanceController.FindAttendaceByMonthName);
router.route("/absent").get(Auth, AttendanceController.OutTimeAttendance);
router
  .route("/absent-month")
  .get(Auth, AttendanceController.FindOutOfAllAttendanceByMonth);
router
  .route("/absent-month/:monthName")
  .get(Auth, AttendanceController.FindOutOfAllAttendanceByMonthName);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       properties:
 *         location:
 *           type: string
 *           description: The location where the attendance is being taken
 *         time:
 *           type: string
 *           format: date-time
 *           description: The time when the attendance was taken
 */

/**
 * @swagger
 * /attendance/create:
 *   post:
 *     summary: Take attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Attendance'
 *     responses:
 *       "201":
 *         description: Attendance taken successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       "401":
 *         description: Unauthorized Error
 *       "500":
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /attendance/month:
 *   get:
 *     summary: Find attendance by month
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Attendance data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /attendance/month/{monthName}:
 *   get:
 *     summary: Find attendance by month name
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: monthName
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the month
 *     responses:
 *       "200":
 *         description: Attendance data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /attendance/absent:
 *   get:
 *     summary: Find out time attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Attendance data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /attendance/absent-month:
 *   get:
 *     summary: Find out of all attendance by month
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Attendance data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /attendance/absent-month/{monthName}:
 *   get:
 *     summary: Find out of all attendance by month name
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: monthName
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the month
 *     responses:
 *       "200":
 *         description: Attendance data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
