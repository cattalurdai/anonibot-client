(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        validateSelections();
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          getPreview();
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
    themeStatusIcon.src = "./assets/img/success.png";
    themeStatusIcon.classList.remove("invalidStatus");
  }
}

const fontStatusIcon = document.getElementById("fontStatusIcon");
function selectFont() {
  if (document.querySelector('input[name="fontSelection"]:checked').value) {
    fontStatusIcon.src = "./assets/img/success.png";
    fontStatusIcon.classList.remove("invalidStatus");
  }
}

function validateSelections() {
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

  return themeSelected && fontSelected;
}

//BUILD BODY

async function buildBody() {
  const body = {
    text: await document.getElementById("textArea").value,
    theme: await document.querySelector(
      'input[name="themeSelection"]:checked'
    ).value,
    font: await document.querySelector('input[name="fontSelection"]:checked')
      .value,
  };
  return JSON.stringify(body);
}

//const API = "https://api.anonibot.com:9999";
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

    getModal().show();
  } catch (error) {
    console.error(error);
  }
}

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

    console.log(response.body);
  } catch (error) {
    console.error(error);
  }
}
