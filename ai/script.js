import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;
function loader(element) {
  element.innerHTML = `
    <div class="loading-message">Loading...</div>
    <div class="loading-bar">
        <div class="loading-indicator"></div>
    </div>
`;

  const progressBar = element.querySelector(".progress-bar");
  const progress = element.querySelector(".progress");

  let loading = 0;
  loadInterval = setInterval(() => {
    loading += 10;
    progress.style.width = `${loading}%`;

    // If the loading has reached 100%, reset it
    if (loading === 100) {
      loading = 0;
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
     
        <div class="messages">
     
    
        <div class="wrapper ${isAi && "ai"}">
        <div class="chat">
            <div class="profile">
                <img 
                  src=${isAi ? bot : user} 
                  alt="${isAi ? "bot" : "user"}" 
                />
            </div>
            <div class="message" id=${uniqueId}>${value}</div>
        </div>
    
    
        </div>
    `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  // to clear the textarea input
  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // to focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // specific message div
  const messageDiv = document.getElementById(uniqueId);

  // messageDiv.innerHTML = "..."
  loader(messageDiv);

  const response = await fetch("https://mmate.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = " ";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'

    typeText(messageDiv, parsedData);
    // send the data to the server for storage
    const logData = {
      userInput: data.get("prompt"),
      botResponse: parsedData,
    };

    await fetch("https://mmate.onrender.com/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logData),
    });
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
