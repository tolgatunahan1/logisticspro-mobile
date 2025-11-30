import React, { useState, useCallback, useMemo } from "react";
import { StyleSheet, View, Pressable, Alert, FlatList, useWindowDimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";

import { ScreenScrollView } from "../components/ScreenScrollView";
import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { Spacing, BorderRadius, Colors, APP_CONSTANTS } from "../constants/theme";
import { getCompletedJobs, markCommissionAsPaid, CompanyWallet, CompletedJob, getCompanies, Company, getDebts, Debt, updateDebtPayment } from "../utils/storage";

const formatCurrency = (amount: number): string => {
  const num = Math.floor(amount);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

type TabType = "all" | "paid" | "unpaid" | "debts";

export default function WalletScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const colors = isDark ? Colors.dark : Colors.light;
  const headerHeight = useHeaderHeight();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { firebaseUser } = useAuth();

  const [paidTotal, setPaidTotal] = useState<number>(0);
  const [unpaidTotal, setUnpaidTotal] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [weeklyRevenue, setWeeklyRevenue] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [allJobs, setAllJobs] = useState<CompletedJob[]>([]);
  const [companies, setCompanies] = useState<{ [key: string]: Company }>({});
  const [isTogglingPaid, setIsTogglingPaid] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("unpaid");
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showDebtPaymentInput, setShowDebtPaymentInput] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [netCommissionTotal, setNetCommissionTotal] = useState<number>(0);

  const filteredJobs = useMemo(() => {
    if (activeTab === "all") return allJobs;
    if (activeTab === "paid") return allJobs.filter(job => job.commissionPaid);
    return allJobs.filter(job => !job.commissionPaid);
  }, [allJobs, activeTab]);

  const calculateRevenueData = (completedJobs: CompletedJob[]) => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    let total = 0, weekly = 0, monthly = 0;

    completedJobs.forEach(job => {
      const amount = parseFloat(job.commissionCost || "0");
      total += amount;
      if (job.completionDate >= oneMonthAgo) monthly += amount;
      if (job.completionDate >= oneWeekAgo) weekly += amount;
    });

    return { total, weekly, monthly };
  };

  const loadData = useCallback(async () => {
    if (!firebaseUser?.uid) return;

    try {
      const jobs = await getCompletedJobs(firebaseUser.uid);
      const companiesList = await getCompanies(firebaseUser.uid);
      const debtsList = await getDebts(firebaseUser.uid);
      
      const companiesMap = companiesList.reduce((acc, company) => {
        acc[company.id] = company;
        return acc;
      }, {} as { [key: string]: Company });

      const paid = jobs.reduce((sum, job) => {
        if (job.commissionPaid && job.commissionCost) {
          return sum + parseFloat(job.commissionCost as string);
        }
        return sum;
      }, 0);

      const unpaid = jobs.reduce((sum, job) => {
        if (!job.commissionPaid && job.commissionCost) {
          return sum + parseFloat(job.commissionCost as string);
        }
        return sum;
      }, 0);
      
      // Calculate net commission: unpaid commission - paylaştığı ÖDENMEMIŞ borçlar
      const commissionShares = debtsList.filter(d => d.type === 'commission' && d.paidAmount < d.totalAmount);
      const totalShared = commissionShares.reduce((sum, debt) => sum + (debt.totalAmount - debt.paidAmount), 0);
      const netCommission = unpaid - totalShared;
      
      const revenue = calculateRevenueData(jobs);

      setPaidTotal(paid);
      setUnpaidTotal(unpaid);
      setTotalRevenue(revenue.total);
      setWeeklyRevenue(revenue.weekly);
      setMonthlyRevenue(revenue.monthly);
      setNetCommissionTotal(netCommission);
      setAllJobs(jobs);
      setCompanies(companiesMap);
      setDebts(debtsList);
    } catch (error) {
      // Silent fail
    }
  }, [firebaseUser?.uid]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleTogglePayment = async (jobId: string, currentPaidStatus: boolean) => {
    if (!firebaseUser?.uid) return;
    setIsTogglingPaid(jobId);
    const newStatus = !currentPaidStatus;
    const result = await markCommissionAsPaid(firebaseUser.uid, jobId, newStatus);
    if (result) {
      await loadData();
      Alert.alert(
        "Başarılı", 
        newStatus ? "Komisyon ödendi olarak işaretlendi" : "Komisyon ödenmedi olarak işaretlendi"
      );
    } else {
      Alert.alert("Hata", "İşlem başarısız oldu");
    }
    setIsTogglingPaid(null);
  };

  const renderDebtRow = (debt: Debt) => {
    const remaining = debt.totalAmount - debt.paidAmount;
    const isCommission = debt.type === 'commission';
    const progress = (debt.paidAmount / debt.totalAmount) * 100;
    
    return (
      <View style={{ marginHorizontal: Spacing.lg, marginVertical: Spacing.sm }}>
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: Spacing.sm }}>
          <View style={{ flex: 1 }}>
            <ThemedText type="small" style={{ fontWeight: "700", fontSize: 14 }}>
              {debt.personName}
            </ThemedText>
            <View style={{ flexDirection: "row", gap: Spacing.xs, marginTop: Spacing.xs, alignItems: "center" }}>
              <View style={{ 
                backgroundColor: isCommission ? "rgba(168, 85, 247, 0.2)" : "rgba(59, 130, 246, 0.2)", 
                paddingHorizontal: Spacing.sm, 
                paddingVertical: 2, 
                borderRadius: BorderRadius.sm 
              }}>
                <ThemedText type="small" style={{ 
                  color: isCommission ? "#A855F7" : "#3B82F6", 
                  fontSize: 10, 
                  fontWeight: "600" 
                }}>
                  {isCommission ? "Komisyon" : "Borç"}
                </ThemedText>
              </View>
              <View style={{ 
                backgroundColor: remaining > 0 ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)", 
                paddingHorizontal: Spacing.sm, 
                paddingVertical: 2, 
                borderRadius: BorderRadius.sm 
              }}>
                <ThemedText type="small" style={{ 
                  color: remaining > 0 ? "#EF4444" : "#22C55E", 
                  fontSize: 10, 
                  fontWeight: "600" 
                }}>
                  {remaining > 0 ? "Beklemede" : "Ödendi"}
                </ThemedText>
              </View>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <ThemedText type="small" style={{ fontWeight: "700", color: remaining > 0 ? colors.destructive : colors.success, fontSize: 16 }}>
              ₺{formatCurrency(remaining)}
            </ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 10, marginTop: Spacing.xs }}>
              {remaining > 0 ? "Ödenecek" : "Tamamlandı"}
            </ThemedText>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={{ height: 4, backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", borderRadius: 2, marginBottom: Spacing.sm, overflow: "hidden" }}>
          <View style={{ height: "100%", width: `${progress}%`, backgroundColor: remaining > 0 ? colors.warning : colors.success }} />
        </View>

        {/* Details Grid */}
        <View style={{ 
          backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", 
          padding: Spacing.md, 
          borderRadius: BorderRadius.md, 
          borderWidth: 1, 
          borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
          marginBottom: Spacing.md 
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: Spacing.lg }}>
            <View style={{ flex: 1 }}>
              <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600", fontSize: 11 }}>
                Toplam
              </ThemedText>
              <ThemedText type="body" style={{ fontWeight: "700", marginTop: Spacing.xs }}>
                ₺{formatCurrency(debt.totalAmount)}
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600", fontSize: 11 }}>
                Ödenen
              </ThemedText>
              <ThemedText type="body" style={{ fontWeight: "700", marginTop: Spacing.xs, color: colors.success }}>
                ₺{formatCurrency(debt.paidAmount)}
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600", fontSize: 11 }}>
                Kalan
              </ThemedText>
              <ThemedText type="body" style={{ fontWeight: "700", marginTop: Spacing.xs, color: remaining > 0 ? colors.destructive : colors.success }}>
                ₺{formatCurrency(remaining)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Action Button */}
        {remaining > 0 && (
          <Pressable
            onPress={() => setShowDebtPaymentInput(debt.id)}
            style={({ pressed }) => [{
              backgroundColor: theme.link,
              opacity: pressed ? 0.8 : 1,
              paddingVertical: Spacing.md,
              borderRadius: BorderRadius.md,
              alignItems: "center",
              marginBottom: Spacing.md,
            }]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
              <Feather name="credit-card" size={16} color="#FFFFFF" />
              <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "700" }}>
                Ödeme Yap
              </ThemedText>
            </View>
          </Pressable>
        )}
      </View>
    );
  };

  const renderTransactionRow = ({ item: job }: { item: CompletedJob }) => {
    const company = companies[job.companyId];
    return (
      <View
        style={{
          flexDirection: "row",
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: isDark
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.05)",
          alignItems: "center",
          gap: Spacing.md,
        }}
      >
        {/* Route & Company Info */}
        <View style={{ flex: 2 }}>
          <ThemedText type="small" style={{ fontWeight: "600", marginBottom: Spacing.xs }}>
            {company?.name || "Bilinmeyen"}
          </ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
            {job.cargoType}
          </ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 10, marginTop: Spacing.xs }}>
            {job.loadingLocation} → {job.deliveryLocation}
          </ThemedText>
        </View>

        {/* Commission Amount */}
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <ThemedText type="body" style={{ color: theme.link, fontWeight: "700" }}>
            {formatCurrency(parseFloat(job.commissionCost))} ₺
          </ThemedText>
          <View
            style={{
              backgroundColor: job.commissionPaid ? colors.success : colors.warning,
              paddingHorizontal: Spacing.sm,
              paddingVertical: 2,
              borderRadius: BorderRadius.sm,
              marginTop: Spacing.xs,
            }}
          >
            <ThemedText type="small" style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "600" }}>
              {job.commissionPaid ? "Ödendi" : "Ödenmedi"}
            </ThemedText>
          </View>
        </View>

        {/* Toggle Button */}
        <Pressable
          onPress={() => handleTogglePayment(job.id, job.commissionPaid)}
          disabled={isTogglingPaid === job.id}
          style={({ pressed }) => [
            {
              backgroundColor: job.commissionPaid ? colors.warning : colors.success,
              padding: Spacing.sm,
              borderRadius: BorderRadius.sm,
              opacity: pressed || isTogglingPaid === job.id ? 0.7 : 1,
            },
          ]}
        >
          <Feather
            name={isTogglingPaid === job.id ? "loader" : job.commissionPaid ? "x" : "check"}
            size={16}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={activeTab === "debts" ? debts.filter(d => d.paidAmount < d.totalAmount) : filteredJobs}
        renderItem={({ item, index }) => {
          if (activeTab === "debts") {
            const debt = item as Debt;
            const isCommission = debt.type === 'commission';
            const debtList = debts.filter(d => d.paidAmount < d.totalAmount);
            const isFirstOfType = index === 0 || (debtList[index - 1]?.type !== isCommission);
            
            return (
              <View>
                {isFirstOfType && (
                  <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, marginTop: index > 0 ? Spacing.md : 0 }}>
                    <ThemedText type="h4" style={{ fontWeight: "700", color: isCommission ? "#A855F7" : theme.link }}>
                      {isCommission ? "💜 Komisyon Paylaşımları" : "📖 Borç Defteri"}
                    </ThemedText>
                  </View>
                )}
                {renderDebtRow(debt)}
              </View>
            );
          }
          return renderTransactionRow({ item: item as CompletedJob });
        }}
        keyExtractor={(item) => (item as any).id || (item as any).personName}
        ListHeaderComponent={() => (
          <>
            {/* Revenue Summary Section */}
            <View style={[styles.statsContainer, { paddingHorizontal: Spacing.lg, paddingTop: headerHeight + Spacing.lg, marginBottom: Spacing.md }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.lg }}>
                <View>
                  <ThemedText type="small" style={{ color: colors.textSecondary }}>
                    Toplam Komisyon Kazancı
                  </ThemedText>
                  <ThemedText type="h2" style={{ fontWeight: "700" }}>
                    ₺{formatCurrency(totalRevenue)}
                  </ThemedText>
                </View>
                <View style={{ backgroundColor: theme.link + "20", padding: Spacing.md, borderRadius: BorderRadius.md }}>
                  <Feather name="trending-up" size={28} color={theme.link} />
                </View>
              </View>

              <View style={{ gap: Spacing.md }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>Bu Hafta</ThemedText>
                    <ThemedText type="h4">₺{formatCurrency(weeklyRevenue)}</ThemedText>
                  </View>
                  <View>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>Bu Ay</ThemedText>
                    <ThemedText type="h4">₺{formatCurrency(monthlyRevenue)}</ThemedText>
                  </View>
                </View>
              </View>
            </View>

            {/* Header Stats */}
            <View style={[styles.statsContainer, { paddingHorizontal: Spacing.lg }]}>
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
                      {formatCurrency(unpaidTotal)} ₺
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
                      {formatCurrency(paidTotal)} ₺
                    </ThemedText>
                  </View>
                  <View style={[styles.statsIcon, { backgroundColor: "#22C55E" }]}>
                    <Feather name="check-circle" size={20} color="#FFFFFF" />
                  </View>
                </View>

                {/* Net Kazancım Card */}
                <View
                  style={[
                    styles.balanceCard,
                    {
                      backgroundColor: isDark
                        ? "rgba(168, 85, 247, 0.15)"
                        : "rgba(168, 85, 247, 0.08)",
                      borderColor: isDark
                        ? "rgba(168, 85, 247, 0.3)"
                        : "rgba(168, 85, 247, 0.2)",
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText type="small" style={{ color: colors.textSecondary, marginBottom: Spacing.xs }}>
                      Net Kazancım
                    </ThemedText>
                    <ThemedText type="h3" style={{ color: "#A855F7", fontWeight: "700" }}>
                      {formatCurrency(Math.max(0, netCommissionTotal))} ₺
                    </ThemedText>
                  </View>
                  <View style={[styles.statsIcon, { backgroundColor: "#A855F7" }]}>
                    <Feather name="trending-up" size={20} color="#FFFFFF" />
                  </View>
                </View>
              </View>
            </View>

            {/* Tab Navigation */}
            <View style={{ flexDirection: "row", paddingHorizontal: Spacing.lg, marginTop: Spacing.lg, gap: Spacing.md, flexWrap: "wrap" }}>
              {(["all", "paid", "unpaid", "debts"] as TabType[]).map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{
                    paddingVertical: Spacing.sm,
                    paddingHorizontal: Spacing.lg,
                    borderRadius: BorderRadius.sm,
                    backgroundColor:
                      activeTab === tab
                        ? tab === "unpaid"
                          ? colors.warning
                          : tab === "paid"
                          ? colors.success
                          : tab === "debts"
                          ? "#8B5CF6"
                          : theme.link
                        : colors.backgroundDefault,
                  }}
                >
                  <ThemedText
                    type="small"
                    style={{
                      fontWeight: "600",
                      color:
                        activeTab === tab
                          ? "#FFFFFF"
                          : colors.textSecondary,
                    }}
                  >
                    {tab === "unpaid"
                      ? `Ödenmedi (${allJobs.filter(j => !j.commissionPaid).length})`
                      : tab === "paid"
                      ? `Ödendi (${allJobs.filter(j => j.commissionPaid).length})`
                      : tab === "debts"
                      ? `Borçlar (${debts.filter(d => d.paidAmount < d.totalAmount).length})`
                      : `Tümü (${allJobs.length})`}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {/* Transaction List Header */}
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.md,
                marginTop: Spacing.lg,
                gap: Spacing.md,
              }}
            >
              <ThemedText type="h4" style={{ fontWeight: "700" }}>
                {activeTab === "debts" ? "Borç Takibi" : "İşlem Geçmişi"}
              </ThemedText>
              {(activeTab === "debts" ? debts.filter(d => d.paidAmount < d.totalAmount).length > 0 : filteredJobs.length > 0) && (
                <View
                  style={{
                    backgroundColor:
                      activeTab === "unpaid"
                        ? colors.warning
                        : activeTab === "paid"
                        ? colors.success
                        : theme.link,
                    paddingHorizontal: Spacing.sm,
                    paddingVertical: 2,
                    borderRadius: BorderRadius.sm,
                    minWidth: 24,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 11 }}>
                    {activeTab === "debts" ? debts.filter(d => d.paidAmount < d.totalAmount).length : filteredJobs.length}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Empty State */}
            {(activeTab === "debts" ? debts.filter(d => d.paidAmount < d.totalAmount).length === 0 : filteredJobs.length === 0) && (
              <View style={{ paddingHorizontal: Spacing.lg, marginTop: Spacing.lg }}>
                <View style={[styles.emptyState]}>
                  <Feather
                    name={activeTab === "unpaid" ? "check-circle" : "inbox"}
                    size={48}
                    color={colors.textSecondary}
                  />
                  <ThemedText type="body" style={{ color: colors.textSecondary, marginTop: Spacing.md }}>
                    {activeTab === "unpaid"
                      ? "Tüm ödemeler tamamlanmıştır"
                      : activeTab === "paid"
                      ? "Henüz ödenen işlem yok"
                      : "İşlem yok"}
                  </ThemedText>
                </View>
              </View>
            )}
          </>
        )}
        scrollEnabled={true}
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
        nestedScrollEnabled={true}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
});
