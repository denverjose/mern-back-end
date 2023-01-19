const express = require("express");
const { body } = require("express-validator/check");

const userController = require("../controllers/user");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

// GET /profile/blogs
router.get("/profile/:userId", isAuth, userController.getProfile);
router.get("/blogs/drafts", isAuth, userController.getProfileDrafts);
router.get("/blogs/:profileId", isAuth, userController.getProfileBlogs);
router.put(
  "/profile/update",
  isAuth,
  [
    body("password").trim().isLength({ min: 6 }),
    body("username").trim().not().isEmpty(),
    body("firstname").trim().isLength({ min: 2 }),
    body("lastname").trim().isLength({ min: 2 }),
  ],
  userController.updateUser
);

// router.patch('/blog/delete/:blogId', isAuth, feedController.deleteBlog);

module.exports = router;
