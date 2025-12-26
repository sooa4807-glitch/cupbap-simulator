// =========================
// 컵밥 시뮬레이터 (4메뉴)
// 참치마요 / 불닭마요 / 김치날치알 / 스팸마요
// (현재는 6장면: 0~5) + 장면별 배경
// =========================

const score = { tuna: 0, buldak: 0, kimchi: 0, spam: 0 };

function setBackground(bgFile) {
  if (!bgFile) return;
  document.body.style.backgroundImage = `url("${bgFile}")`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";
}

function fadeBackgroundTo(bgFile) {
  if (!bgFile) return;
  document.body.style.transition = "filter 180ms ease";
  document.body.style.filter = "brightness(0.85)";
  setTimeout(() => {
    setBackground(bgFile);
    document.body.style.filter = "brightness(1)";
  }, 120);
}

// ✅ 여기 next 번호만 고친 버전 (0→1→2→3→4→5→END)
const scenes = [
  {
    id: 0,
    bg: "bg0.jpg",
    text: "어? 아직 점심 안 먹었어?\n나랑 컵밥 먹으러 갈래…?",
    choices: [
      { label: "응! 같이 가자 🙂", add: {}, next: 1 },
      { label: "좋아… 뭐 먹을지 추천해줘!", add: {}, next: 1 }
    ]
  },
  {
    id: 1,
    bg: "bg1.jpg",
    text: "급식에 매운 거 나오면 어때?\n(김치찌개면 고추 더 넣는 타입…?)",
    choices: [
      { label: "오히려 좋아🔥", add: { buldak: 1, kimchi: 1 }, next: 2 },
      { label: "조금 힘들어🥺", add: { spam: 1, tuna: 1 }, next: 2 }
    ]
  },
  {
    id: 2,
    bg: "bg2.jpg",
    text: "해산물은… 좋아하는 편이야?",
    choices: [
      { label: "좋아! 🐟", add: { kimchi: 1, tuna: 1 }, next: 3 },
      { label: "아니, 고기가 좋아🍖", add: { buldak: 1, spam: 1 }, next: 3 }
    ]
  },
  {
    id: 3,
    bg: "bg6.jpg",
    text: "오늘 하루… 어떤 느낌이야?",
    choices: [
      { label: "스트레스 쌓임🔥", add: { buldak: 1, spam: 1 }, next: 4 }, // ✅ 7 → 4
      { label: "그냥 편안🌿", add: { tuna: 1, kimchi: 1 }, next: 4 }     // ✅ 7 → 4
    ]
  },
  {
    id: 4,
    bg: "bg7.jpg",
    text: "마요네즈 소스, 좋아해?",
    choices: [
      { label: "완전 좋아🍯", add: { tuna: 1, spam: 1 }, next: 5 },      // ✅ 8 → 5
      { label: "매콤 양념이 좋아🌶", add: { buldak: 1, kimchi: 1 }, next: 5 } // ✅ 8 → 5
    ]
  },
  {
    id: 5,
    bg: "bg9.jpg",
    text: "마지막! 지금 딱 끌리는 느낌은?",
    choices: [
      { label: "상큼·깔끔🍋", add: { kimchi: 1, tuna: 1 }, next: "END" },
      { label: "든든·묵직🍱", add: { buldak: 1, spam: 1 }, next: "END" }
    ]
  }
];

function getWinnerMenu() {
  const entries = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const topScore = entries[0][1];
  const tied = entries.filter(([, v]) => v === topScore).map(([k]) => k);
  return { winner: tied[0], tied };
}

function menuLabel(key) {
  return ({ tuna: "참치마요", buldak: "불닭마요", kimchi: "김치날치알", spam: "스팸마요" }[key]) || key;
}

function menuDesc(key) {
  switch (key) {
    case "tuna":
      return "오늘은… 참치마요가 딱이야 🐟\n부드럽고 안정적인 맛이라 편하게 먹기 좋아!\n(마요 좋아한다 했으니까 완전 찰떡✨)";
    case "buldak":
      return "너한테는… 불닭마요🔥\n매운 거 자신 있다 했잖아?\n오늘 스트레스는 이걸로 확 날려버리자!";
    case "kimchi":
      return "김치날치알 어때? 🍚\n상큼하고 톡톡 튀는 느낌!\n가볍게 센스 있는 한 끼로 딱이야.";
    case "spam":
      return "스팸마요가 제일 잘 어울려! 🥓\n짭짤하고 든든해서 ‘실패 없는’ 편안한 한 끼 느낌!\n(익숙한 게 좋다 했잖아🙂)";
    default:
      return "오늘의 추천 컵밥!";
  }
}

const dialogueTextEl = document.getElementById("dialogue-text");
const choiceAreaEl = document.getElementById("choice-area");
const nextBtn = document.getElementById("next-btn");
const resultSection = document.getElementById("result-section");
const resultText = document.getElementById("result-text");

let pendingNext = null;

function renderScene(id) {
  const scene = scenes.find(s => s.id === id);
  if (!scene) {
    console.error("Scene not found:", id);
    dialogueTextEl.textContent = `장면을 찾지 못했어! (id: ${id})`;
    return;
  }

  fadeBackgroundTo(scene.bg);

  dialogueTextEl.textContent = scene.text;
  choiceAreaEl.innerHTML = "";
  nextBtn.style.display = "none";
  pendingNext = null;

  scene.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice.label;
    btn.addEventListener("click", () => applyChoice(choice));
    choiceAreaEl.appendChild(btn);
  });
}

function applyChoice(choice) {
  if (choice.add) {
    Object.keys(choice.add).forEach(k => {
      score[k] += choice.add[k];
    });
  }
  Array.from(choiceAreaEl.children).forEach(btn => (btn.disabled = true));
  pendingNext = choice.next;
  nextBtn.style.display = "block";
}

nextBtn.addEventListener("click", () => {
  if (pendingNext === null) return;
  if (pendingNext === "END") showResult();
  else renderScene(pendingNext);
});

function showResult() {
  const { winner, tied } = getWinnerMenu();

  // resultBg 없거나 파일 없을 때도 안 멈추게 안전 처리
  if (typeof resultBg !== "undefined") {
    fadeBackgroundTo(resultBg[winner] || "result_default.jpg");
  }

  const tieText =
    tied.length > 1 ? `\n\n(비슷하게 어울린 메뉴: ${tied.map(menuLabel).join(" · ")})` : "";

  resultText.textContent =
    `오늘 너에게 어울리는 컵밥은… ${menuLabel(winner)}!\n\n${menuDesc(winner)}${tieText}`;

  resultSection.style.display = "block";
}

renderScene(0);