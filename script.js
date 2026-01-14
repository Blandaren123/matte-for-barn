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
  patterns: { correct: 0, total: 0 },
  algebra: { correct: 0, total: 0 },
  procent: { correct: 0, total: 0 },
  potenser: { correct: 0, total: 0 }
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

window.onload = () => {
  loadAchievements();
  document.getElementById("highscoreDisplay").innerText = highscore;
};

// =====================
// SPEL START
// =====================
function startGame(mode) {
  gameMode = mode;
  if(mode.includes('easy')) level = 'easy';
  else if(mode.includes('medium')) level = 'medium';
  else if(mode.includes('algebra')) level = 'algebra';
  else if(mode.includes('percent')) level = 'percent';
  else if(mode.includes('geometry')) level = 'geometry';
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
// MATTE & FRÅGOR
// =====================
function generateMath() {

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
  
  if (level === "algebra") {
    // ALGEBRA & EKVATIONER - inspirerat från Matteboken.se
    const algebraProblems = [
      { text: "📐 Lös ekvationen: x + 5 = 12. Vad är x?", answer: 7, type: "algebra", explanation: "x + 5 = 12. Vi subtraherar 5 från båda sidor: x = 12 - 5 = 7" },
      { text: "📐 Lös: x - 3 = 10. Vad är x?", answer: 13, type: "algebra", explanation: "x - 3 = 10. Vi adderar 3 till båda sidor: x = 10 + 3 = 13" },
      { text: "📐 Lös: 2x = 16. Vad är x?", answer: 8, type: "algebra", explanation: "2x = 16. Vi delar båda sidor med 2: x = 16 ÷ 2 = 8" },
      { text: "📐 Lös: 3x = 21. Vad är x?", answer: 7, type: "algebra", explanation: "3x = 21. Vi delar båda sidor med 3: x = 21 ÷ 3 = 7" },
      { text: "📐 Lös: x + 8 = 15. Vad är x?", answer: 7, type: "algebra", explanation: "x + 8 = 15. Vi subtraherar 8: x = 15 - 8 = 7" },
      { text: "📐 Lös: x ÷ 4 = 5. Vad är x?", answer: 20, type: "algebra", explanation: "x ÷ 4 = 5. Vi multiplicerar båda sidor med 4: x = 5 × 4 = 20" },
      { text: "📐 Lös: 2x + 3 = 11. Vad är x?", answer: 4, type: "algebra", explanation: "2x + 3 = 11. Först: 2x = 11 - 3 = 8. Sen: x = 8 ÷ 2 = 4" },
      { text: "📐 Lös: 5x - 2 = 18. Vad är x?", answer: 4, type: "algebra", explanation: "5x - 2 = 18. Först: 5x = 18 + 2 = 20. Sen: x = 20 ÷ 5 = 4" },
      { text: "📐 Om x + x = 18, vad är x?", answer: 9, type: "algebra", explanation: "x + x = 2x = 18. Vi delar med 2: x = 18 ÷ 2 = 9" },
      { text: "📐 Lös: 4x = 36. Vad är x?", answer: 9, type: "algebra", explanation: "4x = 36. Vi delar båda sidor med 4: x = 36 ÷ 4 = 9" },
      { text: "🔢 Vad är 2³ (2 upphöjt till 3)?", answer: 8, type: "potenser", explanation: "2³ = 2 × 2 × 2 = 8" },
      { text: "🔢 Vad är 3² (3 upphöjt till 2)?", answer: 9, type: "potenser", explanation: "3² = 3 × 3 = 9" },
      { text: "🔢 Vad är 5² (5 kvadrat)?", answer: 25, type: "potenser", explanation: "5² = 5 × 5 = 25" },
      { text: "🔢 Vad är 10² (10 kvadrat)?", answer: 100, type: "potenser", explanation: "10² = 10 × 10 = 100" },
      { text: "🔢 Vad är 4² (4 kvadrat)?", answer: 16, type: "potenser", explanation: "4² = 4 × 4 = 16" },
      { text: "🔢 Vad är 2⁴ (2 upphöjt till 4)?", answer: 16, type: "potenser", explanation: "2⁴ = 2 × 2 × 2 × 2 = 16" },
      { text: "🔢 Vad är 10³ (10 upphöjt till 3)?", answer: 1000, type: "potenser", explanation: "10³ = 10 × 10 × 10 = 1000" },
      { text: "📏 Ett uttryck: 3a när a = 4. Vad blir uttrycket?", answer: 12, type: "algebra", explanation: "3a = 3 × a = 3 × 4 = 12" },
      { text: "📏 Beräkna: 2b + 5 när b = 3. Vad blir det?", answer: 11, type: "algebra", explanation: "2b + 5 = 2 × 3 + 5 = 6 + 5 = 11" },
      { text: "📏 Om x = 7, vad är x + 10?", answer: 17, type: "algebra", explanation: "x + 10 = 7 + 10 = 17" },
      { text: "📐 Lös: x - 7 = 8. Vad är x?", answer: 15, type: "algebra", explanation: "x - 7 = 8. Vi adderar 7: x = 8 + 7 = 15" },
      { text: "📐 Lös: 6x = 42. Vad är x?", answer: 7, type: "algebra", explanation: "6x = 42. Vi delar med 6: x = 42 ÷ 6 = 7" },
      { text: "🔢 Vilket tal är 2⁵?", answer: 32, type: "potenser", explanation: "2⁵ = 2 × 2 × 2 × 2 × 2 = 32" },
      { text: "📏 Om y = 12, vad är y ÷ 3?", answer: 4, type: "algebra", explanation: "y ÷ 3 = 12 ÷ 3 = 4" },
      { text: "📐 Lös: 3x + 6 = 15. Vad är x?", answer: 3, type: "algebra", explanation: "3x + 6 = 15. Först: 3x = 15 - 6 = 9. Sen: x = 9 ÷ 3 = 3" }
    ];
    
    const problem = algebraProblems[Math.floor(Math.random() * algebraProblems.length)];
    correctAnswer = problem.answer;
    currentQuestionType = problem.type;
    currentExplanation = problem.explanation;
    document.getElementById("question").innerText = problem.text;
    
    if(Math.random() > 0.5) {
      generateMultipleChoice(problem.answer);
    } else {
      hideMultipleChoice();
    }
    
  } else if (level === "percent") {
    // PROCENT & BRÅK - från Matteboken.se högstadiet
    const percentProblems = [
      { text: "💯 Vad är 50% av 100?", answer: 50, type: "procent", explanation: "50% av 100 = 0.5 × 100 = 50" },
      { text: "💯 Vad är 25% av 80?", answer: 20, type: "procent", explanation: "25% av 80 = 0.25 × 80 = 20" },
      { text: "💯 Vad är 10% av 200?", answer: 20, type: "procent", explanation: "10% av 200 = 0.1 × 200 = 20" },
      { text: "💯 En tröja kostar 200 kr. Du får 20% rabatt. Hur mycket är rabatten?", answer: 40, type: "procent", explanation: "20% av 200 = 0.2 × 200 = 40 kr" },
      { text: "💯 Vad är 75% av 60?", answer: 45, type: "procent", explanation: "75% av 60 = 0.75 × 60 = 45" },
      { text: "🍕 Vad är 1/2 (hälften) av 24?", answer: 12, type: "fractions", explanation: "1/2 av 24 = 24 ÷ 2 = 12" },
      { text: "🍕 Vad är 1/4 av 20?", answer: 5, type: "fractions", explanation: "1/4 av 20 = 20 ÷ 4 = 5" },
      { text: "🍕 Vad är 1/3 av 30?", answer: 10, type: "fractions", explanation: "1/3 av 30 = 30 ÷ 3 = 10" },
      { text: "🍕 Vad är 2/4 (samma som 1/2) av 40?", answer: 20, type: "fractions", explanation: "2/4 = 1/2, så 1/2 av 40 = 20" },
      { text: "🍕 Vad är 3/4 av 16?", answer: 12, type: "fractions", explanation: "1/4 av 16 = 4. Så 3/4 = 3 × 4 = 12" },
      { text: "💯 En jacka kostar 400 kr. Den är nedsatt med 25%. Vad är rabatten?", answer: 100, type: "procent", explanation: "25% av 400 = 0.25 × 400 = 100 kr" },
      { text: "💯 Du har 50 kr. Du sparar 50% mer. Hur mycket sparar du?", answer: 25, type: "procent", explanation: "50% av 50 = 0.5 × 50 = 25 kr mer" },
      { text: "💯 Vad är 20% av 150?", answer: 30, type: "procent", explanation: "20% av 150 = 0.2 × 150 = 30" },
      { text: "🍕 Vad är 1/5 av 50?", answer: 10, type: "fractions", explanation: "1/5 av 50 = 50 ÷ 5 = 10" },
      { text: "🍕 Vad är 2/3 av 18?", answer: 12, type: "fractions", explanation: "1/3 av 18 = 6. Så 2/3 = 2 × 6 = 12" },
      { text: "💯 Ett pris ökar från 100 kr till 120 kr. Hur många % är ökningen?", answer: 20, type: "procent", explanation: "Ökning = 20 kr. 20/100 = 0.2 = 20%" },
      { text: "💯 Vad är 5% av 200?", answer: 10, type: "procent", explanation: "5% av 200 = 0.05 × 200 = 10" },
      { text: "🍕 Vad är 3/5 av 25?", answer: 15, type: "fractions", explanation: "1/5 av 25 = 5. Så 3/5 = 3 × 5 = 15" },
      { text: "💯 30% av eleverna är 12 st. Hur många elever totalt?", answer: 40, type: "procent", explanation: "30% = 12. Så 100% = 12 ÷ 0.3 = 40 elever" },
      { text: "💯 Vad är 100% av 75?", answer: 75, type: "procent", explanation: "100% av något = hela värdet = 75" },
      { text: "🍕 Om 1/2 är 8, vad är det hela?", answer: 16, type: "fractions", explanation: "Om hälften är 8, då är det hela 8 × 2 = 16" },
      { text: "💯 Ett spel kostade 250 kr. Det är nedsatt 40%. Vad är rabatten?", answer: 100, type: "procent", explanation: "40% av 250 = 0.4 × 250 = 100 kr" },
      { text: "🍕 Vad är 4/5 av 20?", answer: 16, type: "fractions", explanation: "1/5 av 20 = 4. Så 4/5 = 4 × 4 = 16" }
    ];
    
    const problem = percentProblems[Math.floor(Math.random() * percentProblems.length)];
    correctAnswer = problem.answer;
    currentQuestionType = problem.type;
    currentExplanation = problem.explanation;
    document.getElementById("question").innerText = problem.text;
    
    if(Math.random() > 0.4) {
      generateMultipleChoice(problem.answer);
    } else {
      hideMultipleChoice();
    }
    
  } else if (level === "geometry") {
    // GEOMETRI - area, omkrets, volym från Matteboken.se
    const geometryProblems = [
      { text: "📐 En kvadrat har sidan 5 cm. Vad är arean? (sida × sida)", answer: 25, type: "geometry", explanation: "Area = sida² = 5 × 5 = 25 cm²" },
      { text: "📐 En rektangel är 8 cm lång och 3 cm bred. Vad är arean?", answer: 24, type: "geometry", explanation: "Area = längd × bredd = 8 × 3 = 24 cm²" },
      { text: "📐 En kvadrat har sidan 6 cm. Vad är omkretsen? (alla sidor)", answer: 24, type: "geometry", explanation: "Omkrets = 6 + 6 + 6 + 6 = 24 cm" },
      { text: "📐 En rektangel är 10 cm lång och 4 cm bred. Vad är omkretsen?", answer: 28, type: "geometry", explanation: "Omkrets = 10 + 4 + 10 + 4 = 28 cm" },
      { text: "📐 Omkretsen av en kvadrat är 20 cm. Hur lång är en sida?", answer: 5, type: "geometry", explanation: "Omkrets = 4 × sida. Så sida = 20 ÷ 4 = 5 cm" },
      { text: "📐 En cirkel har radien 5 cm. Vad är diametern?", answer: 10, type: "geometry", explanation: "Diameter = 2 × radie = 2 × 5 = 10 cm" },
      { text: "📐 En triangel med bas 6 cm och höjd 4 cm. Area = (bas × höjd) ÷ 2. Vad är arean?", answer: 12, type: "geometry", explanation: "Area = (6 × 4) ÷ 2 = 24 ÷ 2 = 12 cm²" },
      { text: "📐 En rektangel har arean 40 cm². Bredden är 5 cm. Vad är längden?", answer: 8, type: "geometry", explanation: "Area = längd × bredd. 40 = längd × 5. Längd = 40 ÷ 5 = 8 cm" },
      { text: "📐 En kub har sidan 3 cm. Vad är volymen? (sida × sida × sida)", answer: 27, type: "geometry", explanation: "Volym = sida³ = 3 × 3 × 3 = 27 cm³" },
      { text: "📐 En kvadrat har arean 36 cm². Hur lång är sidan?", answer: 6, type: "geometry", explanation: "Area = sida². Så sida = √36 = 6 cm" },
      { text: "📐 En rektangel är 12 cm lång och 5 cm bred. Vad är arean?", answer: 60, type: "geometry", explanation: "Area = 12 × 5 = 60 cm²" },
      { text: "📐 Omkretsen av en kvadrat är 32 cm. Hur lång är en sida?", answer: 8, type: "geometry", explanation: "Sida = omkrets ÷ 4 = 32 ÷ 4 = 8 cm" },
      { text: "📐 En triangel har bas 10 cm och höjd 6 cm. Vad är arean?", answer: 30, type: "geometry", explanation: "Area = (bas × höjd) ÷ 2 = (10 × 6) ÷ 2 = 30 cm²" },
      { text: "📐 En kub har sidan 4 cm. Vad är volymen?", answer: 64, type: "geometry", explanation: "Volym = 4³ = 4 × 4 × 4 = 64 cm³" },
      { text: "📐 En kvadrat har sidan 7 cm. Vad är arean?", answer: 49, type: "geometry", explanation: "Area = 7² = 7 × 7 = 49 cm²" },
      { text: "📐 En rektangel är 15 cm lång och 3 cm bred. Vad är arean?", answer: 45, type: "geometry", explanation: "Area = 15 × 3 = 45 cm²" },
      { text: "📐 En kvadrat har sidan 10 cm. Vad är omkretsen?", answer: 40, type: "geometry", explanation: "Omkrets = 4 × 10 = 40 cm" },
      { text: "📐 Omkretsen av en kvadrat är 28 cm. Hur lång är sidan?", answer: 7, type: "geometry", explanation: "Sida = 28 ÷ 4 = 7 cm" },
      { text: "📐 En triangel med bas 8 cm och höjd 5 cm. Vad är arean?", answer: 20, type: "geometry", explanation: "Area = (8 × 5) ÷ 2 = 40 ÷ 2 = 20 cm²" },
      { text: "📐 En kub har sidan 5 cm. Vad är volymen?", answer: 125, type: "geometry", explanation: "Volym = 5³ = 5 × 5 × 5 = 125 cm³" },
      { text: "📐 En rektangel är 20 cm lång och 2 cm bred. Vad är arean?", answer: 40, type: "geometry", explanation: "Area = 20 × 2 = 40 cm²" },
      { text: "📐 En kvadrat har arean 64 cm². Hur lång är sidan?", answer: 8, type: "geometry", explanation: "Sida = √64 = 8 cm" },
      { text: "📐 En rektangel har längd 9 cm och bredd 4 cm. Vad är omkretsen?", answer: 26, type: "geometry", explanation: "Omkrets = 9 + 4 + 9 + 4 = 26 cm" }
    ];
    
    const problem = geometryProblems[Math.floor(Math.random() * geometryProblems.length)];
    correctAnswer = problem.answer;
    currentQuestionType = problem.type;
    currentExplanation = problem.explanation;
    document.getElementById("question").innerText = problem.text;
    
    if(Math.random() > 0.4) {
      generateMultipleChoice(problem.answer);
    } else {
      hideMultipleChoice();
    }
  }
}

// =====================
// FEEDBACK FUNKTION
// =====================
function cheer(success) {
  // Visuell feedback utan avatar
  const question = document.getElementById("question");
  if (success) {
    question.style.background = "linear-gradient(135deg, #10b981, #059669)";
    question.style.color = "white";
    question.style.padding = "15px";
    question.style.borderRadius = "10px";
    setTimeout(() => {
      question.style.background = "";
      question.style.color = "";
      question.style.padding = "";
    }, 800);
  } else {
    question.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
    question.style.color = "white";
    question.style.padding = "15px";
    question.style.borderRadius = "10px";
    setTimeout(() => {
      question.style.background = "";
      question.style.color = "";
      question.style.padding = "";
    }, 800);
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
      showMessage("⚡ Blixtsvar! +1 bonuspoäng");
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
function showMessage(message) {
  // Visa meddelande i ett toast-liknande element
  const msgDiv = document.createElement('div');
  msgDiv.innerText = message;
  msgDiv.style.position = 'fixed';
  msgDiv.style.top = '20px';
  msgDiv.style.left = '50%';
  msgDiv.style.transform = 'translateX(-50%)';
  msgDiv.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  msgDiv.style.color = 'white';
  msgDiv.style.padding = '15px 30px';
  msgDiv.style.borderRadius = '10px';
  msgDiv.style.fontSize = '1.2em';
  msgDiv.style.fontWeight = 'bold';
  msgDiv.style.zIndex = '10000';
  msgDiv.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
  msgDiv.style.animation = 'slideDown 0.5s ease-out';
  document.body.appendChild(msgDiv);
  setTimeout(() => {
    msgDiv.style.opacity = '0';
    msgDiv.style.transition = 'opacity 0.5s';
    setTimeout(() => msgDiv.remove(), 500);
  }, 2000);
}

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
    scoreJump();
    score++;
    document.getElementById("score").innerText = score;
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
