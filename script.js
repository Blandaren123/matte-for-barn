let level = "";
let correctAnswer = 0;
let correctTime = "";
let score = 0;
let accessory = localStorage.getItem("accessory") || "";
let player = localStorage.getItem("playerName") || "";

const achievements = [
  { score: 5, name: "Första steget", unlocked: false },
  { score: 10, name: "Silverstjärna", unlocked: false },
  { score: 15, name: "Guldmästare", unlocked: false }
];

let avatar = localStorage.getItem("avatar") || "😺";
document.getElementById("chosenAvatar").innerText =
  "Vald avatar: " + avatar;

function selectAvatar(selected) {
  avatar = selected;
  localStorage.setItem("avatar", avatar);
  document.getElementById("chosenAvatar").innerText =
    "Vald avatar: " + avatar;
}

function selectAccessory(selected) {
  accessory = selected;
  localStorage.setItem("accessory", accessory);
  document.getElementById("chosenAccessory").innerText =
    "Valt tillbehör: " + (accessory || "Ingen");
}

function setPlayer() {
  const nameInput = document.getElementById("playerName").value;
  if(nameInput.trim() === "") return;
  player = nameInput;
  localStorage.setItem("playerName", player);
  document.getElementById("savedName").innerText = "Hej " + player + "!";
}

const checkAchievements = () => {
  achievements.forEach(a => {
    if (score >= a.score && !a.unlocked) {
      a.unlocked = true;
      alert(`🏆 Achievement låst upp: ${a.name}!`);
      saveAchievements();
    }
  });
};

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

window.onload = () => {
  loadAchievements();
  document.getElementById("chosenAvatar").innerText =
    "Vald avatar: " + (localStorage.getItem("avatar") || "😺");
  document.getElementById("chosenAccessory").innerText =
    "Valt tillbehör: " + (localStorage.getItem("accessory") || "Ingen");
  document.getElementById("savedName").innerText =
    player ? "Hej " + player + "!" : "Inget namn valt";
};

function startGame(selectedLevel) {
  level = selectedLevel;
  document.getElementById("menu").style.display = "none";
  document.getElementById("game").classList.remove("hidden");
  generateMath();
  generateTime();
}

function avatarPersonality() {
  if (avatar === "🤖") return "Analyserar...";
  if (avatar === "🐲") return "🔥 Utmana mig!";
  if (avatar === "🦄") return "✨ Du klarar detta!";
  if (avatar === "🧙‍♂️") return "📜 Visdom är makt!";
  return "😄 Kör!";
}

function cheer(success) {
  document.getElementById("character").innerText = success
    ? `${avatar}${accessory} Grymt jobbat!! 🎉`
    : `${avatar}${accessory} Nästan! Försök igen 💪`;
}

function getMedal() {
  if (score >= 15) return "🥇 Guld";
  if (score >= 10) return "🥈 Silver";
  if (score >= 5) return "🥉 Brons";
  return "🎈 Nybörjare";
}

function updateStars() {
  document.getElementById("stars").innerText =
    "⭐".repeat(score);
}

function generateMath() {
  document.getElementById("character").innerText =
    `${avatar} ${avatarPersonality()}`;

  let a, b;

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

function checkAnswer() {
  const userAnswer = Number(document.getElementById("answer").value);

  if (userAnswer === correctAnswer) {
    score++;
    document.getElementById("correctSound").play();
    cheer(true);
  } else {
    document.getElementById("wrongSound").play();
    cheer(false);
  }

  document.getElementById("score").innerText = score;
  document.getElementById("levelBadge").innerText = getMedal();
  updateStars();
  checkAchievements();
  generateMath();
}

function generateTime() {
  let hour = Math.floor(Math.random() * 12) + 1;
  let minute = Math.random() > 0.5 ? 0 : 30;

  correctTime = `${hour}:${minute === 0 ? "00" : "30"}`;

  document.getElementById("timeQuestion").innerText =
    minute === 0
      ? `🕒 Klockan är ${hour} exakt`
      : `🕒 Klockan är halv ${hour + 1}`;

  drawClock(hour, minute);
}

function checkTime() {
  const userTime = document.getElementById("timeAnswer").value;
  document.getElementById("timeResult").innerText =
    userTime === correctTime
      ? "✅ Rätt tid!"
      : `❌ Rätt svar är ${correctTime}`;
  generateTime();
}

function drawClock(hour, minute) {
  const canvas = document.getElementById("clock");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 200, 200);

  ctx.beginPath();
  ctx.arc(100, 100, 90, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(100, 100);
  ctx.lineTo(
    100 + 40 * Math.cos((hour % 12) * 30 * Math.PI / 180 - Math.PI / 2),
    100 + 40 * Math.sin((hour % 12) * 30 * Math.PI / 180 - Math.PI / 2)
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(100, 100);
  ctx.lineTo(
    100 + 70 * Math.cos(minute * 6 * Math.PI / 180 - Math.PI / 2),
    100 + 70 * Math.sin(minute * 6 * Math.PI / 180 - Math.PI / 2)
  );
  ctx.stroke();
}
