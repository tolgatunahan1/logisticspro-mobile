import React, { useState, useEffect } from "react";
import { StyleSheet, View, TextInput, Pressable, Image, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import Checkbox from "expo-checkbox";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import { validatePassword as validatePasswordUtil } from "../utils/userManagement";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useAuth } from "../contexts/AuthContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Signup">;

const REMEMBER_ME_KEY_SIGNUP = "logistics_remember_signup";

export default function SignupScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { registerWithFirebase } = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isFirebaseMode, setIsFirebaseMode] = useState(true);

  const colors = isDark ? Colors.dark : Colors.light;

  // Load saved credentials on mount
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const saved = await SecureStore.getItemAsync(REMEMBER_ME_KEY_SIGNUP);
      if (saved) {
        const { email: savedEmail, password: savedPassword } = JSON.parse(saved);
        setUsername(savedEmail || "");
        setPassword(savedPassword || "");
        setRememberMe(true);
      }
    } catch (error) {
      console.log("Could not load saved credentials:", error);
    }
  };

  const saveCredentials = async () => {
    try {
      if (rememberMe) {
        await SecureStore.setItemAsync(REMEMBER_ME_KEY_SIGNUP, JSON.stringify({ email: username, password }));
      } else {
        await SecureStore.deleteItemAsync(REMEMBER_ME_KEY_SIGNUP);
      }
    } catch (error) {
      console.log("Could not save credentials:", error);
    }
  };

  const checkPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    if (/[!@#$%^&*]/.test(pwd)) strength += 25;
    setPasswordStrength(strength);
  };

  const handleSignup = async () => {
    setError("");

    // Email Validasyonu
    const emailValidation = validateEmail(username);
    if (!emailValidation.isValid) {
      setError(emailValidation.error);
      return;
    }

    if (!password.trim()) {
      setError("Şifre gerekli");
      return;
    }

    // Şifre Validasyonu
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error);
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    setIsLoading(true);
    try {
      const success = await registerWithFirebase(username.trim(), password);
      if (success) {
        // Save credentials if remember me is checked
        await saveCredentials();
        Alert.alert(
          "Başarılı",
          "Hesabınız oluşturuldu! Admin onayı bekleniyor. Onaylandıktan sonra giriş yapabilirsiniz.",
          [{ 
            text: "Anladım", 
            onPress: () => {
              navigation.navigate("Login");
            } 
          }]
        );
      } else {
        setError("Kayıt başarısız oldu");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMsg = error?.message || "Kayıt sırasında hata oluştu";
      if (errorMsg.includes("Firebase yapılandırılmamış")) {
        setError("Firebase kurulu değil. Lütfen FIREBASE_SETUP.md dosyasını okuyun.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + Spacing["3xl"], paddingBottom: insets.bottom + Spacing.xl }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginBottom: Spacing.lg })}
          >
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText type="h2" style={styles.title}>
            Kayıt Ol
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: colors.textSecondary }]}>
            Yeni hesap oluştur
          </ThemedText>
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
              placeholder="Min 8 karakter, 1 büyük harf, 1 rakam"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={(pwd) => {
                setPassword(pwd);
                checkPasswordStrength(pwd);
              }}
              secureTextEntry
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {password.length > 0 && (
              <View style={[styles.strengthBar, { backgroundColor: colors.border, marginTop: Spacing.sm }]}>
                <View
                  style={[
                    styles.strengthFill,
                    {
                      width: `${passwordStrength}%`,
                      backgroundColor:
                        passwordStrength < 50
                          ? colors.destructive
                          : passwordStrength < 75
                          ? colors.warning
                          : colors.success,
                    },
                  ]}
                />
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="small" style={[styles.label, { color: colors.textSecondary }]}>
              Şifre Onayla
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
              placeholder="Şifrenizi tekrar girin"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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

          <Pressable
            onPress={handleSignup}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: colors.link,
                opacity: isLoading || pressed ? 0.7 : 1,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText type="body" style={styles.buttonText}>
                Kayıt Ol
              </ThemedText>
            )}
          </Pressable>

          <View style={styles.loginLink}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Zaten hesabın var mı?{" "}
            </ThemedText>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <ThemedText type="small" style={{ color: colors.link, fontWeight: "600" }}>
                Giriş Yap
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
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
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
    gap: Spacing.sm,
  },
  label: {
    fontWeight: "500",
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 16,
  },
  rememberMeContainer: {
    marginVertical: Spacing.md,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  error: {
    textAlign: "center",
  },
  button: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "600",
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.lg,
  },
});
