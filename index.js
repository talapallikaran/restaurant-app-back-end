const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const db = require("./queries");
const PORT = process.env.PORT || 8080;

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// get config vars
dotenv.config();
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    console.log(err);

    if (err) return res.sendStatus(403);

    req.user = user;

    next();
  });
}

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.get("/users", db.getUsers);
app.get("/users/:id", db.getUserById);
app.post("/users", db.createUser);
app.put("/users/:id", db.updateUser);
app.delete("/userDelete", db.deleteUser);
app.post("/otp", db.checkOtp);
app.post("/resendOtp", db.resendOtp);
app.get("/restaurantwithmenu", db.getRestaurantWithMenu);
app.get("/restaurant", authenticateToken, db.getRestaurant);
app.post("/restaurant", db.createRestaurantAdmin);

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}.`);
});
