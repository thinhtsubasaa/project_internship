import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFlMfimiGOfxtT2brbR7llYTR5w3arI6o",
  authDomain: "rental-945b7.firebaseapp.com",
  projectId: "rental-945b7",
  storageBucket: "rental-945b7.appspot.com",
  messagingSenderId: "575709852717",
  appId: "1:575709852717:web:8dc8791fdf7ec68bd734a4",
  measurementId: "G-1TKZWCSKMV",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app, "gs://rental-945b7.appspot.com");
