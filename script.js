// Functionality to close the "How To Play" explanation
let accept_button = document.getElementById("accept_rules");
accept_button.addEventListener("click", () => {
   document.getElementById("startup").style.display = "none";
   document.getElementById("creation").style.filter = "blur(0)";
   document.getElementById("creation").style.height = "100%";
   document.getElementById("creation").style.pointerEvents = "initial";
});

// Functionality to add more input fields
let add_more_button = document.getElementById("add_more");
add_more_button.addEventListener("click", () => {
  let form = document.getElementsByTagName("form")[0];
  let last_input = form.children[form.children.length-3];
  let last_number = parseInt(last_input.name.substr(5));

  let new_input = document.createElement("input");
  new_input.type = "text";
  new_input.name = "field" + (last_number + 1);

  form.insertBefore(new_input, add_more_button);
});

function formatTime(time) {
  let secs = time % 60
  let min = (time - secs) / 60
  let returnValue = min + ":" + ((secs < 10) ? "0" + secs : secs);
  return returnValue
}

//Plays the bingo celebration animation after player has got a bingo
function playerGotBingo() {
  clearInterval(countUp);
  let container = document.createElement("article");
  let close_button = document.createElement("span");
  let topText = document.createElement("p");
  let title = document.createElement("h3");
  let textAboveTime = document.createElement("p");
  let textTime = document.createElement("h4");
  let textBelowTime = document.createElement("p");
  let shareButton = document.createElement("button");
  let buttonTooltip = document.createElement("label");

  let finalTime = formatTime(parseInt(document.getElementsByClassName("center_card")[0].children[0].dataset.count));

  container.id = "results";

  close_button.classList.add("close_button");
  close_button.addEventListener("click", () => {
    container.remove();
    document.getElementById("board").style.filter = "blur(0px)";
    document.getElementById("invite_link").style.pointerEvents = "auto";
  });

  topText.innerText = "You got a"
  title.innerText = "BINGO!"
  textAboveTime.innerText = "It took you an astonishing";
  textTime.innerText = finalTime;
  textBelowTime.innerText = "to get a Bingo. Great job";

  buttonTooltip.innerText = "Copied to Clipboard";
  buttonTooltip.classList.add("tooltip");

  shareButton.innerText = "Share Results";
  shareButton.addEventListener("click", () => {
    if (shareButton.children[0].tagName == "LABEL") {
      let copyText = "BINGO! in " + finalTime + "\n\n";
      for (let i = 0; i < board_values.length;i++) {
        if (i % 5 == 0) {
          copyText += "\n";
        }
        if(board_values[i]) {
          copyText += "🟩"
        } else {
          copyText += "⬛"
        }
      }
      copyToClipboard(copyText);
      if(popup_active == false) {
        popup_active = true;
        shareButton.children[0].classList.add("show_tooltip");
        setTimeout(function() {
          popup_active = false;
          shareButton.children[0].classList.remove("show_tooltip");
        }, 700);
      }
    }
  });
  shareButton.appendChild(buttonTooltip);

  container.appendChild(close_button);
  container.appendChild(topText);
  container.appendChild(title);
  container.appendChild(textAboveTime);
  container.appendChild(textTime);
  container.appendChild(textBelowTime);
  container.appendChild(shareButton);
  document.getElementsByTagName("main")[0].append(container);
  document.getElementById("board").style.filter = "blur(7px)";
  document.getElementById("board_screen").style.pointerEvents = "none";
  document.getElementById("invite_link").style.pointerEvents = "none";
}

// Checks if the player has got a bingo
function checkForBingo() {
  for (let i = 0; i<board_values.length/5;i++) {
    // Checks for horizontal bingo
    if(board_values[5*i] && board_values[5*i+1] && board_values[5*i+2] && board_values[5*i+3] && board_values[5*i+4]) {
      playerGotBingo();
      return
    }

    // Checks for vertical bingo
    if (board_values[i] && board_values[i+5] && board_values[i+10] && board_values[i+15] && board_values[i+20]) {
      playerGotBingo();
      return
    }

    // Checks diagonal top right -> bottom left bingo
    if (board_values[0] && board_values[6] && board_values[12] && board_values[18] && board_values[24]) {
      playerGotBingo();
      return
    }

    // Checks diagonal top left -> bottom right bingo
    if (board_values[4] && board_values[8] && board_values[12] && board_values[16] && board_values[20]) {
      playerGotBingo();
      return
    }
  }
}

// Creates a card with the style and click functionality
function createCard(content, id) {
  let card = document.createElement("article");
  let text = document.createElement("p");

  if(id == 95) {
    card.classList.add("center_card");

    text.innerText = "0:00";
    text.dataset.count = 0;
    countUp = setInterval(function() {
      num = parseInt(text.dataset.count) + 1;
      text.dataset.count = num;
      text.innerText = formatTime(num);
    }, 1000);
  } else {
    text.innerText = content;
  }

  card.classList.add("board_card");
  card.dataset.id = id;
  card.appendChild(text);

  card.addEventListener("click", () => {
    if(card.dataset.id != 95) {
      card.classList.toggle("card_done");
      let all_cards = document.getElementsByClassName("board_card");
      for (let i = 0; i < all_cards.length; i++) {
        if (all_cards[i] == card) {
          board_values[i] = !board_values[i];
        }
      }
      checkForBingo();
    }
  });

  return card
}

// Functionality for copying the link to clipboard;
async function copyToClipboard(content) {
  try {
    await navigator.clipboard.writeText(content);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}


let popup_active = false;
let invite_link = document.getElementById("invite_link");
invite_link.addEventListener("click", () => {
  copyToClipboard(location.href);
  if(popup_active == false) {
    popup_active = true;
    document.getElementById("invite_link").children[1].classList.add("show_tooltip");
    setTimeout(function() {
      popup_active = false;
      document.getElementById("invite_link").children[1].classList.remove("show_tooltip");
    }, 700);
  }
});

// Functionality to set up the board
let board_values = [];
let countUp;

function setupBoard() {
  let board_screen = document.getElementById("board_screen");
  let clean_inputs = [];

  // Get inputs from url
  let input_string = location.search;
  let inputs_array = decodeURIComponent(input_string.replace(/(field[0-9]+)/g, "")).split("&=");

  // Cleans the inputs
  for (let i = 0; i<inputs_array.length; i++) {
    let current_input = inputs_array[i];
    if (current_input != "") {
      if(i == 0) {
        current_input = current_input.replace("?=", "");
      }
      current_input = current_input.replaceAll("+", " ");

      clean_inputs.push(current_input);
    }
  }

  // Set up the array to check for bingos
  for (let i = 0; i < 25; i++) {
    board_values.push(false);
  }
  board_values[12] = true;

  // Adds all cards to the board
  if (clean_inputs.length >= 24) {
    let card_count = 0;
    while(card_count < 25) {
      let inputs_left = clean_inputs.length;
      if(inputs_left == 12) {
        board_screen.appendChild(createCard("", 95));
        card_count++
      }
      let random_selector = Math.floor(Math.random() * inputs_left);
      let selected_input = clean_inputs.splice(random_selector, 1);
      board_screen.appendChild(createCard(selected_input, random_selector));
      card_count++;
    }
  }
}

window.addEventListener("load", () => {
  if(location.search == "") {
    document.getElementById("board").style.display = "none";
  } else {
    document.getElementById("startup").style.display = "none";
    document.getElementById("creation").style.display = "none";
    setupBoard();

    // Add url to "Copy Field"
    let link = location.href.substr(0, 50);
    document.getElementById("invite_link").children[0].innerText = link;
  }
});
