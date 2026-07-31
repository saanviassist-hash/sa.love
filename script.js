const screens = {
  password: document.getElementById("passwordScreen"),
  intro: document.getElementById("introScreen"),
  book: document.getElementById("bookScreen")
};

const passwordForm = document.getElementById("passwordForm");
const passwordInput = document.getElementById("passwordInput");
const passwordError = document.getElementById("passwordError");
const introVideo = document.getElementById("introVideo");
const videoFrame = document.querySelector(".video-frame");
const openHeartBtn = document.getElementById("openHeartBtn");
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const musicAction = document.getElementById("musicAction");
const volumeControl = document.getElementById("volumeControl");
const musicSeek = document.getElementById("musicSeek");
const musicProgress = document.getElementById("musicProgress");
const musicTime = document.getElementById("musicTime");
const pages = Array.from(document.querySelectorAll(".book-page"));
const pageNumber = document.getElementById("pageNumber");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");
const envelopeBtn = document.getElementById("envelopeBtn");
const letterContent = document.getElementById("letterContent");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const answerArea = document.getElementById("answerArea");
const teaseText = document.getElementById("teaseText");
const yesMessage = document.getElementById("yesMessage");
const petalLayer = document.getElementById("petalLayer");
const heartLayer = document.getElementById("heartLayer");
const sparkleLayer = document.getElementById("sparkleLayer");

const PASSWORD = "17122022";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let currentPage = 0;
let lastSpark = 0;
let musicSeeking = false;

document.querySelectorAll(".scrapbook img").forEach((image) => {
  image.addEventListener("error", () => {
    image.closest("figure").classList.add("is-missing");
    image.remove();
  });
});

window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("loader").classList.add("is-hidden"), 650);

  if (!prefersReducedMotion) {
    createPetal();
    createHeart();
    createParticle();
  }

  updateMusicDisplay();
});

function showScreen(name) {
  Object.values(screens).forEach((screen) => {
    screen.classList.remove("is-active");
    screen.setAttribute("aria-hidden", "true");
  });
  screens[name].classList.add("is-active");
  screens[name].removeAttribute("aria-hidden");

  const firstInput = screens[name].querySelector("input, button");
  if (firstInput) {
    setTimeout(() => firstInput.focus({ preventScroll: true }), 260);
  }
}

function setMusicState(isPlaying) {
  musicToggle.classList.toggle("is-playing", isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
  musicToggle.setAttribute("aria-label", isPlaying ? "Pause music" : "Play music");
  musicAction.textContent = isPlaying ? "Pause" : "Play";
}

async function tryPlayMusic() {
  bgMusic.volume = Number(volumeControl.value);
  try {
    await bgMusic.play();
    setMusicState(true);
  } catch {
    setMusicState(false);
  }
}

passwordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (passwordInput.value.trim() !== PASSWORD) {
    passwordError.textContent = "Incorrect password. Try again";
    passwordInput.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(0)" }],
      { duration: 260, easing: "ease-out" }
    );
    return;
  }

  passwordError.textContent = "";
  showScreen("intro");
  await tryPlayMusic();
  playIntroVideo();
});

async function playIntroVideo() {
  try {
    await introVideo.play();
  } catch {
    openHeartBtn.classList.remove("hidden");
  }
}

introVideo.addEventListener("ended", () => openHeartBtn.classList.remove("hidden"));
introVideo.addEventListener("error", () => {
  videoFrame.classList.add("has-fallback");
  openHeartBtn.classList.remove("hidden");
});

openHeartBtn.addEventListener("click", () => {
  showScreen("book");
  updatePage(0);
});

function updatePage(nextIndex) {
  const previous = currentPage;
  currentPage = Math.max(0, Math.min(pages.length - 1, nextIndex));
  pages.forEach((page, index) => {
    page.classList.toggle("is-visible", index === currentPage);
    page.classList.toggle("turning", index === previous && index !== currentPage);
  });
  pageNumber.textContent = String(currentPage + 1);
  prevPage.disabled = currentPage === 0;
  nextPage.disabled = currentPage === pages.length - 1;
}

prevPage.addEventListener("click", () => updatePage(currentPage - 1));
nextPage.addEventListener("click", () => updatePage(currentPage + 1));

document.addEventListener("keydown", (event) => {
  if (!screens.book.classList.contains("is-active")) return;
  if (event.key === "ArrowLeft") updatePage(currentPage - 1);
  if (event.key === "ArrowRight") updatePage(currentPage + 1);
});

envelopeBtn.addEventListener("click", () => {
  envelopeBtn.classList.add("is-open");
  setTimeout(() => {
    envelopeBtn.style.display = "none";
    letterContent.classList.add("is-open");
    letterContent.focus?.();
  }, 420);
});

musicToggle.addEventListener("click", async () => {
  if (bgMusic.paused) {
    await tryPlayMusic();
  } else {
    bgMusic.pause();
    setMusicState(false);
  }
});

volumeControl.addEventListener("input", () => {
  bgMusic.volume = Number(volumeControl.value);
});

musicSeek.addEventListener("input", () => {
  musicSeeking = true;
  musicProgress.style.width = `${musicSeek.value}%`;
});

musicSeek.addEventListener("change", () => {
  const duration = Number.isFinite(bgMusic.duration) ? bgMusic.duration : 0;
  if (duration > 0) {
    bgMusic.currentTime = (Number(musicSeek.value) / 100) * duration;
  }
  musicSeeking = false;
});

bgMusic.addEventListener("play", () => setMusicState(true));
bgMusic.addEventListener("pause", () => setMusicState(false));
bgMusic.addEventListener("loadedmetadata", updateMusicDisplay);
bgMusic.addEventListener("timeupdate", updateMusicDisplay);

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function updateMusicDisplay() {
  const duration = Number.isFinite(bgMusic.duration) ? bgMusic.duration : 0;
  const current = Number.isFinite(bgMusic.currentTime) ? bgMusic.currentTime : 0;
  const percent = duration > 0 ? (current / duration) * 100 : 0;

  if (!musicSeeking) {
    musicSeek.value = String(percent);
    musicProgress.style.width = `${percent}%`;
  }

  musicTime.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
}

function createPetal() {
  const petal = document.createElement("span");
  petal.className = "falling-petal";
  petal.style.left = `${Math.random() * 100}%`;
  petal.style.opacity = `${0.34 + Math.random() * 0.45}`;
  petal.style.scale = `${0.58 + Math.random() * 0.82}`;
  petal.style.setProperty("--drift", `${-90 + Math.random() * 180}px`);
  petal.style.animationDuration = `${8 + Math.random() * 9}s`;
  petalLayer.appendChild(petal);
  petal.addEventListener("animationend", () => petal.remove());
  setTimeout(createPetal, 640 + Math.random() * 1000);
}

function createHeart() {
  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.setProperty("--drift", `${-70 + Math.random() * 140}px`);
  heart.style.animationDuration = `${7 + Math.random() * 7}s`;
  heartLayer.appendChild(heart);
  heart.addEventListener("animationend", () => heart.remove());
  setTimeout(createHeart, 1200 + Math.random() * 1700);
}

function createParticle() {
  const particle = document.createElement("span");
  particle.className = "particle";
  particle.style.left = `${Math.random() * 100}%`;
  particle.style.top = `${12 + Math.random() * 76}%`;
  particle.style.animationDuration = `${3.2 + Math.random() * 3.4}s`;
  sparkleLayer.appendChild(particle);
  particle.addEventListener("animationend", () => particle.remove());
  setTimeout(createParticle, 520 + Math.random() * 940);
}

document.addEventListener("pointermove", (event) => {
  if (prefersReducedMotion || event.pointerType === "touch") return;
  const now = Date.now();
  if (now - lastSpark < 70) return;
  lastSpark = now;

  const spark = document.createElement("span");
  spark.className = "cursor-spark";
  spark.style.left = `${event.clientX}px`;
  spark.style.top = `${event.clientY}px`;
  sparkleLayer.appendChild(spark);
  spark.addEventListener("animationend", () => spark.remove());
});

document.querySelectorAll(".ripple-btn").forEach((button) => {
  button.addEventListener("click", (event) => {
    if (prefersReducedMotion) return;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    button.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
});

function dodgeNoButton() {
  const bounds = answerArea.getBoundingClientRect();
  const buttonBounds = noBtn.getBoundingClientRect();
  const x = Math.random() * Math.max(40, bounds.width - buttonBounds.width);
  const y = Math.random() * Math.max(50, bounds.height - buttonBounds.height);
  const rotate = -24 + Math.random() * 48;
  const scale = 0.78 + Math.random() * 0.55;

  noBtn.style.position = "absolute";
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  noBtn.style.transform = `rotate(${rotate}deg) scale(${scale})`;
  teaseText.textContent = Math.random() > 0.48 ? "Are you sure?" : "Try again, my love";
}

noBtn.addEventListener("pointerenter", dodgeNoButton);
noBtn.addEventListener("focus", dodgeNoButton);
noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  dodgeNoButton();
});

yesBtn.addEventListener("click", async () => {
  yesMessage.classList.add("is-visible");
  teaseText.textContent = "";
  bgMusic.playbackRate = 1.04;
  await tryPlayMusic();

  if (!prefersReducedMotion) {
    launchConfetti();
    launchFireworks();
  }
});

function launchConfetti() {
  const colors = ["#d94b68", "#f5b8c3", "#d4a85d", "#798e6b", "#fff7e8"];
  for (let i = 0; i < 132; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--drift", `${-150 + Math.random() * 300}px`);
    piece.style.animationDelay = `${Math.random() * 0.65}s`;
    piece.style.animationDuration = `${1.25 + Math.random() * 1.45}s`;
    sparkleLayer.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}

function launchFireworks() {
  const colors = ["#d94b68", "#d4a85d", "#fff7e8", "#f5b8c3"];
  for (let burst = 0; burst < 4; burst += 1) {
    const originX = 20 + Math.random() * 60;
    const originY = 18 + Math.random() * 44;
    for (let i = 0; i < 22; i += 1) {
      const angle = (Math.PI * 2 * i) / 22;
      const distance = 44 + Math.random() * 76;
      const firework = document.createElement("span");
      firework.className = "firework";
      firework.style.left = `${originX}%`;
      firework.style.top = `${originY}%`;
      firework.style.color = colors[i % colors.length];
      firework.style.background = colors[i % colors.length];
      firework.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
      firework.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
      firework.style.animationDelay = `${burst * 180}ms`;
      sparkleLayer.appendChild(firework);
      firework.addEventListener("animationend", () => firework.remove());
    }
  }
}
