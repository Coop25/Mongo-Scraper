var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var RedditSchema = new Schema({
  // `title` is required and of type String
  title: {
    type: String,
    required: true
  },
  // `content` is required and of type String
  content: {
    type: String,
    required: true
  },
  // `link` is required and of type String
  link: {
    type: String,
    required: true
  },
  // `link` is required and of type String
  saved: {
    type: Boolean,
    required: true
  },
  // `notes` is an array of objects that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the Article with an associated Note
  notes: [{
    type: Schema.Types.ObjectId,
    ref: "Notes"
  }]
});

// This creates our model from the above schema, using mongoose's model method
var Reddit = mongoose.model("Reddit", RedditSchema);

// Export the Reddit model
module.exports = Reddit;