import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, ScrollView, Modal, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getPendingUsers, getApprovedUsers, approveUser, rejectUser, unapproveUser, AppUser, debugStorage } from "@/utils/userManagement";

type RootStackParamList = {
  Login: undefined;
  AdminPanel: undefined;
};

type AdminNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminPanel'>;

export default function AdminPanelScreen() {
  const navigation = useNavigation<AdminNavigationProp>();
  const { theme, isDark } = useTheme();
  const { logout } = useAuth();
  const colors = isDark ? Colors.dark : Colors.light;

  const [pendingUsers, setPendingUsers] = useState<AppUser[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<AppUser[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: (() => Promise<void>) | null;
    onCancel: (() => void) | null;
    isLoading: boolean;
  }>({
    visible: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    isLoading: false,
  });

  const loadUsers = useCallback(async () => {
    try {
      console.log("📥 Loading users from storage...");
      await debugStorage();
      
      const pending = await getPendingUsers();
      const approved = await getApprovedUsers();
      
      console.log(`✅ Loaded: ${pending.length} pending, ${approved.length} approved`);
      
      setPendingUsers(pending);
      setApprovedUsers(approved);
    } catch (error) {
      console.error("❌ Failed to load users:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("🎯 Screen focused - loading users");
      loadUsers();
    }, [loadUsers])
  );

  const handleApprove = useCallback((user: AppUser) => {
    console.log("👆 APPROVE BUTTON PRESSED:", user.username);
    
    const confirmAction = async () => {
      console.log("✋ APPROVAL CONFIRMED FOR:", user.username);
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));
      try {
        const success = await approveUser(user.id);
        console.log("Approve result:", success);
        
        if (success) {
          Alert.alert("✅ Başarılı", `${user.username} onaylandı!\n\nGiriş: ${user.username}\nŞifre: ${user.password}`);
          await new Promise(r => setTimeout(r, 800));
          setConfirmDialog(prev => ({ ...prev, visible: false, isLoading: false }));
          await loadUsers();
        } else {
          Alert.alert("❌ Hata", "Onaylama başarısız oldu");
          setConfirmDialog(prev => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        console.error("Approve error:", err);
        Alert.alert("❌ Hata", String(err));
        setConfirmDialog(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    setConfirmDialog({
      visible: true,
      title: "Kullanıcı Onayla",
      message: `${user.username} kullanıcısını onaylamak istiyor musunuz?\n\nGiriş: ${user.username}\nŞifre: ${user.password}`,
      onConfirm: confirmAction,
      onCancel: () => setConfirmDialog(prev => ({ ...prev, visible: false })),
      isLoading: false,
    });
  }, [loadUsers]);

  const handleReject = useCallback((user: AppUser) => {
    console.log("👆 REJECT BUTTON PRESSED:", user.username);
    
    const confirmAction = async () => {
      console.log("✋ REJECTION CONFIRMED FOR:", user.username);
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));
      try {
        const success = await rejectUser(user.id);
        console.log("Reject result:", success);
        
        if (success) {
          Alert.alert("✅ Başarılı", `${user.username} reddedildi`);
          await new Promise(r => setTimeout(r, 800));
          setConfirmDialog(prev => ({ ...prev, visible: false, isLoading: false }));
          await loadUsers();
        } else {
          Alert.alert("❌ Hata", "Reddetme başarısız");
          setConfirmDialog(prev => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        console.error("Reject error:", err);
        Alert.alert("❌ Hata", String(err));
        setConfirmDialog(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    setConfirmDialog({
      visible: true,
      title: "Kullanıcı Reddet",
      message: `${user.username} kullanıcısını reddetmek istiyor musunuz?`,
      onConfirm: confirmAction,
      onCancel: () => setConfirmDialog(prev => ({ ...prev, visible: false })),
      isLoading: false,
    });
  }, [loadUsers]);

  const handleUnapprove = useCallback((user: AppUser) => {
    console.log("👆 UNAPPROVE BUTTON PRESSED:", user.username);
    
    const confirmAction = async () => {
      console.log("✋ UNAPPROVE CONFIRMED FOR:", user.username);
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));
      try {
        const success = await unapproveUser(user.id);
        console.log("Unapprove result:", success);
        
        if (success) {
          Alert.alert("✅ Başarılı", `${user.username} onayı kaldırıldı`);
          await new Promise(r => setTimeout(r, 800));
          setConfirmDialog(prev => ({ ...prev, visible: false, isLoading: false }));
          await loadUsers();
        } else {
          Alert.alert("❌ Hata", "Onay kaldırma başarısız");
          setConfirmDialog(prev => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        console.error("Unapprove error:", err);
        Alert.alert("❌ Hata", String(err));
        setConfirmDialog(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    setConfirmDialog({
      visible: true,
      title: "Onayı Kaldır",
      message: `${user.username} kullanıcısının onayını kaldırmak istiyor musunuz?\n\nBu kullanıcı tekrar yönetici onayı almak zorunda kalacak.`,
      onConfirm: confirmAction,
      onCancel: () => setConfirmDialog(prev => ({ ...prev, visible: false })),
      isLoading: false,
    });
  }, [loadUsers]);

  const handleLogoutPress = () => {
    console.log("👉 LOGOUT BUTTON PRESSED");
    logout();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* İstatistikler */}
        <View style={[styles.header, { backgroundColor: colors.backgroundDefault }]}>
          <ThemedText type="h3">👨‍💼 Admin Paneli</ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.sm }}>
            Toplam: {pendingUsers.length + approvedUsers.length} | ⏳ Bekleyen: {pendingUsers.length} | ✅ Onaylanmış: {approvedUsers.length}
          </ThemedText>
        </View>

        {/* Onay Bekleyen Kullanıcılar */}
        <View>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md, color: colors.textSecondary }}>
            ⏳ Onay Bekleyen ({pendingUsers.length})
          </ThemedText>

          {pendingUsers.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.backgroundDefault }]}>
              <Feather name="inbox" size={32} color={colors.textSecondary} />
              <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.sm }}>
                Bekleyen kullanıcı yok
              </ThemedText>
            </View>
          ) : (
            <View style={{ gap: Spacing.md }}>
              {pendingUsers.map((user) => (
                <View key={user.id} style={[styles.userCard, { backgroundColor: colors.backgroundDefault }]}>
                  <View style={styles.userInfo}>
                    <ThemedText type="h4">{user.username}</ThemedText>
                    <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
                      Başvuru: {formatDate(user.createdAt)}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: colors.success, marginTop: Spacing.xs }}>
                      Şifre: {user.password}
                    </ThemedText>
                  </View>

                  <View style={styles.userActions}>
                    <Pressable
                      onPress={() => handleApprove(user)}
                      disabled={confirmDialog.isLoading}
                      style={({ pressed }) => [
                        styles.actionButton,
                        {
                          backgroundColor: colors.success,
                          opacity: pressed || confirmDialog.isLoading ? 0.6 : 1,
                        },
                      ]}
                    >
                      <Feather name="check" size={18} color="#FFFFFF" />
                      <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "700" }}>
                        ONAYLA
                      </ThemedText>
                    </Pressable>

                    <Pressable
                      onPress={() => handleReject(user)}
                      disabled={confirmDialog.isLoading}
                      style={({ pressed }) => [
                        styles.actionButton,
                        {
                          backgroundColor: colors.destructive,
                          opacity: pressed || confirmDialog.isLoading ? 0.6 : 1,
                        },
                      ]}
                    >
                      <Feather name="x" size={18} color="#FFFFFF" />
                      <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "700" }}>
                        REDDET
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Onaylanmış Kullanıcılar */}
        <View style={{ marginTop: Spacing["2xl"] }}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md, color: colors.textSecondary }}>
            ✅ Onaylanmış ({approvedUsers.length})
          </ThemedText>

          {approvedUsers.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.backgroundDefault }]}>
              <Feather name="check-circle" size={32} color={colors.textSecondary} />
              <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.sm }}>
                Henüz onaylanmış kullanıcı yok
              </ThemedText>
            </View>
          ) : (
            <View style={{ gap: Spacing.md }}>
              {approvedUsers.map((user) => (
                <View key={user.id} style={[styles.approvedCard, { backgroundColor: colors.backgroundDefault, borderColor: colors.success }]}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="h4">{user.username}</ThemedText>
                    <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
                      Başvuru: {formatDate(user.createdAt)}
                    </ThemedText>
                    {user.approvedAt && (
                      <ThemedText type="small" style={{ color: colors.success, marginTop: Spacing.xs }}>
                        Onay: {formatDate(user.approvedAt)}
                      </ThemedText>
                    )}
                  </View>
                  <View style={styles.approvedActions}>
                    <Pressable
                      onPress={() => handleUnapprove(user)}
                      disabled={confirmDialog.isLoading}
                      style={({ pressed }) => [
                        styles.smallActionButton,
                        {
                          backgroundColor: colors.destructive,
                          opacity: pressed || confirmDialog.isLoading ? 0.6 : 1,
                        },
                      ]}
                    >
                      <Feather name="slash" size={16} color="#FFFFFF" />
                    </Pressable>
                    <Feather name="check-circle" size={24} color={colors.success} />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Çıkış Butonu - Outside ScrollView */}
      <Pressable
        onPress={async () => {
          console.log("🔴 LOGOUT CLICKED");
          await logout();
          console.log("🟢 LOGOUT DONE");
          if (typeof window !== 'undefined') {
            console.log("🟡 RELOADING PAGE");
            window.location.reload();
          }
        }}
        style={({ pressed }) => [
          styles.logoutButtonFixed,
          {
            backgroundColor: colors.destructive,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Feather name="log-out" size={18} color="#FFFFFF" />
        <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
          Çıkış Yap
        </ThemedText>
      </Pressable>

      {/* Confirmation Dialog Modal */}
      <Modal
        visible={confirmDialog.visible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (confirmDialog.onCancel) confirmDialog.onCancel();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogBox, { backgroundColor: colors.backgroundDefault }]}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
              {confirmDialog.title}
            </ThemedText>
            
            <ThemedText type="body" style={{ color: colors.textSecondary, marginBottom: Spacing.lg, lineHeight: 24 }}>
              {confirmDialog.message}
            </ThemedText>

            <View style={styles.dialogActions}>
              <Pressable
                onPress={() => {
                  if (confirmDialog.onCancel) confirmDialog.onCancel();
                }}
                disabled={confirmDialog.isLoading}
                style={({ pressed }) => [
                  styles.dialogButton,
                  {
                    backgroundColor: colors.backgroundRoot,
                    opacity: pressed || confirmDialog.isLoading ? 0.6 : 1,
                  },
                ]}
              >
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  İPTAL
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={async () => {
                  console.log("🔘 CONFIRM BUTTON PRESSED");
                  if (confirmDialog.onConfirm) {
                    console.log("🎬 Executing confirm action");
                    await confirmDialog.onConfirm();
                  }
                }}
                disabled={confirmDialog.isLoading}
                style={({ pressed }) => [
                  styles.dialogButton,
                  {
                    backgroundColor: confirmDialog.title.includes("Reddet") || confirmDialog.title.includes("Onayı Kaldır") ? colors.destructive : colors.success,
                    opacity: pressed || confirmDialog.isLoading ? 0.6 : 1,
                  },
                ]}
              >
                <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "700" }}>
                  {confirmDialog.isLoading ? "İŞLEMLENİYOR..." : confirmDialog.title.includes("Reddet") ? "REDDET" : confirmDialog.title.includes("Onayı Kaldır") ? "KALDIR" : "ONAYLA"}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  header: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  emptyCard: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.sm,
  },
  userCard: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  approvedCard: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 2,
  },
  approvedActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  userInfo: {
    gap: Spacing.xs,
  },
  userActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  smallActionButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    marginTop: Spacing["2xl"],
    marginBottom: Spacing["2xl"],
  },
  logoutButtonFixed: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    margin: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialogBox: {
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    minWidth: 280,
  },
  dialogActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
