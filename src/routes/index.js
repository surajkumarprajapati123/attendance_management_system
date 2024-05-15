const express = require("express");
const UserRoutes = require("./user.route");
const AdminRoutes = require("./admin.route");
const LeaveRoutes = require("./leave.route");

const router = express.Router();

const AllRoutes = [
  {
    route: "/user",
    routes: UserRoutes,
  },
  {
    route: "/admin",
    routes: AdminRoutes,
  },
  {
    route: "/leave",
    routes: LeaveRoutes,
  },
];

AllRoutes.map((data) => {
  router.use(data.route, data.routes);
});

module.exports = router;
