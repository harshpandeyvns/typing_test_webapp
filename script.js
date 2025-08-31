const sentences = [
    "The quick brown fox jumps over the lazy dog near the riverbank while the sun sets beautifully behind the mountains.",
    "Consistent practice and dedication to improving your typing skills will lead to remarkable speed and accuracy over time.",
    "Learning new programming languages and concepts can significantly enhance your problem-solving skills and career opportunities.",
    "Artificial intelligence and machine learning are transforming industries across the globe, from healthcare to finance and beyond.",
    "Effective communication, patience, and persistence are essential traits for achieving success in both personal and professional life.",
    "The importance of reading books, exploring knowledge, and expanding your mind cannot be underestimated in the modern world.",
    "Typing efficiently not only saves time but also increases productivity, enabling individuals to accomplish more with less effort.",
    "Embracing challenges, learning from mistakes, and staying motivated are crucial steps in personal development and lifelong learning.",
    "In the age of technology, understanding coding, algorithms, and logical thinking is an invaluable skill for solving real-world problems.",
    "A journey of a thousand miles begins with a single step, and small consistent efforts eventually lead to significant achievements."
];

const sentenceEl = document.getElementById("sentence");
const inputEl = document.getElementById("input");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const timerEl = document.getElementById("timer");
const highestEl = document.getElementById("highest");
const startBtn = document.getElementById("start");
const resetBtn = document.getElementById("reset");
const leaderboardEl = document.getElementById("leaderboard");

let startTime, interval;
let currentSentence = "";
let highestWPM = localStorage.getItem("highestWPM") || 0;
let totalWordsTyped = 0; // total words typed across sentences
const testDuration = 60; // 1-minute timer

// Initialize highest WPM display
highestEl.textContent = highestWPM;

// Load leaderboard
loadLeaderboard();

function startTest() {
    inputEl.value = "";
    inputEl.disabled = false;
    inputEl.focus();
    totalWordsTyped = 0;
    currentSentence = getRandomSentence();
    showSentence(currentSentence);
    startTime = new Date();
    if(interval) clearInterval(interval);
    interval = setInterval(updateStats, 100); // smooth updates
}

function resetTest() {
    clearInterval(interval);
    inputEl.value = "";
    inputEl.disabled = true;
    sentenceEl.textContent = "Click \"Start Test\" to begin typing!";
    wpmEl.textContent = "0";
    accuracyEl.textContent = "0";
    timerEl.textContent = testDuration;
    totalWordsTyped = 0;
}

function getRandomSentence(excludeSentence = "") {
    let nextSentence;
    do {
        nextSentence = sentences[Math.floor(Math.random() * sentences.length)];
    } while(nextSentence === excludeSentence && sentences.length > 1);
    return nextSentence;
}

function showSentence(sentence) {
    sentenceEl.innerHTML = sentence.split("").map(char => `<span>${char}</span>`).join("");
}

function updateStats() {
    const now = new Date();
    const elapsedTime = (now - startTime) / 1000; // seconds
    const remainingTime = Math.max(testDuration - elapsedTime, 0);
    timerEl.textContent = Math.ceil(remainingTime);

    const input = inputEl.value;
    let correctChars = 0;

    const sentenceSpans = sentenceEl.querySelectorAll("span");
    sentenceSpans.forEach((span, idx) => {
        const char = input[idx];
        if(char == null) {
            span.className = "";
        } else if(char === span.textContent) {
            span.className = "correct";
            correctChars++;
        } else {
            span.className = "incorrect";
        }
    });

    // Update words typed so far across all sentences
    const wordsTyped = input.split(" ").filter(word => word !== "").length + totalWordsTyped;
    const minutesElapsed = elapsedTime / 60;
    const wpm = minutesElapsed > 0 ? Math.round(wordsTyped / minutesElapsed) : 0;
    const accuracy = input.length > 0 ? Math.round((correctChars / input.length) * 100) : 0;

    wpmEl.textContent = wpm;
    accuracyEl.textContent = accuracy;

    // Update highest WPM
    if(wpm > highestWPM) {
        highestWPM = wpm;
        localStorage.setItem("highestWPM", highestWPM);
        highestEl.textContent = highestWPM;
    }

    // Move to next sentence automatically without resetting timer
    if(input === currentSentence) {
        totalWordsTyped += input.split(" ").filter(word => word !== "").length;
        inputEl.value = "";
        currentSentence = getRandomSentence(currentSentence); // ensure next sentence is different
        showSentence(currentSentence);
    }

    // End test when 1-minute timer finishes
    if(remainingTime <= 0) {
        clearInterval(interval);
        inputEl.disabled = true;
        updateLeaderboard(wpm);
        timerEl.textContent = "0";
    }
}

function updateLeaderboard(score) {
    let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
    scores.push(score);
    scores.sort((a,b) => b-a);
    scores = scores.slice(0,5); // top 5
    localStorage.setItem("leaderboard", JSON.stringify(scores));
    loadLeaderboard();
}

function loadLeaderboard() {
    const scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboardEl.innerHTML = scores.map(score => `<li>${score} WPM</li>`).join("");
}

startBtn.addEventListener("click", startTest);
resetBtn.addEventListener("click", resetTest);
inputEl.addEventListener("input", updateStats);
