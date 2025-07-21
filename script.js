let questions = [];
let currentIndex = 0;
let score = 0;

const SHEET_ID = "1UkfHZOzOy9dhParCQRQeWzWRXkpBzIzkR3GlK42NUNw";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

window.addEventListener("DOMContentLoaded", loadQuestions);

async function loadQuestions() {
  try {
    const res = await fetch(SHEET_URL);
    const text = await res.text();

    // Google's gviz format wraps JSON in a JS function call; strip it.
    const json = JSON.parse(text.substring(47, text.length - 2));

    // Expect columns: Question, Option1, Option2, Option3, Option4, AnswerIndex
    questions = json.table.rows
      .map(r => {
        const c = r.c;
        if (!c) return null;
        return {
          Question: c[0]?.v || "",
          Option1: c[1]?.v || "",
          Option2: c[2]?.v || "",
          Option3: c[3]?.v || "",
          Option4: c[4]?.v || "",
          AnswerIndex: parseInt(c[5]?.v, 10)
        };
      })
      .filter(q => q && q.Question.trim() !== "");

    showQuestion();
  } catch (err) {
    console.error("Failed to load sheet data:", err);
    document.getElementById("quiz-container").innerHTML =
      "<p>Sorry, could not load quiz questions.</p>";
  }
}

function showQuestion() {
  const q = questions[currentIndex];
  if (!q) {
    document.getElementById("quiz-container").innerHTML = "";
    document.getElementById("nextBtn").style.display = "none";
    document.getElementById("result").innerText =
      `Test complete! Score: ${score}/${questions.length}`;
    return;
  }

  document.getElementById("quiz-container").innerHTML = `
    <h2>${q.Question}</h2>
    <button onclick="selectAnswer(0)">${q.Option1}</button><br>
    <button onclick="selectAnswer(1)">${q.Option2}</button><br>
    <button onclick="selectAnswer(2)">${q.Option3}</button><br>
    <button onclick="selectAnswer(3)">${q.Option4}</button>
  `;
}

function selectAnswer(index) {
  if (index === questions[currentIndex].AnswerIndex) score++;
  document.getElementById("nextBtn").style.display = "block";
  document.querySelectorAll("#quiz-container button").forEach(btn => {
    btn.disabled = true;
  });
}

function nextQuestion() {
  currentIndex++;
  document.getElementById("nextBtn").style.display = "none";
  showQuestion();
}
