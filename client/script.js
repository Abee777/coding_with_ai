import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// Function that will load our messages
function loader(element){
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if(element.textContent === '....'){
      element.textContent = '';
    }
  }, 300)
}

// Typing functionality letter by letter
function typeText (element, text){
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}

// Unique ID for every message
function generateUniqueId(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`; 
}

function chatStripe(isAi, value, uniqueId){
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="profile">
        <img src="${isAi ? bot : user}" alt="${isAi ? 'bot' : 'user'}" />
      </div>
      <div class="message" id="${uniqueId}">${value}</div>
    </div>
    `
  )
}

const handleSubmit = async(e) => {
  e.preventDefault(); // default browser behavior when submitting the form is to reload the browser
  const data = new FormData(form);

  //user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  //bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  //as user types, we want to keep scrolling down to see the message
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // fetch new message div
  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from the server -> bot's response
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })
  //we are no longer loading
  clearInterval(loadInterval);
  messageDiv.innerHTML = ''; // because we r not sure at which point in the loading are we right now

  // this is giving us actual response coming from the backend
  if(response.ok){
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13){
    handleSubmit(e);
  }
})