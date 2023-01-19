const express = require("express");
const { body } = require("express-validator/check");

const User = require("../models/user");
const authController = require("../controllers/auth");

const router = express.Router();

router.post(
  "/signup",
  [
    body("username").trim().isLength({ min: 2 }),
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("firstname").trim().isLength({ min: 2 }),
    body("lastname").trim().isLength({ min: 2 }),
    body("password").trim().isLength({ min: 6 }),
  ],
  authController.signup
);

router.post("/login", authController.login);

module.exports = router;
