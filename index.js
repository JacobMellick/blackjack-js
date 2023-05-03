let cashEl = document.getElementById("cash-el");
let gamestateEl = document.getElementById("gamestate-el");

//initialize and display starting cash
let cash = 100;
cashEl.textContent = "Cash: $" + cash;

//populate deck and create instanced deck for round (called deck)
let cards = [];
for (let i = 1; i <= 4; i++) {
  for (let j = 1; j <= 10; j++) {
    cards.push(j);
  }
}
cards = cards.concat(Array(12).fill(10));
let deck = [...cards]; //deck is used for each round, is repopulated at the beginning of a new round
let tens = ["King", "Queen", "Jack", "10"];
let all_tens = [...tens, ...tens, ...tens, ...tens];
let deck_tens = [...all_tens]; //deck of all face cards, also used for each round

//initialize game values
let gamestate = "starting";
let bet = 0;
let playerHand = [];
let dealerHand = [];
let dealerCards = [];
let playerCards = [];

//displays message at the top of the screen that changes with gamestate
function gamestate_display() {
  if (gamestate == "starting") {
    gamestateEl.textContent = "Welcome to Blackjack!";
    console.log("starting");
  } else if (gamestate == "betting") {
    if (cash == 0) {
      console.log("bruh");
      gamestateEl.textContent = "Refresh for cash injection ;)";
    } else {
      gamestateEl.textContent = "Place your bet";
    }
  } else if (gamestate == "playing") {
    gamestateEl.textContent = "Your hand:";
  } else if (gamestate == "won") {
    let random = Math.floor(Math.random() * 6);
    if (random == 0) {
      gamestateEl.textContent = "You're on a hot streak!";
    } else if (random == 1) {
      gamestateEl.textContent = "Don't you just love gambling?";
    } else if (random == 2) {
      gamestateEl.textContent = "Great! Let's go again!";
    } else if (random == 3) {
      gamestateEl.textContent = "Another, another!";
    } else if (random == 4) {
      gamestateEl.textContent =
        "Enjoy the dopamine :) Hit play again for some more!";
    } else {
      gamestateEl.textContent = "I am proud of you.";
    }
  } else if (gamestate == "tie") {
    gamestateEl.textContent = "A tie? Laaaame >:(";
  } else if (gamestate == "lost") {
    let random = Math.floor(Math.random() * 6);
    if (random == 0) {
      gamestateEl.textContent = "Loser!";
    } else if (random == 1) {
      gamestateEl.textContent = "Well...you tried, I guess.";
    } else if (random == 2) {
      gamestateEl.textContent = "Can't end on a loss!";
    } else if (random == 3) {
      gamestateEl.textContent = "Try again! You have nowhere else to be.";
    } else if (random == 4) {
      gamestateEl.textContent =
        "Don't quit! Try again! Quitters are terrible people :)";
    } else {
      gamestateEl.textContent = "Your mother has left the crowd.";
    }
  }
}

//starts game
function start() {
  document.getElementById("start-btn").style.display = "none";
  gamestate = "betting";
  document.getElementById("betzone").style.display = "block";
  gamestate_display();
}

//controls betting function - prevents players from going over the amount they have
function changeBet(amount) {
  if (amount <= cash && bet >= -amount) {
    cash -= amount;
    bet += amount;
    document.getElementById("bet").textContent = "Current bet: $" + bet;
    cashEl.textContent = "Cash: $" + cash;
  }
}

//deals one card from a deck -- returns item from array and removes it
function dealOne(deck1) {
  const index = Math.floor(Math.random() * deck1.length);
  value = deck1[index];
  deck1.splice(index, 1);
  return value;
}

//gives both dealer and player their starting cards
function initialDeal() {
  for (let i = 0; i <= 1; i++) {
    dealerHand.push(dealOne(deck));
    playerHand.push(dealOne(deck));
    dealerCards.push(interpretCard(dealerHand[i]));
    playerCards.push(interpretCard(playerHand[i]));
  }
}

//interprets card values -- draws from ten-valued deck if card is a ten
function interpretCard(card) {
  if (card == 10) {
    value = dealOne(deck_tens);
  } else if (card == 1) {
    value = "Ace";
  } else {
    value = card;
  }
  return value;
}

//displays hand
function handDisplay(hand) {
  let handString = "";
  for (let i = 0; i < hand.length - 1; i++) {
    handString += hand[i] + ", ";
  }
  handString += hand[hand.length - 1];

  return handString;
}

//displays "game board", gives player and dealer their two cards
function play() {
  if (bet > 0) {
    document.getElementById("betzone").style.display = "none";
    document.getElementById("playzone").style.display = "block";
    gamestate = "playing";
    gamestate_display();

    initialDeal();

    document.getElementById("dealer-card").innerText = dealerCards[0];

    document.getElementById("player-cards").innerText =
      handDisplay(playerCards);
  }
}

//determines if player or dealer has busted
function bustCheck(hand) {
  let ace = hand.includes(1);
  let total1 = 0;
  let total2 = 0;
  let total3 = 0;
  if (ace) {
    total1 = hand.reduce((acc, cumul) => acc + cumul, 0);
    total2 = hand.reduce((acc, cumul) => acc + cumul, 0) + 10;
  } else {
    total3 = hand.reduce((acc, cumul) => acc + cumul, 0);
  }
  return (total1 > 21 && total2 > 21) || total3 > 21;
}

//hits player
function hit() {
  value = dealOne(deck);
  playerHand.push(value);
  playerCards.push(interpretCard(value));
  document.getElementById("player-cards").innerText = handDisplay(playerCards);
  if (bustCheck(playerHand)) {
    stay();
  }
}

//determines if a hand is viable
function viableHand(total) {
  return total <= 21 && total >= 17;
}

//determines the player or dealer's highest viable total
function viableTotal(hand) {
  let ace = hand.includes(1);
  let totals = [];
  if (ace) {
    totals.push(hand.reduce((acc, cumul) => acc + cumul, 0));
    totals.push(hand.reduce((acc, cumul) => acc + cumul, 0) + 10);
  } else {
    totals.push(hand.reduce((acc, cumul) => acc + cumul, 0));
  }
  let total = Math.max(...totals.filter((value) => value <= 21));
  return total;
}

//dealer plays -- dealer play is automatic, they continue until they have 17-21 or bust
function dealerHit() {
  let viable = false;
  while (!viable) {
    let ace = dealerHand.includes(1);
    let total1 = 0;
    let total2 = 0;
    let total3 = 0;
    if (ace) {
      total1 = dealerHand.reduce((acc, cumul) => acc + cumul, 0);
      total2 = dealerHand.reduce((acc, cumul) => acc + cumul, 0) + 10;
    } else {
      total3 = dealerHand.reduce((acc, cumul) => acc + cumul, 0);
    }
    if (
      !viableHand(total1) &&
      !viableHand(total2) &&
      !viableHand(total3) &&
      !bustCheck(dealerHand)
    ) {
      value = dealOne(deck);
      dealerHand.push(value);
      dealerCards.push(interpretCard(value));
    } else {
      viable = true;
    }
  }
}

//checks if player has won -- changes gamestate accordingly
function winCheck() {
  if (bustCheck(playerHand)) {
    gamestate = "lost";
  } else if (bustCheck(dealerHand)) {
    gamestate = "won";
  } else {
    if (viableTotal(dealerHand) > viableTotal(playerHand)) {
      gamestate = "lost";
    } else if (viableTotal(dealerHand) < viableTotal(playerHand)) {
      gamestate = "won";
    } else {
      gamestate = "tie";
    }
  }
}

//stops game, checks if player has won, updates game
function stay() {
  if (bustCheck(playerHand)) {
    console.log("gg");
    gamestate = "lost";
    document.getElementById("play-btn-container").style.display = "none";
    document.getElementById("reset-container").style.display = "block";
    gamestate_display();
  } else {
    dealerHit();
    winCheck();
    document.getElementById("dealer").textContent = "Dealer hand:";
    document.getElementById("dealer-card").innerText = handDisplay(dealerCards);
    gamestate_display();
    document.getElementById("play-btn-container").style.display = "none";
    document.getElementById("reset-container").style.display = "block";
  }
}

//resets the game -- awards cash on victory
function reset() {
  if (gamestate == "won") {
    cash += 2 * bet;
  } else if (gamestate == "tie") {
    cash += bet;
  }
  gamestate = "betting";
  gamestate_display();
  deck = [...cards];
  deck_tens = [...all_tens];
  playerHand = [];
  dealerHand = [];
  playerCards = [];
  dealerCards = [];
  bet = 0;
  cashEl.textContent = "Cash: $" + cash;
  document.getElementById("bet").textContent = "Current bet: $" + bet;
  document.getElementById("playzone").style.display = "none";
  document.getElementById("betzone").style.display = "block";
  document.getElementById("play-btn-container").style.display = "block";
  document.getElementById("reset-container").style.display = "none";
  document.getElementById("dealer").textContent = "Dealer card:";
}
