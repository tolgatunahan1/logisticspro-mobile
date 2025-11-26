import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getCompanyWallet, getUnpaidCommissions, markCommissionAsPaid, CompanyWallet, CompletedJob } from "@/utils/storage";

export default function WalletScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const colors = isDark ? Colors.dark : Colors.light;

  const [wallet, setWallet] = useState<CompanyWallet | null>(null);
  const [unpaidCommissions, setUnpaidCommissions] = useState<CompletedJob[]>([]);
  const [isMarkingPaid, setIsMarkingPaid] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const walletData = await getCompanyWallet();
    setWallet(walletData);
    const unpaidData = await getUnpaidCommissions();
    setUnpaidCommissions(unpaidData);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleMarkAsPaid = async (jobId: string) => {
    setIsMarkingPaid(jobId);
    const result = await markCommissionAsPaid(jobId);
    if (result) {
      await loadData();
      Alert.alert("Başarılı", "Komisyon ödendi olarak işaretlendi ve cüzdana eklendi");
    } else {
      Alert.alert("Hata", "İşlem başarısız oldu");
    }
    setIsMarkingPaid(null);
  };

  return (
    <ScreenScrollView>
      <View style={[styles.section, { backgroundColor: colors.backgroundDefault }]}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>
            Şirket Cüzdanı
          </ThemedText>
        </View>
        {wallet && (
          <View style={{ gap: Spacing.lg }}>
            <View
              style={[
                styles.walletCard,
                { backgroundColor: isDark ? "rgba(33, 150, 243, 0.1)" : "rgba(33, 150, 243, 0.05)" },
              ]}
            >
              <View style={styles.walletCardContent}>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  Cüzdan Bakiyesi
                </ThemedText>
                <ThemedText type="h2" style={{ color: theme.link, fontWeight: "700", marginTop: Spacing.sm }}>
                  {wallet.totalBalance.toFixed(2)} ₺
                </ThemedText>
              </View>
              <View style={[styles.walletIcon, { backgroundColor: theme.link }]}>
                <Feather name="wallet" size={32} color="#FFFFFF" />
              </View>
            </View>

            <View
              style={[
                styles.walletCard,
                { backgroundColor: isDark ? "rgba(76, 175, 80, 0.1)" : "rgba(76, 175, 80, 0.05)" },
              ]}
            >
              <View style={styles.walletCardContent}>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  Toplam Kazanç
                </ThemedText>
                <ThemedText type="h3" style={{ color: "#4CAF50", fontWeight: "700", marginTop: Spacing.sm }}>
                  {wallet.totalEarned.toFixed(2)} ₺
                </ThemedText>
              </View>
              <View style={[styles.walletIcon, { backgroundColor: "#4CAF50" }]}>
                <Feather name="trending-up" size={32} color="#FFFFFF" />
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.backgroundDefault }]}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
            Ödeme Bekleyen İşler
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

        {unpaidCommissions.length > 0 ? (
          <View style={{ gap: Spacing.md }}>
            {unpaidCommissions.map((job) => (
              <View
                key={job.id}
                style={[
                  styles.jobCard,
                  { backgroundColor: isDark ? "rgba(255, 193, 7, 0.1)" : "rgba(255, 193, 7, 0.05)" },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText type="small" style={{ fontWeight: "600", color: colors.textPrimary }}>
                    {job.cargoType}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
                    {job.loadingLocation} → {job.deliveryLocation}
                  </ThemedText>
                  <View style={{ marginTop: Spacing.md, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <ThemedText type="h4" style={{ color: theme.link, fontWeight: "700" }}>
                      {parseFloat(job.commissionCost).toFixed(2)} ₺
                    </ThemedText>
                    <Pressable
                      onPress={() => handleMarkAsPaid(job.id)}
                      disabled={isMarkingPaid === job.id}
                      style={({ pressed }) => [
                        styles.paidButton,
                        {
                          backgroundColor: theme.link,
                          opacity: pressed || isMarkingPaid === job.id ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Feather name="check-circle" size={16} color="#FFFFFF" />
                      <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                        {isMarkingPaid === job.id ? "İşleniyor..." : "Ödendi"}
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Feather name="check-circle" size={48} color={colors.textSecondary} />
            <ThemedText type="body" style={{ color: colors.textSecondary, marginTop: Spacing.md, textAlign: "center" }}>
              Tüm ödemeler tamamlanmıştır
            </ThemedText>
          </View>
        )}
      </View>

      {wallet && wallet.transactions.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.backgroundDefault }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
              İşlem Geçmişi
            </ThemedText>
          </View>
          <View style={{ gap: Spacing.sm }}>
            {wallet.transactions.slice(0, 5).map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="small" style={{ fontWeight: "600" }}>
                    {transaction.description}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
                    {new Date(transaction.createdAt).toLocaleDateString("tr-TR")}
                  </ThemedText>
                </View>
                <ThemedText type="body" style={{ color: theme.link, fontWeight: "700" }}>
                  +{transaction.amount.toFixed(2)} ₺
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  badge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minWidth: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  walletCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  walletCardContent: {
    flex: 1,
  },
  walletIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  jobCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  paidButton: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
});
