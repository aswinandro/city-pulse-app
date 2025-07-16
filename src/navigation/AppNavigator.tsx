"use client"

import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../providers/AuthProvider"
import { useLanguage } from "../hooks/useLanguage"

// Screens
import SplashScreen from "../screens/SplashScreen"
import LoginScreen from "../screens/auth/LoginScreen"
import SignUpScreen from "../screens/auth/SignUpScreen"
import HomeScreen from "../screens/HomeScreen"
import EventDetailScreen from "../screens/EventDetailScreen"
import ProfileScreen from "../screens/ProfileScreen"
import FavoritesScreen from "../screens/FavoritesScreen"

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  )
}

function MainTabNavigator() {
  const { t } = useLanguage()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Favorites") {
            iconName = focused ? "heart" : "heart-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          } else {
            iconName = "home-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t("home") }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ tabBarLabel: t("favorites") }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t("profile") }} />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    return <SplashScreen />
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}
