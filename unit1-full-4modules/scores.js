// Score tracking — Firestore-backed, per logged-in user.
// Keeps the SAME synchronous-looking API as before (record/get/allEntries/
// overallPct/reset) so app.js and dashboard code need no changes.
// Writes go to an in-memory cache instantly (UI updates immediately) and
// are pushed to Firestore in the background. Falls back to localStorage
// if the user is not yet known (queued and flushed once they are).

const Scores = {
  KEY: "el_scores_v1",
  _cache: {},
  _uid: null,
  _queue: [],

  async setUser(uid) {
    this._uid = uid;
    if (!uid) return;
    await this._loadFromFirestore();
    // flush any writes that happened before we knew the uid
    const q = this._queue.splice(0);
    for (const [id, entry] of q) this._writeToFirestore(id, entry);
  },

  clearUser() {
    this._uid = null;
    this._cache = {};
  },

  async _loadFromFirestore() {
    try {
      const { db, doc, getDocs, collection } = window.FB;
      const snap = await getDocs(collection(db, "users", this._uid, "scores"));
      const merged = {};
      snap.forEach((d) => { merged[d.id] = d.data(); });
      this._cache = merged;
      localStorage.setItem(this.KEY, JSON.stringify(this._cache));
    } catch (e) {
      // offline fallback: use last-known local cache
      try { this._cache = JSON.parse(localStorage.getItem(this.KEY)) || {}; }
      catch { this._cache = {}; }
      console.warn("Scores: could not load from Firestore, using local cache.", e);
    }
  },

  _writeToFirestore(id, entry) {
    if (!this._uid || !window.FB) return;
    try {
      const { db, doc, setDoc } = window.FB;
      setDoc(doc(db, "users", this._uid, "scores", id), entry).catch((e) =>
        console.warn("Scores: failed to save to Firestore", e)
      );
    } catch (e) {
      console.warn("Scores: Firestore write error", e);
    }
  },

  record(id, correct, total, meta) {
    const entry = { correct, total, pct: total ? Math.round((correct / total) * 100) : 0, meta: meta || null, ts: Date.now() };
    this._cache[id] = entry;
    localStorage.setItem(this.KEY, JSON.stringify(this._cache));
    if (this._uid) this._writeToFirestore(id, entry);
    else this._queue.push([id, entry]);
  },

  get(id) {
    return this._cache[id] || null;
  },

  allEntries() {
    return this._cache;
  },

  async reset() {
    this._cache = {};
    localStorage.removeItem(this.KEY);
    if (this._uid && window.FB) {
      try {
        const { db, doc, getDocs, collection, deleteDoc } = window.FB;
        const snap = await getDocs(collection(db, "users", this._uid, "scores"));
        const dels = [];
        snap.forEach((d) => dels.push(deleteDoc(doc(db, "users", this._uid, "scores", d.id))));
        await Promise.all(dels);
      } catch (e) {
        console.warn("Scores: failed to clear Firestore", e);
      }
    }
  },

  overallPct() {
    const all = Object.values(this._cache);
    if (!all.length) return null;
    const sumCorrect = all.reduce((s, e) => s + e.correct, 0);
    const sumTotal = all.reduce((s, e) => s + e.total, 0);
    return sumTotal ? Math.round((sumCorrect / sumTotal) * 100) : 0;
  },
};

// Load any offline-cached data immediately so pages aren't empty on first paint.
try { Scores._cache = JSON.parse(localStorage.getItem(Scores.KEY)) || {}; } catch { }
