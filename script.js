let questions = [];
let currentIndex = 0;
let score = 0;

const publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRUcbhxBVF-_wHTPckdLKDWnt2E8rwE4v1lSL2h_IKNCSuHOiU8xqmuQd1GmO9pmr7wnanzV2_YAu2Y/pubhtml';

window.onload = function() {
  Tabletop.init({
    key: publicSpreadsheetUrl,
    callback: showData,
    simpleSheet: true
  });
};

function showData(data) {
  questions = data;
  showQuestion();
}

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
  const correct = parseInt(questions[currentIndex].AnswerIndex);
  if (index === correct) score++;
  document.getElementById("nextBtn").style.display = "block";
  const buttons = document.querySelectorAll("#quiz-container button");
  buttons.forEach(btn => btn.disabled = true);
}

function nextQuestion() {
  currentIndex++;
  document.getElementById("nextBtn").style.display = "none";
  showQuestion();
}
