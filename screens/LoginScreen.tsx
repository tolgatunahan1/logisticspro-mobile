import React, { useState, useEffect } from "react";
import { StyleSheet, View, TextInput, Pressable, Image, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import Checkbox from "expo-checkbox";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "../constants/theme";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

const REMEMBER_ME_KEY_ADMIN = "logistics_remember_admin";
const REMEMBER_ME_KEY_USER = "logistics_remember_user";
const REMEMBER_ME_KEY_SIGNUP = "logistics_remember_signup"; // Also check signup key for backward compatibility

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { loginWithFirebase, loginAdmin, createAdmin } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");

  // Load saved credentials on mount or when mode changes
  useEffect(() => {
    loadSavedCredentials();
  }, [isAdminMode]);

  const loadSavedCredentials = async () => {
    try {
      let key = isAdminMode ? REMEMBER_ME_KEY_ADMIN : REMEMBER_ME_KEY_USER;
      let saved = await SecureStore.getItemAsync(key);
      
      // For user mode, also check signup key if main key has no data
      if (!isAdminMode && !saved) {
        saved = await SecureStore.getItemAsync(REMEMBER_ME_KEY_SIGNUP);
        if (saved) key = REMEMBER_ME_KEY_SIGNUP;
      }
      
      console.log("📌 Loading credentials for", key, ":", saved ? "Found" : "Not found");
      if (saved) {
        const { email: savedEmail, password: savedPassword } = JSON.parse(saved);
        console.log("✅ Loaded email:", savedEmail);
        setEmail(savedEmail || "");
        setPassword(savedPassword || "");
        setRememberMe(true);
      } else {
        setEmail("");
        setPassword("");
        setRememberMe(false);
      }
    } catch (error) {
      console.log("❌ Could not load saved credentials:", error);
    }
  };

  const handleModeChange = async (newAdminMode: boolean) => {
    setIsAdminMode(newAdminMode);
    // Load credentials for the new mode
    try {
      let key = newAdminMode ? REMEMBER_ME_KEY_ADMIN : REMEMBER_ME_KEY_USER;
      let saved = await SecureStore.getItemAsync(key);
      
      // For user mode, also check signup key if main key has no data
      if (!newAdminMode && !saved) {
        saved = await SecureStore.getItemAsync(REMEMBER_ME_KEY_SIGNUP);
        if (saved) key = REMEMBER_ME_KEY_SIGNUP;
      }
      
      if (saved) {
        const { email: savedEmail, password: savedPassword } = JSON.parse(saved);
        setEmail(savedEmail || "");
        setPassword(savedPassword || "");
        setRememberMe(true);
      } else {
        setEmail("");
        setPassword("");
        setRememberMe(false);
      }
    } catch (error) {
      console.log("Could not load saved credentials:", error);
      setEmail("");
      setPassword("");
      setRememberMe(false);
    }
  };

  const saveCredentials = async () => {
    try {
      const key = isAdminMode ? REMEMBER_ME_KEY_ADMIN : REMEMBER_ME_KEY_USER;
      if (rememberMe) {
        await SecureStore.setItemAsync(key, JSON.stringify({ email, password }));
        console.log("✅ Credentials saved for", key, ":", email);
      } else {
        await SecureStore.deleteItemAsync(key);
        console.log("🗑️ Credentials deleted for", key);
      }
    } catch (error) {
      console.log("❌ Could not save credentials:", error);
    }
  };

  const handleCreateAdmin = async () => {
    setError("");
    if (!newAdminEmail.trim() || !newAdminPassword.trim()) {
      setError("Email ve şifre gerekli");
      return;
    }

    if (newAdminPassword.length < 8) {
      setError("Şifre en az 8 karakter olmalı");
      return;
    }

    setIsLoading(true);
    try {
      const success = await createAdmin(newAdminEmail, newAdminPassword);
      if (success) {
        Alert.alert("Başarılı", "Admin hesabı oluşturuldu. Giriş yapabilirsiniz.");
        setShowCreateAdmin(false);
        setNewAdminEmail("");
        setNewAdminPassword("");
        setEmail(newAdminEmail);
        setPassword(newAdminPassword);
      } else {
        setError("Admin oluşturma başarısız");
      }
    } catch (error: any) {
      setError(error?.message || "Hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Email ve şifre gerekli");
      return;
    }

    setIsLoading(true);
    try {
      let success = false;
      if (isAdminMode) {
        success = await loginAdmin(email, password);
      } else {
        success = await loginWithFirebase(email, password);
      }
      
      if (success) {
        // Save credentials if remember me is checked
        await saveCredentials();
      } else {
        setError("Email veya şifre yanlış");
      }
    } catch (error: any) {
      const errorMsg = error?.message || "Giriş sırasında hata oluştu";
      // Check if user is not registered
      if (errorMsg.includes("invalid-credential") || errorMsg.includes("henüz onaylanmamıştır")) {
        setError("Lütfen geçerli bir mail adresi veya şifre giriniz. Yoksa kayıt olunuz.");
      } else if (errorMsg.includes("Admin onayı bekleniyor")) {
        setError("Admin onayı bekleniyor. Lütfen kısa bir süre sonra tekrar deneyin.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + Spacing["3xl"], paddingBottom: insets.bottom + Spacing.xl }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText type="h2" style={styles.title}>
            LogisticsPRO
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isAdminMode ? "Admin Paneli" : "Kullanıcı Girişi"}
          </ThemedText>
        </View>

        <View style={[styles.modeToggle, { borderColor: colors.border }]}>
          <Pressable
            onPress={() => handleModeChange(false)}
            disabled={isLoading}
            style={[
              styles.modeButton,
              {
                backgroundColor: !isAdminMode ? theme.link : colors.inputBackground,
                flex: 1,
              },
            ]}
          >
            <ThemedText style={[styles.modeButtonText, { color: !isAdminMode ? "#FFF" : colors.textSecondary }]}>
              Kullanıcı
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => handleModeChange(true)}
            disabled={isLoading}
            style={[
              styles.modeButton,
              {
                backgroundColor: isAdminMode ? theme.link : colors.inputBackground,
                flex: 1,
              },
            ]}
          >
            <ThemedText style={[styles.modeButtonText, { color: isAdminMode ? "#FFF" : colors.textSecondary }]}>
              Admin
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText type="small" style={[styles.label, { color: colors.textSecondary }]}>
              Email
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: theme.text,
                },
              ]}
              placeholder="Email adresiniz"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="small" style={[styles.label, { color: colors.textSecondary }]}>
              Şifre
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: theme.text,
                },
              ]}
              placeholder="Şifre (8+ karakter)"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Remember Me Checkbox */}
          <View style={[styles.rememberMeContainer, { flexDirection: "row", alignItems: "center", gap: Spacing.md }]}>
            <Checkbox
              value={rememberMe}
              onValueChange={setRememberMe}
              color={rememberMe ? theme.link : undefined}
            />
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Beni Hatırla
            </ThemedText>
          </View>

          {error ? (
            <ThemedText type="small" style={[styles.error, { color: colors.destructive }]}>
              {error}
            </ThemedText>
          ) : null}

          {showCreateAdmin ? (
            <>
              <ThemedText type="h4" style={{ textAlign: "center", marginBottom: Spacing.lg, color: theme.link }}>
                Admin Hesabı Oluştur
              </ThemedText>
              <ThemedText type="small" style={{ textAlign: "center", marginBottom: Spacing.lg, color: colors.textSecondary }}>
                İlk admin hesabını oluştur
              </ThemedText>
              <View style={styles.inputContainer}>
                <ThemedText type="small" style={[styles.label, { color: colors.textSecondary }]}>
                  Admin Email
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                      color: theme.text,
                    },
                  ]}
                  placeholder="admin@logisticspro.com"
                  placeholderTextColor={colors.textSecondary}
                  value={newAdminEmail}
                  onChangeText={setNewAdminEmail}
                  editable={!isLoading}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.inputContainer}>
                <ThemedText type="small" style={[styles.label, { color: colors.textSecondary }]}>
                  Admin Şifre
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                      color: theme.text,
                    },
                  ]}
                  placeholder="Şifre (8+ karakter)"
                  placeholderTextColor={colors.textSecondary}
                  value={newAdminPassword}
                  onChangeText={setNewAdminPassword}
                  secureTextEntry
                  editable={!isLoading}
                  autoCapitalize="none"
                />
              </View>
              <Pressable
                onPress={handleCreateAdmin}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: "#10b981",
                    opacity: pressed || isLoading ? 0.8 : 1,
                  },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText type="body" style={[styles.buttonText, { color: "#FFFFFF" }]}>
                    Admin Oluştur
                  </ThemedText>
                )}
              </Pressable>
              <Pressable
                onPress={() => setShowCreateAdmin(false)}
                disabled={isLoading}
                style={[styles.button, { backgroundColor: colors.inputBackground }]}
              >
                <ThemedText type="body" style={{ color: theme.text }}>
                  İptal
                </ThemedText>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: theme.link,
                    opacity: pressed || isLoading ? 0.8 : 1,
                  },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText type="body" style={[styles.buttonText, { color: "#FFFFFF" }]}>
                    Giriş Yap
                  </ThemedText>
                )}
              </Pressable>
            </>
          )}

          {!isAdminMode && (
            <View style={styles.signupLink}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Hesabın yok mu?{" "}
              </ThemedText>
              <Pressable onPress={() => navigation.navigate("Signup")}>
                <ThemedText type="small" style={{ color: theme.link, fontWeight: "600" }}>
                  Kayıt Ol
                </ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["4xl"],
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
  form: {
    gap: Spacing.lg,
  },
  inputContainer: {
    gap: Spacing.xs,
  },
  label: {
    marginLeft: Spacing.xs,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  rememberMeContainer: {
    marginVertical: Spacing.md,
  },
  error: {
    textAlign: "center",
  },
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
  },
  buttonText: {
    fontWeight: "600",
  },
  signupLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.lg,
  },
  modeToggle: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    padding: Spacing.xs,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
  },
  modeButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
});
