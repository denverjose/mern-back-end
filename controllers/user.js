const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const { validationResult } = require("express-validator/check");

const Blog = require("../models/blog");
const User = require("../models/user");

exports.getProfile = (req, res, next) => {
  const userId = req.params.userId;
  // const currentPage = req.query.page || 1;
  // const perPage = 3;
  // let totalItems;
  User.findById(userId)
    // .countDocuments()
    // .then((count) => {
    // totalItems = count;
    // return Post.find({ deletedAt: null, isDraft: false })
    // .populate("creator")
    // .skip((currentPage - 1) * perPage)
    // .limit(perPage);
    // })
    .then((user) => {
      console.log(user);
      res.status(200).json({
        message: "Fetched user successfully.",
        user: user,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getProfileBlogs = (req, res, next) => {
  const profileId = req.params.profileId;
  // const currentPage = req.query.page || 1;
  // const perPage = 3;
  // let totalItems;
  Blog.find({ deletedAt: null, isDraft: false, creator: profileId })
    .sort({ createdAt: -1 })

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

exports.getProfileDrafts = (req, res, next) => {
  // const currentPage = req.query.page || 1;
  // const perPage = 3;
  // let totalItems;
  Blog.find({ deletedAt: null, isDraft: true, creator: req.userId })
    .sort({ createdAt: -1 })

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
        message: "Fetched drafted blogs successfully.",
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

exports.updateUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const username = req.body.username;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const password = req.body.password;
  const newPassword = req.body.newPassword;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const error = new Error("No file picked.");
    error.statusCode = 422;
    throw error;
  }
  let loadedUser;
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error("Could not find user.");
        error.statusCode = 404;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password!");
        error.statusCode = 401;
        throw error;
      }
      if (imageUrl !== loadedUser.profilePictureUrl) {
        clearImage(loadedUser.profilePictureUrl);
      }

      if (newPassword.length) {
        if (loadedUser.passwordChances === 0) {
          const error = new Error("No Change Password Chances");
          error.statusCode = 422;
          throw error;
        }
        bcrypt.hash(newPassword, 12).then((hashedPw) => {
          console.log("changed password");
          loadedUser.password = hashedPw;
          loadedUser.passwordChances = loadedUser.passwordChances - 1;
          return loadedUser.save();
        });
      }
      loadedUser.username = username;
      loadedUser.firstname = firstname;
      loadedUser.lastname = lastname;
      loadedUser.profilePictureUrl = imageUrl;
      loadedUser.passwordChances = loadedUser.passwordChances;
      return loadedUser.save();
    })
    .then((result) => {
      res.status(200).json({ message: "User updated!", user: result });
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
