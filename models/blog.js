const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    coverPhotoUrl: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    deletedAt: {
      type: Date,
      default: null
    },
    isDraft:{
      type: Boolean,
      default: false
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
