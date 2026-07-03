// Auth helper — waits for firebase-init.js to finish loading (window.FB),
// then exposes simple functions usable from regular <script> (non-module) code.

window.AuthReady = new Promise((resolve) => {
  if (window.FB) resolve();
  else window.addEventListener("firebase-ready", () => resolve(), { once: true });
});

window.Auth = {
  async signup(name, email, password) {
    await window.AuthReady;
    const { auth, createUserWithEmailAndPassword, updateProfile } = window.FB;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
    return cred.user;
  },
  async login(email, password) {
    await window.AuthReady;
    const { auth, signInWithEmailAndPassword } = window.FB;
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  },
  async logout() {
    await window.AuthReady;
    const { auth, signOut } = window.FB;
    await signOut(auth);
  },
  onChange(cb) {
    window.AuthReady.then(() => {
      const { auth, onAuthStateChanged } = window.FB;
      onAuthStateChanged(auth, cb);
    });
  },
};
