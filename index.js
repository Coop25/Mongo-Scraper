const exphbs = require("express-handlebars");
const express = require("express");
const mongoose = require("mongoose");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
let MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
const PORT = process.env.PORT || 8080;

let app = express();

// Use the express.static middleware to serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
let htmlRoutes = require("./controllers/htmlRouter");
let apiRoutes = require("./controllers/apiRouter");

app.use(htmlRoutes);
app.use(apiRoutes);

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT + "/api/scrape");
});
