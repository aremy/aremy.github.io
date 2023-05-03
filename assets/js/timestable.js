'use strict';

var score = 0;

const SUCCESS_POINTS = 1;
const MISSED_POINTS = -3
var autoredirect;
var responseTimer;


function getRandomInt(max) {
    return Math.floor(Math.min(Math.random() * max + 1, max));
}
//module.exports = { getRandomInt };

export { getRandomInt };

function updateScore(points) {
    document.querySelector("#score").textContent = parseInt(document.querySelector("#score").textContent) + points
}

/**
 * Timer for the amount of time it takes to answer
 */
function initTimer() {
    document.getElementById('elapsedTime').innerHTML = 0;
    clearInterval(responseTimer)
    var start = Date.now();
    responseTimer = setInterval(function () {
        document.getElementById('elapsedTime').innerHTML = Math.floor((Date.now() - start) / 1000);
    }, 1000);
}

/** 
 * Initialize the form - call after each correct answer
 */
function initQuizz() {
    var selectedTableChecboxes = [...document.querySelectorAll("input[name='allowedTables[]']:checked")]
    var selectedTables  = selectedTableChecboxes.reduce(function (a,c) { a.push(c.value);return a}, [])

    let randomTableIndex = getRandomInt(selectedTables.length)
    var first = selectedTables[randomTableIndex - 1];
    var second = getRandomInt(10);
    initTimer();
    clearTimeout(autoredirect);

    // TODO: single parent class to condition visibile/hidden display?
    document.querySelector("#validate").classList.replace("d-none", "d-block");
    document.querySelector("#resultMissed").classList.replace("d-block", "d-none");
    document.querySelector("#resultSuccess").classList.replace("d-block", "d-none");
    document.querySelector("#elapsedTime").classList.replace("d-none", "d-block");
    document.querySelector("#first").textContent = first;
    document.querySelector("#second").textContent = second;
    document.querySelector("#response").disabled = false;
    document.querySelector("#response").focus();
}

/**
 * What to do in case of correct answer
 */
function correctAnswer() {
    document.querySelectorAll(".hideIfCorrectAnswer").forEach(element => element.classList.replace("d-block", "d-none"))
    document.querySelectorAll(".showIfCorrectAnswer").forEach(element => element.classList.replace("d-none", "d-block"))
    document.querySelector("#response").disabled = true;
    updateScore(SUCCESS_POINTS)
    document.querySelector("#reset").focus();
    document.querySelector("#elapsedTime").classList.replace("d-block", "d-none");
    autoredirect = setTimeout(() => {
        initQuizz()
    }, "3000");
}

/**
 * What to do in case of wrong answer
 * 
 * @param {number} responseValue 
 */
function wrongAnswer(responseValue) {
    document.querySelector("#wrongValue").textContent = responseValue;
    document.querySelectorAll(".showIfWrongAnswer").forEach(element => element.classList.replace("d-none", "d-block"))
    updateScore(MISSED_POINTS)
    // TODO: store all results instead
    document.querySelector("#errorCount").textContent = parseInt(document.querySelector("#errorCount").textContent) + 1
    document.querySelector("#errorLog").classList.replace("d-none", "d-block");
    document.querySelector("#noErrors").classList.replace("d-block", "d-none");
}

/**
 * Update the form and result display according to the provided answer
 * 
 * @param {number} responseValue 
 * @param {number} expectedResult 
 * @returns 
 */
function checkAnswer(responseValue, expectedResult) {
    if (responseValue === "") return;
    let questionLog = document.querySelector("#log div");
    if (questionLog.childElementCount === 0) {
        document.querySelectorAll("#answersLog").forEach(element => element.classList.replace("d-none", "d-block"));
    }
    const newEntry = document.createElement("div");
    const textContent = document.createTextNode(document.querySelector("#question").textContent + " (" + document.querySelector("#elapsedTime").textContent + "s)");
    newEntry.appendChild(textContent);

    if (expectedResult == responseValue) {
        newEntry.classList.add("text-success-emphasis");
        correctAnswer();
    } else {
        newEntry.classList.add("text-danger-emphasis");
        wrongAnswer(responseValue);
    }
    questionLog.prepend(newEntry)
}

/**
 * Called upon page loaded
 */
function init() {
    initQuizz();
    document.querySelector("#timestable").addEventListener("submit", function (event) {
        event.preventDefault();
        let expectedResult = document.querySelector("#first").textContent * document.querySelector("#second").textContent
        let response = document.querySelector("input[name='response']");
        checkAnswer(response.value, expectedResult);
        response.value = "";
        response.focus();
    });
    document.querySelector("#timestable").addEventListener("reset", function (event) {
        initQuizz();
    });
}

document.addEventListener("DOMContentLoaded", function () {
    init()
});