// Auth helper — waits for firebase-init.js to finish loading (window.FB),
// then exposes simple functions usable from regular <script> (non-module) code.

window.AuthReady = new Promise((resolve) => {
  if (window.FB) resolve();
  else window.addEventListener("firebase-ready", () => resolve(), { once: true });
});

const STUDENT_EMAIL_DOMAIN = "students.mindsetfoundation.app";
window.ADMIN_EMAIL = "duyenvth@hanu.edu.vn";

function studentIdToEmail(id) {
  return `${id.trim().toLowerCase()}@${STUDENT_EMAIL_DOMAIN}`;
}

window.Auth = {
  // Teacher/admin signup (real email) — used only for the teacher's own account.
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
  // Student login by ID (converted to a synthetic email internally).
  async loginStudent(id, password) {
    await window.AuthReady;
    const { auth, signInWithEmailAndPassword } = window.FB;
    const cred = await signInWithEmailAndPassword(auth, studentIdToEmail(id), password);
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
  isAdmin(user) {
    return !!user && user.email === window.ADMIN_EMAIL;
  },
  // Admin-only: create a student account WITHOUT logging the admin out.
  // Uses a secondary, isolated Firebase Auth instance for the signup call.
  async createStudent(id, name, password) {
    await window.AuthReady;
    const { app } = window.FB;
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } =
      await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
    const secondaryApp = initializeApp(window.FB.config, "secondary-" + Date.now());
    const secondaryAuth = getAuth(secondaryApp);
    const email = studentIdToEmail(id);
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
    const uid = cred.user.uid;
    await signOut(secondaryAuth);
    // Save a roster entry so the admin can list/find students later.
    const { db, doc, setDoc } = window.FB;
    await setDoc(doc(db, "students", uid), {
      studentId: id.trim().toLowerCase(),
      name: name || id,
      createdAt: Date.now(),
    });
    return uid;
  },
};

