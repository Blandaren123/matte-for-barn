// =====================
// GLOBALA VARIABLER
// =====================
let gameMode = ""; // math-easy, math-hard, clock-easy, clock-hard, test-mode
let level = "";
let correctAnswer = 0;
let correctTime = "";
let score = 0;
let combo = 0; // combo-system
let streak = 0; // antal rätt i rad
let highscore = localStorage.getItem("highscore") || 0;
let questionStartTime = 0;
let fastAnswers = 0; // antal snabba svar
let currentQuestionType = ""; // För att spåra kategori
let currentExplanation = ""; // Förklaring till svaret
let multipleChoiceOptions = []; // För flerval

let avatar = localStorage.getItem("avatar") || "😺";
let accessory = localStorage.getItem("accessory") || "";
let pet = localStorage.getItem("pet") || ""; // husdjur
let theme = localStorage.getItem("theme") || "default";

// Power-ups
let powerups = {
  skip: 1,
  halfhalf: 1,
  extraTime: 1
};

// Progressionsspårning
let progressStats = JSON.parse(localStorage.getItem("progressStats")) || {
  addition: { correct: 0, total: 0 },
  subtraction: { correct: 0, total: 0 },
  multiplication: { correct: 0, total: 0 },
  division: { correct: 0, total: 0 },
  fractions: { correct: 0, total: 0 },
  decimals: { correct: 0, total: 0 },
  geometry: { correct: 0, total: 0 },
  units: { correct: 0, total: 0 },
  money: { correct: 0, total: 0 },
  time: { correct: 0, total: 0 },
  patterns: { correct: 0, total: 0 }
};

// Provläge
let testMode = false;
let testQuestions = [];
let testCurrentQuestion = 0;
let testTimeLimit = 30 * 60; // 30 minuter
let testTimer = null;
let testStartTime = 0;

// Dagens utmaning
let dailyChallenge = JSON.parse(localStorage.getItem("dailyChallenge")) || {
  date: new Date().toDateString(),
  completed: false,
  streak: 0
};
let isDailyChallengeActive = false;

// =====================
// INIT
// =====================
window.onload = () => {
  loadAchievements();
  checkDailyChallenge();
  updateProgressDisplay();
  
  document.getElementById("chosenAvatar").innerText =
    "Vald avatar: " + avatar;
  document.getElementById("chosenAccessory").innerText =
    "Valt tillbehör: " + (accessory || "Ingen");
  document.getElementById("highscoreDisplay").innerText = highscore;
  if(pet) {
    document.getElementById("chosenPet").innerText = "Ditt husdjur: " + pet;
  }
  applyTheme(theme);
  
  // Markera sparade val visuellt
  if(avatar) {
    document.querySelectorAll('#avatars button').forEach(btn => {
      if(btn.textContent.includes(avatar)) btn.classList.add('selected');
    });
  }
  if(accessory) {
    document.querySelectorAll('#accessories span').forEach(span => {
      if(span.textContent === accessory) span.classList.add('selected');
    });
  }
  if(pet) {
    document.querySelectorAll('#pets span').forEach(span => {
      if(span.textContent === pet) span.classList.add('selected');
    });
  }
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
  
  // Uppdatera visuell feedback
  document.querySelectorAll('#avatars button').forEach(btn => {
    if(btn.textContent.includes(selected)) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
}

function selectAccessory(selected) {
  accessory = selected;
  localStorage.setItem("accessory", accessory);
  updateCharacterText();
  document.getElementById("chosenAccessory").innerText =
    "Valt tillbehör: " + (accessory || "Ingen");
  
  // Uppdatera visuell feedback
  document.querySelectorAll('#accessories span').forEach(span => {
    if(span.textContent === selected) {
      span.classList.add('selected');
    } else {
      span.classList.remove('selected');
    }
  });
}

function selectPet(selected) {
  pet = selected;
  localStorage.setItem("pet", pet);
  document.getElementById("chosenPet").innerText = "Ditt husdjur: " + pet;
  updateCharacterText();
  
  // Uppdatera visuell feedback
  document.querySelectorAll('#pets span').forEach(span => {
    if(span.textContent === selected) {
      span.classList.add('selected');
    } else {
      span.classList.remove('selected');
    }
  });
}

function selectTheme(selectedTheme) {
  theme = selectedTheme;
  localStorage.setItem("theme", theme);
  applyTheme(theme);
  
  // Uppdatera visuell feedback
  document.querySelectorAll('#themes button').forEach(btn => {
    btn.classList.remove('selected');
  });
  event.target.classList.add('selected');
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
function startGame(mode) {
  gameMode = mode;
  if(mode.includes('easy')) level = 'easy';
  else if(mode.includes('medium')) level = 'medium';
  else level = 'hard';
  
  // Nollställ inte streak om daglig utmaning är aktiv
  if(!isDailyChallengeActive) {
    streak = 0;
  }
  
  document.getElementById("menu").style.display = "none";
  document.getElementById("game").classList.remove("hidden");
  
  // Visa rätt sektion baserat på läge
  if(mode.startsWith('math')) {
    document.getElementById("mathSection").classList.remove("hidden");
    document.getElementById("clockSection").classList.add("hidden");
    generateMath();
  } else if(mode.startsWith('clock')) {
    document.getElementById("clockSection").classList.remove("hidden");
    document.getElementById("mathSection").classList.add("hidden");
    generateTime();
  }
  
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
    ${avatarPersonality()}
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
    } else if(level === "medium") {
      a = Math.floor(Math.random() * 8) + 3; // 3-10
      b = Math.floor(Math.random() * 8) + 3; // 3-10
      correctAnswer = a * b;
      document.getElementById("question").innerText = `👑 Bossfråga! ${a} × ${b} = ?`;
    } else {
      a = Math.floor(Math.random() * 11) + 10; // 10-20
      b = Math.floor(Math.random() * 11) + 10; // 10-20
      correctAnswer = a * b;
      document.getElementById("question").innerText = `👑 Bossfråga! ${a} × ${b} = ?`;
    }
    return;
  }

  if (level === "easy") {
    // LÄTT: Enklare frågor, addition, subtraktion, enkel geometri
    const easyWordProblems = [
      { text: "🍬 Du har 5 karameller och får 3 till. Hur många har du nu?", answer: 8, type: "addition", explanation: "5 + 3 = 8. Vi lägger ihop de karameller du hade och de du fick." },
      { text: "🐶 På lekplatsen finns 7 barn. 2 barn går hem. Hur många är kvar?", answer: 5, type: "subtraction", explanation: "7 - 2 = 5. Vi tar bort 2 från 7." },
      { text: "🎨 Du har 10 färgpennor. 4 är röda, resten är blå. Hur många är blå?", answer: 6, type: "subtraction", explanation: "10 - 4 = 6. Totalt minus röda = blå pennor." },
      { text: "⚽ Det finns 6 bollar. Du får 2 bollar till. Hur många bollar finns det?", answer: 8, type: "addition", explanation: "6 + 2 = 8. Vi lägger ihop bollarna." },
      { text: "🔺 En triangel har hur många hörn?", answer: 3, type: "geometry", explanation: "En triangel har alltid 3 hörn." },
      { text: "🔲 En fyrkant har hur många sidor?", answer: 4, type: "geometry", explanation: "En fyrkant har 4 sidor." },
      { text: "🍎 Du har 8 äpplen och äter 3. Hur många har du kvar?", answer: 5, type: "subtraction", explanation: "8 - 3 = 5. Vi subtraherar det du åt." },
      { text: "🐱 Det finns 4 katter. Varje katt har 4 ben. Hur många ben totalt?", answer: 16, type: "multiplication", explanation: "4 × 4 = 16. Varje katt har 4 ben, så 4 katter = 16 ben." },
      { text: "📏 Hur många cm är 1 meter?", answer: 100, type: "units", explanation: "1 meter = 100 centimeter." },
      { text: "⏰ Hur många minuter är en halv timme?", answer: 30, type: "time", explanation: "En timme = 60 minuter. Halva = 30 minuter." },
      { text: "💰 Du har 20 kr och köper godis för 5 kr. Hur mycket får du tillbaka?", answer: 15, type: "money", explanation: "20 - 5 = 15 kr." },
      { text: "🍕 Halva pizzan är uppäten. Hur stor del är kvar? (svara 2 för 1/2)", answer: 2, type: "fractions", explanation: "Om halva (1/2) är uppäten, är halva (1/2 = 2 i nämnaren) kvar." },
      { text: "🌟 Du har 9 stjärnor och får 4 till. Hur många stjärnor har du?", answer: 13, type: "addition", explanation: "9 + 4 = 13. Vi adderar stjärnorna." },
      { text: "🚗 På gatan finns 12 bilar. 5 bilar kör iväg. Hur många är kvar?", answer: 7, type: "subtraction", explanation: "12 - 5 = 7. Vi subtraherar de som åkte." },
      { text: "🎈 Det finns 3 ballonger. Varje ballong kostar 2 kr. Hur mycket kostar alla?", answer: 6, type: "money", explanation: "3 × 2 = 6 kr totalt." },
      { text: "🍪 Du har 15 kakor och delar med din kompis. Ni får lika många. Hur många får var och en?", answer: 7, type: "division", explanation: "15 ÷ 2 = 7,5 men vi avrundar till 7." },
      { text: "🐝 En bikupa har 6 bin. 3 bin flyger iväg. Hur många bin är kvar?", answer: 3, type: "subtraction", explanation: "6 - 3 = 3. Vi tar bort de som flög." },
      { text: "🎯 Du träffar målet 4 gånger. Varje träff ger 2 poäng. Hur många poäng?", answer: 8, type: "multiplication", explanation: "4 × 2 = 8 poäng." },
      { text: "🌺 Det finns 5 blommor i varje kruka. Du har 3 krukor. Hur många blommor totalt?", answer: 15, type: "multiplication", explanation: "5 × 3 = 15 blommor." },
      { text: "🦋 En fjäril har 2 vingar. Hur många vingar har 5 fjärilar?", answer: 10, type: "multiplication", explanation: "2 × 5 = 10 vingar." },
      { text: "🍊 Du har 14 apelsiner och ger bort 6. Hur många har du kvar?", answer: 8, type: "subtraction", explanation: "14 - 6 = 8 apelsiner kvar." },
      { text: "⭕ En cirkel har hur många hörn?", answer: 0, type: "geometry", explanation: "En cirkel har inga hörn." },
      { text: "📘 Du har 6 böcker och köper 7 till. Hur många böcker har du nu?", answer: 13, type: "addition", explanation: "6 + 7 = 13 böcker." },
      { text: "🎲 En tärning har hur många sidor?", answer: 6, type: "geometry", explanation: "En vanlig tärning har 6 sidor." },
      { text: "🥤 En flaska innehåller 50 cl. Hur många ml är det?", answer: 500, type: "units", explanation: "1 cl = 10 ml, så 50 cl = 500 ml." },
      { text: "⏱️ Hur många sekunder är 1 minut?", answer: 60, type: "time", explanation: "1 minut = 60 sekunder." },
      { text: "💎 Du hittar 3 diamanter varje dag i 4 dagar. Hur många totalt?", answer: 12, type: "multiplication", explanation: "3 × 4 = 12 diamanter." },
      { text: "🎮 Ett spel kostar 10 kr. Du har 25 kr. Hur mycket får du tillbaka?", answer: 15, type: "money", explanation: "25 - 10 = 15 kr i växel." },
      { text: "🐠 I akvariet finns 11 fiskar. 4 fiskar är gula. Hur många är inte gula?", answer: 7, type: "subtraction", explanation: "11 - 4 = 7 fiskar som inte är gula." },
      { text: "🎪 En cirkusbiljett kostar 8 kr. Du vill köpa 3 biljetter. Hur mycket?", answer: 24, type: "money", explanation: "8 × 3 = 24 kr totalt." },
      { text: "🧮 Vad är hälften av 18?", answer: 9, type: "division", explanation: "18 ÷ 2 = 9." },
      { text: "🌈 En regnbåge har 7 färger. 2 regnbågar har hur många färger totalt?", answer: 14, type: "multiplication", explanation: "7 × 2 = 14 färger." },
      { text: "🍇 Du har 20 druvor och äter 8. Hur många druvor är kvar?", answer: 12, type: "subtraction", explanation: "20 - 8 = 12 druvor kvar." },
      { text: "🔢 Vilket tal kommer härnäst? 2, 4, 6, 8, ?", answer: 10, type: "patterns", explanation: "Mönstret ökar med 2 varje gång: 2, 4, 6, 8, 10." },
      { text: "🔢 Fyll i: 5, 10, 15, 20, ?", answer: 25, type: "patterns", explanation: "Vi räknar i 5-steg: 5, 10, 15, 20, 25." },
      { text: "🔢 Vilket tal saknas? 10, 20, 30, ?, 50", answer: 40, type: "patterns", explanation: "Talen ökar med 10: 10, 20, 30, 40, 50." },
      { text: "🔢 Fortsätt serien: 1, 2, 3, 4, ?", answer: 5, type: "patterns", explanation: "Räkna uppåt: 1, 2, 3, 4, 5." },
      { text: "🔢 Vad blir nästa? 3, 6, 9, 12, ?", answer: 15, type: "patterns", explanation: "3-gångertabellen: 3, 6, 9, 12, 15." },
      { text: "🔢 Fyll i det saknade: 0, 5, 10, ?, 20", answer: 15, type: "patterns", explanation: "Räkna i 5-steg: 0, 5, 10, 15, 20." }
    ];
    
    if (Math.random() > 0.3) {
      const problem = easyWordProblems[Math.floor(Math.random() * easyWordProblems.length)];
      correctAnswer = problem.answer;
      currentQuestionType = problem.type;
      currentExplanation = problem.explanation;
      document.getElementById("question").innerText = problem.text;
      
      // Flerval (50% av frågorna)
      if(Math.random() > 0.5) {
        generateMultipleChoice(problem.answer);
      } else {
        hideMultipleChoice();
      }
      return;
    }
    
    a = Math.floor(Math.random() * 10);
    b = Math.floor(Math.random() * 10);
    correctAnswer = a + b;
    currentQuestionType = "addition";
    currentExplanation = `${a} + ${b} = ${correctAnswer}`;
    document.getElementById("question").innerText = `${a} + ${b} = ?`;
    hideMultipleChoice();
    
  } else if (level === "medium") {
    // MEDEL: 2-siffriga tal, gångertabeller 1-10, enklare division
    
    const mediumWordProblems = [
      { text: "🍎 Du har 34 äpplen och köper 28 till. Hur många har du nu?", answer: 62, type: "addition", explanation: "34 + 28 = 62. Vi adderar de två talen." },
      { text: "🚗 Det finns 56 bilar i parkeringen. 29 kör iväg. Hur många är kvar?", answer: 27, type: "subtraction", explanation: "56 - 29 = 27. Vi subtraherar." },
      { text: "🍕 En pizza är delad i 4 bitar. Du äter 1 bit. Hur stor del åt du? (svara 4 för 1/4)", answer: 4, type: "fractions", explanation: "1 av 4 bitar = 1/4 (svara 4 för nämnaren)." },
      { text: "⚽ Det finns 5 bollar i varje låda. Du har 7 lådor. Hur många bollar totalt?", answer: 35, type: "multiplication", explanation: "5 × 7 = 35 bollar." },
      { text: "💰 En leksak kostar 45 kr. Du köper 3 stycken. Hur mycket kostar det?", answer: 135, type: "money", explanation: "45 × 3 = 135 kr." },
      { text: "📏 Hur många mm är 5 cm?", answer: 50, type: "units", explanation: "1 cm = 10 mm, så 5 cm = 50 mm." },
      { text: "🎮 Du har 48 poäng och delar med 3 kompisar. Hur många får var och en?", answer: 16, type: "division", explanation: "48 ÷ 3 = 16 poäng var." },
      { text: "🌟 En pentagon (femhörning) har hur många sidor?", answer: 5, type: "geometry", explanation: "En pentagon har 5 sidor." },
      { text: "⏰ Hur många minuter är 2 timmar?", answer: 120, type: "time", explanation: "1 timme = 60 min, så 2 timmar = 120 min." },
      { text: "🍬 Du har 72 karameller och delar lika på 6 barn. Hur många får varje barn?", answer: 12, type: "division", explanation: "72 ÷ 6 = 12 karameller per barn." },
      { text: "🔢 Vad blir 6 × 8?", answer: 48, type: "multiplication", explanation: "6 × 8 = 48. Det är 6-gångertabellen." },
      { text: "🎯 Du har 85 kr och köper något för 37 kr. Hur mycket får du tillbaka?", answer: 48, type: "money", explanation: "85 - 37 = 48 kr i växel." },
      { text: "📐 En rektangel har hur många hörn?", answer: 4, type: "geometry", explanation: "En rektangel har 4 hörn." },
      { text: "🌺 Det finns 9 blommor i varje bukett. Du köper 6 buketter. Hur många blommor?", answer: 54, type: "multiplication", explanation: "9 × 6 = 54 blommor totalt." },
      { text: "💎 Du hittar 7 diamanter varje dag i 8 dagar. Hur många totalt?", answer: 56, type: "multiplication", explanation: "7 × 8 = 56 diamanter." },
      { text: "🥤 En flaska innehåller 75 cl. Hur många ml är det?", answer: 750, type: "units", explanation: "1 cl = 10 ml, så 75 cl = 750 ml." },
      { text: "🧮 Vad är hälften av 34?", answer: 17, type: "division", explanation: "34 ÷ 2 = 17." },
      { text: "🍪 Du bakar 60 kakor och delar på 4 tallrikar. Hur många på varje tallrik?", answer: 15, type: "division", explanation: "60 ÷ 4 = 15 kakor per tallrik." },
      { text: "🔢 Vad blir 9 × 7?", answer: 63, type: "multiplication", explanation: "9 × 7 = 63. Det är 9-gångertabellen." },
      { text: "🚲 En cykel kostar 450 kr. Du har sparat 275 kr. Hur mycket mer behöver du?", answer: 175, type: "money", explanation: "450 - 275 = 175 kr mer att spara." },
      { text: "⏱️ Hur många sekunder är 3 minuter?", answer: 180, type: "time", explanation: "1 minut = 60 sek, så 3 min = 180 sek." },
      { text: "🍕 En pizza är delad i 8 bitar. Du äter 3 bitar. Hur många bitar är kvar?", answer: 5, type: "subtraction", explanation: "8 - 3 = 5 bitar kvar." },
      { text: "📘 Det finns 12 böcker på varje hylla. Du har 5 hyllor. Hur många böcker totalt?", answer: 60, type: "multiplication", explanation: "12 × 5 = 60 böcker." },
      { text: "🎈 En ballong kostar 12 kr. Du köper 4 ballonger. Hur mycket kostar det?", answer: 48, type: "money", explanation: "12 × 4 = 48 kr totalt." },
      { text: "🔢 Vilket tal kommer härnäst? 15, 30, 45, 60, ?", answer: 75, type: "patterns", explanation: "Mönstret ökar med 15: 15, 30, 45, 60, 75." },
      { text: "🔢 Fyll i: 12, 24, 36, ?, 60", answer: 48, type: "patterns", explanation: "12-gångertabellen: 12, 24, 36, 48, 60." },
      { text: "🐝 Det finns 8 bin i varje bikupa. Du har 9 bikupor. Hur många bin totalt?", answer: 72, type: "multiplication", explanation: "8 × 9 = 72 bin." },
      { text: "💰 Du har 100 kr och köper något för 63 kr. Hur mycket får du tillbaka?", answer: 37, type: "money", explanation: "100 - 63 = 37 kr i växel." },
      { text: "📏 Hur många cm är 2,5 meter?", answer: 250, type: "units", explanation: "1 m = 100 cm, så 2,5 m = 250 cm." },
      { text: "🎲 Du kastar en tärning 8 gånger och får 4 varje gång. Summan blir?", answer: 32, type: "multiplication", explanation: "4 × 8 = 32." },
      { text: "🔢 Vad blir nästa? 20, 40, 60, 80, ?", answer: 100, type: "patterns", explanation: "Räkna i 20-steg: 20, 40, 60, 80, 100." },
      { text: "🌈 Du har 45 färgpennor och ger bort 18. Hur många har du kvar?", answer: 27, type: "subtraction", explanation: "45 - 18 = 27 pennor kvar." },
      { text: "🍊 En apelsin kostar 8 kr. Du köper 7 apelsiner. Hur mycket kostar det?", answer: 56, type: "money", explanation: "8 × 7 = 56 kr." },
      { text: "🔢 Fortsätt: 6, 12, 18, 24, ?", answer: 30, type: "patterns", explanation: "6-gångertabellen: 6, 12, 18, 24, 30." },
      { text: "⏰ Hur många minuter är en kvart (1/4 timme)?", answer: 15, type: "time", explanation: "1 timme = 60 min. En kvart = 60 ÷ 4 = 15 min." },
      { text: "🎯 Du träffar målet 9 gånger. Varje träff ger 5 poäng. Hur många poäng?", answer: 45, type: "multiplication", explanation: "9 × 5 = 45 poäng." },
      { text: "🧮 Vad är 54 delat med 6?", answer: 9, type: "division", explanation: "54 ÷ 6 = 9." },
      { text: "🍇 Du har 96 druvor och delar på 8 personer. Hur många får var och en?", answer: 12, type: "division", explanation: "96 ÷ 8 = 12 druvor per person." },
      { text: "🔢 Vilket tal saknas? 18, 27, 36, ?, 54", answer: 45, type: "patterns", explanation: "9-gångertabellen: 18, 27, 36, 45, 54." },
      { text: "📐 En hexagon (sexhörning) har hur många sidor?", answer: 6, type: "geometry", explanation: "En hexagon har 6 sidor." }
    ];
    
    if (Math.random() > 0.3) {
      const problem = easyWordProblems[Math.floor(Math.random() * easyWordProblems.length)];
      correctAnswer = problem.answer;
      currentQuestionType = problem.type;
      currentExplanation = problem.explanation;
      document.getElementById("question").innerText = problem.text;
      
      // Flerval (50% av frågorna)
      if(Math.random() > 0.5) {
        generateMultipleChoice(problem.answer);
      } else {
        hideMultipleChoice();
      }
      return;
    }
    
    a = Math.floor(Math.random() * 10);
    b = Math.floor(Math.random() * 10);
    correctAnswer = a + b;
    currentQuestionType = "addition";
    currentExplanation = `${a} + ${b} = ${correctAnswer}`;
    document.getElementById("question").innerText = `${a} + ${b} = ?`;
    hideMultipleChoice();
    
  } else if (level === "medium") {
    // MEDEL: 2-siffriga tal, gångertabeller 1-10, enklare division
    
    if (Math.random() > 0.3) {
      const problem = mediumWordProblems[Math.floor(Math.random() * mediumWordProblems.length)];
      correctAnswer = problem.answer;
      currentQuestionType = problem.type;
      currentExplanation = problem.explanation;
      document.getElementById("question").innerText = problem.text;
      
      // Flerval (55% av medelfrågorna)
      if(Math.random() > 0.45) {
        generateMultipleChoice(problem.answer);
      } else {
        hideMultipleChoice();
      }
      return;
    }
    
    a = Math.floor(Math.random() * 9) + 2; // 2-10
    b = Math.floor(Math.random() * 9) + 2; // 2-10
    correctAnswer = a * b;
    currentQuestionType = "multiplication";
    currentExplanation = `${a} × ${b} = ${correctAnswer}`;
    document.getElementById("question").innerText = `${a} × ${b} = ?`;
    hideMultipleChoice();
    
  } else {
    // SVÅR: Multiplikation, division, svårare ordfrågor
    const hardWordProblems = [
      { text: "🍎 Lisa har 12 äpplen och delar dem på 3 barn. Hur många får varje barn?", answer: 4, type: "division", explanation: "12 ÷ 3 = 4. Vi delar 12 äpplen jämnt på 3 barn." },
      { text: "🍕 En pizza har 8 bitar. Om 4 kompisar delar lika, hur många bitar får var och en?", answer: 2, type: "division", explanation: "8 ÷ 4 = 2. Varje kompis får 2 bitar." },
      { text: "🚗 Det finns 15 bilar på en parkeringsplats. 5 bilar på varje rad. Hur många rader finns det?", answer: 3, type: "division", explanation: "15 ÷ 5 = 3 rader." },
      { text: "🍪 En burk har 20 kakor. Om du äter 4 kakor per dag, hur många dagar räcker de?", answer: 5, type: "division", explanation: "20 ÷ 4 = 5 dagar." },
      { text: "📚 Det finns 18 böcker som ska delas på 6 hyllor. Hur många böcker per hylla?", answer: 3, type: "division", explanation: "18 ÷ 6 = 3 böcker per hylla." },
      { text: "⚽ 24 barn ska delas i lag om 6 personer. Hur många lag blir det?", answer: 4, type: "division", explanation: "24 ÷ 6 = 4 lag." },
      { text: "🎈 Du har 16 ballonger och ska ge 8 till din kompis. Hur många har du kvar?", answer: 8, type: "subtraction", explanation: "16 - 8 = 8 ballonger kvar." },
      { text: "🐕 En hund har 4 ben. Hur många ben har 3 hundar?", answer: 12, type: "multiplication", explanation: "4 × 3 = 12 ben totalt." },
      { text: "💰 Du har 50 kr och köper godis för 15 kr. Hur mycket får du tillbaka?", answer: 35, type: "money", explanation: "50 - 15 = 35 kr i växel." },
      { text: "🎮 Ett spel kostar 25 kr. Du vill köpa 2 spel. Hur mycket kostar det?", answer: 50, type: "money", explanation: "25 × 2 = 50 kr totalt." },
      { text: "🍕 En pizza kostar 80 kr. Ni är 4 personer som delar. Hur mycket betalar var och en?", answer: 20, type: "money", explanation: "80 ÷ 4 = 20 kr per person." },
      { text: "🔺 En triangel har 3 sidor. Hur många sidor har 4 trianglar?", answer: 12, type: "geometry", explanation: "3 × 4 = 12 sidor totalt." },
      { text: "⭐ En stjärna har 5 uddar. Hur många uddar har 3 stjärnor?", answer: 15, type: "multiplication", explanation: "5 × 3 = 15 uddar." },
      { text: "🎯 Du behöver 100 poäng. Du har 65 poäng. Hur många poäng saknas?", answer: 35, type: "subtraction", explanation: "100 - 65 = 35 poäng saknas." },
      { text: "📐 En rektangel är 5 cm lång och 3 cm bred. Vad är arean? (längd × bredd)", answer: 15, type: "geometry", explanation: "Area = längd × bredd = 5 × 3 = 15 cm²." },
      { text: "📏 Omkretsen av en fyrkant med sida 6 cm? (alla sidor ihop)", answer: 24, type: "geometry", explanation: "Omkrets = 6 + 6 + 6 + 6 = 24 cm." },
      { text: "⚖️ Hur många gram är 2 kg?", answer: 2000, type: "units", explanation: "1 kg = 1000 g, så 2 kg = 2000 g." },
      { text: "📏 Hur många meter är 250 cm?", answer: 2.5, type: "units", explanation: "100 cm = 1 m, så 250 cm = 2,5 m." },
      { text: "🥤 Hur många ml är 2 liter?", answer: 2000, type: "units", explanation: "1 liter = 1000 ml, så 2 liter = 2000 ml." },
      { text: "⏰ Hur många minuter är 2,5 timmar?", answer: 150, type: "time", explanation: "1 timme = 60 min. 2,5 × 60 = 150 minuter." },
      { text: "💵 En vara kostar 12,50 kr. Du köper 4 st. Totalpris? (avrunda till heltal)", answer: 50, type: "decimals", explanation: "12,50 × 4 = 50 kr." },
      { text: "🍰 Du har 3/4 av en tårta. Din kompis tar 1/4. Hur mycket har du kvar? (svara 2 för 2/4)", answer: 2, type: "fractions", explanation: "3/4 - 1/4 = 2/4 (eller 1/2) kvar." },
      { text: "🎨 En låda har 36 pennor. Du delar dem i 4 lika högar. Hur många pennor i varje hög?", answer: 9, type: "division", explanation: "36 ÷ 4 = 9 pennor per hög." },
      { text: "🚲 En cykel kostar 450 kr. Du har sparat 280 kr. Hur mycket saknas?", answer: 170, type: "money", explanation: "450 - 280 = 170 kr saknas." },
      { text: "🌳 I varje rad finns 8 träd. Det finns 7 rader. Hur många träd totalt?", answer: 56, type: "multiplication", explanation: "8 × 7 = 56 träd." },
      { text: "📦 En låda rymmer 12 bollar. Hur många lådor behövs för 60 bollar?", answer: 5, type: "division", explanation: "60 ÷ 12 = 5 lådor." },
      { text: "🎪 En biljett kostar 35 kr. Du köper 6 biljetter. Totalpris?", answer: 210, type: "money", explanation: "35 × 6 = 210 kr." },
      { text: "📐 En kvadrat har sidan 8 cm. Vad är omkretsen?", answer: 32, type: "geometry", explanation: "Omkrets = 8 + 8 + 8 + 8 = 32 cm." },
      { text: "⚖️ Hur många kg är 3500 gram?", answer: 3.5, type: "units", explanation: "1000 g = 1 kg, så 3500 g = 3,5 kg." },
      { text: "🍫 En chokladkaka har 24 bitar. Du äter 1/3. Hur många bitar åt du?", answer: 8, type: "fractions", explanation: "24 ÷ 3 = 8 bitar (1/3 av 24)." },
      { text: "🚂 Ett tåg har 9 vagnar. Varje vagn har 48 platser. Hur många platser totalt?", answer: 432, type: "multiplication", explanation: "9 × 48 = 432 platser." },
      { text: "💎 En diamant kostar 125 kr. Du har 500 kr. Hur många diamanter kan du köpa?", answer: 4, type: "division", explanation: "500 ÷ 125 = 4 diamanter." },
      { text: "📏 En rektangel är 12 cm lång och 4 cm bred. Vad är arean?", answer: 48, type: "geometry", explanation: "Area = 12 × 4 = 48 cm²." },
      { text: "⏱️ Hur många sekunder är 3 minuter?", answer: 180, type: "time", explanation: "1 minut = 60 sekunder. 3 × 60 = 180 sekunder." },
      { text: "🎮 Ett spel kostade 299 kr. Det är nu 50 kr billigare. Vad kostar det nu?", answer: 249, type: "money", explanation: "299 - 50 = 249 kr." },
      { text: "🌟 Du samlar stjärnor. Första dagen 12, andra 18, tredje 15. Hur många totalt?", answer: 45, type: "addition", explanation: "12 + 18 + 15 = 45 stjärnor." },
      { text: "📚 En bok har 240 sidor. Du läser 15 sidor per dag. Hur många dagar tar det?", answer: 16, type: "division", explanation: "240 ÷ 15 = 16 dagar." },
      { text: "🍎 En låda äpplen väger 3 kg. Hur många gram är det?", answer: 3000, type: "units", explanation: "1 kg = 1000 g, så 3 kg = 3000 g." },
      { text: "🎯 Du träffar målet 8 av 12 gånger. Hur många missade du?", answer: 4, type: "subtraction", explanation: "12 - 8 = 4 missade skott." },
      { text: "💰 Du har 3 50-kronorssedlar. Hur mycket pengar har du?", answer: 150, type: "money", explanation: "3 × 50 = 150 kr." },
      { text: "📏 Hur många cm är 4,5 meter?", answer: 450, type: "units", explanation: "1 m = 100 cm, så 4,5 m = 450 cm." },
      { text: "🍕 En pizza delas i 12 bitar. Du äter 1/4. Hur många bitar åt du?", answer: 3, type: "fractions", explanation: "12 ÷ 4 = 3 bitar (1/4 av 12)." },
      { text: "🎲 Du kastar en tärning 7 gånger. Varje kast ger 6 poäng. Hur många poäng?", answer: 42, type: "multiplication", explanation: "7 × 6 = 42 poäng." },
      { text: "🚴 En cykeltur är 28 km. Du har cyklat 19 km. Hur långt kvar?", answer: 9, type: "subtraction", explanation: "28 - 19 = 9 km kvar." },
      { text: "⏰ En film är 2 timmar lång. Hur många minuter är det?", answer: 120, type: "time", explanation: "1 timme = 60 min. 2 × 60 = 120 minuter." },
      { text: "📐 En triangel har omkretsen 36 cm. Alla sidor är lika långa. Hur lång är en sida?", answer: 12, type: "geometry", explanation: "36 ÷ 3 = 12 cm per sida." },
      { text: "🥤 Hur många liter är 5000 ml?", answer: 5, type: "units", explanation: "1000 ml = 1 liter, så 5000 ml = 5 liter." },
      { text: "🔢 Talföljd: 4, 8, 12, 16, ?", answer: 20, type: "patterns", explanation: "4-gångertabellen: 4, 8, 12, 16, 20." },
      { text: "🔢 Vilket tal saknas? 100, 90, 80, ?, 60", answer: 70, type: "patterns", explanation: "Minskar med 10: 100, 90, 80, 70, 60." },
      { text: "🔢 Fortsätt mönstret: 1, 4, 7, 10, ?", answer: 13, type: "patterns", explanation: "Ökar med 3: 1, 4, 7, 10, 13." },
      { text: "🔢 Vad blir nästa? 50, 45, 40, 35, ?", answer: 30, type: "patterns", explanation: "Minskar med 5: 50, 45, 40, 35, 30." },
      { text: "🔢 Fyll i: 7, 14, 21, ?, 35", answer: 28, type: "patterns", explanation: "7-gångertabellen: 7, 14, 21, 28, 35." },
      { text: "🔢 Vilket tal kommer härnäst? 2, 4, 8, 16, ?", answer: 32, type: "patterns", explanation: "Varje tal dubblas: 2, 4, 8, 16, 32." },
      { text: "🔢 Talföljd: 64, 32, 16, 8, ?", answer: 4, type: "patterns", explanation: "Varje tal halveras: 64, 32, 16, 8, 4." },
      { text: "🔢 Fortsätt: 3, 5, 7, 9, ?", answer: 11, type: "patterns", explanation: "Udda tal: 3, 5, 7, 9, 11." },
      { text: "🔢 Vad saknas? 25, 30, 35, ?, 45", answer: 40, type: "patterns", explanation: "Ökar med 5: 25, 30, 35, 40, 45." },
      { text: "🔢 Vilket blir nästa? 11, 22, 33, 44, ?", answer: 55, type: "patterns", explanation: "11-gångertabellen: 11, 22, 33, 44, 55." }
    ];
    
    if (Math.random() > 0.3) {
      const problem = hardWordProblems[Math.floor(Math.random() * hardWordProblems.length)];
      correctAnswer = problem.answer;
      currentQuestionType = problem.type;
      currentExplanation = problem.explanation;
      document.getElementById("question").innerText = problem.text;
      
      // Flerval (60% av svåra frågorna)
      if(Math.random() > 0.4) {
        generateMultipleChoice(problem.answer);
      } else {
        hideMultipleChoice();
      }
      return;
    }
    
    a = Math.floor(Math.random() * 10);
    b = Math.floor(Math.random() * 10);
    correctAnswer = a * b;
    currentQuestionType = "multiplication";
    currentExplanation = `${a} × ${b} = ${correctAnswer}`;
    document.getElementById("question").innerText = `${a} × ${b} = ?`;
    hideMultipleChoice();
  }
}

// =====================
// CHECK SVAR
// =====================
function checkAnswer(providedAnswer) {
  const userAnswer = providedAnswer !== undefined ? providedAnswer : Number(document.getElementById("answer").value);
  const timeTaken = (Date.now() - questionStartTime) / 1000; // sekunder
  
  const wasCorrect = userAnswer === correctAnswer;

  if (wasCorrect) {
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
    
    // Om daglig utmaning är aktiv, avsluta den vid fel svar
    if(isDailyChallengeActive) {
      isDailyChallengeActive = false;
      document.getElementById("dailyChallengeInfo").classList.add("hidden");
      alert("❌ Fel svar! Dagens utmaning avbröts.\n\nDu hade " + streak + " rätt i rad. Försök igen!");
    }
    
    streak = 0;
    shakeScreen();
    showExplanation(false);
  }
  
  // Uppdatera progress
  if(currentQuestionType) {
    updateProgress(currentQuestionType, wasCorrect);
  }
  
  // Kolla daglig utmaning
  checkDailyChallengeComplete();

  document.getElementById("answer").value = "";
  document.getElementById("score").innerText = score;
  document.getElementById("streakDisplay").innerText = streak;
  document.getElementById("levelBadge").innerText = getMedal();
  updateStars();
  checkAchievements();
  
  // Dölj flerval innan nästa fråga genereras
  hideMultipleChoice();
  
  if(testMode) {
    nextTestQuestion();
  } else {
    generateMath();
  }
  
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
  
  if(level === "easy") {
    // LÄTT: Endast hel och halv timme
    const minutes = [0, 30];
    minute = minutes[Math.floor(Math.random() * minutes.length)];
    
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
    }
    
    document.getElementById("timeQuestion").innerText = timeText;
    
  } else if(level === "medium") {
    // MEDEL: Kvart över och kvart i, 12-timmars med tydlig tid på dygnet
    const minutes = [0, 15, 30, 45];
    minute = minutes[Math.floor(Math.random() * minutes.length)];
    
    hour = Math.floor(Math.random() * 12) + 1; // 1-12
    let isMorning = Math.random() > 0.5;
    let timeOfDay = isMorning ? "på morgonen" : "på eftermiddagen";
    
    // Konvertera till 24-timmars för input-matching
    let hour24 = isMorning ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
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
    
    document.getElementById("timeQuestion").innerText = timeText + " (Svara i 24-timmarsformat HH:MM)";
    
  } else {
    // SVÅR: Kvart över, kvart i, och tidsgåtor med 24-timmars tid
    const minutes = [0, 15, 30, 45];
    minute = minutes[Math.floor(Math.random() * minutes.length)];
    
    hour = Math.floor(Math.random() * 24); // 0-23
    correctTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    
    // Bestäm tid på dygnet
    let timeOfDay = "";
    if(hour >= 6 && hour < 12) timeOfDay = "på morgonen";
    else if(hour >= 12 && hour < 18) timeOfDay = "på eftermiddagen";
    else if(hour >= 18 && hour < 22) timeOfDay = "på kvällen";
    else timeOfDay = "på natten";
    
    // Ibland tidsgåtor!
    if(Math.random() > 0.7 && minute === 0) {
      let hourBefore = (hour - 2 + 24) % 24;
      correctTime = `${String(hour).padStart(2, '0')}:00`;
      let timeOfDayBefore = "";
      if(hourBefore >= 6 && hourBefore < 12) timeOfDayBefore = "på morgonen";
      else if(hourBefore >= 12 && hourBefore < 18) timeOfDayBefore = "på eftermiddagen";
      else if(hourBefore >= 18 && hourBefore < 22) timeOfDayBefore = "på kvällen";
      else timeOfDayBefore = "på natten";
      document.getElementById("timeQuestion").innerText = 
        `🧩 Om klockan var ${hourBefore}:00 ${timeOfDayBefore} för 2 timmar sedan, vad är klockan nu? (svara i 24-timmarsformat)`;
    } else {
      let hour12 = hour % 12 || 12; // för text (1-12)
      let hourText = numberToText(hour12);
      let timeText = "";
      
      if(minute === 0) {
        timeText = `🕒 Klockan är ${hourText} ${timeOfDay}`;
      } else if(minute === 30) {
        let nextHour12 = ((hour % 12) + 1) % 12 || 12;
        timeText = `🕒 Klockan är halv ${numberToText(nextHour12)} ${timeOfDay}`;
      } else if(minute === 15) {
        timeText = `🕒 Klockan är kvart över ${hourText} ${timeOfDay}`;
      } else if(minute === 45) {
        let nextHour12 = ((hour % 12) + 1) % 12 || 12;
        timeText = `🕒 Klockan är kvart i ${numberToText(nextHour12)} ${timeOfDay}`;
      }
      
      document.getElementById("timeQuestion").innerText = timeText + " (Svara i 24-timmarsformat HH:MM)";
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

// =====================
// FLERVAL
// =====================
function generateMultipleChoice(correctAns) {
  const container = document.getElementById("multipleChoice");
  if(!container) return;
  
  container.classList.remove("hidden");
  document.getElementById("answer").classList.add("hidden");
  
  multipleChoiceOptions = [correctAns];
  
  // Generera 3 felaktiga alternativ
  while(multipleChoiceOptions.length < 4) {
    let wrong = correctAns + Math.floor(Math.random() * 10) - 5;
    if(wrong !== correctAns && !multipleChoiceOptions.includes(wrong) && wrong > 0) {
      multipleChoiceOptions.push(wrong);
    }
  }
  
  // Blanda alternativen
  multipleChoiceOptions.sort(() => Math.random() - 0.5);
  
  // Visa knappar
  container.innerHTML = "";
  multipleChoiceOptions.forEach(option => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = option;
    btn.onclick = () => checkMultipleChoice(option);
    container.appendChild(btn);
  });
}

function hideMultipleChoice() {
  const container = document.getElementById("multipleChoice");
  if(container) {
    container.classList.add("hidden");
    document.getElementById("answer").classList.remove("hidden");
  }
}

function checkMultipleChoice(selected) {
  if(selected === correctAnswer) {
    checkAnswer(correctAnswer);
  } else {
    checkAnswer(-999); // Fel svar
  }
}

// =====================
// FÖRKLARINGSLÄGE
// =====================
function showExplanation(wasCorrect) {
  const explDiv = document.getElementById("explanation");
  if(!explDiv) return;
  
  if(!wasCorrect && currentExplanation) {
    explDiv.classList.remove("hidden");
    explDiv.innerHTML = `
      <h3>💡 Så här tänker du:</h3>
      <p>${currentExplanation}</p>
    `;
    setTimeout(() => explDiv.classList.add("hidden"), 8000);
  } else {
    explDiv.classList.add("hidden");
  }
}

// =====================
// PROGRESSIONSSPÅRNING
// =====================
function updateProgress(type, wasCorrect) {
  if(!progressStats[type]) progressStats[type] = { correct: 0, total: 0 };
  
  progressStats[type].total++;
  if(wasCorrect) progressStats[type].correct++;
  
  localStorage.setItem("progressStats", JSON.stringify(progressStats));
  updateProgressDisplay();
}

function updateProgressDisplay() {
  const progressDiv = document.getElementById("progressDisplay");
  if(!progressDiv) return;
  
  let html = "<h3>📊 Din utveckling:</h3>";
  const areas = [
    { key: "addition", name: "Addition" },
    { key: "subtraction", name: "Subtraktion" },
    { key: "multiplication", name: "Multiplikation" },
    { key: "division", name: "Division" },
    { key: "fractions", name: "Bråk" },
    { key: "decimals", name: "Decimaler" },
    { key: "geometry", name: "Geometri" },
    { key: "units", name: "Enheter" },
    { key: "money", name: "Pengar" },
    { key: "time", name: "Tid" }
  ];
  
  areas.forEach(area => {
    const stats = progressStats[area.key];
    if(stats && stats.total > 0) {
      const percent = Math.round((stats.correct / stats.total) * 100);
      const color = percent >= 70 ? "green" : percent >= 50 ? "orange" : "red";
      html += `
        <div class="progress-bar">
          <span>${area.name}:</span>
          <div class="bar">
            <div class="fill" style="width: ${percent}%; background: ${color}"></div>
          </div>
          <span>${percent}% (${stats.correct}/${stats.total})</span>
        </div>
      `;
    }
  });
  
  progressDiv.innerHTML = html;
}

function getWeakAreas() {
  const weak = [];
  Object.keys(progressStats).forEach(key => {
    const stats = progressStats[key];
    if(stats.total >= 3) {
      const percent = (stats.correct / stats.total) * 100;
      if(percent < 60) {
        weak.push(key);
      }
    }
  });
  return weak;
}

// =====================
// PROVLÄGE
// =====================
function startTestMode() {
  testMode = true;
  testQuestions = [];
  testCurrentQuestion = 0;
  score = 0;
  
  // Generera 20 blandade frågor
  const allQuestions = [...Array(20)].map(() => {
    const type = Math.random();
    if(type < 0.3) return { category: "easy", level: "easy" };
    else if(type < 0.6) return { category: "hard", level: "hard" };
    else return { category: "clock", level: Math.random() > 0.5 ? "easy" : "hard" };
  });
  
  testQuestions = allQuestions;
  document.getElementById("menu").style.display = "none";
  document.getElementById("game").classList.remove("hidden");
  document.getElementById("testInfo").classList.remove("hidden");
  
  testStartTime = Date.now();
  testTimer = setInterval(updateTestTimer, 1000);
  
  nextTestQuestion();
}

function nextTestQuestion() {
  if(testCurrentQuestion >= testQuestions.length) {
    endTestMode();
    return;
  }
  
  const q = testQuestions[testCurrentQuestion];
  level = q.level;
  
  if(q.category === "clock") {
    document.getElementById("mathSection").classList.add("hidden");
    document.getElementById("clockSection").classList.remove("hidden");
    generateTime();
  } else {
    document.getElementById("clockSection").classList.add("hidden");
    document.getElementById("mathSection").classList.remove("hidden");
    generateMath();
  }
  
  document.getElementById("testProgress").innerText = 
    `Fråga ${testCurrentQuestion + 1} av ${testQuestions.length}`;
  
  testCurrentQuestion++;
}

function updateTestTimer() {
  const elapsed = Math.floor((Date.now() - testStartTime) / 1000);
  const remaining = testTimeLimit - elapsed;
  
  if(remaining <= 0) {
    endTestMode();
    return;
  }
  
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  document.getElementById("testTimer").innerText = 
    `⏰ Tid kvar: ${minutes}:${String(seconds).padStart(2, '0')}`;
}

function endTestMode() {
  clearInterval(testTimer);
  testMode = false;
  
  const percent = Math.round((score / testQuestions.length) * 100);
  let grade = "";
  if(percent >= 90) grade = "A - Utmärkt! 🏆";
  else if(percent >= 75) grade = "B - Mycket bra! 🥇";
  else if(percent >= 60) grade = "C - Bra jobbat! 🥈";
  else if(percent >= 50) grade = "D - Godkänt! 🥉";
  else grade = "F - Träna mer! 💪";
  
  alert(`
    📝 PROVRESULTAT
    
    Rätt svar: ${score} av ${testQuestions.length}
    Procent: ${percent}%
    Betyg: ${grade}
    
    ${getWeakAreas().length > 0 ? 
      `Träna mer på: ${getWeakAreas().join(", ")}` : 
      "Bra jobbat på alla områden!"}
  `);
  
  document.getElementById("testInfo").classList.add("hidden");
  document.getElementById("menu").style.display = "block";
  document.getElementById("game").classList.add("hidden");
}

// =====================
// DAGLIG UTMANING
// =====================
function checkDailyChallenge() {
  const today = new Date().toDateString();
  
  if(dailyChallenge.date !== today) {
    // Ny dag
    if(dailyChallenge.completed) {
      dailyChallenge.streak++;
    } else {
      dailyChallenge.streak = 0;
    }
    dailyChallenge.date = today;
    dailyChallenge.completed = false;
    localStorage.setItem("dailyChallenge", JSON.stringify(dailyChallenge));
  }
  
  updateDailyChallengeDisplay();
}

function updateDailyChallengeDisplay() {
  const div = document.getElementById("dailyChallenge");
  if(!div) return;
  
  div.innerHTML = `
    <h3>🌟 Dagens utmaning</h3>
    <p>${dailyChallenge.completed ? "✅ Klart för idag!" : "❌ Inte slutförd"}</p>
    <p>🔥 Streak: ${dailyChallenge.streak} dagar</p>
    ${!dailyChallenge.completed ? 
      '<button onclick="startDailyChallenge()">Starta dagens utmaning!</button>' : 
      '<p>Kom tillbaka imorgon! 😊</p>'}
  `;
}

function startDailyChallenge() {
  if(dailyChallenge.completed) {
    alert("Du har redan klarat dagens utmaning! 🎉");
    return;
  }
  
  isDailyChallengeActive = true;
  streak = 0;
  document.getElementById("dailyChallengeInfo").classList.remove("hidden");
  alert("🌟 Dagens utmaning: Få 10 rätt i rad!\n\nDu har just nu " + streak + " rätt i rad. Målet är 10!");
  startGame("math-" + (Math.random() > 0.5 ? "easy" : "hard"));
}

function checkDailyChallengeComplete() {
  if(isDailyChallengeActive && !dailyChallenge.completed && streak >= 10) {
    dailyChallenge.completed = true;
    isDailyChallengeActive = false;
    document.getElementById("dailyChallengeInfo").classList.add("hidden");
    localStorage.setItem("dailyChallenge", JSON.stringify(dailyChallenge));
    updateDailyChallengeDisplay();
    alert("🎊 GRATTIS! Du klarade dagens utmaning med 10 rätt i rad!\n\nKom tillbaka imorgon för en ny utmaning!");
    celebrate();
  }
}
