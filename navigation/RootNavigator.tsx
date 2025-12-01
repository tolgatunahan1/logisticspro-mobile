import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomTabNavigator from "./BottomTabNavigator";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import AdminDashboard from "../screens/AdminDashboard"; // Yeni eklendi
// Diğer ekranlar...
import CarrierListScreen from "../screens/CarrierListScreen";
import CarrierFormScreen from "../screens/CarrierFormScreen";
import CompanyListScreen from "../screens/CompanyListScreen";
import CompanyFormScreen from "../screens/CompanyFormScreen";
import JobListScreen from "../screens/JobListScreen";
import JobFormScreen from "../screens/JobFormScreen";
import CompletedJobListScreen from "../screens/CompletedJobListScreen";
import CompletedJobFormScreen from "../screens/CompletedJobFormScreen";
import SettingsScreen from "../screens/SettingsScreen";

import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { getCommonScreenOptions } from "./screenOptions";
import { Carrier, Company, PlannedJob, CompletedJob } from "../utils/storage";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  AdminDashboard: undefined;
  AnaSayfa: undefined;
  // ... Diğerleri aynı
  CarrierList: undefined;
  CarrierForm: { carrier?: Carrier; mode: "add" | "edit"; initialData?: { name?: string; phone?: string; vehicleType?: string } };
  CompanyList: undefined;
  CompanyForm: { company?: Company; mode: "add" | "edit" };
  JobList: undefined;
  JobForm: { job?: PlannedJob; mode: "add" | "edit" };
  CompletedJobList: undefined;
  CompletedJobForm: { job?: CompletedJob; mode: "add" | "edit" };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { theme, isDark } = useTheme();
  // Artık userData'ya da bakıyoruz
  const { firebaseUser, userData, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.link} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      {!firebaseUser || !userData || userData.status !== 'approved' ? (
        // GİRİŞ YAPMAMIŞSA VEYA ONAY BEKLİYORSA
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        </>
      ) : userData.role === 'admin' ? (
        // ADMİN İSE
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ headerShown: false }} />
      ) : (
        // ONAYLANMIŞ NORMAL KULLANICI İSE (Ana Sayfa ve Diğerleri)
        <>
          <Stack.Screen name="AnaSayfa" component={BottomTabNavigator} options={{ headerShown: false }} />
          
          <Stack.Screen name="CarrierList" component={CarrierListScreen} options={{ headerTitle: "Nakliyeciler" }} />
          <Stack.Screen name="CarrierForm" component={CarrierFormScreen} options={({ route }) => ({ headerTitle: route.params.mode === "add" ? "Nakliyeci Ekle" : "Düzenle", presentation: "modal" })} />
          <Stack.Screen name="CompanyList" component={CompanyListScreen} options={{ headerTitle: "Firmalar" }} />
          <Stack.Screen name="CompanyForm" component={CompanyFormScreen} options={({ route }) => ({ headerTitle: route.params.mode === "add" ? "Firma Ekle" : "Düzenle", presentation: "modal" })} />
          <Stack.Screen name="JobList" component={JobListScreen} options={{ headerTitle: "Yeni Sefer Programı" }} />
          <Stack.Screen name="JobForm" component={JobFormScreen} options={({ route }) => ({ headerTitle: route.params.mode === "add" ? "İş Ekle" : "Düzenle", presentation: "modal" })} />
          <Stack.Screen name="CompletedJobList" component={CompletedJobListScreen} options={{ headerTitle: "Gerçekleşen Seferler" }} />
          <Stack.Screen name="CompletedJobForm" component={CompletedJobFormScreen} options={({ route }) => ({ headerTitle: route.params.mode === "add" ? "İş Ekle" : "Düzenle", presentation: "modal" })} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerTitle: "Ayarlar" }} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});