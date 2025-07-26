const suits = [
  { name: "Luvdisc", symbol: "♥", class: "hearts" },
  { name: "Carbink", symbol: "♦", class: "diamonds" },
  { name: "Bonsly", symbol: "♣", class: "clubs" },
  { name: "Gothitelle", symbol: "♠", class: "spades" }
];

const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
let deck = [];
let playerHand = [];
let dealerHand = [];
let playerCoins = 100;
let betAmount = 10;
let gameInProgress = false;

const playerCoinsDisplay = document.getElementById("player-coins");
const betInput = document.getElementById("bet");
const message = document.getElementById("message");
const playerCards = document.getElementById("player-cards");
const dealerCards = document.getElementById("dealer-cards");
const hitButton = document.getElementById("hit-button");
const standButton = document.getElementById("stand-button");
const playButton = document.getElementById("play-button");

function createDeck() {
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  shuffle(deck);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function dealCard(hand) {
  const card = deck.pop();
  hand.push(card);
  return card;
}

function getCardHTML(card) {
  const div = document.createElement("div");
  const isFaceCard = ["A", "J", "Q", "K"].includes(card.value);
  div.className = `card ${card.suit.class} ${isFaceCard ? "face-card" : ""}`;

  const pokeName = card.suit.name;
  const count = isNaN(card.value) ? 1 : parseInt(card.value);

  let pokemonIcons = "";
  for (let i = 0; i < count; i++) {
    pokemonIcons += `<img src="images/${pokeName.toLowerCase()}.png" class="poke-icon" alt="${pokeName}">`;
  }

  div.innerHTML = `
    <div class="card-title">${card.value} of ${card.suit.symbol}</div>
    <div class="card-pokemon">${pokemonIcons}</div>
  `;

  return div;
}


function renderHand(hand, element) {
  const container = element.querySelector(".hand-container");
  if (!container) return;
  container.innerHTML = "";
  for (let card of hand) {
    container.appendChild(getCardHTML(card));
  }
  const valueDiv = element.querySelector(".hand-value");
  if (valueDiv) {
    valueDiv.textContent = `Value: ${getHandValue(hand)}`;
  }
}

function getHandValue(hand) {
  let value = 0;
  let aces = 0;
  for (let card of hand) {
    if (["J", "Q", "K"].includes(card.value)) {
      value += 10;
    } else if (card.value === "A") {
      value += 11;
      aces++;
    } else {
      value += parseInt(card.value);
    }
  }
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  return value;
}

function checkWinner() {
  const playerValue = getHandValue(playerHand);
  const dealerValue = getHandValue(dealerHand);
  if (playerValue > 21) {
    message.textContent = "You busted! Dealer wins.";
    playerCoins -= betAmount;
  } else if (dealerValue > 21 || playerValue > dealerValue) {
    message.textContent = "You win!";
    playerCoins += betAmount;
  } else if (playerValue < dealerValue) {
    message.textContent = "Dealer wins!";
    playerCoins -= betAmount;
  } else {
    message.textContent = "It's a tie!";
  }
  updateCoins();
  hitButton.disabled = true;
  standButton.disabled = true;
  gameInProgress = false;
}

function updateCoins() {
  playerCoinsDisplay.textContent = `Coins: ${playerCoins}`;
}

function playGame() {
  if (gameInProgress) return;

  betAmount = parseInt(betInput.value);
  if (isNaN(betAmount) || betAmount <= 0) {
    message.textContent = "Please enter a valid bet amount.";
    return;
  }
  if (betAmount > playerCoins) {
    message.textContent = "Not enough coins to bet that amount.";
    return;
  }

  gameInProgress = true;

  createDeck();
  playerHand = [];
  dealerHand = [];

  dealCard(playerHand);
  dealCard(dealerHand);
  dealCard(playerHand);
  dealCard(dealerHand);

  const dealerValue = dealerCards.querySelector(".hand-value");
  const dealerContainer = dealerCards.querySelector(".hand-container");

  if (dealerValue && dealerContainer) {
    dealerValue.textContent = "";
    dealerContainer.innerHTML = "";
    
    dealerContainer.appendChild(getCardHTML(dealerHand[0]));

    const hiddenCard = document.createElement("div");
    hiddenCard.className = "card hidden";
    hiddenCard.innerHTML = `<div class="top">?</div><div class="middle">???</div><div class="bottom">?</div>`;
    dealerContainer.appendChild(hiddenCard);
  }
  
  const playerValue = playerCards.querySelector(".hand-value");
  const playerContainer = playerCards.querySelector(".hand-container");

  if (playerValue && playerContainer) {
    playerValue.textContent = "";
    playerContainer.innerHTML = "";
    for (let card of playerHand) {
        playerContainer.appendChild(getCardHTML(card));
    }
  }

  renderHand(playerHand, playerCards);

  message.textContent = "Game in progress...";
  hitButton.disabled = false;
  standButton.disabled = false;
}

function hit() {
  if (!gameInProgress || deck.length === 0) return;
  dealCard(playerHand);
  renderHand(playerHand, playerCards);
  const value = getHandValue(playerHand);
  if (value > 21) {
    stand();
  }
}

function stand() {
  if (!gameInProgress) return;

  while (getHandValue(dealerHand) < 17) {
    dealCard(dealerHand);
  }

  const dealerValue = dealerCards.querySelector(".hand-value");
  const dealerContainer = dealerCards.querySelector(".hand-container");

  dealerValue.textContent = "";
  dealerContainer.innerHTML = "";

  for (let card of dealerHand) {
    dealerContainer.appendChild(getCardHTML(card));
  }

  renderHand(dealerHand, dealerCards);
  checkWinner();
}


hitButton.addEventListener("click", hit);
standButton.addEventListener("click", stand);
playButton.addEventListener("click", playGame);

updateCoins();
hitButton.disabled = true;
standButton.disabled = true;
