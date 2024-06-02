const express = require("express");
const { AttendanceController } = require("../controllers");
const Auth = require("../middleware/auth");
const AdminAuth = require("../middleware/AdminAuth");

const router = express.Router();

router.route("/take").get(Auth, AttendanceController.TakingAttendance);
router
  .route("/manual")
  .post(Auth, AttendanceController.TakingAttendaceByMannual);
router.route("/month").get(Auth, AttendanceController.FindAttendaceByMonth);
router
  .route("/month/days")
  .post(
    Auth,
    AttendanceController.FindOutTimeAttendanceByMonthByUseridController
  );
router
  .route("/month/:monthName")
  .get(Auth, AttendanceController.FindAttendaceByMonthName);
router.route("/absent").get(Auth, AttendanceController.OutTimeAttendance);
router
  .route("/absent-month")
  .get(Auth, AttendanceController.FindOutOfAllAttendanceByMonth);
router
  .route("/absent-month/:monthName")
  .get(AdminAuth, AttendanceController.FindOutOfAllAttendanceByMonthName);

router.route("/present").get(AttendanceController.FindAllPresentUser);

module.exports = router;

/**
 * @swagger
 * /attendance/present:
 *   get:
 *     summary: Get all present users Only Admin Can Access
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of present users and their details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 UserName:
 *                   type: array
 *                   description: List of user names
 *                   items:
 *                     type: string
 *                 UserEmail:
 *                   type: array
 *                   description: List of user emails
 *                   items:
 *                     type: string
 *                 TotalUser:
 *                   type: integer
 *                   description: Total count of present users
 *             example:
 *               UserName: ["John Doe", "Jane Smith"]
 *               UserEmail: ["john@example.com", "jane@example.com"]
 *               TotalUser: 2
 *       '401':
 *         description: Unauthorized - Admin access only
 *       '500':
 *         description: Internal server error
 */

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
 *     summary: Find out of all attendance by month name only Admin Access
 *     tags: [Admin]
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
 * /attendance/month/days:
 *   post:
 *     summary: Find attendance by month
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *               month:
 *                 type: integer
 *               numberOfDays:
 *                 type: integer
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
 * /attendance/manual:
 *   post:
 *     summary: Take attendance manually
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *                 description: Location where attendance is being taken
 *     responses:
 *       "200":
 *         description: Attendance successfully recorded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */
