const express = require("express");
const { AttendanceController } = require("../controllers");
const Auth = require("../middleware/auth");

const router = express.Router();

router.route("/take").get(Auth, AttendanceController.TakingAttendance);
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
 * /attendance/take:
 *   get:
 *     summary: Get attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the success of the operation
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
