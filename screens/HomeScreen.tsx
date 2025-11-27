import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Modal, ScrollView, Dimensions } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { getCarriers, getCompanies, getJobs, getCompletedJobs } from "@/utils/storage";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { AnimatedMap } from "@/components/AnimatedMap";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  
  const [carrierCount, setCarrierCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [completedJobCount, setCompletedJobCount] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const colors = isDark ? Colors.dark : Colors.light;

  const loadCounts = useCallback(async () => {
    const carriers = await getCarriers();
    const companies = await getCompanies();
    const jobs = await getJobs();
    const completedJobs = await getCompletedJobs();
    setCarrierCount(carriers.length);
    setCompanyCount(companies.length);
    setJobCount(jobs.length);
    setCompletedJobCount(completedJobs.length);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCounts();
    }, [loadCounts])
  );

  const handleSettingsPress = () => {
    navigation.navigate("Settings");
  };

  const handleMenuPress = (screen: "CarrierList" | "CompanyList") => {
    setDrawerVisible(false);
    navigation.navigate(screen);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => setDrawerVisible(true)}
          style={({ pressed }) => [
            styles.headerButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Feather name="menu" size={24} color={theme.text} />
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={handleSettingsPress}
          style={({ pressed }) => [
            styles.headerButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Feather name="settings" size={24} color={theme.text} />
        </Pressable>
      ),
    });
  }, [navigation, theme]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: Spacing.xl + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.heroBg, { backgroundColor: theme.link + "15" }]}>
            <AnimatedMap />
            <ThemedText type="h2" style={styles.heroTitle}>
              Nakliye Yönetimine Hoşgeldiniz
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.heroSubtitle, { color: colors.textSecondary }]}
            >
              Tüm sevkiyatlarınızı ve taşıyıcılarınızı kolayca yönetin
            </ThemedText>
          </View>
        </View>

        {/* Stats Grid - 2x2 Modern Design */}
        <View style={styles.statsGrid}>
          {/* Taşıyıcılar */}
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: theme.link + "10",
                borderColor: theme.link,
              },
            ]}
          >
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: theme.link + "20" },
              ]}
            >
              <Feather name="truck" size={28} color={theme.link} />
            </View>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Taşıyıcı
            </ThemedText>
            <ThemedText type="h2" style={{ fontWeight: "700" }}>
              {carrierCount}
            </ThemedText>
          </View>

          {/* Firmalar */}
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.success + "10",
                borderColor: colors.success,
              },
            ]}
          >
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: colors.success + "20" },
              ]}
            >
              <Feather name="briefcase" size={28} color={colors.success} />
            </View>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Firma
            </ThemedText>
            <ThemedText type="h2" style={{ fontWeight: "700" }}>
              {companyCount}
            </ThemedText>
          </View>

          {/* Sefer Programı */}
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.warning + "10",
                borderColor: colors.warning,
              },
            ]}
          >
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: colors.warning + "20" },
              ]}
            >
              <Feather name="calendar" size={28} color={colors.warning} />
            </View>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Sefer Programı
            </ThemedText>
            <ThemedText type="h2" style={{ fontWeight: "700" }}>
              {jobCount}
            </ThemedText>
          </View>

          {/* Tamamlanan Seferler */}
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.success + "10",
                borderColor: colors.success,
              },
            ]}
          >
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: colors.success + "20" },
              ]}
            >
              <Feather name="check-circle" size={28} color={colors.success} />
            </View>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Tamamlanan
            </ThemedText>
            <ThemedText type="h2" style={{ fontWeight: "700" }}>
              {completedJobCount}
            </ThemedText>
          </View>
        </View>

        {/* Quick Access Section */}
        <ThemedText
          type="h4"
          style={[styles.sectionHeader, { color: colors.text, marginTop: Spacing.xl }]}
        >
          Hızlı Erişim
        </ThemedText>

        {/* Menu Cards - Modern Stack */}
        <View style={styles.menuStack}>
          <Pressable
            onPress={() => navigation.navigate("CarrierList")}
            style={({ pressed }) => [
              styles.modernMenuCard,
              {
                backgroundColor: colors.backgroundDefault,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
                borderTopColor: theme.link,
              },
            ]}
          >
            <View style={styles.menuCardRow}>
              <View
                style={[
                  styles.modernIconContainer,
                  { backgroundColor: theme.link + "15" },
                ]}
              >
                <Feather name="truck" size={24} color={theme.link} />
              </View>
              <View style={styles.modernMenuContent}>
                <ThemedText type="h4" style={{ fontWeight: "700" }}>
                  Nakliyeciler
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  {carrierCount} kayıt
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </View>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("CompanyList")}
            style={({ pressed }) => [
              styles.modernMenuCard,
              {
                backgroundColor: colors.backgroundDefault,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
                borderTopColor: colors.success,
              },
            ]}
          >
            <View style={styles.menuCardRow}>
              <View
                style={[
                  styles.modernIconContainer,
                  { backgroundColor: colors.success + "15" },
                ]}
              >
                <Feather name="briefcase" size={24} color={colors.success} />
              </View>
              <View style={styles.modernMenuContent}>
                <ThemedText type="h4" style={{ fontWeight: "700" }}>
                  Firmalar
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  {companyCount} kayıt
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </View>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("JobList")}
            style={({ pressed }) => [
              styles.modernMenuCard,
              {
                backgroundColor: colors.backgroundDefault,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
                borderTopColor: colors.warning,
              },
            ]}
          >
            <View style={styles.menuCardRow}>
              <View
                style={[
                  styles.modernIconContainer,
                  { backgroundColor: colors.warning + "15" },
                ]}
              >
                <Feather name="calendar" size={24} color={colors.warning} />
              </View>
              <View style={styles.modernMenuContent}>
                <ThemedText type="h4" style={{ fontWeight: "700" }}>
                  Yeni Sefer Programı
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  {jobCount} sefer
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </View>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("CompletedJobList")}
            style={({ pressed }) => [
              styles.modernMenuCard,
              {
                backgroundColor: colors.backgroundDefault,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
                borderTopColor: colors.success,
                borderBottomLeftRadius: BorderRadius.xl,
                borderBottomRightRadius: BorderRadius.xl,
              },
            ]}
          >
            <View style={styles.menuCardRow}>
              <View
                style={[
                  styles.modernIconContainer,
                  { backgroundColor: colors.success + "15" },
                ]}
              >
                <Feather name="check-circle" size={24} color={colors.success} />
              </View>
              <View style={styles.modernMenuContent}>
                <ThemedText type="h4" style={{ fontWeight: "700" }}>
                  Gerçekleşen Seferler
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  {completedJobCount} sefer
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </View>
          </Pressable>
        </View>
      </ScrollView>

      {/* Drawer Menu */}
      <Modal
        visible={drawerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDrawerVisible(false)}
      >
        <Pressable
          style={styles.drawerOverlay}
          onPress={() => setDrawerVisible(false)}
        >
          <View style={[styles.drawerContent, { backgroundColor: theme.backgroundRoot }]}>
            <View style={[styles.drawerHeader, { paddingTop: insets.top + Spacing.lg }]}>
              <Pressable onPress={() => setDrawerVisible(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.drawerBody}>
              <ThemedText type="h3" style={styles.sectionTitle}>
                Kayıt
              </ThemedText>

              <Pressable
                onPress={() => handleMenuPress("CarrierList")}
                style={({ pressed }) => [
                  styles.drawerItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather name="truck" size={20} color={theme.link} />
                <View style={{ flex: 1 }}>
                  <ThemedText type="body">Nakliyeciler</ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary }}>
                    {carrierCount} kayıt
                  </ThemedText>
                </View>
              </Pressable>

              <Pressable
                onPress={() => handleMenuPress("CompanyList")}
                style={({ pressed }) => [
                  styles.drawerItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather name="briefcase" size={20} color={colors.success} />
                <View style={{ flex: 1 }}>
                  <ThemedText type="body">Firmalar</ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary }}>
                    {companyCount} kayıt
                  </ThemedText>
                </View>
              </Pressable>

              <ThemedText type="h3" style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>
                Program
              </ThemedText>

              <Pressable
                onPress={() => {
                  setDrawerVisible(false);
                  navigation.navigate("JobList");
                }}
                style={({ pressed }) => [
                  styles.drawerItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather name="calendar" size={20} color={colors.warning} />
                <View style={{ flex: 1 }}>
                  <ThemedText type="body">Yeni Sefer Programı</ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary }}>
                    {jobCount} sefer
                  </ThemedText>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  setDrawerVisible(false);
                  navigation.navigate("CompletedJobList");
                }}
                style={({ pressed }) => [
                  styles.drawerItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather name="check-circle" size={20} color={colors.success} />
                <View style={{ flex: 1 }}>
                  <ThemedText type="body">Gerçekleşen Seferler</ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary }}>
                    {completedJobCount} sefer
                  </ThemedText>
                </View>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  heroSection: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  heroBg: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.md,
  },
  heroTitle: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
  },
  heroSubtitle: {
    textAlign: "center",
    marginHorizontal: Spacing.lg,
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: "48%",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    gap: Spacing.md,
    justifyContent: "center",
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  menuStack: {
    gap: 0,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  modernMenuCard: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 3,
    borderRadius: 0,
  },
  menuCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  modernIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modernMenuContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawerContent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "75%",
    maxWidth: 300,
  },
  drawerHeader: {
    alignItems: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  drawerBody: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
});
