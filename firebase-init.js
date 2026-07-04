// Firebase init — uses CDN ES modules, no npm/build step needed.
// This file is loaded as <script type="module"> in each page.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDocs, collection, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDyfFlyIe8pujzUd4fDN0atXreuB5EmwEE",
  authDomain: "mindset-for-ielts-foundation.firebaseapp.com",
  projectId: "mindset-for-ielts-foundation",
  storageBucket: "mindset-for-ielts-foundation.firebasestorage.app",
  messagingSenderId: "354897362621",
  appId: "1:354897362621:web:f2e2d68d93c4e67e9481d4",
  measurementId: "G-M8T246LCVP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.FB = {
  auth, db,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile,
  doc, setDoc, getDocs, collection, deleteDoc,
};

// Fire a custom event once Firebase is ready, so non-module scripts can react.
window.dispatchEvent(new Event("firebase-ready"));
