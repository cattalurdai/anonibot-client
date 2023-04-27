// BOOTSTRAP FORM VALIDATIONS

(function () {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
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

// ANIMATION DOTS

let dotsContainer = document.getElementById("dotsContainer");
let textArea = document.getElementById("textArea");

// Animation scope
(function () {
  let isAnimating = false;

  // Return if animation already running
  function animateDots() {
    if (isAnimating) {
      return;
    }

    // Start animation
    isAnimating = true;

    let count = 0;
    const intervalId = setInterval(() => {
      if (textArea.value) {
        // Break if input is detected
        clearInterval(intervalId);
        dotsContainer.textContent = "";
        isAnimating = false;
        return;
      }
      count = (count + 1) % 4;
      dotsContainer.textContent = ".".repeat(count);
    }, 800);
  }

  // Call animateDots() initially
  animateDots();

  // Event listener for blur event on text area
  textArea.addEventListener("blur", () => {
    // Restart the animation
    animateDots();
  });
})();

// ANIMATION SCROLL DIMMING

// TODO: THIS NEEDS TO BE MADE DYNAMIC SO IT CAN BE USED ON ANY SECTION

/* const section = document.getElementById("first");
const sectionTop = section.offsetTop;
const sectionHeight = section.offsetHeight;

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;

  if (window.scrollY > 250) {
    let totalPixels = sectionHeight - 350;
    let leftPixels = sectionHeight - window.scrollY;
    let percentage = (leftPixels / totalPixels) * 100;

    console.log(percentage);

    let opacity = percentage / 100;
    section.style.opacity = opacity;
  } else {
    section.style.opacity = 1; // fully visible
  }
});
 */

/* 
  function dimmingSrollAnimation(elem, startPercentage, endPercentage) {
    const elemTop = elem.offsetTop;
    const elemHeight = elem.offsetHeight;
    const dimStart = elemTop + (elemHeight * startPercentage / 100);
    const dimEnd = elemTop + (elemHeight * endPercentage / 100);
    
    window.addEventListener("scroll", () => {
      const currentScroll = window.scrollY;

      if (currentScroll >= dimStart && currentScroll < dimEnd) {
        const totalPixels = elemHeight * (endPercentage - startPercentage) / 100;
        const leftPixels = (currentScroll - elemTop - (elemHeight * startPercentage / 100)) * (elemHeight / totalPixels);
        const opacity = 1 - (leftPixels / elemHeight);
        elem.style.opacity = opacity;
      } else if (currentScroll >= dimEnd) {
        elem.style.opacity = 0; // completely dark
      } else {
        elem.style.opacity = 1; // fully visible
      }
    });
  }
 */

const section = document.getElementById("first"); /* 
  dimmingSrollAnimation(section, 50, 85); // will start dimming 20% down from the top of the section */

const section2 = document.getElementById("second"); /* 
  dimmingSrollAnimation(section2, 50, 85); // will start dimming 20% down from the top of the section */
  const section3 = document.getElementById("third"); 

fadeOnScroll(section, 50, 85, 75, 85);
fadeOnScroll(section2, 50, 85, 75, 85);
fadeOnScroll(section3, 50, 85, 75, 85);

function fadeOnScroll(elem, appearStartPct, appearEndPct, disappearStartPct, disappearEndPct, lockOpacityThreshold = 0.8) {
  const elemTop = elem.offsetTop;
  const elemHeight = elem.offsetHeight;
  const appearStartPixels = (elemHeight * appearStartPct) / 100;
  const appearEndPixels = (elemHeight * appearEndPct) / 100;
  const disappearStartPixels = (elemHeight * disappearStartPct) / 100;
  const disappearEndPixels = (elemHeight * disappearEndPct) / 100;

  let appearing = false;
  let disappearing = false;
  let locked = true;

  function updateOpacity() {
    const currentScroll = window.scrollY;
    const windowBottom = currentScroll + window.innerHeight;

    const appearStartVisible = Math.max(elemTop + appearStartPixels, currentScroll);
    const appearEndVisible = Math.min(elemTop + appearEndPixels, windowBottom);
    const disappearStartVisible = Math.max(elemTop + disappearStartPixels, currentScroll);
    const disappearEndVisible = Math.min(elemTop + disappearEndPixels, windowBottom);

    let opacity;

    if (!disappearing && appearStartVisible < appearEndVisible) {
      appearing = true;
      const visiblePixels = appearEndVisible - appearStartVisible;
      opacity = visiblePixels / (appearEndPixels - appearStartPixels);
    } else if (!appearing && disappearStartVisible < disappearEndVisible) {
      disappearing = true;
      const visiblePixels = disappearEndVisible - disappearStartVisible;
      opacity = 1 - visiblePixels / (disappearEndPixels - disappearStartPixels);
    } else {
      appearing = false;
      disappearing = false;
      locked = true;
      opacity = 0;
    }

    if (locked && opacity < lockOpacityThreshold) {
      locked = false;
    }

    if (!locked) {
      elem.style.opacity = opacity;
    }
  }

  window.addEventListener("scroll", updateOpacity);
}


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

///////// INSTAGRAM POST REQUESTS ///////////

// BUILD BODY SPECIFYING TEXT AND SELECTED BACKGROUND

async function buildBody() {
  const body = {
    text: await document.getElementById("textArea").value,
    background: await document.querySelector(
      'input[name="backgroundSelection"]:checked'
    ).value,
  };
  return JSON.stringify(body);
}

// REQUEST IMAGE PREVIEW

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

    // Check error
    if (!response.ok) {
      const errorMessage = await response.text();
      console.error(errorMessage);
      return;
    }
    const base64String = await response.text();

    // Set preview image as source
    previewField.src = `data:image/png;base64,${base64String}`;
  } catch (error) {
    console.error(error);
  }
}

// POST IMAGE ON IG

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

    // Check error
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

//////////// SPAM PREVENTION //////////////

// SAVES DATETIME WHEN POST IS SUBMITTED

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

/////// UTILITIES & TWEAKS //////////////

// CLOSE NAVBAR WHEN CLICK

const navLinks = document.querySelectorAll(".nav-link");
const menuToggle = document.getElementById("navbarMenu");
const bsCollapse = new bootstrap.Collapse(menuToggle, { toggle: false });
navLinks.forEach((l) => {
  l.addEventListener("click", () => {
    bsCollapse.toggle();
  });
});

// MILISECONDS TO TIME

function parseMillisecondsIntoTime(milliseconds) {
  // Get hours from milliseconds
  var hours = milliseconds / (1000 * 60 * 60);
  var absoluteHours = Math.floor(hours);
  var h = absoluteHours > 9 ? absoluteHours : "0" + absoluteHours;

  // Get remainder from hours and convert to minutes
  var minutes = (hours - absoluteHours) * 60;
  var absoluteMinutes = Math.floor(minutes);
  var m = absoluteMinutes > 9 ? absoluteMinutes : "0" + absoluteMinutes;

  // Get remainder from minutes and convert to seconds
  var seconds = (minutes - absoluteMinutes) * 60;
  var absoluteSeconds = Math.floor(seconds);
  var s = absoluteSeconds > 9 ? absoluteSeconds : "0" + absoluteSeconds;

  return h + ":" + m + ":" + s;
}
