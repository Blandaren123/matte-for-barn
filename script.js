// =====================
// GLOBALA VARIABLER
// =====================
let level = "";
let correctAnswer = 0;
let correctTime = "";
let score = 0;
let combo = 0; // combo-system

let avatar = localStorage.getItem("avatar") || "😺";
let accessory = localStorage.getItem("accessory") || "";
let player = localStorage.getItem("playerName") || "";
let gender = localStorage.getItem("gender") || ""; // kön

// =====================
// INIT
// =====================
window.onload = () => {
  loadAchievements();
  document.getElementById("chosenAvatar").innerText =
    "Vald avatar: " + avatar;
  document.getElementById("chosenAccessory").innerText =
    "Valt tillbehör: " + (accessory || "Ingen");
  document.getElementById("savedName").innerText =
    player ? `Hej ${player}!` : "Inget namn valt";
};

// =====================
// SPARK-UP FUNKTIONER
// =====================
function selectAvatar(selected) {
  avatar = selected;
  localStorage.setItem("avatar", avatar);
  updateCharacterText();
  document.getElementById("chosenAvatar").innerText =
    "Vald avatar: " + avatar;
}

function selectAccessory(selected) {
  accessory = selected;
  localStorage.setItem("accessory", accessory);
  updateCharacterText();
  document.getElementById("chosenAccessory").innerText =
    "Valt tillbehör: " + (accessory || "Ingen");
}

function setPlayer() {
  const nameInput = document.getElementById("playerName").value;
  if (nameInput.trim() === "") return;
  player = nameInput;
  localStorage.setItem("playerName", player);
  document.getElementById("savedName").innerText =
    `Hej ${player}!`;
}

function setGender(selected) {
  gender = selected;
  localStorage.setItem("gender", gender);
}

// =====================
// SPELSTART
// =====================
function startGame(selectedLevel) {
  level = selectedLevel;
  document.getElementById("menu").style.display = "none";
  document.getElementById("game").classList.remove("hidden");
  generateMath();
  generateTime();
  changeBackground();
}

// =====================
// AVATAR PERSONLIGHET & ANIMATION
// =====================
function avatarPersonality() {
  if (avatar === "😺") return "😸 Rätt på!";
  if (avatar === "🤖") return "Analyserar...";
  if (avatar === "🐲") return "🔥 Utmana mig!";
  if (avatar === "🦄") return "✨ Du klarar detta!";
  if (avatar === "🧙‍♂️") return "📜 Visdom är makt!";
  if (avatar === "🐧") return "❄️ Kul med kyla!";
  if (avatar === "🐸") return "💚 Hoppar runt!";
  if (avatar === "🦊") return "🦊 Listig som alltid!";
  return "😄 Kör!";
}

function updateCharacterText() {
  let greet = gender === "girl" ? "Prinsessan" :
              gender === "boy" ? "Hjälten" :
              "";

  // Tillbehörsklass
  let accessoryClass = "";
  if(accessory === "⚔️") accessoryClass = "accessory-spin";
  if(accessory === "🪄") accessoryClass = "accessory-glitter";
  if(accessory === "🎩") accessoryClass = "accessory-blink";

  // Avatar-animation
  let avatarClass = "";
  if(avatar === "😺" || avatar === "🐸") avatarClass = "avatar-jump";
  if(avatar === "🐲" || avatar === "🦊" || avatar==="🤖") avatarClass = "avatar-sway";
  if(avatar === "🦄" || avatar === "🧙‍♂️") avatarClass = "avatar-glitter";
  if(avatar === "🐧") avatarClass = "avatar-sway";

  document.getElementById("character").innerHTML = `
    <span class="${avatarClass}">${avatar}</span>
    <span class="${accessoryClass}">${accessory}</span>
    ${greet} ${avatarPersonality()}
  `;
}

function cheer(success) {
  updateCharacterText();
  document.getElementById("character").innerText += success ? " 🎉 Grymt jobbat!!" : " 💪 Nästan rätt!";
  avatarJump();
}

// =====================
// MATTE & FRÅGOR
// =====================
function generateMath() {
  updateCharacterText();

  let a, b;

  // Bossfråga var 10:e poäng
  if(score > 0 && score % 10 === 0) {
    if(level === "easy") {
      correctAnswer = Math.floor(Math.random() * 20 + 10); // 10-29
      document.getElementById("question").innerText = `👑 Bossfråga! Vad blir ${correctAnswer - 5} + 5?`;
    } else {
      a = Math.floor(Math.random() * 11) + 10; // 10-20
      b = Math.floor(Math.random() * 11) + 10; // 10-20
      correctAnswer = a * b;
      document.getElementById("question").innerText = `👑 Bossfråga! ${a} × ${b} = ?`;
    }
    return;
  }

  if (level === "easy") {
    a = Math.floor(Math.random() * 10);
    b = Math.floor(Math.random() * 10);
    correctAnswer = a + b;
    document.getElementById("question").innerText =
      `${a} + ${b} = ?`;
  } else {
    if (Math.random() > 0.5) {
      correctAnswer = 12 / 3;
      document.getElementById("question").innerText =
        "🍎 Lisa har 12 äpplen och delar dem på 3 barn. Hur många får varje barn?";
      return;
    }
    a = Math.floor(Math.random() * 10);
    b = Math.floor(Math.random() * 10);
    correctAnswer = a * b;
    document.getElementById("question").innerText =
      `${a} × ${b} = ?`;
  }
}

// =====================
// CHECK SVAR
// =====================
function checkAnswer() {
  const userAnswer = Number(document.getElementById("answer").value);

  if (userAnswer === correctAnswer) {
    score++;
    combo++;
    cheer(true);

    if(combo >= 3) {
      score++;
      alert(`🔥 Combo x${combo}! Extra poäng!`);
      celebrate();
    }

  } else {
    cheer(false);
    combo = 0;
  }

  document.getElementById("answer").value = "";
  document.getElementById("score").innerText = score;
  document.getElementById("levelBadge").innerText = getMedal();
  updateStars();
  checkAchievements();
  generateMath();
}

// =====================
// LEVEL & STARS
// =====================
function getMedal() {
  if (score >= 15) return "🥇 Guld";
  if (score >= 10) return "🥈 Silver";
  if (score >= 5) return "🥉 Brons";
  return "🎈 Nybörjare";
}

function updateStars() {
  const stars = document.getElementById("stars");
  stars.innerText = "⭐".repeat(score);
  stars.classList.add("score-jump");
  setTimeout(()=> stars.classList.remove("score-jump"), 500);
}

// =====================
// EFFEKTER
// =====================
function celebrate() {
  const confettiContainer = document.createElement("div");
  confettiContainer.style.position = "fixed";
  confettiContainer.style.top = 0;
  confettiContainer.style.left = 0;
  confettiContainer.style.width = "100%";
  confettiContainer.style.height = "100%";
  confettiContainer.style.pointerEvents = "none";
  confettiContainer.style.overflow = "hidden";
  confettiContainer.style.zIndex = "9999";
  document.body.appendChild(confettiContainer);

  for(let i=0; i<50; i++){
    const emoji = document.createElement("div");
    emoji.innerText = ["🎉","✨","🌟","🎈"][Math.floor(Math.random()*4)];
    emoji.style.position = "absolute";
    emoji.style.left = Math.random()*100 + "%";
    emoji.style.top = "-2%";
    emoji.style.fontSize = Math.random()*30 + 20 + "px";
    emoji.style.animation = `fall ${3 + Math.random()*2}s linear`;
    confettiContainer.appendChild(emoji);
  }

  setTimeout(()=> confettiContainer.remove(), 5000);
}

function avatarJump() {
  const character = document.getElementById("character");
  character.classList.add("avatar-animate");
  setTimeout(()=> character.classList.remove("avatar-animate"), 500);
}

function scoreJump() {
  const scoreEl = document.getElementById("score");
  scoreEl.classList.add("score-jump");
  setTimeout(()=> scoreEl.classList.remove("score-jump"), 500);
}

function changeBackground() {
  const colors = ["#fceabb","#ffb347","#ff7b00","#a0e9fd","#c1fba4"];
  document.body.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
}

// =====================
// ACHIEVEMENTS
// =====================
const achievements = [
  { score: 5, name: "Första steget", unlocked: false },
  { score: 10, name: "Silverstjärna", unlocked: false },
  { score: 15, name: "Guldmästare", unlocked: false }
];

function checkAchievements() {
  achievements.forEach(a => {
    if (score >= a.score && !a.unlocked) {
      a.unlocked = true;
      alert(`🏆 Achievement låst upp: ${a.name}!`);
      celebrate();

      if(a.score === 5) selectAccessory("🎩");
      if(a.score === 10) selectAccessory("🕶️");
      if(a.score === 15) selectAccessory("⚔️");

      saveAchievements();
    }
  });
}

function saveAchievements() {
  localStorage.setItem("achievements", JSON.stringify(achievements));
}

function loadAchievements() {
  const stored = localStorage.getItem("achievements");
  if (stored) {
    const parsed = JSON.parse(stored);
    parsed.forEach((a, i) => achievements[i].unlocked = a.unlocked);
  }
}

// =====================
// KLOCKA
// =====================
function generateTime() {
  let hour, minute;
  minute = Math.random() > 0.5 ? 0 : 30;

  if(level === "easy") {
    // 12-timmars AM/PM för display
    hour = Math.floor(Math.random() * 12) + 1; // 1-12
    let ampm = Math.random() > 0.5 ? "AM" : "PM";
    // Konvertera till 24-timmars för input-matching
    let hour24 = ampm === "AM" ? hour % 12 : (hour % 12) + 12;
    correctTime = `${String(hour24).padStart(2, '0')}:${minute === 0 ? "00" : "30"}`;
    document.getElementById("timeQuestion").innerText =
      minute === 0
        ? `🕒 Klockan är ${hour} ${ampm} exakt`
        : `🕒 Klockan är halv ${hour + 1} ${ampm}`;
  } else {
    // 24-timmars
    hour = Math.floor(Math.random() * 24); // 0-23
    correctTime = `${String(hour).padStart(2, '0')}:${minute === 0 ? "00" : "30"}`;
    document.getElementById("timeQuestion").innerText =
      minute === 0
        ? `🕒 Klockan är ${hour}:00`
        : `🕒 Klockan är ${hour}:${minute === 30 ? "30" : "00"}`;
  }

  drawClock(hour % 12 || 12, minute); // analog klocka alltid 12h
}

function checkTime() {
  const userTime = document.getElementById("timeAnswer").value.trim();

  if(userTime === correctTime) {
    document.getElementById("timeResult").innerText = "✅ Rätt tid!";
    avatarJump();
    scoreJump();
    score++;
    document.getElementById("score").innerText = score;
    document.getElementById("levelBadge").innerText = getMedal();
    updateStars();
    checkAchievements();
  } else {
    document.getElementById("timeResult").innerText = `❌ Rätt svar är ${correctTime}`;
    combo = 0;
  }

  document.getElementById("timeAnswer").value = "";
  generateTime();
}

function drawClock(hour, minute) {
  const canvas = document.getElementById("clock");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 200, 200);

  ctx.beginPath();
  ctx.arc(100, 100, 90, 0, Math.PI * 2);
  ctx.stroke();

  // Timvisare
  ctx.beginPath();
  ctx.moveTo(100, 100);
  ctx.lineTo(
    100 + 40 * Math.cos((hour % 12) * 30 * Math.PI / 180 - Math.PI / 2),
    100 + 40 * Math.sin((hour % 12) * 30 * Math.PI / 180 - Math.PI / 2)
  );
  ctx.stroke();

  // Minutvisare
  ctx.beginPath();
  ctx.moveTo(100, 100);
  ctx.lineTo(
    100 + 70 * Math.cos(minute * 6 * Math.PI / 180 - Math.PI / 2),
    100 + 70 * Math.sin(minute * 6 * Math.PI / 180 - Math.PI / 2)
  );
  ctx.stroke();
}
