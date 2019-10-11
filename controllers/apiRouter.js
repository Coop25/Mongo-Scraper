const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const db = require("../models/index");

const router = express.Router();

function createReddit(obj) {
    return new Promise((resolve, reject) => {
        db.Reddit.create(obj).then((Reddit) => {
            resolve(Reddit)
        }).catch((err) => {
            console.log(err.message)
        })
    })
}

router.get("/api/scrape", function (req, res) {
    axios.get("https://www.reddit.com/r/mongodb/new/").then(async function (response) {
        const $ = cheerio.load(response.data);
        let arr = []
        $("._1poyrkZ7g36PawDueRza-J").each(function (i, element) {
            let text;
            if ($(this).find("._1qeIAgB0cPwnLhDF9XSiJM").text()) {
                text = $(this).find("._1qeIAgB0cPwnLhDF9XSiJM").text();
                text = text.split(" ");
                if (text.length > 20) {
                    text.length = 20;
                    text.push("...");
                    text = text.join(" ");
                    console.log(text + "\n")
                } else {
                    text.join(" ");
                }
            }
            let obj = {
                title: $(this).find("._eYtD2XCVieq6emjKBH3m").text(),
                content: text || $(this).find("._13svhQIUZqD9PVzFcLwOKT").attr("href") || "nothing was here LOL",
                link: "reddit.com" + $(this).find(".SQnoC3ObvgnGjWt90zD9Z").attr("href"),
                notes: [],
                saved: false
            }
            arr.push(obj)
        })
        let newArr = []
        await arr.forEach(async (obj, i) => {
            let objTwo = await createReddit(obj);
            newArr.push(objTwo);
            if (i === arr.length - 1) {
                res.json(newArr);
            }
        });
    })
});

router.delete("/api/scrape", function (req, res) {
    db.Reddit.remove({}, () => {
        db.Notes.remove({}, () => {
            res.json({
                status: true
            });
        })
    })
});

router.get("/api/notes/:id", function (req, res) {
    db.Reddit.find({
            _id: req.params.id
        })
        .populate("notes")
        .then((Reddit) => {
            res.json(Reddit);
        }).catch((err) => {
            console.log(err.message)
        })
});

// Route for saving a new Note to the db and associating it with a reddit Post
router.post("/api/notes", function (req, res) {
    db.Notes.create({
            body: req.body.note
        })
        .then(function (dbNote) {
            return db.Reddit.findOneAndUpdate({
                _id: req.body._id
            }, {
                $push: {
                    notes: dbNote._id
                }
            }, {
                new: true
            });
        })
        .then(function (dbPost) {
            res.json(dbPost);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for saving a new Note to the db and associating it with a reddit Post
router.delete("/api/notes", function (req, res) {
    db.Notes.remove({
            _id: req.body.noteID
        })
        .then(function () {
            return db.Reddit.findOneAndUpdate({
                _id: req.body._id
            }, {
                $pull: {
                    notes: req.body.noteID
                }
            }, {
                "multi": true
            });
        })
        .then(function (dbPost) {
            res.json(dbPost);
        })
        .catch(function (err) {
            res.json(err);
        });
});


// Route for saving a new Note to the db and associating it with a reddit Post
router.post("/api/posts", function (req, res) {
    db.Reddit.findOneAndUpdate({
        _id: req.body._id
    }, {
        saved: true
    }).then(data => {
        db.Reddit.find({}).then(data => {
            let resArr = data.filter(r=> r.saved === false);
            res.json({
                count: resArr.length
            })
        })
    });
});


// Route for saving a new Note to the db and associating it with a reddit Post
router.delete("/api/posts", function (req, res) {
    db.Reddit.find({
        _id: req.body._id
    }).then(data => {
        return db.Notes.remove({
            _id: {
                $in: data[0].notes
            }
        })
    }).then(data => {
        db.Reddit.remove({
            _id: req.body._id
        }).then(data => {
            db.Reddit.find({}).then(data => {
                let resArr = data.filter(r=> r.saved === true);
                res.json({
                    count: resArr.length
                })
            })
        });
    })
});

// Export routes for server.js to use.
module.exports = router;