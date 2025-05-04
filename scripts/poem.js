// Preloader
window.addEventListener("load", () => {
    // Show the main content after a short delay and hide the preloader
    setTimeout(() => {
        document.getElementById("preloader").style.display = "none";
        document.getElementById("main-content").style.display = "block";
        confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
    }, 4500);

    const birthday = new Date('2025-05-05T00:00:00').getTime();
    const countdownEl = document.getElementById('countdown');
    const countdownScreen = document.getElementById('countdown-screen');
    const siteContent = document.getElementById('site-content');

    // Declare timerInterval in outer scope
    let timerInterval;

    function updateCountdown() {
        const now = Date.now();
        const dist = birthday - now;

        if (dist <= 0) {
            // Stop the interval
            clearInterval(timerInterval);

            // Swap views
            countdownScreen.style.display = 'none';
            siteContent.style.display = 'block';
            return;
        }

        // Compute remaining time
        const days = Math.floor(dist / (1000 * 60 * 60 * 24));
        const hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((dist % (1000 * 60)) / 1000);

        countdownEl.textContent =
            `Next birthday in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    // Run once immediately…
    updateCountdown();
    // …and then every second, storing the ID in timerInterval
    timerInterval = setInterval(updateCountdown, 1000);

});


// Fetch and load poems from poems.json
fetch("./data/poems.json")
    .then((response) => response.json())
    .then((jsonPoems) => {
        const cardsContainer = document.getElementById("interactive-cards");

        // Random selections
        const randomDaily = jsonPoems.daily[Math.floor(Math.random() * jsonPoems.daily.length)];
        const randomCarousel = jsonPoems.carousel[Math.floor(Math.random() * jsonPoems.carousel.length)];
        const randomFlipcard = jsonPoems.flipcards[Math.floor(Math.random() * jsonPoems.flipcards.length)];
        const randomSecret = jsonPoems.secretmsg[Math.floor(Math.random() * jsonPoems.secretmsg.length)]; // corrected key

        // Poem of the Day
        const poemOfTheDay = document.getElementById("poemOfTheDay");
        if (poemOfTheDay) {
            poemOfTheDay.innerText = randomDaily;
        }

        // Carousel Setup
        const carouselContainer = document.getElementById("carousel-poems");
        if (carouselContainer) {
            jsonPoems.carousel.forEach((poem, i) => {
                const div = document.createElement("div");
                div.className = `carousel-item${i === 0 ? " active" : ""}`;
                div.innerHTML = `
  <div class='poem-card p-4'>
    <h5>${poem.title}</h5>
    <p>${poem.lines.join("<br>")}</p>
  </div>`;
                carouselContainer.appendChild(div);
            });
        }

        // Flipcard + Secret Message Cards
        cardsContainer.innerHTML = `
<div class="row justify-content-center g-4">

<!-- Flipcard -->
<div class="col-md-4 d-flex justify-content-center">
<div class="flip-card" onclick="this.querySelector('.flip-card-inner').classList.toggle('flipped')">
<div class="flip-card-inner">
  <div class="flip-card-front text-center p-3">
    <p>${randomFlipcard.front}</p>
  </div>
  <div class="flip-card-back text-center p-3">
    <p>${randomFlipcard.back}</p>
  </div>
</div>
</div>
</div>
<!-- Shiny Secret Card -->
<div class="col-md-4 d-flex justify-content-center">
  <div class="shiny-card mx-auto text-center p-3"
       data-bs-toggle="modal"
       data-bs-target="#secretModal"
       onclick="revealMessage()">
    <h6>${randomSecret.title}</h6>
    <p>Click to reveal a secret…</p>
  </div>
</div>

<!-- Secret Message Modal -->
<div class="modal fade" id="secretModal" tabindex="-1" aria-labelledby="secretModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content text-center">
      <div class="modal-header border-0">
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
  <!-- Hidden message revealed on click -->
  <div id="revealed-message" class="d-none">
          <h5 class="modal-title mx-auto fw-semibold text-dark fs-3 mb-4" id="secretModalLabel">${randomSecret.title}</h5>
        <p class='poem-text'>${randomSecret.lines.join("<br>")}</p>
      <br />
       <h5 class="fw-semibold text-dark text-end me-auto mt-3">
       - Your Paapu
    </h5>
  </div>

  <!-- Instruction before reveal -->
  <p id="tap-instruction" class="text-muted fst-italic mt-3">
    Tap the card to reveal...
  </p>
</div>

      <div class="modal-footer border-0 justify-content-center">
        <button type="button" class="btn btn-pink" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

`;


    })
    .catch((error) => console.error("Failed to load poems.json:", error));



function revealMessage() {
    const msg = document.getElementById("revealed-message");
    const hint = document.getElementById("tap-instruction");

    if (msg && hint) {
        msg.classList.remove("d-none");
        msg.classList.add("d-block");

        hint.classList.add("d-none");

        confetti({
            particleCount: 200,
            spread: 70,
            origin: { y: 0.6 }
        });

        localStorage.setItem("birthday_secret_revealed", "yes");
    }
}


document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("birthday_secret_revealed") === "yes") {
        const msg = document.getElementById("revealed-message");
        const hint = document.getElementById("tap-instruction");
        if (msg && hint) {
            msg.style.display = "block";
            hint.style.display = "none";
        }
    }
});


// Heart‑burst on click
// Heart‑burst on click (multiple hearts)
document.body.addEventListener('click', (e) => {
    // don’t spawn hearts when clicking buttons/links/inputs
    if (e.target.closest('button, a, input')) return;

    const count = 8;  // how many hearts per click
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('span');
        heart.className = 'heart-particle';
        heart.textContent = '♥';

        // randomise start position around the click
        const offsetX = (Math.random() - 0.5) * 40;  // ±20px
        const offsetY = (Math.random() - 0.5) * 40;  // ±20px
        heart.style.left = `${e.pageX + offsetX}px`;
        heart.style.top = `${e.pageY + offsetY}px`;

        document.body.appendChild(heart);

        heart.addEventListener('animationend', () => heart.remove());
    }
});

// When the modal is fully shown, trigger confetti
const secretModal = document.getElementById('secretModal');
secretModal.addEventListener('shown.bs.modal', () => {
    confetti({
        particleCount: 150,
        spread: 60,
        origin: { y: 0.6 }
    });
});


  // Safari and some mobile browsers require a user gesture before autoplaying audio.
  // This bit will resume playback if it's been suspended by the browser.
  document.addEventListener('click', function once() {
    const audio = document.getElementById('bg-audio');
    if (audio.paused) {
      audio.play().catch(() => {
        /* still may fail if user hasn't interacted, but click should cover it */
      });
    }
    document.removeEventListener('click', once);
  });
