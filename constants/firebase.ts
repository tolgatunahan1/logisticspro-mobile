import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDV7X8j9PuhYw1A1CXdGTRp08NFm0F9ajg",
  authDomain: "logisticspro-62f16.firebaseapp.com",
  projectId: "logisticspro-62f16",
  storageBucket: "logisticspro-62f16.firebasestorage.app",
  messagingSenderId: "332674012352",
  appId: "1:332674012352:web:35306fe307bfbfabea4925",
  measurementId: "G-Z8L31L5GFK",
  databaseURL: "https://logisticspro-62f16-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
export const firebaseDatabase = getDatabase(app);
