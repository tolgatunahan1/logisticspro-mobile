import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { View } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";

import HomeScreen from "@/screens/HomeScreen";
import WalletScreen from "@/screens/WalletScreen";

export type BottomTabParamList = {
  HomeTab: undefined;
  WalletTab: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();
const HomeStack = createNativeStackNavigator();
const WalletStack = createNativeStackNavigator();

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

export default function BottomTabNavigator() {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "HomeTab") {
            return <Feather name="home" size={24} color={color} />;
          } else if (route.name === "WalletTab") {
            return <Feather name="wallet" size={24} color={color} />;
          }
          return null;
        },
        tabBarActiveTintColor: theme.link,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: 75,
          paddingBottom: Spacing.md,
          paddingTop: Spacing.sm,
        },
        tabBarBackground: () => (
          <BlurView intensity={90} style={{ flex: 1, overflow: "hidden" }}>
            <View
              style={{
                flex: 1,
                backgroundColor: isDark
                  ? "rgba(30, 30, 30, 0.4)"
                  : "rgba(255, 255, 255, 0.6)",
                borderTopColor: isDark
                  ? "rgba(255, 255, 255, 0.15)"
                  : "rgba(0, 0, 0, 0.08)",
                borderTopWidth: 1,
              }}
            />
          </BlurView>
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: Spacing.sm,
          paddingBottom: Spacing.xs,
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
    </Tab.Navigator>
  );
}
