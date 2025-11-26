import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";

import HomeScreen from "@/screens/HomeScreen";
import WalletScreen from "@/screens/WalletScreen";
import AvailabilityScreen from "@/screens/AvailabilityScreen";

export type BottomTabParamList = {
  HomeTab: undefined;
  WalletTab: undefined;
  AvailabilityTab: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();
const HomeStack = createNativeStackNavigator();
const WalletStack = createNativeStackNavigator();
const AvailabilityStack = createNativeStackNavigator();

function HomeStackScreen() {
  const { theme, isDark } = useTheme();
  return (
    <HomeStack.Navigator screenOptions={{ ...getCommonScreenOptions({ theme, isDark }) }}>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Nakliyeci Kayıt" />,
        }}
      />
    </HomeStack.Navigator>
  );
}

function WalletStackScreen() {
  const { theme, isDark } = useTheme();
  return (
    <WalletStack.Navigator screenOptions={{ ...getCommonScreenOptions({ theme, isDark }) }}>
      <WalletStack.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          headerTitle: "Şirket Cüzdanı",
        }}
      />
    </WalletStack.Navigator>
  );
}

function AvailabilityStackScreen() {
  const { theme, isDark } = useTheme();
  return (
    <AvailabilityStack.Navigator screenOptions={{ ...getCommonScreenOptions({ theme, isDark }) }}>
      <AvailabilityStack.Screen
        name="Availability"
        component={AvailabilityScreen}
        options={{
          headerTitle: "Nakliyeci Bildirimleri",
        }}
      />
    </AvailabilityStack.Navigator>
  );
}

export default function BottomTabNavigator() {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: "home" | "shopping-bag" | "bell" = "home";
          if (route.name === "WalletTab") {
            iconName = "shopping-bag";
          } else if (route.name === "AvailabilityTab") {
            iconName = "bell";
          }
          return <Feather name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: theme.link,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.backgroundDefault,
          borderTopWidth: 1,
          borderTopColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
          height: 68,
          paddingBottom: Spacing.sm,
          paddingTop: Spacing.xs,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: Spacing.xs,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          tabBarLabel: "Ana Sayfa",
        }}
      />
      <Tab.Screen
        name="WalletTab"
        component={WalletStackScreen}
        options={{
          tabBarLabel: "Cüzdan",
        }}
      />
      <Tab.Screen
        name="AvailabilityTab"
        component={AvailabilityStackScreen}
        options={{
          tabBarLabel: "Bildiriler",
        }}
      />
    </Tab.Navigator>
  );
}
