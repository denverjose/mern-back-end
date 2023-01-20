const express = require("express");
const { body } = require("express-validator/check");

const feedController = require("../controllers/feed");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

// GET /feed/blogs
router.get("/blogs", isAuth, feedController.getBlogs);

// router.get("/blogs/drafts", isAuth, feedController.getDraftedBlogs);

// POST /feed/blog
router.post(
  "/blog",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("description").isLength({ min: 400 }),
  ],
  feedController.createBlog
);

router.get("/blog/:blogId", isAuth, feedController.getBlog);

router.put(
  "/blog/:blogId",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("description").isLength({ min: 400 }),
  ],
  feedController.updateBlog
);

router.patch("/blog/delete/:blogId", isAuth, feedController.deleteBlog);
router.patch("/blog/draft/:blogId", isAuth, feedController.draftBlog);

module.exports = router;
