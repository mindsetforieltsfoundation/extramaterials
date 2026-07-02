// Score tracking — uses localStorage. Safe here because this is a STANDALONE
// site meant to be deployed (GitHub Pages / Netlify), not run inside the
// Claude.ai artifact sandbox.
const Scores = {
  KEY: "el_scores_v1",

  _all() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; }
    catch { return {}; }
  },

  record(id, correct, total, meta) {
    const all = this._all();
    all[id] = { correct, total, pct: total ? Math.round((correct / total) * 100) : 0, meta, ts: Date.now() };
    localStorage.setItem(this.KEY, JSON.stringify(all));
  },

  get(id) {
    return this._all()[id] || null;
  },

  allEntries() {
    return this._all();
  },

  reset() {
    localStorage.removeItem(this.KEY);
  },

  overallPct() {
    const all = Object.values(this._all());
    if (!all.length) return null;
    const sumCorrect = all.reduce((s, e) => s + e.correct, 0);
    const sumTotal = all.reduce((s, e) => s + e.total, 0);
    return sumTotal ? Math.round((sumCorrect / sumTotal) * 100) : 0;
  },
};
