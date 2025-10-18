// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAAAdGNs4MQvTycCl7LfTW1GDH5TpNogSY",
  authDomain: "featherfashions-cfbc9.firebaseapp.com",
  projectId: "featherfashions-cfbc9",
  storageBucket: "featherfashions-cfbc9.firebasestorage.app",
  messagingSenderId: "166169521215",
  appId: "1:166169521215:web:e2527e63e28db233799c8a",
  measurementId: "G-YEXN2EXK5P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);