import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "@/screens/LoginScreen";
import CarrierListScreen from "@/screens/CarrierListScreen";
import CarrierFormScreen from "@/screens/CarrierFormScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { Carrier } from "@/utils/storage";

export type RootStackParamList = {
  Login: undefined;
  CarrierList: undefined;
  CarrierForm: { carrier?: Carrier; mode: "add" | "edit" };
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
      {user ? (
        <>
          <Stack.Screen
            name="CarrierList"
            component={CarrierListScreen}
            options={{
              headerTitle: () => <HeaderTitle title="Nakliyeci Kayıt" />,
            }}
          />
          <Stack.Screen
            name="CarrierForm"
            component={CarrierFormScreen}
            options={({ route }) => ({
              headerTitle: route.params.mode === "add" ? "Nakliyeci Ekle" : "Düzenle",
              presentation: "modal",
            })}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerTitle: "Ayarlar",
            }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
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
