const express = require("express");
const upload = require("../middleware/multer");
const { AdminController, LeaveController } = require("../controllers");
const AdminAuth = require("../middleware/AdminAuth");
const router = express.Router();

router.route("/update/:id").put(AdminAuth, AdminController.UpdateUserWithID);
router.route("/profile").get(AdminAuth, AdminController.GetProfile);
router.route("/all").get(AdminAuth, AdminController.FindAllUserByAdmin);
router.route("/delete/:id").delete(AdminAuth, AdminController.DeleteUserById);
router.route("/reset-password").put(AdminAuth, AdminController.resetPassword);
router.route("/logout").post(AdminAuth, AdminController.LogoutUser);
router
  .route("/leave-update")
  .put(AdminAuth, AdminController.updateAdminLeaveApplication);
router
  .route("/search")
  .get(AdminAuth, AdminController.SerchByApplicationNumber);
router
  .route("/avatar-update")
  .put(AdminAuth, upload.single("avatar"), AdminController.UpdateAdminAvatar);

router.route("/create").post(AdminAuth, AdminController.ApplyLeaveApplication);

router
  .route("/department-find/:departmentName")
  .post(AdminAuth, AdminController.FindAllStudentUsingDepartment);
router
  .route("/department-assign/:UserId")
  .put(AdminAuth, AdminController.ChangeDepartmentUsingUserId);

router.get("/test", (req, res) => {
  //   console.log(req.user);
  res.send("testing routng is working");
});
module.exports = router;

// Update User by id

/**
 * @swagger
 * /admin/department-find/{departmentName}:
 *   post:
 *     summary: Find all users by department name
 *     description: Retrieves all users belonging to the specified department.
 *     tags: [Department]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentName
 *         type: string
 *         required: true
 *         description: The name of the department to search users for.
 *     responses:
 *       200:
 *         description: Success. Returns users in the specified department.
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/User'
 *       401:
 *         description: Unauthorized. User does not have admin access.
 *       500:
 *         description: Internal Server Error. Failed to retrieve users.
 */

/**
 * @swagger
 * /admin/department-assign/{UserId}:
 *   put:
 *     summary: Change department by user ID
 *     description: Changes the department of a user based on their user ID.
 *     tags: [Department]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: UserId
 *         type: string
 *         required: true
 *         description: The ID of the user to change the department for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departmentName:
 *                 type: string
 *                 description: The new department name for the user.
 *     responses:
 *       200:
 *         description: Success. Returns the updated user.
 *         schema:
 *           $ref: '#/definitions/User'
 *       401:
 *         description: Unauthorized. User does not have admin access.
 *       404:
 *         description: Not Found. User with the provided ID not found.
 *       500:
 *         description: Internal Server Error. Failed to update user department.
 */

/**
 * @swagger
 * /admin/department-assign/{UserId}:
 *   put:
 *     summary: Change department by user ID
 *     description: Changes the department of a user based on their user ID and assigns a permission.
 *     tags: [Department]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: UserId
 *         type: string
 *         required: true
 *         description: The ID of the user to change the department for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departmentName:
 *                 type: string
 *                 description: The new department name for the user.
 *               permission:
 *                 type: string
 *                 description: The permission to assign to the user in the new department.
 *     responses:
 *       200:
 *         description: Success. Returns the updated user.
 *         schema:
 *           $ref: '#/definitions/User'
 *       401:
 *         description: Unauthorized. User does not have admin access.
 *       404:
 *         description: Not Found. User with the provided ID not found.
 *       500:
 *         description: Internal Server Error. Failed to update user department.
 */

// Delete user by id
/**
 * @swagger
 * /admin/delete/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     description: Delete the user by their ID.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to delete
 *     responses:
 *       "204":
 *         description: No Content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
// Get all user
/**
 * @swagger
 * /admin/all:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all users.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
// Get Profile
/**
 * @swagger
 * /admin/profile:
 *   get:
 *     summary: Get Admin profile
 *     description: Retrieve the profile of the authenticated user.
 *     tags: [Admin]
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
 * /admin/reset-password:
 *   put:
 *     summary: Reset password
 *     description: Reset the password for the admin.
 *     tags: [Admin]
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
 * /admin/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: User successfully logged out
 *       401:
 *         description: Unauthorized - User not logged in
 */

// Avatar image  updated
/**
 * @swagger
 * /admin/avatar-update:
 *   put:
 *     summary: Update profile image
 *     description: Update the user's profile image .
 *     tags: [Admin]
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
 * /admin/search:
 *   get:
 *     summary: Search for a leave application by application number
 *     tags: [Admin]
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

// update Applicaiotn using id
/**
 * @swagger
 * /admin/leave-update:
 *   put:
 *     summary: Update leave application by ID
 *     tags: [Admin]
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
// Apply leave Application
// Apply Leave Application
/**
 * @swagger
 * /admin/create:
 *   post:
 *     summary: Apply for leave
 *     tags: [Admin]
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
