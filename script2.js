const canvas = document.getElementById("roulette");
const ctx = canvas.getContext("2d");

const spinButton = document.getElementById("spin-button");
const resultText = document.getElementById("result-text");
const coinDisplay = document.getElementById("coin-count");
const betAmountInput = document.getElementById("bet-amount");

const pokemonGrid = document.getElementById("pokemon-grid");
let selectedBets = new Set();

const pokemonNames = [
  "Charmander", "Squirtle", "Bulbasaur", "Chikorita", "Cyndaquil", "Totodile",
  "Treecko", "Torchic", "Arceus", "Turtwig", "Chimchar", "Piplup",
  "Snivy", "Tepig", "Oshawott", "Chespin", "Fennekin", "Froakie",
  "Mew", "Mudkip"
];

// Color setup
const colors = [];
for (let i = 0; i < pokemonNames.length; i++) {
  const name = pokemonNames[i];
  if (name === "Mew" || name === "Arceus") {
    colors.push("#00ff00"); // Green
  } else {
    colors.push(i % 2 === 0 ? "#000000" : "#ff0000"); // Black / Red
  }
}

const sliceAngle = (2 * Math.PI) / pokemonNames.length;
let currentRotation = 0;
let spinning = false;
let coins = 100;

// Text color contrast logic
function getTextColor(bgColor) {
  const r = parseInt(bgColor.substr(1, 2), 16);
  const g = parseInt(bgColor.substr(3, 2), 16);
  const b = parseInt(bgColor.substr(5, 2), 16);
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  return brightness < 128 ? "#ffffff" : "#000000";
}

// Draw the roulette wheel
function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(250, 250);
  ctx.rotate(currentRotation);

  for (let i = 0; i < pokemonNames.length; i++) {
    const angle = i * sliceAngle;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 250, angle, angle + sliceAngle);
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.closePath();

    ctx.save();
    ctx.rotate(angle + sliceAngle / 2);
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "right";
    ctx.fillStyle = getTextColor(colors[i]);
    ctx.fillText(pokemonNames[i], 240, 5);
    ctx.restore();
  }

  ctx.restore();
}

// Spin logic
function spinWheel() {
  if (spinning) return;

  const betAmount = parseInt(betAmountInput.value);
  if (isNaN(betAmount) || betAmount <= 0 || betAmount > coins) {
    alert("Invalid bet amount.");
    return;
  }

  if (selectedBets.size === 0) {
    alert("Please place a bet.");
    return;
  }

  coins -= betAmount;
  updateCoins();
  spinning = true;

  const spins = 5 + Math.floor(Math.random() * 5);
  const extraRotation = Math.random() * 2 * Math.PI;
  const totalRotation = spins * 2 * Math.PI + extraRotation;
  const start = performance.now();
  const duration = 4000;

  function animate(timestamp) {
    const elapsed = timestamp - start;
    if (elapsed < duration) {
      const progress = elapsed / duration;
      const ease = 1 - Math.pow(1 - progress, 3);
      currentRotation = ease * totalRotation;
      drawWheel();
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      currentRotation = totalRotation % (2 * Math.PI);
      drawWheel();

      // Determine which Pokémon was landed on
      const pointerAngle = (2 * Math.PI - currentRotation + Math.PI) % (2 * Math.PI);
      const index = Math.floor(pointerAngle / sliceAngle);
      const landedPokemon = pokemonNames[index];
      const landedColor = pokemonColors[index];

      resultText.textContent = `You landed on: ${landedPokemon}!`;

      let win = false;
      let payout = 0;

      // If user bet on the exact landed Pokémon
      if (selectedBets.has(landedPokemon)) {
        win = true;
        payout = (landedPokemon === "Mew" || landedPokemon === "Arceus")
          ? betAmount * 10
          : betAmount * 2;
      }
      // If user bet on a color group (red/black)
      else if (
        (landedColor === "red" && [...selectedBets].every(name => pokemonColors[pokemonNames.indexOf(name)] === "red")) ||
        (landedColor === "black" && [...selectedBets].every(name => pokemonColors[pokemonNames.indexOf(name)] === "black"))
      ) {
        win = true;
        payout = betAmount * 2;
      }

      if (win) {
        coins += payout;
        alert(`You won! +${payout} coins`);
      } else {
        alert(`You lost!`);
      }

      updateCoins();
    }
  }

  requestAnimationFrame(animate);
}


// Coin display
function updateCoins() {
  coinDisplay.textContent = coins;
}

// Color mapping logic
const pokemonColors = pokemonNames.map((name, index) => {
  if (name === "Mew" || name === "Arceus") return "green";
  return index % 2 === 0 ? "black" : "red";
});

// Build grid UI
pokemonNames.forEach((name, i) => {
  const div = document.createElement("div");
  div.textContent = name;
  div.classList.add("pokemon-tile");
  div.dataset.name = name;
  div.dataset.color = pokemonColors[i];

  div.addEventListener("click", () => {
    clearAllBets();
    selectedBets.add(name);
    div.classList.add("selected");
  });

  pokemonGrid.appendChild(div);
});


// Color group buttons
document.querySelectorAll(".color-bet").forEach(btn => {
  btn.addEventListener("click", () => {
    const color = btn.dataset.color;
    clearAllBets();
    document.querySelectorAll(`.pokemon-tile[data-color="${color}"]`).forEach(tile => {
      const name = tile.dataset.name;
      selectedBets.add(name);
      tile.classList.add("selected");
    });
  });
});
// Initial load
function clearAllBets() {
  selectedBets.clear();
  document.querySelectorAll(".pokemon-tile").forEach(tile => {
    tile.classList.remove("selected");
  });
}

drawWheel();
updateCoins();
spinButton.addEventListener("click", spinWheel);
