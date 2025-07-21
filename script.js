let questions = [];
let currentIndex = 0;
let score = 0;

const SHEET_ID = "1UkfHZOzOy9dhParCQRQeWzWRXkpBzIzkR3GlK42NUNw";  // Your sheet ID
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

window.onload = async function() {
  try {
    const response = await fetch(SHEET_URL);
    const text = await response.text();
    const json = JSON.parse(text.substr(47).slice(0, -2)); // clean Google's response

    questions = json.table.rows.map(row => ({
      Question: row.c[0]?.v,
      Option1: row.c[1]?.v,
      Option2: row.c[2]?.v,
      Option3: row.c[3]?.v,
      Option4: row.c[4]?.v,
      AnswerIndex: parseInt(row.c[5]?.v, 10)
    }));

    showQuestion();
  } catch (error) {
    console.error("Error loading sheet data", error);
  }
};

function showQuestion() {
  const q = questions[currentIndex];
  if (!q) {
    document.getElementById("quiz-container").innerHTML = "";
    document.getElementById("nextBtn").style.display = "none";
    document.getElementById("result").innerText = `Test complete! Score: ${score}/${questions.length}`;
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
  document.querySelectorAll("#quiz-container button").forEach(btn => btn.disabled = true);
}

function nextQuestion() {
  currentIndex++;
  document.getElementById("nextBtn").style.display = "none";
  showQuestion();
}
