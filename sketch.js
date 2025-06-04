// Hand Pose Detection with ml5.js
let video;
let handPose;
let hands = [];
let circles = [];
let circleRadius = 109;
let currentQuestion = null;
let currentIndex = 0;
let showResult = false;
let resultMessage = "";
let resultTimer = 0;
let score = 0;
let startTime = 0;
let gameStarted = false;
let gameEnded = false;
let startButton;

const questions = [
  {
    number: 1,
    text: "教育科技在未來十年最有可能改變哪一項教學元素？",
    options: ["A. 學科內容本身", "B. 教師的角色與教學方式", "C. 教室的地板設計"],
    answer: "B"
  },
  {
    number: 2,
    text: "下列哪一項是虛擬實境（VR）與擴增實境（AR）在教育現場應用時常見的挑戰？",
    options: ["A. 學生對科技失去興趣", "B. 教材難以轉換為科技內容", "C. 設備與技術成本高"],
    answer: "C"
  }
];

function preload() {}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // 初始化圓圈資料
  for (let i = 0; i < questions.length; i++) {
    circles.push({
      x: random(100, width - 100),
      y: random(100, height - 100),
      number: questions[i].number,
      question: questions[i]
    });
  }

  handPose.detectStart(video, gotHands);

  // 建立開始按鈕
  startButton = createButton("開始");
  startButton.position(width / 2 - 10, height / 2 - 10); // 按鈕置中
  startButton.size(20, 20); // 按鈕大小
  startButton.style("background-color", "#A6E1FA");
  startButton.style("color", "#001C55");
  startButton.style("font-family", "新細明體");
  startButton.style("font-size", "18px");
  startButton.style("border", "none");
  startButton.style("cursor", "pointer");

  // 按下按鈕開始遊戲
  startButton.mousePressed(() => {
    gameStarted = true;
    startTime = millis();
    currentQuestion = questions[currentIndex];
    startButton.hide(); // 隱藏按鈕
  });
}

function modelReady() {
  console.log("Hand Pose Model Loaded!");
}

function gotHands(results) {
  hands = results.length > 0 ? results : [];
}

function draw() {
  image(video, 0, 0);

  if (!gameStarted) {
    fill(0, 255, 0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("雙手按下開始按鈕開始遊戲", width / 2, height / 2);
    return;
  }

  if (gameEnded) {
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    let totalTime = ((millis() - startTime) / 1000).toFixed(2);
    text(`遊戲結束！總分：${score} 分`, width / 2, height / 2 - 20);
    text(`完成時間：${totalTime} 秒`, width / 2, height / 2 + 20);
    return;
  }

  // 繪製圓圈和數字
  for (let circle of circles) {
    fill(0, 0, 255, 150); // 半透明藍色
    noStroke();
    circle(circle.x, circle.y, circleRadius);

    fill(255); // 白色文字
    textAlign(CENTER, CENTER);
    textSize(32);
    text(circle.number, circle.x, circle.y);
  }

  // 顯示當前題目
  if (currentQuestion && !showResult) {
    fill(0);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(currentQuestion.text, width / 2, height - 100);

    // 顯示選項
    for (let i = 0; i < currentQuestion.options.length; i++) {
      text(currentQuestion.options[i], width / 2, height - 70 + i * 20);
    }
  }

  // 顯示結果
  if (showResult) {
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(resultMessage, width / 2, height / 2);

    // 計時器結束後切換到下一題
    if (millis() - resultTimer > 2000) {
      showResult = false;
      currentIndex++;
      if (currentIndex < questions.length) {
        currentQuestion = questions[currentIndex];
      } else {
        gameEnded = true; // 遊戲結束
      }
    }
  }

  // 確保至少有一隻手被偵測到
  if (hands.length > 0 && !showResult) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        let indexFinger = hand.keypoints[8]; // 食指的關鍵點

        // 檢查食指是否碰觸圓圈
        for (let circle of circles) {
          let d = dist(indexFinger.x, indexFinger.y, circle.x, circle.y);
          if (d < circleRadius / 2) {
            // 檢查答案是否正確
            if (circle.question.answer === currentQuestion.answer) {
              resultMessage = "正確！";
              score += 12.5; // 加分
            } else {
              resultMessage = "錯誤！";
            }
            showResult = true;
            resultTimer = millis();
          }
        }
      }
    }
  }
}
