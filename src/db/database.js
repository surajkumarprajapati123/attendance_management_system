const mongoose = require("mongoose");

const DatabaseConnection = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then((e) => {
      console.log(
        `Database Connected Successfully and host is ${e.connection.host}`
      );
    })

    .catch((err) => {
      console.log(err);
    });
};
module.exports = DatabaseConnection;
