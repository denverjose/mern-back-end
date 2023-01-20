const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator/check");

const Blog = require("../models/blog");
const User = require("../models/user");

exports.getBlogs = (req, res, next) => {
  // const currentPage = req.query.page || 1;
  // const perPage = 3;
  // let totalItems;
  Blog.find({ deletedAt: null, isDraft: false })
    .populate("creator")
    // .countDocuments()
    // .then((count) => {
    // totalItems = count;
    // return Post.find({ deletedAt: null, isDraft: false })
    // .populate("creator")
    // .skip((currentPage - 1) * perPage)
    // .limit(perPage);
    // })
    .then((blogs) => {
      res.status(200).json({
        message: "Fetched blogs successfully.",
        blogs: blogs,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createBlog = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path.replace("\\", "/");
  const title = req.body.title;
  const description = req.body.description;
  let creator;
  const blog = new Blog({
    title: title,
    description: description,
    coverPhotoUrl: imageUrl,
    creator: req.userId,
  });
  blog
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully!",
        blog: blog,
        creator: { _id: blog.creator._id, name: blog.creator.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getBlog = (req, res, next) => {
  const blogId = req.params.blogId;
  Blog.findById(blogId)
    .populate("creator")
    .exec()
    .then((blog) => {
      if (!blog) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Blog fetched.", blog: blog });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateBlog = (req, res, next) => {
  const blogId = req.params.blogId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const description = req.body.description;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const error = new Error("No file picked.");
    error.statusCode = 422;
    throw error;
  }
  Blog.findById(blogId)
    .then((blog) => {
      if (!blog) {
        const error = new Error("Could not find blog.");
        error.statusCode = 404;
        throw error;
      }
      if (blog.creator.toString() !== req.userId) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
      if (imageUrl !== blog.coverPhotoUrl) {
        clearImage(blog.coverPhotoUrl);
      }
      blog.title = title;
      blog.coverPhotoUrl = imageUrl;
      blog.description = description;
      return blog.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Blog updated!", blog: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteBlog = (req, res, next) => {
  const blogId = req.params.blogId;
  Blog.findById(blogId)
    .then((blog) => {
      if (!blog) {
        const error = new Error("Could not find blog.");
        error.statusCode = 404;
        throw error;
      }
      if (blog.creator.toString() !== req.userId) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
      clearImage(blog.coverPhotoUrl);
      blog.deletedAt = new Date();
      return blog.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Deleted post." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.draftBlog = (req, res, next) => {
  const blogId = req.params.blogId;
  Blog.findById(blogId)
    .then((blog) => {
      if (!blog) {
        const error = new Error("Could not find blog.");
        error.statusCode = 404;
        throw error;
      }
      if (blog.creator.toString() !== req.userId) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
      let isDraft;
      if (blog.isDraft) {
        isDraft = false;
      } else {
        isDraft = true;
      }

      blog.isDraft = isDraft;
      return blog.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Drafted blog." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
