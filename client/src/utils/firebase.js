import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "pro-man-abdd5.firebaseapp.com",
  projectId: "pro-man-abdd5",
  storageBucket: "pro-man-abdd5.firebasestorage.app",
  messagingSenderId: "1082566169229",
  appId: "1:1082566169229:web:323815b4be0e507e6788c4",
  measurementId: "G-6RT6XFKCNT",
};

export const app = initializeApp(firebaseConfig);
