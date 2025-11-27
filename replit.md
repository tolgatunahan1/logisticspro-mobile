# LogisticsPRO - Turkish Logistics Management App

## Project Overview
A React Native/Expo mobile app for Turkish logistics management with user authentication, admin approval workflow, and job/carrier/company management using AsyncStorage.

## Current Status
- **Auth System**: Login/Signup/Admin with AsyncStorage (no backend)
- **Admin Panel**: Pending user approval workflow
- **Main Features**: Carriers (nakliyeciler), Companies (firmalar), Jobs (seferler)
- **UI**: iOS Liquid Glass design theme

## Critical Issues Fixed This Session
1. **Admin Login Bug** - Admin credentials weren't being checked (loginAdmin function existed but wasn't called)
   - Fixed: Added loginAdmin check to handleLogin in LoginScreen
2. **Async Initialization** - initializeDefaultAdmin wasn't properly awaited
   - Fixed: Wrapped in proper async/await pattern
3. **Runtime Crashes** - App was crashing on navigation
   - Status: Recovered with proper error handling

## Architecture
- Pure frontend (AsyncStorage only, no backend allowed per Expo guidelines)
- Navigation: React Navigation v7
- State: AuthContext for user/admin state
- Storage: @react-native-async-storage/async-storage
- UI: Liquid Glass theme with iOS 26 design guidelines

## Known Limitations
- Passwords stored in plain text (should use expo-secure-store in future)
- No persistence across app reinstalls (local storage only)
- Admin credentials hardcoded: username "tolgatunahan" password "1Liraversene"

## File Structure
- contexts/AuthContext.tsx - User/Admin auth state
- screens/LoginScreen.tsx - Login with admin+user support
- screens/AdminDashboard.tsx - Pending user approval management
- utils/userManagement.ts - User/Admin storage functions
- navigation/RootNavigator.tsx - Auth flow routing

## Next Priority
- Test admin login flow in Expo Go
- Verify app stability on app lifecycle changes
- Consider adding expo-secure-store for passwords
