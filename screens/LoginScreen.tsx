import React, { useState } from "react";
import { StyleSheet, View, TextInput, Pressable, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { signInWithEmailAndPassword, signOut } from "firebase/auth"; // signOut eklendi
import { ref, get } from "firebase/database"; // Veritabanı okuma
import { firebaseAuth, firebaseDatabase } from "../constants/firebase";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { ScreenContainer } from "../components/ScreenContainer";
import { useTheme } from "../hooks/useTheme";
import { Spacing, BorderRadius, Colors, APP_CONSTANTS } from "../constants/theme";
import { RootStackParamList } from "../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const handleLogin = async () => {
    setErrorMsg("");
    setInfoMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("❌ Lütfen e-posta ve şifrenizi girin.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Giriş Yap
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;

      // 2. Kullanıcı Durumunu Kontrol Et
      const userRef = ref(firebaseDatabase, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();

        // STATUS KONTROLÜ
        if (userData.status === 'pending') {
          // ONAYLANMAMIŞSA ÇIKIŞ YAP VE UYARI VER
          await signOut(firebaseAuth);
          setInfoMsg("⏳ Hesabınız henüz yönetici tarafından onaylanmadı. Lütfen bekleyiniz.");
        } else if (userData.status === 'suspended') {
          // DONDURULMUŞSA ÇIKIŞ YAP VE UYARI VER
          await signOut(firebaseAuth);
          setErrorMsg("❌ Hesabınız askıya alınmıştır. Yöneticiyle iletişime geçin.");
        } else if (userData.status === 'approved') {
          // ONAYLIYSA İÇERİ AL (RootNavigator zaten auth değişikliğini dinleyip yönlendirecek)
          setInfoMsg("✅ Giriş başarılı, yönlendiriliyor...");
          console.log("Giriş başarılı, role:", userData.role, "status:", userData.status);
        } else {
          // Bilinmeyen durum
          await signOut(firebaseAuth);
          setErrorMsg("❌ Hesap durumu geçersizdir.");
        }
      } else {
        // Veritabanında kaydı yoksa
        setErrorMsg("❌ Kullanıcı profili bulunamadı.");
        await signOut(firebaseAuth);
      }

    } catch (error: any) {
      console.error("Giriş hatası:", error);
      let msg = "Giriş yapılamadı.";
      if (error?.code === "auth/invalid-credential") msg = "E-posta veya şifre hatalı.";
      else if (error?.code === "auth/user-not-found") msg = "Bu e-posta ile kayıtlı hesap bulunamadı.";
      else if (error?.code === "auth/invalid-email") msg = "Geçerli Email Veya Şifre Giriniz";
      else if (error?.message) msg = error.message;
      setErrorMsg("❌ HATA: " + msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: "center" }}>
        
        <View style={styles.logoContainer}>
          <Image 
            source={require("../assets/images/IMG_6804.png")} 
            style={{ width: 120, height: 120, borderRadius: 20 }} 
          />
          <ThemedText type="h1" style={{ marginTop: Spacing.lg }}>LogisticsPRO</ThemedText>
        </View>

        <View style={styles.formContainer}>
          {errorMsg ? (
            <View style={[styles.messageBox, { backgroundColor: colors.error || '#FF4444', borderColor: '#CC0000' }]}>
              <ThemedText type="small" style={{ color: "#FFF", fontWeight: 'bold', textAlign: 'center' }}>
                {errorMsg}
              </ThemedText>
            </View>
          ) : infoMsg ? (
            <View style={[styles.messageBox, { backgroundColor: colors.warning || '#FFA500', borderColor: '#FF8800' }]}>
              <ThemedText type="small" style={{ color: "#FFF", fontWeight: 'bold', textAlign: 'center' }}>
                {infoMsg}
              </ThemedText>
            </View>
          ) : null}
          
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

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.link, opacity: pressed || isLoading ? 0.8 : 1 },
            ]}
          >
            {isLoading ? <ActivityIndicator color="#FFF" /> : <ThemedText type="body" style={{ color: "#FFF", fontWeight: "bold" }}>Giriş Yap</ThemedText>}
          </Pressable>

          <View style={styles.signupLink}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>Hesabınız yok mu? </ThemedText>
            <Pressable onPress={() => navigation.navigate("Signup")}>
              <ThemedText type="small" style={{ color: theme.link, fontWeight: "bold" }}>Kayıt Ol</ThemedText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoContainer: { alignItems: "center", marginBottom: Spacing.xl },
  formContainer: { gap: Spacing.md, paddingHorizontal: Spacing.lg },
  inputGroup: { gap: 4 },
  input: { height: 50, borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, fontSize: 16 },
  button: { height: 50, borderRadius: BorderRadius.md, alignItems: "center", justifyContent: "center", marginTop: Spacing.sm },
  signupLink: { flexDirection: "row", justifyContent: "center", marginTop: Spacing.md },
  messageBox: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.md },
});