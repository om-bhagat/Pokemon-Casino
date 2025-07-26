const stopButtons = document.querySelectorAll(".stop-button");
let reelIntervals = [null, null, null];
let stoppedResults = [null, null, null];
let reelsStopped = 0;

const symbols = [
    { name: "7", image: "7.png" },
    { name: "REPLAY", image: "replay.png" },
    { name: "CHERRY", image: "cherry.png" },
    { name: "LEMON", image: "lemon.png" },
    { name: "WATERMELON", image: "watermelon.png" },
    { name: "PIKACHU", image: "pikachu.png" },
    { name: "SQUIRTLE", image: "squirtle.png" },
    { name: "POLIWAG", image: "poliwag.png" }
];

const reels = [
    document.querySelector("#reel1 img"),
    document.querySelector("#reel2 img"),
    document.querySelector("#reel3 img")
];

const resultText = document.getElementById('result');
const spinButton = document.getElementById("spin-button");

function getRandomSymbol() {
    const index = Math.floor(Math.random() * symbols.length);
    return symbols[index];
}

function checkResult(result, bet) {
    console.log("stopped results: ", result);
    const [a, b, c] = result;

    if (a === b && b === c) {
        if (a === "REPLAY") {
            resultText.textContent = " Free spin! Bet refunded!";
            resultText.style.color = "blue";
            updateCoins(bet);
        } else if (a === "7") {
            console.log("Triple 7s! Triggering animation");
            const winnings = bet * 10;
            updateCoins(winnings);
            resultText.textContent = ` JACKPOT! Triple 7s! You win ${winnings} coins! 🎉`;
            resultText.style.color = "gold";

            triggerJackpotAnimation(); //  Add this line
        } else {
            const winnings = bet * 5;
            updateCoins(winnings);
            resultText.textContent = ` Three ${a}s! You win ${winnings} coins!`;
            resultText.style.color = "green";
        }
    } else if (result.includes("REPLAY")) {
        resultText.textContent = " One REPLAY - You get your bet back!";
        resultText.style.color = "blue";
        updateCoins(bet);
    } else {
        resultText.textContent = "No match. Try again!";
        resultText.style.color = "red";
    }
}

function triggerJackpotAnimation() {
    console.log("Triggering flowing coin rain!");

    const coinContainer = document.getElementById("coin-container");
    const coinSound = new Audio('sounds/Pokemon Slots - Google Chrome 2025-07-23 18-02-21.mp4');
    coinSound.play();
    coinContainer.innerHTML = "";

    let totalCoins = 0;
    const maxCoins = 1000; // Or 500 for longer flow

    const winSound = new Audio("sounds/jackpot.mp3");
    winSound.play();

    const coinInterval = setInterval(() => {
        spawnCoin();
        totalCoins++;
        const coin = document.createElement("div");
        coin.className = "coin";
        let spacing = window.innerWidth / 20;
        coin.style.left = (totalCoins & 20) * spacing + "px";
        coin.style.top = "-50px";
        coin.style.animation = "fall 2.5s linear forwards";
        coinContainer.appendChild(coin);

        // Remove after fall
        setTimeout(() => {
            coin.remove();
        }, 3000);

        totalCoins++;
        if (totalCoins >= maxCoins) {
            clearInterval(coinInterval);
        }
    }, 20); // Drop a coin every 20 ms
}


let coins = 100;
const coinDisplay = document.getElementById("coin-count");
const betInput = document.getElementById("bet-amount");

function updateCoins(amount) {
    coins += amount;
    coinDisplay.textContent = coins;
}


function spinReels() {
    const bet = parseInt(betInput.value);

    if (isNaN(bet) || bet <= 0 || bet > coins) {
        resultText.textContent = " Invalid bet or not enough coins!";
        resultText.style.color = "orange";
        return;
    }

    updateCoins(-bet);
    resultText.textContent = " Spinning...";
    resultText.style.color = "black";
    spinButton.disabled = true;

    reelsStopped = 0;
    stoppedResults = [null, null, null];

    // Start spinning each reel
    for (let i = 0; i < 3; i++) {
        spinReel(i);
        stopButtons[i].disabled = false;
    }
}

function spinReel(index) {
    const reel = reels[index];
    reelIntervals[index] = setInterval(() => {
        const symbol = getRandomSymbol();
        reel.src = `images/${symbol.image}`;
        reel.alt = symbol.name;
    }, 100);
}

function stopReel(index) {
    clearInterval(reelIntervals[index]);

    // Force it to be 7 for testing
    const finalSymbol = getRandomSymbol();

    reels[index].src = `images/${finalSymbol.image}`;
    reels[index].alt = finalSymbol.name;
    stoppedResults[index] = finalSymbol.name;
    stopButtons[index].disabled = true;
    reelsStopped++;

    if (reelsStopped === 3) {
        spinButton.disabled = false;
        checkResult(stoppedResults, parseInt(betInput.value));
    }
}


function startReelSpin(reelIndex, duration, onComplete) {
    const reel = reels[reelIndex];
    let spinInterval = setInterval(() => {
        const symbol = getRandomSymbol();
        reel.src = `images/${symbol.image}`;
        reel.alt = symbol.name;
    }, 100);

    setTimeout(() => {
        clearInterval(spinInterval);
        const finalSymbol = getRandomSymbol();
        reel.src = `images/${finalSymbol.image}`;
        reel.alt = finalSymbol.name;

        reel.classList.remove("spin");

        onComplete(finalSymbol.name);
    }, duration);
}

stopButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index);
        stopReel(index);
    });
});

function spawnCoin() {
    const coin = document.createElement("div");
    coin.className = "coin";
    coin.style.left = Math.random() * 100 + "vw";

    const coinContainer = document.getElementById("coin-container");
    coinContainer.appendChild(coin);

    setTimeout(() => {
        coin.remove();
    }, 2500);
}

spinButton.addEventListener("click", spinReels);
