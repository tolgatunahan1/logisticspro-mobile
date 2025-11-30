import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Modal, ScrollView, Image } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { LiftPressable } from "../components/LiftPressable";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList } from "../navigation/RootNavigator";
import { getCarriers, getCompanies, getJobs, getCompletedJobs, CompletedJob } from "../utils/storage";
import { Spacing, BorderRadius, Colors, APP_CONSTANTS } from "../constants/theme";
const formatCurrency = (amount: number): string => {
  return amount.toFixed(2).replace(".", ",");
};

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
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [weeklyRevenue, setWeeklyRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [pendingCommissions, setPendingCommissions] = useState(0);
  const [paidCommissions, setPaidCommissions] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { firebaseUser } = useAuth();

  const colors = isDark ? Colors.dark : Colors.light;

  const calculateRevenueData = (completedJobs: CompletedJob[]) => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    let total = 0, weekly = 0, monthly = 0, pending = 0, paid = 0;

    completedJobs.forEach(job => {
      const amount = parseFloat(job.commissionCost || "0");
      total += amount;
      if (job.completionDate >= oneMonthAgo) monthly += amount;
      if (job.completionDate >= oneWeekAgo) weekly += amount;
      if (job.commissionPaid) paid += amount;
      else pending += amount;
    });

    return { total, weekly, monthly, pending, paid };
  };

  const loadCounts = useCallback(async () => {
    if (!firebaseUser?.uid) return;
    const carriers = await getCarriers(firebaseUser.uid);
    const companies = await getCompanies(firebaseUser.uid);
    const jobs = await getJobs(firebaseUser.uid);
    const completedJobs = await getCompletedJobs(firebaseUser.uid);
    
    setCarrierCount(carriers.length);
    setCompanyCount(companies.length);
    setJobCount(jobs.length);
    setCompletedJobCount(completedJobs.length);
    
    const revenue = calculateRevenueData(completedJobs);
    setTotalRevenue(revenue.total);
    setWeeklyRevenue(revenue.weekly);
    setMonthlyRevenue(revenue.monthly);
    setPendingCommissions(revenue.pending);
    setPaidCommissions(revenue.paid);
  }, [firebaseUser?.uid]);

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
      headerTitle: "LogisticsPRO",
      headerLeft: () => (
        <Pressable
          onPress={() => setDrawerVisible(true)}
          style={({ pressed }) => [
            styles.headerButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Feather name="menu" size={APP_CONSTANTS.ICON_SIZE_MEDIUM} color={theme.text} />
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
          <Feather name="settings" size={APP_CONSTANTS.ICON_SIZE_MEDIUM} color={theme.text} />
        </Pressable>
      ),
    });
  }, [navigation, theme]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.xl, paddingBottom: Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={{ justifyContent: "center", alignItems: "center", marginBottom: Spacing.lg }}>
          <Image
            source={require("../assets/images/IMG_6804.png")}
            style={{ width: APP_CONSTANTS.LOGO_SIZE, height: APP_CONSTANTS.LOGO_SIZE }}
          />
        </View>

        {/* Hero Text */}
        <View style={styles.heroSection}>
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

        {/* Stats Cards - Row 1 */}
        <View style={styles.statsContainer}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.backgroundDefault,
                borderLeftColor: theme.link,
              },
            ]}
          >
            <Feather name="truck" size={24} color={theme.link} />
            <View style={styles.statContent}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Taşıyıcı
              </ThemedText>
              <AnimatedCounter value={carrierCount} type="h3" />
            </View>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.backgroundDefault,
                borderLeftColor: colors.success,
              },
            ]}
          >
            <Feather name="briefcase" size={24} color={colors.success} />
            <View style={styles.statContent}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Firma
              </ThemedText>
              <AnimatedCounter value={companyCount} type="h3" />
            </View>
          </View>
        </View>

        {/* Stats Cards - Row 2 */}
        <View style={styles.statsContainer}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.backgroundDefault,
                borderLeftColor: colors.warning,
              },
            ]}
          >
            <Feather name="calendar" size={24} color={colors.warning} />
            <View style={styles.statContent}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Sefer
              </ThemedText>
              <AnimatedCounter value={jobCount} type="h3" />
            </View>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.backgroundDefault,
                borderLeftColor: colors.success,
              },
            ]}
          >
            <Feather name="check-circle" size={24} color={colors.success} />
            <View style={styles.statContent}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Tamamlanan
              </ThemedText>
              <AnimatedCounter value={completedJobCount} type="h3" />
            </View>
          </View>
        </View>


        {/* Menu Cards */}
        <ThemedText type="h4" style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          Hızlı Erişim
        </ThemedText>

        <LiftPressable
          onPress={() => navigation.navigate("CarrierList")}
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.backgroundDefault,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.link, borderRadius: 16 },
            ]}
          >
            <Feather name="truck" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.menuCardContent}>
            <ThemedText type="h3">Nakliyeciler</ThemedText>
            <ThemedText type="body" style={{ color: colors.textSecondary }}>
              {carrierCount} kayıt
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={24} color={colors.textSecondary} />
        </LiftPressable>

        <LiftPressable
          onPress={() => navigation.navigate("CompanyList")}
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.backgroundDefault,
              borderRadius: 0,
              marginTop: 0,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.success, borderRadius: 16 },
            ]}
          >
            <Feather name="briefcase" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.menuCardContent}>
            <ThemedText type="h3">Firmalar</ThemedText>
            <ThemedText type="body" style={{ color: colors.textSecondary }}>
              {companyCount} kayıt
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={24} color={colors.textSecondary} />
        </LiftPressable>

        <LiftPressable
          onPress={() => navigation.navigate("JobList")}
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.backgroundDefault,
              borderRadius: 0,
              marginTop: 0,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.warning, borderRadius: 16 },
            ]}
          >
            <Feather name="calendar" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.menuCardContent}>
            <ThemedText type="h3">Yeni Sefer Programı</ThemedText>
            <ThemedText type="body" style={{ color: colors.textSecondary }}>
              {jobCount} sefer
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={24} color={colors.textSecondary} />
        </LiftPressable>

        <LiftPressable
          onPress={() => navigation.navigate("CompletedJobList")}
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.backgroundDefault,
              borderRadius: 0,
              marginTop: 0,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.success, borderRadius: 16 },
            ]}
          >
            <Feather name="check-circle" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.menuCardContent}>
            <ThemedText type="h3">Gerçekleşen Seferler</ThemedText>
            <ThemedText type="body" style={{ color: colors.textSecondary }}>
              {completedJobCount} sefer
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={24} color={colors.textSecondary} />
        </LiftPressable>
      </ScrollView>

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
                <Feather name="calendar" size={20} color={Colors.light.warning} />
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
    alignItems: "center",
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  heroTitle: {
    textAlign: "center",
  },
  heroSubtitle: {
    textAlign: "center",
    marginHorizontal: Spacing.lg,
  },
  statsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    gap: Spacing.md,
  },
  statContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  sectionHeader: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
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
  drawerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(6px)",
  },
  drawerContent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "75%",
    maxWidth: 300,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
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
  revenueCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.1)",
    backdropFilter: "blur(10px)",
  },
  commissionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    borderRightColor: "rgba(255, 255, 255, 0.2)",
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
});
