import React, { useState, useEffect } from "react";
import { StyleSheet, View, TextInput, Pressable, Image, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getAdmin, createAdmin, requestSignup, validatePassword } from "@/utils/userManagement";

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
    checkAdminExists();
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
      const success = isAdmin ? await loginAdmin(username, password) : await loginUser(username, password);
      if (!success) {
        setError("Giriş başarısız. Bilgileri kontrol edin.");
      }
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

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + Spacing["3xl"], paddingBottom: insets.bottom + Spacing.xl }]}>
      <View style={styles.content}>
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
            Devam etmek için giriş yapın
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
              placeholder="Kullanıcı adınızı girin"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
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
              placeholder="Şifrenizi girin"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {error ? (
            <ThemedText type="small" style={[styles.error, { color: colors.destructive }]}>
              {error}
            </ThemedText>
          ) : null}

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: theme.link,
                opacity: pressed || isLoading ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.buttonText} />
            ) : (
              <ThemedText type="body" style={[styles.buttonText, { color: colors.buttonText }]}>
                Giriş Yap
              </ThemedText>
            )}
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flex: 1,
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
  buttonText: {
    fontWeight: "600",
  },
});
