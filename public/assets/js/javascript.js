function scrape() {
    fetch("/api/scrape")
        .then(r => r.json())
        .then(response => {
            let articleDiv = document.getElementById("articleDiv");
            if (articleDiv) {
                articleDiv.innerHTML = "";
                response.forEach(obj => {
                    articleDiv.innerHTML += `
          <div class="article">
            <div class="title">
                <h2 class="titleText"><a href="${obj.link}">${obj.title}</a></h2>
                <h3 class="saveButton" mongo-id="${obj._id}" onclick="saveReddit(this)">Save Post</h3>
            </div>
            <div class="content">
                ${obj.content}
            </div>
          </div>`;
                });
            }
        });
}

function antiScrape() {
    fetch("/api/scrape", {
            method: "DELETE"
        })
        .then(r => r.json())
        .then(response => {
            let articleDiv = document.getElementById("articleDiv");
            if (articleDiv) {
                articleDiv.innerHTML = `<div class="alert">
          Oh No! it looks like we don't have any reddits!
      </div>
      <div class="article">
          <div class="title">
              <h5 class="noTitle">What would you like to do?</h5>
          </div>
          <div class="noContent">
              <h3 onclick="scrape()">Scrape some new Reddits</h3>
              <h3><a href="/saved">Go To Saved Reddits</a></h3>
          </div>
      </div>`;
            }
        });
}

function saveReddit(item) {
    let id = item.getAttribute("mongo-id");
    fetch("/api/posts", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            _id: id
        })
    }).then(r => r.json()).then(response => {
        console.log(response)
        item.parentNode.parentNode.remove();
        let bodyDiv = document.getElementById("bodyDiv");
        if (response.count === 0) bodyDiv.innerHTML = `<div class="alert">
            Oh No! it looks like we don't have any reddits!
        </div>
        <div class="article">
            <div class="title">
                <h5 class="noTitle">What would you like to do?</h5>
            </div>
            <div class="noContent">
                <h3 onclick="scrape()">Scrape some new Reddits</h3>
                <h3><a href="/saved">Go To Saved Reddits</a></h3>
            </div>
        </div>`
    })
}

let docID;
let redditPost

function Settings(item) {
    let id = item.getAttribute("mongo-id");
    docID = id;
    redditPost = item;
    let text = document.getElementById("modalText");
    text.textContent = `Editing Post: ${id}`;

    fetch("/api/notes/" + id)
        .then(r => r.json())
        .then(response => {
            response = response[0];
            let repeater = document.getElementById("repeater");
            repeater.innerHTML = "";
            if (response.notes.length !== 0) {
                response.notes.forEach((note, i) => {
                    repeater.innerHTML +=
                        `<div class="repeatableItem">
                            <div class="repeatableText">
                                ${note.body}
                                <h4 mongo-id="${note._id}" onclick="deleteNote(this)">Delete Note</h4>
                            </div>
                        </div>`;
                    if (i === response.notes.length - 1) {
                        displayModal();
                    }
                })
            } else {
                repeater.innerHTML = "No Notes Yet :)"
                displayModal();
            }
        })
}

function displayModal() {
    // Get the modal
    let modal = document.getElementById("myModal");
    // Get the <span> element that closes the modal
    let span = document.getElementsByClassName("close")[0];
    // When the user clicks on the button, open the modal
    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function closeModal() {
    // Get the modal
    let modal = document.getElementById("myModal");
    modal.style.display = "none";
}

function saveNote() {
    closeModal();
    let textArea = document.getElementById("textArea");
    if (textArea.value === "") return;
    fetch("/api/notes", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _id: docID,
                note: textArea.value
            })
        })
        .then(r => r.json())
        .then(response => {
            textArea.value = ""
            return;
        })
}

function deleteNote(item) {
    closeModal();
    fetch("/api/notes", {
            method: "DELETE",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _id: docID,
                noteID: item.getAttribute("mongo-id")
            })
        })
        .then(r => r.json())
        .then(response => {
            return;
        })
}

function deletePost() {
    closeModal();
    fetch("/api/posts", {
            method: "DELETE",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _id: docID
            })
        })
        .then(r => r.json())
        .then(response => {
            redditPost.parentNode.parentNode.remove();
            let bodyDiv = document.getElementById("bodyDiv");
            if (response.count === 0) bodyDiv.innerHTML = `<div class="alert">
            Oh No! it looks like we don't have any reddits!
        </div>
        <div class="article">
            <div class="title">
                <h5 class="noTitle">Would you like to browse available posts?</h5>
            </div>
            <div class="noContent">
                <h3><a href="/">Browse Posts</a></h3>
            </div>
        </div>`
            return;
        })
}