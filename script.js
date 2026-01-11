// =====================
// GLOBALA VARIABLER
// =====================
let level = "";
let correctAnswer = 0;
let correctTime = "";
let score = 0;
let combo = 0; // combo-system
let streak = 0; // antal rätt i rad
let highscore = localStorage.getItem("highscore") || 0;
let questionStartTime = 0;
let fastAnswers = 0; // antal snabba svar

let avatar = localStorage.getItem("avatar") || "😺";
let accessory = localStorage.getItem("accessory") || "";
let player = localStorage.getItem("playerName") || "";
let gender = localStorage.getItem("gender") || ""; // kön
let pet = localStorage.getItem("pet") || ""; // husdjur
let theme = localStorage.getItem("theme") || "default";

// Power-ups
let powerups = {
  skip: 1,
  halfhalf: 1,
  extraTime: 1
};

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
  document.getElementById("highscoreDisplay").innerText = highscore;
  if(pet) {
    document.getElementById("chosenPet").innerText = "Ditt husdjur: " + pet;
  }
  applyTheme(theme);
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

function selectPet(selected) {
  pet = selected;
  localStorage.setItem("pet", pet);
  document.getElementById("chosenPet").innerText = "Ditt husdjur: " + pet;
  updateCharacterText();
}

function selectTheme(selectedTheme) {
  theme = selectedTheme;
  localStorage.setItem("theme", theme);
  applyTheme(theme);
}

function applyTheme(selectedTheme) {
  const themes = {
    default: "linear-gradient(135deg, #74ebd5, #acb6e5)",
    space: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    sunset: "linear-gradient(135deg, #ff6e7f, #bfe9ff)",
    forest: "linear-gradient(135deg, #134e5e, #71b280)",
    candy: "linear-gradient(135deg, #fa709a, #fee140)"
  };
  document.body.style.background = themes[selectedTheme] || themes.default;
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
  questionStartTime = Date.now();
  updatePowerupDisplay();
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
    ${pet ? `<span class="pet-float">${pet}</span>` : ''}
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
    // Ordfrågor även för 8-9 år!
    const easyWordProblems = [
      { text: "🍬 Du har 5 karameller och får 3 till. Hur många har du nu?", answer: 5 + 3 },
      { text: "🐶 På lekplatsen finns 7 barn. 2 barn går hem. Hur många är kvar?", answer: 7 - 2 },
      { text: "🎨 Du har 10 färgpennor. 4 är röda, resten är blå. Hur många är blå?", answer: 10 - 4 },
      { text: "⚽ Det finns 6 bollar. Du får 2 bollar till. Hur många bollar finns det?", answer: 6 + 2 },
      { text: "🔺 En triangel har hur många hörn?", answer: 3 },
      { text: "🔲 En fyrkant har hur många sidor?", answer: 4 }
    ];
    
    if (Math.random() > 0.4) {
      const problem = easyWordProblems[Math.floor(Math.random() * easyWordProblems.length)];
      correctAnswer = problem.answer;
      document.getElementById("question").innerText = problem.text;
      return;
    }
    
    a = Math.floor(Math.random() * 10);
    b = Math.floor(Math.random() * 10);
    correctAnswer = a + b;
    document.getElementById("question").innerText =
      `${a} + ${b} = ?`;
  } else {
    // Ordfrågor för variation - UTÖKAD
    const wordProblems = [
      { text: "🍎 Lisa har 12 äpplen och delar dem på 3 barn. Hur många får varje barn?", answer: 12 / 3 },
      { text: "🍕 En pizza har 8 bitar. Om 4 kompisar delar lika, hur många bitar får var och en?", answer: 8 / 4 },
      { text: "🚗 Det finns 15 bilar på en parkeringsplats. 5 bilar på varje rad. Hur många rader finns det?", answer: 15 / 5 },
      { text: "🍪 En burk har 20 kakor. Om du äter 4 kakor per dag, hur många dagar räcker de?", answer: 20 / 4 },
      { text: "📚 Det finns 18 böcker som ska delas på 6 hyllor. Hur många böcker per hylla?", answer: 18 / 6 },
      { text: "⚽ 24 barn ska delas i lag om 6 personer. Hur många lag blir det?", answer: 24 / 6 },
      { text: "🎈 Du har 16 ballonger och ska ge 8 till din kompis. Hur många har du kvar?", answer: 16 - 8 },
      { text: "🐕 En hund har 4 ben. Hur många ben har 3 hundar?", answer: 4 * 3 },
      { text: "💰 Du har 50 kr och köper godis för 15 kr. Hur mycket får du tillbaka?", answer: 50 - 15 },
      { text: "🎮 Ett spel kostar 25 kr. Du vill köpa 2 spel. Hur mycket kostar det?", answer: 25 * 2 },
      { text: "🍕 En pizza kostar 80 kr. Ni är 4 personer som delar. Hur mycket betalar var och en?", answer: 80 / 4 },
      { text: "🔺 En triangel har 3 sidor. Hur många sidor har 4 trianglar?", answer: 3 * 4 },
      { text: "⭐ En stjärna har 5 uddar. Hur många uddar har 3 stjärnor?", answer: 5 * 3 },
      { text: "🎯 Du behöver 100 poäng. Du har 65 poäng. Hur många poäng saknas?", answer: 100 - 65 }
    ];
    
    if (Math.random() > 0.3) {
      const problem = wordProblems[Math.floor(Math.random() * wordProblems.length)];
      correctAnswer = problem.answer;
      document.getElementById("question").innerText = problem.text;
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
  const timeTaken = (Date.now() - questionStartTime) / 1000; // sekunder

  if (userAnswer === correctAnswer) {
    score++;
    combo++;
    streak++;
    cheer(true);
    
    // Snabbt svar bonus (under 5 sekunder)
    if(timeTaken < 5) {
      fastAnswers++;
      score++;
      sparkleEffect();
      document.getElementById("character").innerText += " ⚡ Blixtsvar!";
    }

    if(combo >= 3) {
      score++;
      alert(`🔥 Combo x${combo}! Extra poäng!`);
      celebrate();
    }
    
    // Uppdatera highscore
    if(score > highscore) {
      highscore = score;
      localStorage.setItem("highscore", highscore);
      document.getElementById("highscoreDisplay").innerText = highscore;
      alert("🎊 NYTT REKORD! 🎊");
    }

  } else {
    cheer(false);
    combo = 0;
    streak = 0;
    shakeScreen();
  }

  document.getElementById("answer").value = "";
  document.getElementById("score").innerText = score;
  document.getElementById("streakDisplay").innerText = streak;
  document.getElementById("levelBadge").innerText = getMedal();
  updateStars();
  checkAchievements();
  generateMath();
  questionStartTime = Date.now();
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

function shakeScreen() {
  document.body.classList.add("shake");
  setTimeout(() => document.body.classList.remove("shake"), 500);
}

function sparkleEffect() {
  const sparkle = document.createElement("div");
  sparkle.innerText = "⚡";
  sparkle.className = "sparkle-effect";
  sparkle.style.position = "fixed";
  sparkle.style.left = "50%";
  sparkle.style.top = "50%";
  sparkle.style.fontSize = "60px";
  sparkle.style.animation = "sparkle 1s forwards";
  document.body.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 1000);
}

// =====================
// POWER-UPS
// =====================
function usePowerup(type) {
  if(powerups[type] <= 0) {
    alert("Du har inga fler av denna power-up!");
    return;
  }
  
  if(type === "skip") {
    powerups.skip--;
    generateMath();
    alert("⏭️ Fråga hoppas över!");
  } else if(type === "halfhalf") {
    powerups.halfhalf--;
    alert(`💡 Tips: Svaret är INTE ${correctAnswer + Math.floor(Math.random() * 10) + 1}`);
  } else if(type === "extraTime") {
    powerups.extraTime--;
    score += 2;
    document.getElementById("score").innerText = score;
    alert("⏰ +2 extrapoäng!");
  }
  
  updatePowerupDisplay();
}

function updatePowerupDisplay() {
  document.getElementById("powerupSkip").innerText = powerups.skip;
  document.getElementById("powerupHalf").innerText = powerups.halfhalf;
  document.getElementById("powerupTime").innerText = powerups.extraTime;
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

// Konvertera siffra till text
function numberToText(num) {
  const numbers = ["noll", "ett", "två", "tre", "fyra", "fem", "sex", "sju", 
                   "åtta", "nio", "tio", "elva", "tolv", "tretton", "fjorton", 
                   "femton", "sexton", "sjutton", "arton", "nitton", "tjugo", 
                   "tjugoett", "tjugotvå", "tjugotre"];
  return numbers[num] || num;
}

function generateTime() {
  let hour, minute;
  
  // Fler tidpunkter: 00, 15, 30, 45
  const minutes = [0, 15, 30, 45];
  minute = minutes[Math.floor(Math.random() * minutes.length)];

  if(level === "easy") {
    // 12-timmars för barn
    hour = Math.floor(Math.random() * 12) + 1; // 1-12
    let isMorning = Math.random() > 0.5;
    let timeOfDay = isMorning ? "på morgonen" : "på eftermiddagen";
    
    // Konvertera till 24-timmars för input-matching
    let hour24 = isMorning ? hour % 12 : (hour % 12) + 12;
    correctTime = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    
    let hourText = numberToText(hour);
    let timeText = "";
    
    if(minute === 0) {
      timeText = `🕒 Klockan är ${hourText} ${timeOfDay}`;
    } else if(minute === 30) {
      timeText = `🕒 Klockan är halv ${numberToText(hour + 1)} ${timeOfDay}`;
    } else if(minute === 15) {
      timeText = `🕒 Klockan är kvart över ${hourText} ${timeOfDay}`;
    } else if(minute === 45) {
      timeText = `🕒 Klockan är kvart i ${numberToText(hour + 1)} ${timeOfDay}`;
    }
    
    document.getElementById("timeQuestion").innerText = timeText;
  } else {
    // 24-timmars med text och tidsgåtor
    hour = Math.floor(Math.random() * 24); // 0-23
    correctTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    
    // Ibland tidsgåtor!
    if(Math.random() > 0.7 && minute === 0) {
      let hourBefore = (hour - 2 + 24) % 24;
      correctTime = `${String(hour).padStart(2, '0')}:00`;
      document.getElementById("timeQuestion").innerText = 
        `🧩 Om klockan var ${numberToText(hourBefore)} för 2 timmar sedan, vad är klockan nu?`;
    } else {
      let hourText = numberToText(hour);
      let timeText = "";
      
      if(minute === 0) {
        timeText = `🕒 Klockan är ${hourText}`;
      } else if(minute === 30) {
        timeText = `🕒 Klockan är halv ${numberToText((hour + 1) % 24)}`;
      } else if(minute === 15) {
        timeText = `🕒 Klockan är kvart över ${hourText}`;
      } else if(minute === 45) {
        timeText = `🕒 Klockan är kvart i ${numberToText((hour + 1) % 24)}`;
      }
      
      document.getElementById("timeQuestion").innerText = timeText;
    }
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
