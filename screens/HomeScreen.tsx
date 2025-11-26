import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Modal } from "react-native";
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
          <Feather name="menu" size={22} color={theme.text} />
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
                  <ThemedText type="body">Planlanan İşler</ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary }}>
                    {jobCount} iş
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
                  <ThemedText type="body">Gerçekleşen İşler</ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary }}>
                    {completedJobCount} iş
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
