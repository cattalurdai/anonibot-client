// DOTS ANIMATION

let dotsContainer = document.getElementById("dotsContainer");
let textArea = document.getElementById("textArea");

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

// SCROLL DIMMING ANIMATION 

function dimmingSrollAnimation(elem, startPercentage, endPercentage) {
  const elemTop = elem.offsetTop;
  const elemHeight = elem.offsetHeight;
  const dimStart = elemTop + (elemHeight * startPercentage) / 100;
  const dimEnd = elemTop + (elemHeight * endPercentage) / 100;

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;

    if (currentScroll >= dimStart && currentScroll < dimEnd) {
      const totalPixels =
        (elemHeight * (endPercentage - startPercentage)) / 100;
      const leftPixels =
        (currentScroll - elemTop - (elemHeight * startPercentage) / 100) *
        (elemHeight / totalPixels);
      const opacity = 1 - leftPixels / elemHeight;
      elem.style.opacity = opacity;
    } else if (currentScroll >= dimEnd) {
      elem.style.opacity = 0; // completely dark
    } else {
      elem.style.opacity = 1; // fully visible
    }
  });
}

const section = document.getElementById("first");
const section3 = document.getElementById("third");
const section2 = document.getElementById("second");
dimmingSrollAnimation(section, 50, 85); 
dimmingSrollAnimation(section2, 50, 85); 
dimmingSrollAnimation(section3, 50, 85); 

let eappsAdd = document.getElementsByClassName("eapps-link")[0]

