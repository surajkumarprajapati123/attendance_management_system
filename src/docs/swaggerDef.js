const dotenv = require("dotenv");
dotenv.config();
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: " Express API with Swagger",
      version: "0.1.0",
      description:
        "This is a Attendance Management  Aystem API application made with Express and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://github.com/hagopj13/node-express-boilerplate/blob/master/LICENSE",
      },
      contact: {
        name: "skills with suraj",
        email: "surajkumarprajapati632@gmail.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
      },
    ],
  },
  apis: ["src/docs/*.yml", "src/routes/*.js"],
};

console.log(process.env.PORT);
module.exports = options;
