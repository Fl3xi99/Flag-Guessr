// Database Endpoint Configuration
const API_URL = "https://restcountries.com/v3.1/all?fields=name,flags";

let countryDatabase = [];
let currentCountry = null;
let score = 0;
let streak = 0;

// DOM Hooks
const loadingScreen = document.getElementById('loading-screen');
const flagImg = document.getElementById('flag-img');
const optionsContainer = document.getElementById('options-container');
const scoreDisplay = document.getElementById('score');
const streakDisplay = document.getElementById('streak');
const themeSelect = document.getElementById('theme-select');

// --- Theme Management ---
themeSelect.addEventListener('change', (e) => {
    const selectedTheme = e.target.value;
    // Set an attribute on the <html> level so CSS can style components
    document.documentElement.setAttribute('data-theme', selectedTheme);
    // Save selection to remember preferences on refresh
    localStorage.setItem('game-theme', selectedTheme);
});

// Load Saved Theme Settings on boot
const savedTheme = localStorage.getItem('game-theme') || 'dark';
themeSelect.value = savedTheme;
document.documentElement.setAttribute('data-theme', savedTheme);


// --- Game Core Engine ---

// Fetch data from the live API
async function fetchDatabase() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Clean array mappings
        countryDatabase = data.map(item => ({
            name: item.name.common,
            flagUrl: item.flags.svg || item.flags.png
        }));

        loadingScreen.style.display = 'none';
        generateQuestion();

    } catch (error) {
        console.error("Database failed to load:", error);
        document.getElementById('loading-screen').innerHTML = "❌ Failed to load database. Refresh to try again.";
    }
}

// Generate a random round
function generateQuestion() {
    optionsContainer.innerHTML = "";

    const randomIndex = Math.floor(Math.random() * countryDatabase.length);
    currentCountry = countryDatabase[randomIndex];
    flagImg.src = currentCountry.flagUrl;

    // Pick unique choices
    let choices = [currentCountry.name];
    while (choices.length < 4) {
        const randomWrong = countryDatabase[Math.floor(Math.random() * countryDatabase.length)].name;
        if (!choices.includes(randomWrong)) {
            choices.push(randomWrong);
        }
    }

    // Shuffle choices array
    choices.sort(() => Math.random() - 0.5);

    // Build the visual interaction layers
    choices.forEach(countryName => {
        const btn = document.createElement('button');
        btn.textContent = countryName;
        btn.onclick = () => processGuess(btn, countryName);
        optionsContainer.appendChild(btn);
    });
}

// Process user input evaluation
function processGuess(clickedButton, chosenName) {
    const allButtons = optionsContainer.querySelectorAll('button');
    allButtons.forEach(btn => btn.disabled = true);

    if (chosenName === currentCountry.name) {
        clickedButton.classList.add('correct-choice');
        score++;
        streak++;
    } else {
        clickedButton.classList.add('wrong-choice');
        streak = 0; 

        // Reveal the right answer visually
        allButtons.forEach(btn => {
            if (btn.textContent === currentCountry.name) {
                btn.classList.add('correct-choice');
            }
        });
    }

    scoreDisplay.textContent = score;
    streakDisplay.textContent = streak;

    setTimeout(generateQuestion, 1800);
}

// Start Game
fetchDatabase();