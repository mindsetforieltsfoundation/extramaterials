// Shared interactive exercise engine — vanilla JS, no dependencies.

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else e.setAttribute(k, v);
  }
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (c == null) return;
    e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return e;
}

function norm(s) {
  return (s || "").toString().trim().toLowerCase().replace(/\s+/g, " ");
}

/* ---------- 1. Fill in the blank ---------- */
function buildFillBlank(container, { lines, prefixLabel, exerciseId, meta }) {
  // lines: [{ text: "I ____ my teeth.", answers: ["brush","brushes"], explain: "..." }, ...]
  const inputs = [];
  lines.forEach((line, i) => {
    const wrap = el("div", { class: "sentence-line" });
    const parts = line.text.split("____");
    wrap.appendChild(document.createTextNode((prefixLabel ? `${i + 1}. ` : "") + parts[0]));
    const input = el("input", { class: "blank", type: "text", "data-idx": i, autocomplete: "off" });
    wrap.appendChild(input);
    wrap.appendChild(document.createTextNode(parts[1] || ""));
    const explainEl = el("div", { class: "explain", style: "display:none;" });
    wrap.appendChild(explainEl);
    container.appendChild(wrap);
    inputs.push({ input, answers: line.answers.map(norm), explain: line.explain, explainEl, rawAnswers: line.answers });
  });
  const scoreEl = el("div", { class: "score" });
  const checkBtn = el("button", { class: "check" }, "Kiểm tra");
  const resetBtn = el("button", { class: "reset" }, "Làm lại");
  checkBtn.onclick = () => {
    let correct = 0;
    inputs.forEach(({ input, answers, explain, explainEl, rawAnswers }) => {
      const ok = answers.includes(norm(input.value));
      input.classList.remove("correct", "incorrect");
      input.classList.add(ok ? "correct" : "incorrect");
      if (!ok) {
        explainEl.style.display = "block";
        explainEl.textContent = `✗ Đáp án đúng: "${rawAnswers[0]}"` + (explain ? ` — ${explain}` : "");
      } else {
        explainEl.style.display = "none";
      }
      if (ok) correct++;
    });
    scoreEl.textContent = `Kết quả: ${correct}/${inputs.length} câu đúng (${Math.round(correct / inputs.length * 100)}%).`;
    scoreEl.className = "score " + (correct === inputs.length ? "good" : "bad");
    if (exerciseId) Scores.record(exerciseId, correct, inputs.length, meta);
    if (typeof onExerciseChecked === "function") onExerciseChecked();
  };
  resetBtn.onclick = () => {
    inputs.forEach(({ input, explainEl }) => { input.value = ""; input.classList.remove("correct", "incorrect"); explainEl.style.display = "none"; });
    scoreEl.textContent = "";
  };
  container.appendChild(checkBtn);
  container.appendChild(resetBtn);
  container.appendChild(scoreEl);
}

/* ---------- 2. Multiple choice ---------- */
function buildMCQ(container, { questions, exerciseId, meta }) {
  // questions: [{ text, options: [...], answer, explain }]
  const state = questions.map(() => null);
  questions.forEach((q, qi) => {
    const qwrap = el("div", { class: "mcq-q" });
    qwrap.appendChild(el("div", { class: "qtext" }, `${qi + 1}. ${q.text}`));
    const opts = el("div", { class: "mcq-options" });
    q.options.forEach(opt => {
      const b = el("button", {}, opt);
      b.onclick = () => {
        state[qi] = opt;
        [...opts.children].forEach(c => c.classList.remove("selected"));
        b.classList.add("selected");
      };
      opts.appendChild(b);
    });
    qwrap.appendChild(opts);
    qwrap.appendChild(el("div", { class: "explain", style: "display:none;" }));
    container.appendChild(qwrap);
  });
  const scoreEl = el("div", { class: "score" });
  const checkBtn = el("button", { class: "check" }, "Kiểm tra");
  const resetBtn = el("button", { class: "reset" }, "Làm lại");
  checkBtn.onclick = () => {
    let correct = 0;
    [...container.querySelectorAll(".mcq-q")].forEach((qwrap, qi) => {
      const opts = qwrap.querySelector(".mcq-options");
      const explainEl = qwrap.querySelector(".explain");
      [...opts.children].forEach(b => {
        b.classList.remove("correct-answer", "wrong-answer");
        if (b.textContent === questions[qi].answer) b.classList.add("correct-answer");
        else if (b.textContent === state[qi]) b.classList.add("wrong-answer");
      });
      const ok = state[qi] === questions[qi].answer;
      if (!ok) {
        explainEl.style.display = "block";
        explainEl.textContent = `✗ Đáp án đúng: "${questions[qi].answer}"` + (questions[qi].explain ? ` — ${questions[qi].explain}` : "");
      } else {
        explainEl.style.display = "none";
      }
      if (ok) correct++;
    });
    scoreEl.textContent = `Kết quả: ${correct}/${questions.length} câu đúng (${Math.round(correct / questions.length * 100)}%).`;
    scoreEl.className = "score " + (correct === questions.length ? "good" : "bad");
    if (exerciseId) Scores.record(exerciseId, correct, questions.length, meta);
    if (typeof onExerciseChecked === "function") onExerciseChecked();
  };
  resetBtn.onclick = () => {
    state.fill(null);
    [...container.querySelectorAll(".mcq-options button")].forEach(b =>
      b.classList.remove("selected", "correct-answer", "wrong-answer"));
    [...container.querySelectorAll(".explain")].forEach(e => e.style.display = "none");
    scoreEl.textContent = "";
  };
  container.appendChild(checkBtn);
  container.appendChild(resetBtn);
  container.appendChild(scoreEl);
}

/* ---------- 3. Matching (click pairs) ---------- */
function buildMatching(container, { pairs, leftLabel, rightLabel, exerciseId, meta }) {
  // pairs: [{ left: "...", right: "..." }]
  const leftItems = pairs.map((p, i) => ({ text: p.left, id: i }));
  const rightItems = pairs.map((p, i) => ({ text: p.right, id: i }))
    .sort(() => Math.random() - 0.5);

  const wrap = el("div", { class: "match-wrap" });
  const colL = el("div", { class: "match-col" });
  const colR = el("div", { class: "match-col" });
  if (leftLabel) colL.appendChild(el("h3", { style: "font-size:.85rem;color:#6b7280;margin:0 0 6px;" }, leftLabel));
  if (rightLabel) colR.appendChild(el("h3", { style: "font-size:.85rem;color:#6b7280;margin:0 0 6px;" }, rightLabel));

  let selectedLeft = null;
  let firstTryCorrect = 0;
  let attempted = 0;
  const matched = new Set();

  function makeItem(text, id, side) {
    const item = el("div", { class: "match-item" }, text);
    item.dataset.id = id;
    item.onclick = () => {
      if (matched.has(`${side}-${id}`)) return;
      if (side === "L") {
        [...colL.children].forEach(c => c.classList.remove("selected"));
        item.classList.add("selected");
        selectedLeft = id;
      } else if (side === "R" && selectedLeft !== null) {
        const leftEl = colL.querySelector(`[data-id="${selectedLeft}"]`);
        const correct = selectedLeft === id;
        attempted++;
        if (correct) firstTryCorrect++;
        [leftEl, item].forEach(x => {
          x.classList.remove("selected");
          x.classList.add(correct ? "matched-correct" : "matched-wrong");
        });
        if (correct) {
          matched.add(`L-${selectedLeft}`);
          matched.add(`R-${id}`);
          if (matched.size === leftItems.length * 2 && exerciseId) {
            Scores.record(exerciseId, firstTryCorrect, pairs.length, meta);
            if (typeof onExerciseChecked === "function") onExerciseChecked();
          }
        } else {
          const ls = selectedLeft;
          setTimeout(() => {
            leftEl.classList.remove("matched-wrong");
            item.classList.remove("matched-wrong");
          }, 700);
        }
        selectedLeft = null;
      }
    };
    return item;
  }

  leftItems.forEach(it => colL.appendChild(makeItem(it.text, it.id, "L")));
  rightItems.forEach(it => colR.appendChild(makeItem(it.text, it.id, "R")));
  wrap.appendChild(colL);
  wrap.appendChild(colR);
  container.appendChild(wrap);

  const scoreEl = el("div", { class: "score" });
  const resetBtn = el("button", { class: "reset" }, "Làm lại");
  resetBtn.onclick = () => location.reload();
  container.appendChild(resetBtn);
  container.appendChild(scoreEl);
}

/* ---------- 4. Sort into 2 columns (e.g. make/do) ---------- */
function buildSort2(container, { items, columns, exerciseId, meta }) {
  // items: [{ text, col }], columns: ["make","do"]
  const pool = el("div", { class: "sort-pool" });
  const cols = el("div", { class: "sort-columns" });
  const colEls = {};
  columns.forEach(c => {
    const colEl = el("div", { class: "sort-col" }, [el("h3", {}, c.toUpperCase())]);
    colEl.dataset.col = c;
    colEls[c] = colEl;
    cols.appendChild(colEl);
  });

  const shuffled = [...items].sort(() => Math.random() - 0.5);
  let activeChip = null;
  shuffled.forEach((it, i) => {
    const chip = el("div", { class: "sort-chip" }, it.text);
    chip.dataset.answer = it.col;
    chip.onclick = () => {
      if (chip.classList.contains("placed")) return;
      [...pool.children].forEach(c => c.style.outline = "none");
      chip.style.outline = "3px solid var(--navy)";
      activeChip = chip;
    };
    pool.appendChild(chip);
  });

  columns.forEach(c => {
    colEls[c].onclick = () => {
      if (!activeChip) return;
      const placed = el("span", { class: "placed-item" }, activeChip.textContent);
      placed.dataset.answer = activeChip.dataset.answer;
      placed.dataset.placedIn = c;
      colEls[c].appendChild(placed);
      activeChip.classList.add("placed");
      activeChip.style.outline = "none";
      activeChip = null;
    };
  });

  container.appendChild(el("p", { style: "font-size:.85rem;color:#6b7280;" }, "Bấm 1 từ ở trên, rồi bấm vào cột đúng (MAKE hoặc DO) để xếp từ vào cột."));
  container.appendChild(pool);
  container.appendChild(cols);

  const scoreEl = el("div", { class: "score" });
  const checkBtn = el("button", { class: "check" }, "Kiểm tra");
  const resetBtn = el("button", { class: "reset" }, "Làm lại");
  checkBtn.onclick = () => {
    let correct = 0, total = 0;
    columns.forEach(c => {
      [...colEls[c].querySelectorAll(".placed-item")].forEach(p => {
        total++;
        const ok = p.dataset.answer === p.dataset.placedIn;
        p.style.background = ok ? "var(--lightgreen)" : "var(--lightred)";
        p.style.color = ok ? "var(--green)" : "var(--red)";
        if (ok) correct++;
      });
    });
    scoreEl.textContent = `Kết quả: ${correct}/${items.length} từ đúng vị trí (đã xếp ${total}/${items.length}).`;
    scoreEl.className = "score " + (correct === items.length && total === items.length ? "good" : "bad");
    if (exerciseId) Scores.record(exerciseId, correct, items.length, meta);
    if (typeof onExerciseChecked === "function") onExerciseChecked();
  };
  resetBtn.onclick = () => location.reload();
  container.appendChild(checkBtn);
  container.appendChild(resetBtn);
  container.appendChild(scoreEl);
}

/* ---------- 5. Word order builder ---------- */
function buildWordOrder(container, { items, exerciseId, meta }) {
  // items: [{ words: [...], answer: "..." }]  answer = correct sentence string
  const blocks = [];
  items.forEach((it, idx) => {
    const wrap = el("div", { style: "margin-bottom:18px;" });
    wrap.appendChild(el("div", { style: "font-weight:600;margin-bottom:6px;" }, `${idx + 1}.`));
    const target = el("div", { class: "wo-target" });
    const pool = el("div", { class: "wo-pool" });
    const order = [];
    const shuffled = it.words.map((w, i) => ({ w, i })).sort(() => Math.random() - 0.5);

    function refreshPool() {
      pool.innerHTML = "";
      shuffled.forEach(({ w, i }) => {
        if (order.includes(i)) return;
        const chip = el("div", { class: "wo-chip" }, w);
        chip.onclick = () => { order.push(i); render(); };
        pool.appendChild(chip);
      });
    }
    function render() {
      target.innerHTML = "";
      order.forEach((i, pos) => {
        const chip = el("div", { class: "wo-placed" }, it.words[i]);
        chip.onclick = () => { order.splice(pos, 1); render(); };
        target.appendChild(chip);
      });
      refreshPool();
    }
    render();
    wrap.appendChild(target);
    wrap.appendChild(pool);
    container.appendChild(wrap);
    blocks.push({ order, answer: norm(it.answer), words: it.words });
  });

  const scoreEl = el("div", { class: "score" });
  const checkBtn = el("button", { class: "check" }, "Kiểm tra");
  const resetBtn = el("button", { class: "reset" }, "Làm lại");
  checkBtn.onclick = () => {
    let correct = 0;
    blocks.forEach(b => {
      const built = norm(b.order.map(i => b.words[i]).join(" ").replace(/\s+([?.,])/g, "$1"));
      if (built === b.answer) correct++;
    });
    scoreEl.textContent = `Kết quả: ${correct}/${blocks.length} câu đúng.`;
    scoreEl.className = "score " + (correct === blocks.length ? "good" : "bad");
    if (exerciseId) Scores.record(exerciseId, correct, blocks.length, meta);
    if (typeof onExerciseChecked === "function") onExerciseChecked();
  };
  resetBtn.onclick = () => location.reload();
  container.appendChild(checkBtn);
  container.appendChild(resetBtn);
  container.appendChild(scoreEl);
}

/* ---------- 6. Word search (simplified: click-list to reveal + mark found) ---------- */
function buildWordSearch(container, { grid, words, exerciseId, meta }) {
  const gridEl = el("div", { class: "ws-grid" });
  const rows = grid.length, cols = grid[0].length;
  gridEl.style.gridTemplateColumns = `repeat(${cols}, 32px)`;
  let selecting = [];
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = el("div", { class: "ws-cell" }, grid[r][c]);
      cell.dataset.r = r; cell.dataset.c = c;
      cell.onclick = () => {
        cell.classList.toggle("sel");
        const key = `${r},${c}`;
        const i = selecting.indexOf(key);
        if (i >= 0) selecting.splice(i, 1); else selecting.push(key);
      };
      gridEl.appendChild(cell);
      cells.push(cell);
    }
  }
  const list = el("ul", { class: "ws-words" });
  const foundSet = new Set();
  words.forEach(w => list.appendChild(el("li", { "data-word": w }, w)));

  const wsWrap = el("div", { class: "ws-wrap" }, [gridEl, list]);
  container.appendChild(el("p", { style: "font-size:.85rem;color:#6b7280;" },
    "Bấm lần lượt các ô chữ cái để chọn 1 từ, rồi bấm 'Kiểm tra từ đã chọn'. Tìm đủ 10 từ trong danh sách bên phải."));
  container.appendChild(wsWrap);

  const scoreEl = el("div", { class: "score" });
  const checkSelBtn = el("button", { class: "check" }, "Kiểm tra từ đã chọn");
  const resetBtn = el("button", { class: "reset" }, "Làm lại");
  checkSelBtn.onclick = () => {
    const selectedCells = [...gridEl.querySelectorAll(".ws-cell.sel")];
    const word = selectedCells.map(c => c.textContent).join("").toUpperCase();
    const wordRev = [...word].reverse().join("");
    const match = words.find(w => w.toUpperCase() === word || w.toUpperCase() === wordRev);
    if (match && !foundSet.has(match)) {
      foundSet.add(match);
      selectedCells.forEach(c => { c.classList.remove("sel"); c.classList.add("found"); });
      list.querySelector(`[data-word="${match}"]`).classList.add("found");
      scoreEl.textContent = `Đã tìm ${foundSet.size}/${words.length} từ. ✔ ${match}`;
      scoreEl.className = "score good";
      if (foundSet.size === words.length && exerciseId) {
        Scores.record(exerciseId, foundSet.size, words.length, meta);
        if (typeof onExerciseChecked === "function") onExerciseChecked();
      }
    } else {
      selectedCells.forEach(c => c.classList.remove("sel"));
      scoreEl.textContent = foundSet.size === words.length ? "🎉 Hoàn thành tất cả!" : "Chưa đúng, thử lại.";
      scoreEl.className = "score bad";
    }
    selecting = [];
  };
  resetBtn.onclick = () => location.reload();
  container.appendChild(checkSelBtn);
  container.appendChild(resetBtn);
  container.appendChild(scoreEl);
}
