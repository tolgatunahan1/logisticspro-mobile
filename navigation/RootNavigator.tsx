import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "@/screens/LoginScreen";
import AdminPanelScreen from "@/screens/AdminPanelScreen";
import BottomTabNavigator from "@/navigation/BottomTabNavigator";
import CarrierListScreen from "@/screens/CarrierListScreen";
import CarrierFormScreen from "@/screens/CarrierFormScreen";
import CompanyListScreen from "@/screens/CompanyListScreen";
import CompanyFormScreen from "@/screens/CompanyFormScreen";
import JobListScreen from "@/screens/JobListScreen";
import JobFormScreen from "@/screens/JobFormScreen";
import CompletedJobListScreen from "@/screens/CompletedJobListScreen";
import CompletedJobFormScreen from "@/screens/CompletedJobFormScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { Carrier, Company, PlannedJob, CompletedJob } from "@/utils/storage";

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
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
  const { user, isLoading } = useAuth();

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
      {!user ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
      ) : user.type === "admin" ? (
        <Stack.Screen
          name="AdminPanel"
          component={AdminPanelScreen}
          options={{
            headerShown: false,
          }}
        />
      ) : (
        <>
          <Stack.Screen
            name="MainTabs"
            component={BottomTabNavigator}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="CarrierList"
            component={CarrierListScreen}
            options={{
              headerTitle: "Nakliyeciler",
              headerBackTitleVisible: false,
            }}
          />
          <Stack.Screen
            name="CarrierForm"
            component={CarrierFormScreen}
            options={({ route }) => ({
              headerTitle: route.params.mode === "add" ? "Nakliyeci Ekle" : "Düzenle",
              presentation: "modal",
              headerBackTitleVisible: false,
            })}
          />
          <Stack.Screen
            name="CompanyList"
            component={CompanyListScreen}
            options={{
              headerTitle: "Firmalar",
              headerBackTitleVisible: false,
            }}
          />
          <Stack.Screen
            name="CompanyForm"
            component={CompanyFormScreen}
            options={({ route }) => ({
              headerTitle: route.params.mode === "add" ? "Firma Ekle" : "Düzenle",
              presentation: "modal",
              headerBackTitleVisible: false,
            })}
          />
          <Stack.Screen
            name="JobList"
            component={JobListScreen}
            options={{
              headerTitle: "Planlanan İşler",
              headerBackTitleVisible: false,
              headerBackTitle: "",
            }}
          />
          <Stack.Screen
            name="JobForm"
            component={JobFormScreen}
            options={({ route }) => ({
              headerTitle: route.params.mode === "add" ? "İş Ekle" : "Düzenle",
              presentation: "modal",
              headerBackTitleVisible: false,
            })}
          />
          <Stack.Screen
            name="CompletedJobList"
            component={CompletedJobListScreen}
            options={{
              headerTitle: "Gerçekleşen İşler",
              headerBackTitleVisible: false,
              headerBackTitle: "",
            }}
          />
          <Stack.Screen
            name="CompletedJobForm"
            component={CompletedJobFormScreen}
            options={({ route }) => ({
              headerTitle: route.params.mode === "add" ? "İş Ekle" : "Düzenle",
              presentation: "modal",
              headerBackTitleVisible: false,
            })}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerTitle: "Ayarlar",
              headerBackTitleVisible: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
