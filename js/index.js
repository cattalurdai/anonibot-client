// BOOTSTRAP FORM VALIDATIONS

(function () {
  var forms = document.querySelectorAll(".needs-validation");

  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        event.stopPropagation();
        const clickedButton = event.submitter;
        if (form.checkValidity()) {
          clickedButton.id === "postSubmit" ? createPost() : getPreview();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
})();

// GET IG LAST 5 POSTS

let igImageFields = document.getElementsByClassName("igPost");

async function getIgPosts() {
  try {
    const response = await fetch("http://localhost:4555/getIgPosts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) =>
      res.json().then((data) => {
        console.log(data);
        insertMedia(data);
      })
    );
  } catch (error) {
    console.error(error);
  }
}

function insertMedia(mediaArray) {
  let i = 0;
  for (const field of igImageFields) {
    field.src = mediaArray[i].media_url;
    i += 1;
  }
}

getIgPosts();

// BUILD REQUEST BODY

async function buildBody() {
  const body = {
    text: await document.getElementById("textArea").value,
    background: await document.querySelector(
      'input[name="backgroundSelection"]:checked'
    ).value,
  };
  return JSON.stringify(body);
}

// POST IMAGE PREVIEW

const previewField = document.getElementById("imagePreview");

async function getPreview() {
  // Send request
  try {
    const response = await fetch("http://localhost:4555/getPreview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: await buildBody(),
    });

    // Error handling
    if (!response.ok) {
      const errorMessage = await response.text();
      console.error(errorMessage);
      return;
    }
    const base64String = await response.text();

    // Update preview
    previewField.src = `data:image/png;base64,${base64String}`;
  } catch (error) {
    console.error(error);
  }
}

// POST UPLOAD IMAGE

async function createPost() {
  // Check last post time
  if (!spamValidation()) {
    return;
  }

  // Send request
  try {
    const response = await fetch("http://localhost:4555/createPost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: await buildBody(),
    }).then(() => setLastPostDate());

    // Error handling
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// SPAM PREVENTION //

function setLastPostDate() {
  let lastPostDate = new Date();
  let lastPostDateString = lastPostDate.toISOString();
  localStorage.setItem("lastPostDate", lastPostDateString);
}

// VALIDATES IF LAST POST WAS MORE THAN 8 HOURS AGO

function spamValidation() {
  let currentDate = new Date();
  let lastPostDateString = localStorage.getItem("lastPostDate");
  let lastPostDate = new Date(lastPostDateString);

  // Check existence of lastPostDate or it being larger than 8 hours
  if (!lastPostDateString || currentDate - lastPostDate > 28800000) {
    return true;
  } else {
    spamAlert(28800000 - (currentDate - lastPostDate));
    return false;
  }
}

// SHOW ALERT WITH REMAINING TIME

function spamAlert(remainingTime) {
  document.getElementById("reimainingTimeField").innerText =
    "Podrás hacer otra publicación en " +
    parseMillisecondsIntoTime(remainingTime);
  document.getElementById("reimainingTimeField").style.display = "block";
}

// TIME CONVERSION

function parseMillisecondsIntoTime(milliseconds) {
  // Hours to milliseconds
  var hours = milliseconds / (1000 * 60 * 60);
  var absoluteHours = Math.floor(hours);
  var h = absoluteHours > 9 ? absoluteHours : "0" + absoluteHours;

  // Convert remainder to minutes
  var minutes = (hours - absoluteHours) * 60;
  var absoluteMinutes = Math.floor(minutes);
  var m = absoluteMinutes > 9 ? absoluteMinutes : "0" + absoluteMinutes;

  // Convert remainder to seconds
  var seconds = (minutes - absoluteMinutes) * 60;
  var absoluteSeconds = Math.floor(seconds);
  var s = absoluteSeconds > 9 ? absoluteSeconds : "0" + absoluteSeconds;

  return h + ":" + m + ":" + s;
}
