// BOOTSTRAP FORM VALIDATIONS
(function () {
  var forms = document.querySelectorAll(".needs-validation");

  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity()) {
          getPreview();
        } else {
          addTextAreaInvalidStyle();
        }
      },
      false
    );
  });
})();

const API = "http://ec2-18-229-125-4.sa-east-1.compute.amazonaws.com:9999";

//const API = "http://localhost:9999";

async function buildBody() {
  const body = {
    text: await document.getElementById("textArea").value,
    background: await document.querySelector(
      'input[name="themeSelection"]:checked'
    ).value,
  };
  return JSON.stringify(body);
}

// POST IMAGE PREVIEW
const submitModal = new bootstrap.Modal(document.getElementById("submitModal"));
const previewField = document.getElementById("imagePreview");

async function getPreview() {
  if (!textValidation(document.getElementById("textArea").value)) {
    return;
  }

  showSpinner();

  // Send request
  try {
    const response = await fetch(API + "/getPreview", {
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

    // Open modal
    hideSpinner();
    submitModal.show();
  } catch (error) {
    console.error(error);
  }
}

// POST IMAGE UPLOAD

const submitCreatePost = document.getElementById("submitCreatePost");
submitCreatePost.addEventListener("click", () => {
  createPost();
});

async function createPost() {
  // Check last post time

  // Send request
  try {
    const response = await fetch(API + "/createPost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: await buildBody(),
    });

    // Error handling
    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }

    setLastPostDate();
  } catch (error) {
    console.error(error);
  }
}

// LOADING SPINNER

const spinner = document.getElementById("spinner");
const spinnerContainer = document.getElementById("spinner-container");

function showSpinner() {
  document.body.classList.add("loading");
  spinner.style.display = "block";
  spinnerContainer.style.display = "flex";
  console.log("spinner on");
}

function hideSpinner() {
  spinner.style.display = "none";
  spinnerContainer.style.display = "none";
  document.body.classList.remove("loading");
  console.log("spinner off");
}

// INPUT TEXT VALIDATION

const adjacentCharThreshold = 3;

function repeatedCharsValidation(input) {
  const cleanedInput = input.toLowerCase();
  let consecutiveCount = 1;

  for (let i = 1; i < cleanedInput.length; i++) {
    if (cleanedInput[i] === cleanedInput[i - 1]) {
      consecutiveCount++;

      if (consecutiveCount > adjacentCharThreshold) {
        // Exceeded the maximum allowed adjacent repeated characters
        console.log(
          `Adjacent repeated characters detected: ${cleanedInput[i]}, count: ${consecutiveCount}`
        );
        return false;
      }
    } else {
      consecutiveCount = 1;
    }
  }

  // No adjacent repeated characters detected
  return true;
}

function lengthValidation(input) {
  // Trim the input to remove leading and trailing whitespaces
  const trimmedInput = input.trim();

  // Split the input by whitespace to get individual words
  const words = trimmedInput.split(/\s+/);

  // Check if the number of words is at least 2
  if (words.length < 2) {
    console.warn("Input should contain at least two words.");
    return false;
  }

  // Check if the length of the input is at least 8 characters
  if (trimmedInput.length < 8) {
    console.warn("Input should be at least 8 characters long.");
    return false;
  }

  // Both conditions are met, input is valid
  console.log("Input is valid.");
  return true;
}

function textValidation(input) {
  return repeatedCharsValidation(input) && lengthValidation(input);
}

function addTextAreaInvalidStyle() {
  const textArea = document.getElementById("textArea");

  textArea.classList.add("invalid");

  textArea.addEventListener("input", () => {
    textArea.classList.remove("invalid");
  });
}

// SPAM PREVENTION //

function setLastPostDate() {
  let lastPostDate = new Date();
  let lastPostDateString = lastPostDate.toISOString();
  localStorage.setItem("lastPostDate", lastPostDateString);
  console.log("Last post time resetted");
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
