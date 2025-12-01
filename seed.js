import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

// Firebase Config (dari .env)
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

async function seedDatabase() {
  try {
    console.log("🚀 Seed işlemi başlıyor...\n");

    // 1. AUTH: Admin kullanıcısı oluştur
    console.log("📝 1. Firebase Auth'da admin oluşturuluyor...");
    const adminEmail = "tolgatunahan@icloud.com";
    const adminPassword = "1Liraversene";

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminEmail,
      adminPassword
    );
    const adminUID = userCredential.user.uid;
    console.log(`✅ Auth kullanıcısı oluşturuldu! UID: ${adminUID}\n`);

    // 2. DATABASE: Admin verisi kaydet
    console.log("📝 2. Realtime Database'de admin profili oluşturuluyor...");
    const adminData = {
      uid: adminUID,
      email: adminEmail,
      name: "Tolga Tunahan",
      phone: "05423822832",
      role: "admin",
      status: "approved",
      createdAt: new Date().toISOString(),
    };

    await set(ref(db, `users/${adminUID}`), adminData);
    console.log(`✅ Database kaydı oluşturuldu!\n`);

    // 3. SONUÇ
    console.log("=" + "=".repeat(49));
    console.log("✨ SEED İŞLEMİ BAŞARILI! ✨");
    console.log("=" + "=".repeat(49));
    console.log("\n📋 ADMIN BİLGİLERİ:");
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Şifre: ${adminPassword}`);
    console.log(`  UID: ${adminUID}`);
    console.log(`  Rol: Admin`);
    console.log(`  Durum: Onaylı`);
    console.log("\n✅ Artık uygulamaya giriş yapabilirsiniz!\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ HATA:", error.message);
    console.error("Kod:", error.code);
    process.exit(1);
  }
}

seedDatabase();
