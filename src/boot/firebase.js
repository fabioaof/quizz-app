
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1PcGiUURlKIyMFLWUHlkcBiwEieMSVUM",
  authDomain: "quizz-app-c4bd3.firebaseapp.com",
  databaseURL: "https://quizz-app-c4bd3-default-rtdb.firebaseio.com",
  projectId: "quizz-app-c4bd3",
  storageBucket: "quizz-app-c4bd3.firebasestorage.app",
  messagingSenderId: "265074102560",
  appId: "1:265074102560:web:641538880cc91e9c8c4745"
};

// Inicializa a app
const app = initializeApp(firebaseConfig)

const db = getDatabase(app)

// Exporta o db para poderes usar noutras partes da app
export { db }
