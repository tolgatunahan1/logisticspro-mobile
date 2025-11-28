import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { ScreenScrollView } from "../components/ScreenScrollView";
import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import { getCompletedJobs, markCommissionAsPaid, CompanyWallet, CompletedJob } from "../utils/storage";

export default function WalletScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const colors = isDark ? Colors.dark : Colors.light;
  const { firebaseUser } = useAuth();

  const [paidTotal, setPaidTotal] = useState<number>(0);
  const [unpaidTotal, setUnpaidTotal] = useState<number>(0);
  const [unpaidCommissions, setUnpaidCommissions] = useState<CompletedJob[]>([]);
  const [isMarkingPaid, setIsMarkingPaid] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!firebaseUser?.uid) {
      console.log("❌ No firebaseUser.uid in WalletScreen");
      return;
    }

    console.log("📊 Loading wallet data for:", firebaseUser.uid);
    
    try {
      const allJobs = await getCompletedJobs(firebaseUser.uid);
      console.log("📦 Got jobs:", allJobs.length);

      // Calculate paid and unpaid totals
      const paid = allJobs.reduce((sum, job) => {
        if (job.commissionPaid && job.commissionCost) {
          return sum + parseFloat(job.commissionCost as string);
        }
        return sum;
      }, 0);

      const unpaid = allJobs.reduce((sum, job) => {
        if (!job.commissionPaid && job.commissionCost) {
          return sum + parseFloat(job.commissionCost as string);
        }
        return sum;
      }, 0);

      const unpaidJobs = allJobs.filter(job => !job.commissionPaid);

      console.log("✅ Paid:", paid, "Unpaid:", unpaid, "Unpaid jobs:", unpaidJobs.length);
      
      setPaidTotal(paid);
      setUnpaidTotal(unpaid);
      setUnpaidCommissions(unpaidJobs);
    } catch (error) {
      console.error("❌ Error loading wallet data:", error);
    }
  }, [firebaseUser?.uid]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleMarkAsPaid = async (jobId: string) => {
    if (!firebaseUser?.uid) return;
    setIsMarkingPaid(jobId);
    const result = await markCommissionAsPaid(firebaseUser.uid, jobId, true);
    if (result) {
      await loadData();
      Alert.alert("Başarılı", "Komisyon ödendi olarak işaretlendi");
    } else {
      Alert.alert("Hata", "İşlem başarısız oldu");
    }
    setIsMarkingPaid(null);
  };

  return (
    <ScreenScrollView>
      {/* Header Stats */}
      <View style={[styles.statsContainer, { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg }]}>
        <View style={{ gap: Spacing.md }}>
          {/* Bekleyen Ödemeler Bakiyesi Card */}
          <View
            style={[
              styles.balanceCard,
              {
                backgroundColor: isDark
                  ? "rgba(234, 179, 8, 0.15)"
                  : "rgba(234, 179, 8, 0.08)",
                borderColor: isDark
                  ? "rgba(234, 179, 8, 0.3)"
                  : "rgba(234, 179, 8, 0.2)",
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText type="small" style={{ color: colors.textSecondary, marginBottom: Spacing.xs }}>
                Bekleyen Ödemeler Bakiyesi
              </ThemedText>
              <ThemedText type="h2" style={{ color: "#EAB308", fontWeight: "700" }}>
                {unpaidTotal.toFixed(2)} ₺
              </ThemedText>
            </View>
            <View style={[styles.statsIcon, { backgroundColor: "#EAB308" }]}>
              <Feather name="clock" size={20} color="#FFFFFF" />
            </View>
          </View>

          {/* Ödenen Bakiye Card */}
          <View
            style={[
              styles.balanceCard,
              {
                backgroundColor: isDark
                  ? "rgba(34, 197, 94, 0.15)"
                  : "rgba(34, 197, 94, 0.08)",
                borderColor: isDark
                  ? "rgba(34, 197, 94, 0.3)"
                  : "rgba(34, 197, 94, 0.2)",
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText type="small" style={{ color: colors.textSecondary, marginBottom: Spacing.xs }}>
                Ödenen Bakiye
              </ThemedText>
              <ThemedText type="h3" style={{ color: "#22C55E", fontWeight: "700" }}>
                {paidTotal.toFixed(2)} ₺
              </ThemedText>
            </View>
            <View style={[styles.statsIcon, { backgroundColor: "#22C55E" }]}>
              <ThemedText style={{ fontSize: 18, fontWeight: "700", color: "#FFFFFF" }}>₺</ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Pending Payments Section */}
      <View style={[styles.section, { marginTop: Spacing.xl }]}>
        {/* Section Header */}
        <View style={[styles.sectionHeader, { paddingHorizontal: Spacing.lg }]}>
          <ThemedText type="h4" style={{ fontWeight: "700" }}>
            Bekleyen Ödemeler
          </ThemedText>
          {unpaidCommissions.length > 0 && (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.destructive },
              ]}
            >
              <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                {unpaidCommissions.length}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Table */}
        {unpaidCommissions.length > 0 ? (
          <View style={[styles.tableContainer, { marginHorizontal: Spacing.lg }]}>
            {/* Table Header */}
            <View
              style={[
                styles.tableHeader,
                {
                  backgroundColor: isDark
                    ? "rgba(0, 0, 0, 0.3)"
                    : "rgba(0, 0, 0, 0.05)",
                  borderTopLeftRadius: BorderRadius.md,
                  borderTopRightRadius: BorderRadius.md,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={[styles.tableHeaderCell, { flex: 2, fontWeight: "600" }]}
              >
                Rota
              </ThemedText>
              <ThemedText
                type="small"
                style={[styles.tableHeaderCell, { flex: 1, fontWeight: "600", textAlign: "right" }]}
              >
                Komisyon
              </ThemedText>
              <ThemedText
                type="small"
                style={[styles.tableHeaderCell, { flex: 1, fontWeight: "600", textAlign: "center" }]}
              >
                İşlem
              </ThemedText>
            </View>

            {/* Table Rows */}
            {unpaidCommissions.map((job, index) => (
              <View
                key={job.id}
                style={[
                  styles.tableRow,
                  {
                    backgroundColor: colors.backgroundDefault,
                    borderBottomWidth: index < unpaidCommissions.length - 1 ? 1 : 0,
                    borderBottomColor: isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.05)",
                    borderBottomLeftRadius: index === unpaidCommissions.length - 1 ? BorderRadius.md : 0,
                    borderBottomRightRadius: index === unpaidCommissions.length - 1 ? BorderRadius.md : 0,
                  },
                ]}
              >
                {/* Route Info */}
                <View style={{ flex: 2 }}>
                  <ThemedText type="small" style={{ fontWeight: "600", marginBottom: Spacing.xs }}>
                    {job.cargoType}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                    {job.loadingLocation} → {job.deliveryLocation}
                  </ThemedText>
                </View>

                {/* Commission Amount */}
                <ThemedText
                  type="body"
                  style={[
                    { flex: 1, textAlign: "right", color: theme.link, fontWeight: "700" },
                  ]}
                >
                  {parseFloat(job.commissionCost).toFixed(2)} ₺
                </ThemedText>

                {/* Action Button */}
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Pressable
                    onPress={() => handleMarkAsPaid(job.id)}
                    disabled={isMarkingPaid === job.id}
                    style={({ pressed }) => [
                      styles.payButton,
                      {
                        backgroundColor: theme.link,
                        opacity: pressed || isMarkingPaid === job.id ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Feather
                      name={isMarkingPaid === job.id ? "loader" : "check"}
                      size={14}
                      color="#FFFFFF"
                    />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { marginHorizontal: Spacing.lg }]}>
            <Feather name="check-circle" size={48} color={colors.textSecondary} />
            <ThemedText type="body" style={{ color: colors.textSecondary, marginTop: Spacing.md }}>
              Tüm ödemeler tamamlanmıştır
            </ThemedText>
          </View>
        )}
      </View>


      <View style={{ height: Spacing.xl }} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    gap: Spacing.md,
  },
  balanceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  tableContainer: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    alignItems: "center",
  },
  tableHeaderCell: {
    color: "rgba(0, 0, 0, 0.6)",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    alignItems: "center",
  },
  payButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  transactionList: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
});
