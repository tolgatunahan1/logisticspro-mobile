import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase Config - Şu anda development/test configuration
// Production'da environment variables'dan yüklenecek
const firebaseConfig = {
  apiKey: "AIzaSyBZfF6K1Z2X3X4X5X6X7X8X9X0X1X2X3X",
  authDomain: "logisticspro-test.firebaseapp.com",
  projectId: "logisticspro-test",
  storageBucket: "logisticspro-test.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  databaseURL: "https://logisticspro-test-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;
