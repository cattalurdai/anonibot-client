(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        applyValidationStyles();
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          event.preventDefault();
          validateSelection() ? getPreview() : null;
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
})();

function addTextAreaInvalidStyle() {
  const textArea = document.getElementById("textArea");

  textArea.classList.add("invalid");

  textArea.addEventListener("input", () => {
    textArea.classList.remove("invalid");
  });
}

const themeStatusIcon = document.getElementById("themeStatusIcon");
function selectTheme() {
  if (document.querySelector('input[name="themeSelection"]:checked')) {
    themeStatusIcon.src = "./assets/img/success.webp";
    themeStatusIcon.classList.remove("invalidStatus");
  }
}

const fontStatusIcon = document.getElementById("fontStatusIcon");
function selectFont() {
  if (document.querySelector('input[name="fontSelection"]:checked').value) {
    fontStatusIcon.src = "./assets/img/success.webp";
    fontStatusIcon.classList.remove("invalidStatus");
  }
}

function applyValidationStyles() {
  const themeSelected = document.querySelector(
    'input[name="themeSelection"]:checked'
  );
  const fontSelected = document.querySelector(
    'input[name="fontSelection"]:checked'
  );

  if (!themeSelected) {
    themeStatusIcon.classList.add("invalidStatus");
  } else {
    themeStatusIcon.classList.remove("invalidStatus");
  }
  if (!fontSelected) {
    fontStatusIcon.classList.add("invalidStatus");
  } else {
    fontStatusIcon.classList.remove("invalidStatus");
  }
}

function validateSelection() {
  const themeSelected = document.querySelector(
    'input[name="themeSelection"]:checked'
  );
  const fontSelected = document.querySelector(
    'input[name="fontSelection"]:checked'
  );

  return themeSelected && fontSelected;
}

//BUILD BODY

async function buildBody() {
  const body = {
    text: await document.getElementById("textArea").value,
    theme: await document.querySelector('input[name="themeSelection"]:checked')
      .value,
    size: await document.querySelector('input[name="sizeSelection"]:checked')
      .value,
    font: await document.querySelector('input[name="fontSelection"]:checked')
      .value,
  };
  console.log(body);
  return JSON.stringify(body);
}

// const API = "https://api.anonibot.com:9999";
const API = "http://localhost:9999";

function getPreviewModal() {
  if (!previewModal) {
    previewModal = new $bootstrap.Modal("#test-modal");
  }
  return modal;
}

let previewModal = null;
const previewField = document.getElementById("imagePreview");

function getModal() {
  if (!previewModal) {
    previewModal = new bootstrap.Modal(document.getElementById("previewModal"));
  }
  return previewModal;
}
async function getPreview() {
  showSpinner();
  try {
    const response = await fetch(API + "/getPreview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: await buildBody(),
    });

    if (!response.ok) {
      // Check specific error status codes and display custom error messages
      if (response.status === 404) {
        showErrorAlert("No encontrado.");
      } else if (response.status === 500) {
        showErrorAlert("Error interno del servidor, intenta de nuevo");
      } else {
        const errorMessage = await response.text();
        showErrorAlert(
          `Solicitud falló con status: ${response.status}. ${errorMessage}`
        );
      }
      return;
    }

    const base64String = await response.text();

    // Update preview
    previewField.src = `data:image/png;base64,${base64String}`;

    hideSpinner();
    getModal().show();
  } catch (error) {
    // Handle network errors or other unexpected exceptions
    hideSpinner();
    showErrorAlert("Ocurrio un error inesperado, intenta de nuevo.");
    console.error(error);
  }
}

const submitCreatePost = document.getElementById("submitCreatePost");
submitCreatePost.addEventListener("click", () => {
  createPost();
});

async function createPost() {
  showSpinner();
  // Send request
  try {
    const response = await fetch(API + "/createPost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: await buildBody(),
    });

    if (response.status === 429) {
      // Handle 429 status error
      hideSpinner();
      showErrorAlert(
        "Has enviado un mensaje hace poco, intenta de nuevo en un rato"
      );
      return;
    }

    // Error handling
    if (!response.ok) {
      showErrorAlert("Error de servidor, intenta otra vez");
      hideSpinner();
      throw new Error(`Request failed with status: ${response.status}`);
    }

    hideSpinner();
    showSuccessAlert();
    console.log(response.body);
  } catch (error) {
    console.error(error);
  }
}

// CHAR COUNTER
// Get the textarea element
const textArea = document.getElementById("textArea");

// Get the counter element
const charCounter = document.getElementById("charCounter");

// Get the radio buttons
const sizeSelectionRadios = document.getElementsByName("sizeSelection");

// Function to update the character counter
function updateCharCounter() {
  const remainingCharacters = textArea.maxLength - textArea.value.length;
  charCounter.textContent = remainingCharacters;
  charCounter.style.color = remainingCharacters < 0 ? "red" : "#333"; // Set color based on remaining characters
}

// Update the character counter and display negative remaining characters
textArea.addEventListener("input", () => {
  updateCharCounter();
});

// Handle paste event
textArea.addEventListener("paste", (event) => {
  // Allow the paste event to complete first
  setTimeout(() => {
    updateCharCounter();

    // Trim the text to the character limit if necessary
    if (textArea.value.length > textArea.maxLength) {
      textArea.value = textArea.value.slice(0, textArea.maxLength);
      updateCharCounter();
    }
  }, 10);
});

// Update the maximum character limit based on radio button selection
sizeSelectionRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    if (radio.value === "sm") {
      textArea.maxLength = 240;
    } else if (radio.value === "md") {
      textArea.maxLength = 120;
    } else {
      textArea.maxLength = 60;
    }

    // Update the counter to reflect the new limit
    updateCharCounter();
  });
});

// FULLSCREEN IMAGE

// Get the image element
const imagePreview = document.getElementById("imagePreview");

// Variable to store the timer for long press
let longPressTimer;

// Function to toggle fullscreen mode
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    imagePreview.requestFullscreen().catch((err) => {
      console.log(
        `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
      );
    });
  } else {
    document.exitFullscreen();
  }
}

// Function to handle long press
function handleLongPress(event) {
  event.preventDefault(); // Prevent the context menu from opening
  longPressTimer = setTimeout(() => {
    toggleFullScreen();
    // After entering fullscreen, remove the "click" event listener
    imagePreview.removeEventListener("click", handleExitFullscreen);
  }, 500); // Adjust the long press duration (in milliseconds) as needed
}

// Function to handle release of the press
function handleRelease() {
  clearTimeout(longPressTimer);
}

// Function to handle exit fullscreen on click
function handleExitFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
}

// Listen for touch events
imagePreview.addEventListener("touchstart", handleLongPress);
imagePreview.addEventListener("touchend", handleRelease);

// Listen for mouse events
imagePreview.addEventListener("mousedown", handleLongPress);
imagePreview.addEventListener("mouseup", handleRelease);

// Listen for click event to exit fullscreen mode (with a delay)
imagePreview.addEventListener("click", () => {
  setTimeout(() => {
    imagePreview.addEventListener("click", handleExitFullscreen);
  }, 300); // Adjust the delay (in milliseconds) as needed
});

// SUCCESS ALERT
// Function to show the success alert
function showSuccessAlert() {
  // Show the success alert
  const alertContainer = document.getElementById("alertContainer");
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `  <div class="col-12 p-0 col-lg-5 alert alert-success align-items-center  mx-lg-auto text-gray-900 fade show" id="successAlert"
role="alert"><div class="row">
<div class="col-2 ms-auto">
<img width="50" src="/assets/img/success.webp" alt=""></div>
<div class="col-10 d-flex align-items-center me-auto">
<span class="ps-2">Secreto publicado exitosamente </span></div></div>
</div>`;

  alertContainer.append(wrapper);
  // Automatically hide the alert after a few seconds (optional)
  setTimeout(() => {
    alertContainer.innerHTML = "";
  }, 5000);
}
function showErrorAlert(text) {
  // Show the success alert
  const alertContainer = document.getElementById("alertContainer");
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `  <div class="col-12 p-0 col-lg-5 alert alert-danger align-items-center  mx-lg-auto text-gray-900 fade show" id="successAlert"
role="alert"><div class="row">
<div class="col-2 ms-auto">

<img width="50" src="/assets/img/error.webp" alt=""></div>

<div class="col-10 d-flex align-items-center me-auto">
<span class="ps-2">${text} </span></div></div>
</div>`;

  alertContainer.append(wrapper);
  // Automatically hide the alert after a few seconds (optional)
  setTimeout(() => {
    alertContainer.innerHTML = "";
  }, 8000);
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
