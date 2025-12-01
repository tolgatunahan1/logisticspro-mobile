import React, { useState } from "react";
import { StyleSheet, View, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { firebaseAuth, firebaseDatabase } from "../constants/firebase";

import { ThemedText } from "../components/ThemedText";
import { ScreenContainer } from "../components/ScreenContainer";
import { useTheme } from "../hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import { RootStackParamList } from "../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SignupScreen() {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const navigation = useNavigation<NavigationProp>();

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignup = async () => {
    console.log("🚀 [SIGNUP START] handleSignup fonksiyonu çağrıldı");
    console.log("📝 Form Değerleri:", { name, phone, email, passwordLength: password.length });

    // Validasyon Kontrolleri
    console.log("✅ [VALIDATION] Alan boşluk kontrolü başladı");
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      const msg = "Lütfen tüm alanları doldurun.";
      console.error("❌ [VALIDATION ERROR]", msg);
      setErrorMsg("❌ HATA: " + msg);
      return;
    }
    console.log("✅ [VALIDATION] Tüm alanlar dolu");

    console.log("✅ [VALIDATION] Şifre eşleşme kontrolü başladı");
    if (password !== confirmPassword) {
      const msg = "Şifreler eşleşmiyor.";
      console.error("❌ [VALIDATION ERROR]", msg);
      setErrorMsg("❌ HATA: " + msg);
      return;
    }
    console.log("✅ [VALIDATION] Şifreler eşleşiyor");

    console.log("✅ [VALIDATION] Şifre uzunluğu kontrolü başladı");
    if (password.length < 6) {
      const msg = "Şifre en az 6 karakter olmalı.";
      console.error("❌ [VALIDATION ERROR]", msg);
      setErrorMsg("❌ HATA: " + msg);
      return;
    }
    console.log("✅ [VALIDATION] Şifre uzunluğu uygun (", password.length, "karakter)");

    console.log("✅ [VALIDATION] Tüm validasyonlar geçti");
    setIsLoading(true);
    
    try {
      // 1. Firebase Auth ile kullanıcı oluştur
      console.log("🔐 [AUTH] Firebase Auth kullanıcı oluşturma başladı");
      console.log("📧 E-posta:", email);
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;
      console.log("✅ [AUTH] Kullanıcı başarıyla oluşturuldu");
      console.log("👤 UID:", user.uid);

      // 2. Realtime Database'e kullanıcı detaylarını yaz (Onay Bekliyor statüsünde)
      console.log("💾 [DATABASE] Kullanıcı profili veritabanına yazılıyor");
      const userProfileData = {
        uid: user.uid,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        role: "user",
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      console.log("📋 Yazılacak veri:", userProfileData);
      
      await set(ref(firebaseDatabase, `users/${user.uid}`), userProfileData);
      console.log("✅ [DATABASE] Profil başarıyla yazıldı");

      console.log("🎉 [SUCCESS] Kayıt işlemi başarıyla tamamlandı");
      setSuccessMsg("✅ Kayıt Başarılı! Hesabınız oluşturuldu ve yönetici onayına gönderildi.");
      
      // Hemen Login ekranına yönlendir (Alert.alert web'de çalışmıyor)
      setTimeout(() => {
        console.log("📲 Kullanıcı Login ekranına yönlendiriliyor");
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }, 1500);

    } catch (error: any) {
      console.error("❌ [ERROR] Kayıt işlemi başarısız:", error);
      console.error("Error Code:", error?.code);
      console.error("Error Message:", error?.message);
      console.error("Full Error Object:", error);

      let msg = "Kayıt oluşturulamadı.";
      
      if (error?.code === "auth/email-already-in-use") {
        msg = "Bu e-posta zaten kullanımda.";
        console.error("❌ [ERROR] Email-already-in-use hatası");
      } else if (error?.code === "auth/weak-password") {
        msg = "Şifre çok zayıf. Daha güçlü bir şifre seçin.";
        console.error("❌ [ERROR] Weak-password hatası");
      } else if (error?.code === "auth/invalid-email") {
        msg = "Geçersiz e-posta adresi.";
        console.error("❌ [ERROR] Invalid-email hatası");
      } else if (error?.message?.includes("Firebase")) {
        msg = "Firebase bağlantı hatası: " + error?.message;
        console.error("❌ [ERROR] Firebase hatası");
      }
      
      console.error("💬 Kullanıcıya gösterilecek mesaj:", msg);
      setErrorMsg("❌ HATA: " + msg);
    } finally {
      console.log("🛑 [CLEANUP] İşlem sonlandırılıyor, isLoading false yapılıyor");
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <ThemedText type="h1" style={{ textAlign: "center", marginBottom: Spacing.sm }}>Kayıt Ol</ThemedText>
          <ThemedText type="subtitle" style={{ textAlign: "center", color: colors.textSecondary }}>
            Lojistik yönetimine katılın
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          {errorMsg ? (
            <View style={[styles.messageBox, { backgroundColor: colors.error || '#FF4444', borderColor: '#CC0000' }]}>
              <ThemedText type="small" style={{ color: "#FFF", fontWeight: 'bold', textAlign: 'center' }}>
                {errorMsg}
              </ThemedText>
            </View>
          ) : successMsg ? (
            <View style={[styles.messageBox, { backgroundColor: colors.success || '#44AA44', borderColor: '#00AA00' }]}>
              <ThemedText type="small" style={{ color: "#FFF", fontWeight: 'bold', textAlign: 'center' }}>
                {successMsg}
              </ThemedText>
            </View>
          ) : null}

          {/* Ad Soyad */}
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ marginBottom: Spacing.xs, fontWeight: '600' }}>Ad Soyad</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundRoot }]}
              placeholder="Adınız Soyadınız"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Telefon */}
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ marginBottom: Spacing.xs, fontWeight: '600' }}>Telefon</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundRoot }]}
              placeholder="0555 555 55 55"
              placeholderTextColor={colors.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* E-posta */}
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ marginBottom: Spacing.xs, fontWeight: '600' }}>E-posta</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundRoot }]}
              placeholder="ornek@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Şifre */}
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ marginBottom: Spacing.xs, fontWeight: '600' }}>Şifre</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundRoot }]}
              placeholder="******"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Şifre Tekrar */}
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ marginBottom: Spacing.xs, fontWeight: '600' }}>Şifre Tekrar</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundRoot }]}
              placeholder="******"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <Pressable
            onPress={handleSignup}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.link, opacity: pressed || isLoading ? 0.8 : 1 },
            ]}
          >
            {isLoading ? <ActivityIndicator color="#FFF" /> : <ThemedText type="body" style={{ color: "#FFF", fontWeight: "bold" }}>Kayıt Ol</ThemedText>}
          </Pressable>

          <View style={styles.loginLink}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>Zaten hesabınız var mı? </ThemedText>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <ThemedText type="small" style={{ color: theme.link, fontWeight: "bold" }}>Giriş Yap</ThemedText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerContainer: { marginTop: Spacing.xl * 2, marginBottom: Spacing.xl },
  formContainer: { gap: Spacing.md, paddingHorizontal: Spacing.lg },
  inputGroup: { gap: 4 },
  input: { height: 50, borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, fontSize: 16 },
  button: { height: 50, borderRadius: BorderRadius.md, alignItems: "center", justifyContent: "center", marginTop: Spacing.sm },
  loginLink: { flexDirection: "row", justifyContent: "center", marginTop: Spacing.md },
  messageBox: { borderWidth: 2, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md },
});