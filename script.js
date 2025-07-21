let questions = [];
let currentIndex = 0;
let score = 0;
let selectedAnswers = [];
let timerInterval;

const QUIZ_TIME = 60; // Total time in seconds
const SHEET_ID = "1UkfHZOzOy9dhParCQRQeWzWRXkpBzIzkR3GlK42NUNw";
const GID = "0";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

window.addEventListener("DOMContentLoaded", loadQuestions);

async function loadQuestions() {
  try {
    const res = await fetch(CSV_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csv = await res.text();
    questions = parseCsvToQuestions(csv);

    // Shuffle questions
    shuffleArray(questions);

    startTimer(QUIZ_TIME);
    showQuestion();
  } catch (err) {
    console.error("Failed to load sheet data:", err);
    document.getElementById("quiz-container").innerHTML =
      "<p>Sorry, could not load quiz questions.</p>";
  }
}

function parseCsvToQuestions(csv) {
  const rows = [];
  const lines = csv.split(/\r?\n/).filter(l => l.trim() !== "");
  const headers = splitCsvLine(lines[0]);
  const idxQ = headers.indexOf("Question");
  const idx1 = headers.indexOf("Option1");
  const idx2 = headers.indexOf("Option2");
  const idx3 = headers.indexOf("Option3");
  const idx4 = headers.indexOf("Option4");
  const idxA = headers.indexOf("AnswerIndex");
  const idxImg = headers.indexOf("ImageURL"); // Optional

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (!cols[idxQ]) continue;
    rows.push({
      Question: cols[idxQ] || "",
      Option1: cols[idx1] || "",
      Option2: cols[idx2] || "",
      Option3: cols[idx3] || "",
      Option4: cols[idx4] || "",
      AnswerIndex: parseInt(cols[idxA], 10),
      ImageURL: idxImg >= 0 ? (cols[idxImg] || "") : ""
    });
  }
  return rows;
}

function splitCsvLine(line) {
  const result = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

function showQuestion() {
  const q = questions[currentIndex];
  if (!q) {
    finishQuiz();
    return;
  }

  const imgHTML = q.ImageURL
    ? `<img src="${q.ImageURL}" alt="Question image" style="max-width:300px;display:block;margin:10px 0;">`
    : "";

  document.getElementById("quiz-container").innerHTML = `
    <h2>${q.Question}</h2>
    ${imgHTML}
    <button onclick="selectAnswer(0)">${q.Option1}</button><br>
    <button onclick="selectAnswer(1)">${q.Option2}</button><br>
    <button onclick="selectAnswer(2)">${q.Option3}</button><br>
    <button onclick="selectAnswer(3)">${q.Option4}</button>
  `;
  document.getElementById("nextBtn").style.display = "none";
}

function selectAnswer(index) {
  selectedAnswers[currentIndex] = index;
  if (index === questions[currentIndex].AnswerIndex) score++;

  // Highlight correct/wrong
  const buttons = document.querySelectorAll("#quiz-container button");
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === questions[currentIndex].AnswerIndex) {
      btn.style.backgroundColor = "#4CAF50"; // correct
    } else if (i === index) {
      btn.style.backgroundColor = "#f44336"; // chosen wrong
    }
  });

  document.getElementById("nextBtn").style.display = "block";
}

function nextQuestion() {
  currentIndex++;
  showQuestion();
}

function finishQuiz() {
  clearInterval(timerInterval);

  let reviewHTML = `<h2>Test complete! Score: ${score}/${questions.length}</h2><ul>`;
  questions.forEach((q, i) => {
    const correct = q.AnswerIndex;
    const userAnswer = selectedAnswers[i];
    const isCorrect = correct === userAnswer;
    reviewHTML += `<li>
      <strong>Q${i + 1}:</strong> ${q.Question}<br>
      Your answer: ${userAnswer !== undefined ? q["Option" + (userAnswer + 1)] : "No answer"}<br>
      Correct answer: ${q["Option" + (correct + 1)]}<br>
      ${isCorrect ? '<span style="color:green;">✔ Correct</span>' : '<span style="color:red;">✖ Incorrect</span>'}
    </li><br>`;
  });
  reviewHTML += "</ul>";

  document.getElementById("quiz-container").innerHTML = "";
  document.getElementById("nextBtn").style.display = "none";
  document.getElementById("result").innerHTML = reviewHTML;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function startTimer(seconds) {
  const timerDiv = document.createElement("div");
  timerDiv.id = "timer";
  timerDiv.style.fontSize = "18px";
  timerDiv.style.marginBottom = "10px";
  document.body.insertBefore(timerDiv, document.getElementById("quiz-container"));

  let remaining = seconds;
  updateTimer(remaining);
  timerInterval = setInterval(() => {
    remaining--;
    updateTimer(remaining);
    if (remaining <= 0) {
      clearInterval(timerInterval);
      finishQuiz();
    }
  }, 1000);
}

function updateTimer(sec) {
  const timerDiv = document.getElementById("timer");
  if (timerDiv) {
    timerDiv.innerText = `Time left: ${sec} sec`;
  }
}
