import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-6vxRV1ayUtKgi-Xl6BR8g9jsUqR8YX8",
  authDomain: "logisticspro-f044a.firebaseapp.com",
  projectId: "logisticspro-f044a",
  storageBucket: "logisticspro-f044a.firebasestorage.app",
  messagingSenderId: "548356449242",
  appId: "1:548356449242:web:2cab58fabd0e1b049616e3",
  measurementId: "G-67QHK4DFVS",
  databaseURL: "https://logisticspro-f044a-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
export const firebaseDatabase = getDatabase(app);
