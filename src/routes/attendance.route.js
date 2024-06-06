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

router
  .route("/present")
  .get(AdminAuth, AttendanceController.FindAllPresentUser);
router.route("/absent").get(AdminAuth, AttendanceController.FindAllAbsentUuser);

router
  .route("/absent-present-user/:userId")
  .post(
    AdminAuth,
    AttendanceController.FindOutTimeAttendanceByMonthByAnyUserIDAdmin
  );
router
  .route("/absent-present-range")
  .post(Auth, AttendanceController.FindAttendanceByMonthByAdminOnly);
router
  .route("/absent-present-range-admin/:UserId")
  .post(AdminAuth, AttendanceController.FindAttendanceByMonthByAdminOnlyUserID);

module.exports = router;

/**
 * @swagger
 * /attendance/absent-present-range-admin/{UserId}:
 *   post:
 *     summary: Get attendance data for a user within a specified date range (Admin)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user
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
 *                 description: The start date of the date range (YYYY-MM-DD)
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: The end date of the date range (YYYY-MM-DD)
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attendance:
 *                   type: array
 *                   description: Attendance data for the user within the specified date range
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       present:
 *                         type: integer
 *                       absent:
 *                         type: integer
 *                       users:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             email:
 *                               type: string
 *                             status:
 *                               type: string
 *               example:
 *                 attendance:
 *                   - date: "2024-06-02"
 *                     present: 3
 *                     absent: 1
 *                     users:
 *                       - name: "John Doe"
 *                         email: "john@example.com"
 *                         status: "present"
 *                       - name: "Jane Smith"
 *                         email: "jane@example.com"
 *                         status: "absent"
 *       '400':
 *         description: Bad request
 *       '401':
 *         description: Unauthorized - Admin access only
 *       '404':
 *         description: Data not found
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /attendance/absent-present-range:
 *   post:
 *     summary: Get attendance data for a user within a specified date range with User id it self
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
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the date range (YYYY-MM-DD)
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: The end date of the date range (YYYY-MM-DD)
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attendance:
 *                   type: object
 *                   description: Attendance data for the user within the specified date range
 *               example:
 *                 attendance:
 *                   1:
 *                     date: "2024-06-02"
 *                     present: 3
 *                     absent: 1
 *                     users:
 *                       - name: "John Doe"
 *                         email: "john@example.com"
 *                         status: "present"
 *                       - name: "Jane Smith"
 *                         email: "jane@example.com"
 *                         status: "absent"
 *       '400':
 *         description: Bad request
 *       '401':
 *         description: Unauthorized - Admin access only
 *       '404':
 *         description: Data not found
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /attendance/absent-present-user/{userId}:
 *   post:
 *     summary: Get absent user's attendance by user ID for a specific month (Admin)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *                 description: Numeric representation of the year
 *               month:
 *                 type: integer
 *                 description: Numeric representation of the month (1 for January, 2 for February, etc.)
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: ID of the user
 *                 userName:
 *                   type: string
 *                   description: Name of the user
 *                 userEmail:
 *                   type: string
 *                   format: email
 *                   description: Email of the user
 *                 absentDate:
 *                   type: string
 *                   format: date
 *                   description: Date of absence
 *                 absentTime:
 *                   type: string
 *                   format: time
 *                   description: Time of absence
 *       '400':
 *         description: Bad request
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /attendance/absent:
 *   get:
 *     summary: Get all absent users (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of absent users and their details
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
 *                 TotalAbsentUser:
 *                   type: integer
 *                   description: Total count of absent users
 *             example:
 *               UserName: ["John Doe", "Jane Smith"]
 *               UserEmail: ["john@example.com", "jane@example.com"]
 *               TotalAbsentUser: 2
 *       '401':
 *         description: Unauthorized - Admin access only
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /attendance/present:
 *   get:
 *     summary: Get all present users Only Admin Can Access
 *     tags: [Admin]
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
 *     summary: Find out of all attendance by month Current Month User Find It Self
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
