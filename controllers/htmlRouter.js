const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const db = require("../models/index");

const router = express.Router();

router.get("/", function (req, res) {
  db.Reddit.find({}).then(response=>{
    res.render("index",{articles: response || false})
  })
});


router.get("/saved", function (req, res) {
  db.Reddit.find({}).then(response=>{
    let resArr = response.filter(r=> r.saved === true);
    res.render("saved",{articles: resArr || false})
  })
});

// Export routes for server.js to use.
module.exports = router;