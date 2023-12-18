let url = "./questionsDataBase.json";

let questionsData;
let questions = [];
let correctAnswers = [];
let answers = [];
let correct = 0;

let mode = "selected";
let firstPass = true;
let portrait = matchMedia("(orientation:portrait)");
let isPortrait = false;

const duration = 30;
let timeLeft = duration;
let timeLeftCounter;

// questions functions
async function getData(dataURL) {
  let response = await fetch(dataURL);
  let data = await response.json();

  return data;
}

async function pickQuestions() {
  questionsData = await getData(url);

  switch (mode) {
    case "random":
      let questionsCategories = [];

      for (let i = 0; i < 10; i++) {
        questionsCategories.push(
          questionsData.categories[
            Math.floor(Math.random() * questionsData.categories.length)
          ]
        );
      }
      questionsCategories.forEach((category) => {
        let quesIndex = Math.floor(
          Math.random() * questionsData[category].length
        );

        while (
          questions.includes(
            Object.values(questionsData[category][quesIndex])[0]
          )
        ) {
          quesIndex = Math.floor(
            Math.random() * questionsData[category].length
          );
        }

        questions.push(category);
        for (let value of Object.values(questionsData[category][quesIndex])) {
          questions.push(value);
        }
      });
      break;

    case "selected":
      let category = document.querySelector(".category.selected").id;
      questions.push(category);

      let added = [];
      for (let i = 0; i < questionsData[category].length; i++) {
        let index = Math.floor(Math.random() * questionsData[category].length);

        while (added.includes(index)) {
          index = Math.floor(Math.random() * questionsData[category].length);
        }
        added.push(index);

        correctAnswers.push(questionsData[category][index].question);
        for (let value of Object.values(questionsData[category][index])) {
          questions.push(value);
          if (Object.values(value) == "true") {
            correctAnswers.push(Object.getOwnPropertyNames(value));
          }
        }
      }

      break;
  }
}

async function addQuestionsToPage() {
  switch (mode) {
    case "random":
      document.querySelector(".selected").classList.remove("selected");
      document.querySelector(`#${questions[0]}`).classList.add("selected");
      questions.shift();

      break;

    case "selected":
      if (firstPass) {
        document.querySelector(`#${questions[0]}`).classList.add("selected");
        questions.shift();
        firstPass = false;
      }

      break;
  }

  document.querySelector(".question-content").innerHTML = `${questions[0]}`;
  questions.shift();

  document.querySelectorAll(".answer-content").forEach((answer) => {
    answer.innerHTML = `${Object.getOwnPropertyNames(questions[0])}`;
    answer.parentElement.previousElementSibling.setAttribute(
      "value",
      `${Object.values(questions[0])}`
    );
    questions.shift();
    answer.parentElement.parentElement.style.backgroundColor = "#f0f3ff";
  });
}

async function init() {
  try {
    questions = [];
    await pickQuestions();
    addQuestionsToPage();
    if (document.querySelector("input[type=radio]:checked"))
      document.querySelector("input[type=radio]:checked").checked = false;
    progLine();
  } catch (error) {
    console.error("couldn't fetch questions", error);
  }
}

// DOM functions
function setTime() {
  timeLeft = duration;
  let minutes = Math.floor(timeLeft / 60);
  let seconds = Math.floor(timeLeft % 60);

  document.querySelector(".time").innerHTML = `${
    minutes < 1 ? "00" : "0" + minutes
  }:${seconds < 10 ? "0" + seconds : seconds}`;
  document.querySelector(".time").style.color = "#2f2f2f";

  timeLeftCounter = setInterval(updateTime, 1000);
}

function updateTime() {
  --timeLeft;
  let minutes = Math.floor(timeLeft / 60);
  let seconds = Math.floor(timeLeft % 60);

  document.querySelector(".time").innerHTML = `${
    minutes < 1 ? "00" : "0" + minutes
  }:${seconds < 10 ? "0" + seconds : seconds}`;

  document.querySelector(".time").style.color =
    timeLeft < 4 ? "#f00c" : "#2f2f2f";

  if (timeLeft == 0) stopTime();
}

function stopTime() {
  timeLeftCounter = clearInterval(timeLeftCounter);
  if (timeLeft == 0) {
    document.querySelector(
      ".game-ended p"
    ).innerHTML = `للأسف انتهى الوقت\nنتيجتك هي ${correct}`;
    document.querySelector(".game-ended").style.visibility = "visible";
  }
}

function progLine() {
  let prog = document.querySelector(".progress");

  switch (mode) {
    case "random":
      prog.style.setProperty("--widi", `${(1 - questions.length / 60) * 100}%`);
      break;

    default:
      document.querySelector(".time").innerHTML = `${
        questionsData[document.querySelector(".category.selected").id].length -
        questions.length / 5
      }/${
        questionsData[document.querySelector(".category.selected").id].length
      }`;

      document.querySelector(".time").style.color = "#2f2f2f";

      prog.style.setProperty(
        "--widi",
        `${
          (1 -
            questions.length /
              questionsData[document.querySelector(".category.selected").id]
                .length /
              5) *
          100
        }%`
      );

      break;
  }
}

function checkAnswer() {
  document.querySelectorAll("input[type=radio]").forEach((input) => {
    if (input.checked && input.value == "true") correct += 1;

    switch (mode) {
      case "random":
        if (input.value == "true")
          input.parentElement.style.backgroundColor = "#0f0c";
        else if (input.checked)
          input.parentElement.style.backgroundColor = "#f00c";
        break;

      default:
        if (input.checked)
          answers.push(input.nextElementSibling.firstElementChild.innerHTML);
        break;
    }

    input.checked = false;
  });
}

function blockClick() {
  document.querySelectorAll("label").forEach((label) => {
    label.classList.toggle("no-click");
  });
}

function showRes() {
  document.querySelector(".game-ended p").innerHTML = `نتيجتك هي ${correct}`;
  document.querySelector(".game-ended").style.visibility = "visible";
}

function addListener() {
  document.querySelectorAll(".category").forEach((category) => {
    category.addEventListener("click", handleClick);
  });
}

function handleClick(e) {
  document.querySelectorAll(".category").forEach((category, index) => {
    if (!e.target.classList.contains("selected")) {
      document.querySelector(".category.selected").classList.remove("selected");

      e.target.classList.add("selected");
      document
        .querySelector(".categories")
        .style.setProperty(
          "--offset",
          `${
            document.querySelector(".category.selected").dataset.ind *
            parseFloat(
              getComputedStyle(document.querySelector(".category")).width
            )
          }px`
        );

      answers = [];
      firstPass = true;
      init();
    }
  });
}

portrait.addEventListener("change", (e) => {
  e.matches ? (isPortrait = true) : (isPortrait = false);
});

document
  .querySelectorAll(".category")
  [Math.floor(Math.random() * 2)].classList.add("selected");
document
  .querySelector(".categories")
  .style.setProperty(
    "--offset",
    `${
      document.querySelector(".category.selected").dataset.ind *
      parseFloat(getComputedStyle(document.querySelector(".category")).width)
    }px`
  );

init();
addListener();
if (mode == "random") {
  setTime();
}

document.body.querySelector("header").addEventListener("click", (e) => {
  e.currentTarget.classList.toggle("clicked");
  e.currentTarget.lastElementChild.classList.toggle("clicked");
});

document.querySelector("#selected").addEventListener("click", () => {
  if (mode !== "selected") {
    mode = "selected";

    clearInterval(timeLeftCounter);

    document.querySelector(".category.selected").classList.remove("selected");
    document
      .querySelectorAll(".category")
      [Math.floor(Math.random() * 2)].classList.add("selected");

    firstPass = true;
    init();

    addListener();
  }
});

document.querySelector("#random").addEventListener("click", () => {
  if (mode !== "random") {
    mode = "random";

    document.querySelectorAll(".category").forEach((category) => {
      category.removeEventListener("click", handleClick);
    });

    init();
    setTime();
  }
});

document.querySelector(".next").addEventListener("click", (e) => {
  e.preventDefault();
  if (document.querySelector("input[type=radio]:checked")) {
    if (mode == "random") stopTime();
    blockClick();
    checkAnswer();
    if (questions.length != 0) {
      setTimeout(
        () => {
          addQuestionsToPage();
          progLine();

          if (mode == "random") setTime();

          blockClick();
        },
        mode == "random" ? 700 : 300
      );
    } else {
      switch (mode) {
        case "random":
          setTimeout(
            () => {
              showRes();
            },
            mode == "random" ? 700 : 300
          );
          break;

        default:
          localStorage.setItem(
            "correctAnswers",
            JSON.stringify(correctAnswers)
          );
          localStorage.setItem("answers", JSON.stringify(answers));
          location.href = "./results.html";
      }
    }
  }
});

document.querySelector(".confirm-btn").addEventListener("click", () => {
  location.reload();
});

// TODO
// Add Results Page
// Add Starting Game Introduction
