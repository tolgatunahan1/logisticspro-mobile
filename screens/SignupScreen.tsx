import React, { useState, useEffect } from "react";
import { StyleSheet, View, TextInput, Pressable, Image, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import { requestSignup, validatePassword } from "../utils/userManagement";
import { RootStackParamList } from "../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Signup">;

export default function SignupScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const colors = isDark ? Colors.dark : Colors.light;

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

    if (!username.trim()) {
      setError("Kullanıcı adı gerekli");
      return;
    }

    if (username.length < 3) {
      setError("Kullanıcı adı en az 3 karakter olmalı");
      return;
    }

    if (!password.trim()) {
      setError("Şifre gerekli");
      return;
    }

    if (!validatePassword(password)) {
      setError("Şifre: min 8 char, 1 büyük harf, 1 rakam");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    setIsLoading(true);
    try {
      const success = await requestSignup(username.trim(), password);

      if (success) {
        Alert.alert(
          "Başarılı",
          "Kayıt talebiniz alınmıştır. Admin onayı bekleniyor.",
          [{ text: "Tamam", onPress: () => navigation.navigate("Login") }]
        );
      } else {
        setError("Bu kullanıcı adı zaten kullanılıyor");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Kayıt sırasında hata oluştu");
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
  strengthBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
  },
  error: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
  button: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  buttonText: {
    color: "white",
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
