const app = require("./app");
const DatabaseConnection = require("./db/database");
DatabaseConnection();

app.listen(process.env.PORT, () => {
  console.log(`Server is started  and post is ${process.env.PORT}`);
});
