import React, { useState, useEffect } from "react";
import { StyleSheet, View, TextInput, Pressable, Image, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import { initializeDefaultAdmin } from "../utils/userManagement";
import { firebaseAuthService } from "../utils/firebaseAuth";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { loginUser, loginAdmin, loginWithFirebase } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isFirebaseMode, setIsFirebaseMode] = useState(true); // Default: Firebase (normal users)

  useEffect(() => {
    const init = async () => {
      try {
        // Setup Firebase admin if not already done
        await firebaseAuthService.initializeAdmin("admin@logisticspro.com", "Admin1234");
        // Also setup local admin for backwards compatibility
        await initializeDefaultAdmin();
      } catch (error) {
        console.error("Admin init error:", error);
      }
    };
    init();
  }, []);

  const handleLogin = async () => {
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Email/Kullanıcı adı ve şifre gerekli");
      return;
    }

    setIsLoading(true);
    try {
      let success = false;
      if (isFirebaseMode) {
        // Firebase login with email
        success = await loginWithFirebase(username, password);
      } else if (isAdminMode) {
        // Admin mode - only try admin login
        success = await loginAdmin(username, password);
      } else {
        // User mode - only try user login
        success = await loginUser(username, password);
      }
      
      if (!success) {
        if (isFirebaseMode) {
          setError("Email veya şifre yanlış");
        } else {
          setError(isAdminMode ? "Admin şifresi yanlış" : "Onaylanmamış kullanıcı veya yanlış şifre");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMsg = error?.message || "Giriş sırasında hata oluştu";
      if (errorMsg.includes("Firebase yapılandırılmamış")) {
        setError("Firebase kurulu değil. Lütfen FIREBASE_SETUP.md dosyasını okuyun.");
      } else if (isFirebaseMode) {
        if (errorMsg.includes("onaylanmamıştır")) {
          setError("Admin onayı bekleniyor. Lütfen daha sonra tekrar deneyin.");
        } else {
          setError(errorMsg);
        }
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
            onPress={() => { setIsAdminMode(false); setIsFirebaseMode(true); }}
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
            onPress={() => { setIsAdminMode(true); setIsFirebaseMode(false); }}
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
              placeholder={isAdminMode ? "admin@logisticspro.com" : "Email adresiniz"}
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
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
