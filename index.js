const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieSession = require("cookie-session");
const passport = require("passport");

const { secretKey } = require("./secretData");

// import all route
const userRoute = require("./route/user");
const Authentication = require("./route/auth");
const userEditRoute = require("./route/userEdit");
const documentsRoute = require("./route/documents");
const allGroupRoute = require("./route/allGroup");
const detailsRoute = require("./route/details");
const displayHeadRoute = require("./route/displayHead");

const app = express();
const port = 8000;

//middleware to initialize passport and creating cookie
app.use(
  cookieSession({
    keys: [secretKey], // key used to encrypt cookie
    maxAge: 24 * 60 * 60 * 1000,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Create an instance of the Authentication class
const auth = new Authentication();

// set view engine as ejs and set path location of ejs file
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.static(path.resolve("./public")));
app.use(express.urlencoded({ extended: false }));

//----------------------------------------------class----------------------------------------------

class MainPage {
  async viewMainPage(req, res) {
    if (!req.user) {
      return res.render("main");
    }
    return res.render("main", {
      user: {
        profileImageURL: req.user.profileImageURL,
        userId: req.user.userId,
      },
    });
  }
}
//created class instance
const mainPage = new MainPage();

//----------------------------------------------routes----------------------------------------------

//get request for main page
app.get("/", mainPage.viewMainPage.bind(mainPage));
// get request to log out user
app.get("/logout", async (req, res) => {
  req.logout();
  return res.render("main");
});
//middleware to redirect url to route
app.use("/user", userRoute);
app.use("/userEdit", userEditRoute);
app.use("/documents", documentsRoute);
app.use("/allGroup", allGroupRoute);
app.use("/details", detailsRoute);
app.use("/displayHead", displayHeadRoute);
// Set up authentication routes
app.use("/auth", auth.setupRoutes());

// connect mongo Db
mongoose
  .connect("mongodb://localhost:27017/medicalRecords")
  .then(() => console.log("mongo db connected"))
  .catch((err) => console.log("mongo connection error", err));

// starting server
app.listen(port, () => console.log("server started"));
