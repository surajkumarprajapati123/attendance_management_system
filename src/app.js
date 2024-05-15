const express = require("express");

const donenv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const routes = require("./routes/index");
const cors = require("cors");
const ErrorHandler = require("./middleware/ErrorHandler");

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const options = require("./docs/swaggerDef");
const app = express();
donenv.config();
// console.log(process.env.PORT);

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

app.use(routes);
app.get("/", () => {
  console.log("routes is working");
});
const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(ErrorHandler);

module.exports = app;
