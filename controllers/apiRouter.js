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
                    console.log(text+"\n")
                } else {
                    text.join(" ");
                }
            }
            let obj = {
                title: $(this).find("._eYtD2XCVieq6emjKBH3m").text(),
                content: text || $(this).find("._13svhQIUZqD9PVzFcLwOKT").attr("href") || "nothing was here LOL",
                link: "reddit.com" + $(this).find(".SQnoC3ObvgnGjWt90zD9Z").attr("href"),
                notes: []
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

// Export routes for server.js to use.
module.exports = router;