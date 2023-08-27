'use strict';

var score = 0;

const SUCCESS_POINTS = 1;
const MISSED_POINTS = -3
var autoredirect;
var responseTimer;

var size = 10;
var results = Array(size).fill().map(() => Array(size).fill())

function drawSummary() {
    var c, r, resultTable;
    resultTable = document.createElement('table');
    resultTable.classList.add("table", "table-sm", "table-hover");

    r = resultTable.insertRow(0);
    c = r.insertCell(0); // first cell of first row is empty
    for (let i in [...Array(results.length).keys()]) {
        c = r.insertCell(+i + 1);
        c.innerHTML = +i + 1;
    }

    for (let i = 0; i < results.length; i++) {
        r = resultTable.insertRow(i + 1);
        c = r.insertCell(0);
        c.innerHTML = +i + 1;
        for (let j = 0; j < results[i].length; j++) {
            c = r.insertCell(j + 1);
            if (results[i][j] === "true") {
                c.innerHTML = '<i class="bi bi-check text-success"></i>';
            } else if (results[i][j] === "NA") {
                c.innerHTML = '<i class="bi bi-slash text-info"></i>';
            } else {
                c.innerHTML = '<i class="bi bi-dash text-secondary"></i>';
            }
        }

    }
    document.querySelector("#summary").innerHTML = ""
    document.querySelector("#summary").appendChild(resultTable);
}

function getRandomInt(max) {
    return Math.floor(Math.min(Math.random() * max + 1, max));
}

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
    // TODO: changing the selected boxes should be a bigger reset
    var selectedTableCheckboxes = [...document.querySelectorAll("input[name='allowedTables[]']:checked")]
    let selectedTables = selectedTableCheckboxes.reduce(function (a, c) { a.push(c.value); return a }, [])

    for (let i = 0; i < results.length; i++) {
        for (let j = 0; j < results[i].length; j++) {
            if (!selectedTables.includes(String(i + 1)) && !selectedTables.includes(String(j + 1))) {
                results[i][j] = "NA";
            } else if (results[i][j] != "true") {
                results[i][j] = undefined;
            }
        }
    }

    drawSummary();
    // todo: first & second should be selected with a higher weight on the items which did not come up yet
    // todo: highlight when each combination is done?
    // todo: highlight the number of times each combination was tried
    // option to just exclude number which already appeared?

    var first = getRandomInt(size);
    var second;
    if (selectedTables.includes(String(first))) {
        second = getRandomInt(size);
    } else { // the first number was forbidden, so we constrain the second
        let randomTableIndex = getRandomInt(selectedTables.length)
        second = selectedTables[randomTableIndex - 1];
    }
    if (results[(+first - 1)][(+second - 1)] !== undefined) {
        // todo: recompute. Even better, only use get values from the undefined indices
    }

    

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
        document.querySelectorAll(".answersLog").forEach(element => element.classList.replace("d-none", "d-block"));
    }
    const newEntry = document.createElement("div");
    const textContent = document.createTextNode(document.querySelector("#question").textContent + " (" + document.querySelector("#elapsedTime").textContent + "s)");
    newEntry.appendChild(textContent);

    if (expectedResult == responseValue) {
        newEntry.classList.add("text-success-emphasis");

        let first = document.querySelector("#first").textContent
        results[(+first - 1)][(+document.querySelector("#second").textContent) - 1] = "true";
        drawSummary()
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
    //var selectedTableCheckboxes = [...document.querySelectorAll("input[name='allowedTables[]']")]
    [...document.querySelectorAll("input[name='allowedTables[]']")].forEach(element => element.addEventListener("click", initQuizz))

    /*document.querySelector("#timestable").addEventListener("reset", function (event) {
        initQuizz();
    });*/
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