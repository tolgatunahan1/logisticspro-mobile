import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { getCarriers, getCompanies } from "@/utils/storage";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  
  const [carrierCount, setCarrierCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);

  const colors = isDark ? Colors.dark : Colors.light;

  const loadCounts = useCallback(async () => {
    const carriers = await getCarriers();
    const companies = await getCompanies();
    setCarrierCount(carriers.length);
    setCompanyCount(companies.length);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCounts();
    }, [loadCounts])
  );

  const handleSettingsPress = () => {
    navigation.navigate("Settings");
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleSettingsPress}
          style={({ pressed }) => [
            styles.headerButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Feather name="settings" size={22} color={theme.text} />
        </Pressable>
      ),
    });
  }, [navigation, theme]);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.content, { paddingTop: headerHeight + Spacing.xl }]}>
        <Pressable
          onPress={() => navigation.navigate("CarrierList")}
          style={({ pressed }) => [
            styles.menuCard,
            {
              backgroundColor: colors.backgroundDefault,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: theme.link }]}>
            <Feather name="truck" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.menuCardContent}>
            <ThemedText type="h3">Nakliyeciler</ThemedText>
            <ThemedText type="body" style={{ color: colors.textSecondary }}>
              {carrierCount} kayıt
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={24} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("CompanyList")}
          style={({ pressed }) => [
            styles.menuCard,
            {
              backgroundColor: colors.backgroundDefault,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.success }]}>
            <Feather name="briefcase" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.menuCardContent}>
            <ThemedText type="h3">Firmalar</ThemedText>
            <ThemedText type="body" style={{ color: colors.textSecondary }}>
              {companyCount} kayıt
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  menuCardContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  headerButton: {
    padding: Spacing.sm,
  },
});
