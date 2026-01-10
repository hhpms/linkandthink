// script.js

/**
 * =========================
 *  TEACHER EDIT SECTION
 * =========================
 * Edit GROUPS below:
 * - Exactly 3 categories (groups)
 * - Each category has exactly 3 words
 *
 * Tip: Keep words distinct (no repeats) to avoid ambiguity.
 */
const GROUPS = [
  {
    name: "Career Opportunities for Students",
    words: ["Work-Based Learning", "Job Shadowing", "Internship"],
  },
  {
    name: "Digital Skills We'll be Learning",
    words: ["Word Processing", "Multimedia Presentations", "Spreadsheets and Databases"],
  },
  {
    name: "Planning Your Future",
    words: ["Goals", "Education", "Career Path"],
  },
];
/* =========================
   END TEACHER EDIT SECTION
   ========================= */

const gridEl = document.getElementById("grid");
const messageEl = document.getElementById("message");
const foundListEl = document.getElementById("foundList");

const submitBtn = document.getElementById("submitBtn");
const shuffleBtn = document.getElementById("shuffleBtn");


/** State */
let cards = [];                 // [{id, text, groupIndex}]
let selectedIds = new Set();    // selected card ids (max 3)
let solvedGroupIndices = new Set(); // which groups are solved

function validateTeacherData() {
  if (GROUPS.length !== 3) {
    console.warn("Link & Think expects exactly 3 groups.");
  }

  const allWords = [];
  GROUPS.forEach((g, i) => {
    if (!g.name) console.warn(`Group ${i} is missing a name.`);
    if (!Array.isArray(g.words) || g.words.length !== 3) {
      console.warn(`Group "${g.name || i}" should have exactly 3 words.`);
    }
    (g.words || []).forEach(w => allWords.push(String(w).trim()));
  });

  const duplicates = allWords.filter((w, idx) => allWords.indexOf(w) !== idx);
  if (duplicates.length) {
    console.warn("Duplicate words detected (can make the puzzle ambiguous):", duplicates);
  }
}

function shuffleArray(arr) {
  // Fisher–Yates
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildCards() {
  const built = [];
  let id = 0;

  GROUPS.forEach((group, groupIndex) => {
    (group.words || []).forEach(word => {
      built.push({
        id: id++,
        text: String(word),
        groupIndex,
      });
    });
  });

  cards = shuffleArray(built);
}

function render() {
  gridEl.innerHTML = "";

  cards.forEach(card => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card";
    btn.textContent = card.text;
    btn.dataset.id = String(card.id);

    const isSolved = solvedGroupIndices.has(card.groupIndex);
    const isSelected = selectedIds.has(card.id);

    if (isSolved) btn.classList.add("solved");
    if (isSelected) btn.classList.add("selected");

    btn.addEventListener("click", () => onCardClick(card));
    gridEl.appendChild(btn);
  });

  // Update submit button label + enabled state
  const n = selectedIds.size;
  submitBtn.textContent = `Submit (${n}/3)`;
  submitBtn.disabled = (n !== 3);

  // Render found groups
  renderFound();
}

function renderFound() {
  foundListEl.innerHTML = "";

  if (solvedGroupIndices.size === 0) {
    const empty = document.createElement("div");
    empty.style.color = "rgba(20,20,20,0.62)";
    empty.textContent = "No groups solved yet.";
    foundListEl.appendChild(empty);
    return;
  }

  // Keep the display ordered 0..2
  [...solvedGroupIndices].sort((a,b)=>a-b).forEach(groupIndex => {
    const g = GROUPS[groupIndex];
    const chip = document.createElement("div");
    chip.className = "found-chip";

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = g.name + ":";
    chip.appendChild(label);

    g.words.forEach(w => {
      const pill = document.createElement("span");
      pill.className = "word";
      pill.textContent = w;
      chip.appendChild(pill);
    });

    foundListEl.appendChild(chip);
  });
}

function setMessage(text, kind = "") {
  messageEl.textContent = text;
  messageEl.classList.remove("good", "bad");
  if (kind) messageEl.classList.add(kind);
}

function onCardClick(card) {
  // Can't select already-solved groups
  if (solvedGroupIndices.has(card.groupIndex)) return;

  // Toggle selection
  if (selectedIds.has(card.id)) {
    selectedIds.delete(card.id);
    setMessage("");
    render();
    return;
  }

  // Max 3 selected
  if (selectedIds.size >= 3) {
    setMessage("You can only pick 3 cards. Unselect one first.", "bad");
    return;
  }

  selectedIds.add(card.id);
  setMessage("");
  render();
}

function submitSelection() {
  if (selectedIds.size !== 3) return;

  const picked = cards.filter(c => selectedIds.has(c.id));
  const groupIndex = picked[0].groupIndex;

  const allSameGroup = picked.every(c => c.groupIndex === groupIndex);

  if (allSameGroup) {
    solvedGroupIndices.add(groupIndex);
    setMessage("Nice! You found a group ✅", "good");
  } else {
    setMessage("Not a match ❌ Try a different set of 3.", "bad");
  }

  // Clear selection after submit either way
  selectedIds.clear();

  // If all 3 groups solved, celebrate
  if (solvedGroupIndices.size === 3) {
    setMessage("🎉 You solved all groups! Great work!", "good");
  }

  render();
}

function newShuffle() {
  // Keep solved groups? For a true “new game” shuffle, reset everything:
  startNewGame();
}

function resetSelectionsOnly() {
  selectedIds.clear();
  setMessage("");
  render();
}

function startNewGame() {
  selectedIds.clear();
  solvedGroupIndices.clear();
  setMessage("");
  buildCards();
  render();
}

/* ---------- Events ---------- */
submitBtn.addEventListener("click", submitSelection);
shuffleBtn.addEventListener("click", newShuffle);


// Keyboard helpers (nice for projector use)
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitSelection();
  if (e.key === "Escape") resetSelectionsOnly();
});

/* ---------- Init ---------- */
validateTeacherData();
startNewGame();
