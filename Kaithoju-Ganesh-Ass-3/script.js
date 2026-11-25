// changing the background color of the selected box based on click event

const redBtn = document.getElementById('red')
const blueBtn = document.getElementById('blue')
const greenBtn = document.getElementById('green')
const yellowBtn = document.getElementById('yellow')

redBtn.addEventListener('click',() => changeColor(redBtn, 'red'))
blueBtn.addEventListener('click',() => changeColor(blueBtn, 'blue'))
greenBtn.addEventListener('click',() => changeColor(greenBtn, 'green'))
yellowBtn.addEventListener('click',() => changeColor(yellowBtn, 'yellow'))

function changeColor(element, color){
    element.style.backgroundColor=color
}

// greeting the user based on input

const nameInput = document.getElementById('name');

const greetBtn = document.getElementById('btn');

const greeting = document.getElementById('greeting');

greetBtn.addEventListener('click', () => {
    const userName = nameInput.value.trim();
    if(userName !== ""){
        greeting.textContent= `Hello, ${userName}`;
    } else {
        greeting.textContent= 'Hello';
    }
});