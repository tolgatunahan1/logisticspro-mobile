import React, { useState, useCallback, useMemo } from "react";
import { StyleSheet, View, Pressable, Alert, FlatList, useWindowDimensions, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { Spacing, BorderRadius, Colors, APP_CONSTANTS } from "../constants/theme";
import { getCompletedJobs, markCommissionAsPaid, CompletedJob, getCompanies, Company } from "../utils/storage";

const formatCurrency = (amount: number): string => {
  const num = Math.floor(amount);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

type ReportPeriod = "weekly" | "monthly" | "yearly";

interface ReportData {
  period: ReportPeriod;
  label: string;
  paid: number;
  unpaid: number;
  total: number;
}

export default function WalletScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const colors = isDark ? Colors.dark : Colors.light;
  const headerHeight = useHeaderHeight();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { firebaseUser } = useAuth();

  const [allJobs, setAllJobs] = useState<CompletedJob[]>([]);
  const [companies, setCompanies] = useState<{ [key: string]: Company }>({});
  const [isTogglingPaid, setIsTogglingPaid] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("monthly");

  const loadData = useCallback(async () => {
    if (!firebaseUser?.uid) return;
    try {
      const jobs = await getCompletedJobs(firebaseUser.uid);
      const companiesList = await getCompanies(firebaseUser.uid);
      const companiesMap = companiesList.reduce((acc, company) => {
        acc[company.id] = company;
        return acc;
      }, {} as { [key: string]: Company });
      setAllJobs(jobs);
      setCompanies(companiesMap);
    } catch (error) {
      // Silent fail
    }
  }, [firebaseUser?.uid]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleTogglePayment = async (jobId: string, currentPaidStatus: boolean) => {
    if (!firebaseUser?.uid) return;
    setIsTogglingPaid(jobId);
    const newStatus = !currentPaidStatus;
    const result = await markCommissionAsPaid(firebaseUser.uid, jobId, newStatus);
    if (result) {
      await loadData();
      Alert.alert("Başarılı", newStatus ? "Komisyon ödendi olarak işaretlendi" : "Komisyon ödenmedi olarak işaretlendi");
    } else {
      Alert.alert("Hata", "İşlem başarısız oldu");
    }
    setIsTogglingPaid(null);
  };

  // Calculate summary stats
  const totalStats = useMemo(() => {
    const paid = allJobs.reduce((sum, job) => sum + (job.commissionPaid ? parseFloat(job.commissionCost || "0") : 0), 0);
    const unpaid = allJobs.reduce((sum, job) => sum + (!job.commissionPaid ? parseFloat(job.commissionCost || "0") : 0), 0);
    return { paid, unpaid, total: paid + unpaid };
  }, [allJobs]);

  // Calculate period-based reports
  const reportData = useMemo(() => {
    const now = Date.now();
    const periods = {
      weekly: { days: 7, label: "Bu Hafta" },
      monthly: { days: 30, label: "Bu Ay" },
      yearly: { days: 365, label: "Bu Yıl" },
    };

    const reports: ReportData[] = [];
    Object.entries(periods).forEach(([key, value]) => {
      const startDate = now - value.days * 24 * 60 * 60 * 1000;
      const periodJobs = allJobs.filter(job => job.completionDate >= startDate);
      const paid = periodJobs.reduce((sum, job) => sum + (job.commissionPaid ? parseFloat(job.commissionCost || "0") : 0), 0);
      const unpaid = periodJobs.reduce((sum, job) => sum + (!job.commissionPaid ? parseFloat(job.commissionCost || "0") : 0), 0);
      reports.push({
        period: key as ReportPeriod,
        label: value.label,
        paid,
        unpaid,
        total: paid + unpaid,
      });
    });
    return reports;
  }, [allJobs]);

  const currentReport = reportData.find(r => r.period === selectedPeriod);

  const filteredJobs = useMemo(() => {
    const periods = { weekly: 7, monthly: 30, yearly: 365 };
    const startDate = Date.now() - periods[selectedPeriod] * 24 * 60 * 60 * 1000;
    return allJobs.filter(job => job.completionDate >= startDate).sort((a, b) => b.completionDate - a.completionDate);
  }, [allJobs, selectedPeriod]);

  const renderTransactionCard = ({ item: job }: { item: CompletedJob }) => {
    const company = companies[job.companyId];
    const isLoading = isTogglingPaid === job.id;

    return (
      <View style={[styles.card, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)", borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }]}>
        <View style={{ flex: 1 }}>
          <ThemedText type="body" style={{ fontWeight: "700", marginBottom: Spacing.xs }}>
            {company?.name || "Bilinmeyen"}
          </ThemedText>
          <View style={{ flexDirection: "row", gap: Spacing.lg, marginBottom: Spacing.md }}>
            <View>
              <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>Tarih</ThemedText>
              <ThemedText type="small" style={{ fontWeight: "600", marginTop: 2 }}>
                {new Date(job.completionDate).toLocaleDateString("tr-TR")}
              </ThemedText>
            </View>
            <View>
              <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>Tutar</ThemedText>
              <ThemedText type="body" style={{ color: theme.link, fontWeight: "700", marginTop: 2 }}>
                ₺{formatCurrency(parseFloat(job.commissionCost || "0"))}
              </ThemedText>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.md }}>
            <View style={[styles.statusBadge, { backgroundColor: job.commissionPaid ? colors.success : colors.warning, flex: 1 }]}>
              <ThemedText type="small" style={{ color: "#FFF", fontWeight: "600" }}>
                {job.commissionPaid ? "✓ Ödendi" : "⏱ Bekleniyor"}
              </ThemedText>
            </View>

            <Pressable
              onPress={() => handleTogglePayment(job.id, job.commissionPaid)}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.toggleButton,
                {
                  backgroundColor: job.commissionPaid ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
                  opacity: pressed || isLoading ? 0.6 : 1,
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.link} />
              ) : (
                <Feather
                  name={job.commissionPaid ? "x" : "check"}
                  size={18}
                  color={job.commissionPaid ? "#EF4444" : colors.success}
                />
              )}
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={filteredJobs}
        renderItem={renderTransactionCard}
        keyExtractor={(item) => item.id}
        scrollEnabled
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        ListHeaderComponent={() => (
          <>
            {/* Summary Cards */}
            <View style={styles.header}>
              <View style={[styles.summaryCard, { backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.08)" }]}>
                <View>
                  <ThemedText type="small" style={{ color: colors.textSecondary }}>Toplam Kazanç</ThemedText>
                  <ThemedText type="h2" style={{ fontWeight: "700", color: theme.link, marginTop: 4 }}>
                    ₺{formatCurrency(totalStats.total)}
                  </ThemedText>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: Spacing.md }}>
                <View style={[styles.summaryCard, { flex: 1, backgroundColor: isDark ? "rgba(34, 197, 94, 0.15)" : "rgba(34, 197, 94, 0.08)" }]}>
                  <ThemedText type="small" style={{ color: colors.textSecondary }}>Ödenen</ThemedText>
                  <ThemedText type="h4" style={{ fontWeight: "700", color: colors.success, marginTop: 4 }}>
                    ₺{formatCurrency(totalStats.paid)}
                  </ThemedText>
                </View>

                <View style={[styles.summaryCard, { flex: 1, backgroundColor: isDark ? "rgba(234, 179, 8, 0.15)" : "rgba(234, 179, 8, 0.08)" }]}>
                  <ThemedText type="small" style={{ color: colors.textSecondary }}>Bekleniyor</ThemedText>
                  <ThemedText type="h4" style={{ fontWeight: "700", color: colors.warning, marginTop: 4 }}>
                    ₺{formatCurrency(totalStats.unpaid)}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Period Selector & Report Table */}
            <View style={styles.reportSection}>
              <View style={styles.periodSelector}>
                {reportData.map((report) => (
                  <Pressable
                    key={report.period}
                    onPress={() => setSelectedPeriod(report.period)}
                    style={[
                      styles.periodButton,
                      selectedPeriod === report.period && { borderBottomWidth: 2, borderBottomColor: theme.link },
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={{
                        fontWeight: selectedPeriod === report.period ? "700" : "500",
                        color: selectedPeriod === report.period ? theme.link : colors.textSecondary,
                      }}
                    >
                      {report.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {/* Report Table */}
              <View style={styles.reportTable}>
                <View style={styles.tableHeader}>
                  <ThemedText type="small" style={{ flex: 1, fontWeight: "700", color: colors.textSecondary }}>Metrik</ThemedText>
                  <ThemedText type="small" style={{ flex: 1, textAlign: "right", fontWeight: "700", color: colors.textSecondary }}>Tutar</ThemedText>
                </View>

                <View style={[styles.tableRow, { backgroundColor: isDark ? "rgba(34, 197, 94, 0.08)" : "rgba(34, 197, 94, 0.05)" }]}>
                  <ThemedText type="body" style={{ flex: 1, fontWeight: "600" }}>Ödenen Toplam</ThemedText>
                  <ThemedText type="body" style={{ flex: 1, textAlign: "right", fontWeight: "700", color: colors.success }}>
                    ₺{formatCurrency(currentReport?.paid || 0)}
                  </ThemedText>
                </View>

                <View style={[styles.tableRow, { backgroundColor: isDark ? "rgba(234, 179, 8, 0.08)" : "rgba(234, 179, 8, 0.05)" }]}>
                  <ThemedText type="body" style={{ flex: 1, fontWeight: "600" }}>Beklenen Toplam</ThemedText>
                  <ThemedText type="body" style={{ flex: 1, textAlign: "right", fontWeight: "700", color: colors.warning }}>
                    ₺{formatCurrency(currentReport?.unpaid || 0)}
                  </ThemedText>
                </View>

                <View style={[styles.tableRow, { backgroundColor: isDark ? "rgba(59, 130, 246, 0.08)" : "rgba(59, 130, 246, 0.05)" }]}>
                  <ThemedText type="body" style={{ flex: 1, fontWeight: "600" }}>Toplam Kazanç</ThemedText>
                  <ThemedText type="body" style={{ flex: 1, textAlign: "right", fontWeight: "700", color: theme.link }}>
                    ₺{formatCurrency(currentReport?.total || 0)}
                  </ThemedText>
                </View>

                <View style={[styles.tableRow, { borderBottomWidth: 0, backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.05)" }]}>
                  <ThemedText type="body" style={{ flex: 1, fontWeight: "600" }}>İşlem Sayısı</ThemedText>
                  <ThemedText type="body" style={{ flex: 1, textAlign: "right", fontWeight: "700", color: colors.textSecondary }}>
                    {filteredJobs.length}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Transactions Header */}
            {filteredJobs.length > 0 && (
              <View style={styles.transactionsHeader}>
                <ThemedText type="h4" style={{ fontWeight: "700" }}>İşlem Detayları</ThemedText>
              </View>
            )}

            {/* Empty State */}
            {filteredJobs.length === 0 && (
              <View style={styles.emptyState}>
                <Feather name="inbox" size={48} color={colors.textSecondary} />
                <ThemedText type="body" style={{ color: colors.textSecondary, marginTop: Spacing.md }}>
                  Bu dönem için işlem yok
                </ThemedText>
              </View>
            )}
          </>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  summaryCard: { padding: Spacing.md, borderRadius: BorderRadius.md, justifyContent: "space-between" },
  reportSection: { marginTop: Spacing.xl, paddingHorizontal: Spacing.lg },
  periodSelector: { flexDirection: "row", gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.1)" },
  periodButton: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm },
  reportTable: { marginTop: Spacing.lg, borderRadius: BorderRadius.md, overflow: "hidden", borderWidth: 1, borderColor: "rgba(0,0,0,0.1)" },
  tableHeader: { flexDirection: "row", padding: Spacing.md, backgroundColor: "rgba(0,0,0,0.03)" },
  tableRow: { flexDirection: "row", alignItems: "center", padding: Spacing.md, borderBottomWidth: 1 },
  
  card: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  statusBadge: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, alignItems: "center", justifyContent: "center" },
  toggleButton: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: "center", justifyContent: "center" },
  transactionsHeader: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl, paddingBottom: Spacing.md },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: Spacing.xl * 2 },
});
