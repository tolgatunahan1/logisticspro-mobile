import React, { useState, useEffect } from "react";
import { StyleSheet, View, TextInput, Pressable, Image, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getAdmin, createAdmin, requestSignup, validatePassword, initializeDefaultAdmin } from "@/utils/userManagement";

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { loginUser, loginAdmin } = useAuth();
  
  const [mode, setMode] = useState<"login" | "register" | "admin" | "setup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      await initializeDefaultAdmin();
      await checkAdminExists();
    };
    init();
  }, []);

  const checkAdminExists = async () => {
    try {
      const admin = await getAdmin();
      setMode(admin ? "login" : "setup");
    } catch (error) {
      setMode("login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupAdmin = async () => {
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Tüm alanlar gerekli");
      return;
    }
    if (!validatePassword(password)) {
      setError("Şifre: 8+ karakter, büyük harf ve rakam gerekli");
      return;
    }

    setIsLoading(true);
    try {
      const success = await createAdmin(username, password);
      if (success) {
        setMode("login");
        setUsername("");
        setPassword("");
        Alert.alert("Başarılı", "Admin hesabı oluşturuldu");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (isAdmin: boolean) => {
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Kullanıcı adı ve şifre gerekli");
      return;
    }

    setIsLoading(true);
    try {
      let success = false;
      if (isAdmin) {
        console.log("Admin login attempt:", username);
        success = await loginAdmin(username, password);
        console.log("Admin login result:", success);
      } else {
        console.log("User login attempt:", username);
        success = await loginUser(username, password);
        console.log("User login result:", success);
      }
      
      if (!success) {
        setError(isAdmin ? "Admin bilgileri yanlış" : "Onaylanmamış kullanıcı veya yanlış şifre");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Giriş sırasında hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Tüm alanlar gerekli");
      return;
    }
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }
    if (!validatePassword(password)) {
      setError("Şifre: 8+ karakter, büyük harf ve rakam gerekli");
      return;
    }

    setIsLoading(true);
    try {
      const success = await requestSignup(username, password);
      if (success) {
        Alert.alert("Başarılı", "Başvurunuz alındı. Admin onayını bekleyin.");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setMode("login");
      } else {
        setError("Kullanıcı adı zaten mevcut");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const colors = isDark ? Colors.dark : Colors.light;

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.link} />
      </ThemedView>
    );
  }

  const getTitle = () => {
    if (mode === "setup") return "Admin Hesabı Oluştur";
    if (mode === "register") return "Kayıt Ol";
    if (mode === "admin") return "Admin Girişi";
    return "Giriş Yap";
  };

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
            {getTitle()}
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText type="small" style={[styles.label, { color: colors.textSecondary }]}>
              Kullanıcı Adı
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
              placeholder="Kullanıcı adınız"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
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
              placeholder="Şifre (8+ karakter, büyük harf, rakam)"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {(mode === "setup" || mode === "register") && (
            <View style={styles.inputContainer}>
              <ThemedText type="small" style={[styles.label, { color: colors.textSecondary }]}>
                Şifre (Tekrar)
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
                placeholder="Şifre tekrar"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!isLoading}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          {error ? (
            <ThemedText type="small" style={[styles.error, { color: colors.destructive }]}>
              {error}
            </ThemedText>
          ) : null}

          <Pressable
            onPress={() => {
              if (mode === "setup") handleSetupAdmin();
              else if (mode === "register") handleRegister();
              else if (mode === "admin") handleLogin(true);
              else handleLogin(false);
            }}
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
                {mode === "setup" ? "Admin Oluştur" : mode === "register" ? "Kayıt Ol" : "Giriş Yap"}
              </ThemedText>
            )}
          </Pressable>

          {mode === "login" && (
            <View style={{ gap: Spacing.md, marginTop: Spacing.lg }}>
              <Pressable
                onPress={() => {
                  setMode("register");
                  setError("");
                  setUsername("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                style={({ pressed }) => [styles.secondaryButton, { opacity: pressed ? 0.6 : 1 }]}
              >
                <ThemedText type="body" style={[styles.buttonText, { color: theme.link }]}>
                  Kayıt Ol
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => {
                  setMode("admin");
                  setError("");
                  setUsername("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                style={({ pressed }) => [styles.secondaryButton, { opacity: pressed ? 0.6 : 1 }]}
              >
                <ThemedText type="body" style={[styles.buttonText, { color: theme.link }]}>
                  Admin Girişi
                </ThemedText>
              </Pressable>
            </View>
          )}

          {mode !== "login" && (
            <Pressable
              onPress={() => {
                setMode("login");
                setError("");
                setUsername("");
                setPassword("");
                setConfirmPassword("");
              }}
              style={{ marginTop: Spacing.lg }}
            >
              <ThemedText type="small" style={{ color: theme.link, textAlign: "center", fontWeight: "600" }}>
                Giriş Sayfasına Dön
              </ThemedText>
            </Pressable>
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
    width: 80,
    height: 80,
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
  secondaryButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  buttonText: {
    fontWeight: "600",
  },
});
