# LogisticsPRO - Turkish Logistics Management App

## Project Overview
A React Native/Expo mobile app for Turkish logistics management with user authentication, admin approval workflow, and job/carrier/company management using AsyncStorage.

## Current Status
- **Auth System**: ✅ STABLE & WORKING - User Login/Signup/Admin with AsyncStorage (no backend)
- **Admin Panel**: ✅ WORKING - Pending user approval + Approved users management
- **Main Features**: Carriers (nakliyeciler), Companies (firmalar), Jobs (seferler)
- **UI**: iOS Liquid Glass design theme

## 🔒 CRITICAL: STABLE AUTHENTICATION SYSTEM - DO NOT MODIFY
**User Login/Authentication System Status: PRODUCTION STABLE**
- User signup with approval workflow ✅
- Admin login with toggle UI ✅ 
- Admin dashboard with pending/approved users ✅
- User approval/rejection/revoke functionality ✅
- Logout functionality ✅
- AsyncStorage persistence working correctly ✅

**⛔ DO NOT MAKE ANY CHANGES TO:**
- contexts/AuthContext.tsx
- screens/LoginScreen.tsx
- screens/AdminDashboard.tsx
- utils/userManagement.ts (auth functions)
- navigation/RootNavigator.tsx (auth flow)

This authentication system is working perfectly and must be preserved as-is.

## Session 2 Fixes
1. **Admin Login UI** - Added Admin/Kullanıcı toggle buttons in LoginScreen
2. **AsyncStorage Key Migration** - Fixed key mismatch (@logistics_admin_user)
3. **Admin Initialization** - Robust migration + verification logic
4. **Admin Dashboard Enhanced**:
   - Added stat cards: Aktif Kullanıcılar + Beklemede counts
   - Added Onaylanmış Kullanıcılar section with approval dates
   - Added revoke (onayı kaldır) functionality
   - Turkish date formatting for approvalDates

## Architecture
- Pure frontend (AsyncStorage only, no backend allowed per Expo guidelines)
- Navigation: React Navigation v7
- State: AuthContext for user/admin state
- Storage: @react-native-async-storage/async-storage
- UI: Liquid Glass theme with iOS 26 design guidelines

## Known Limitations
- Passwords stored in plain text (hardcoded admin credentials for now)
- No persistence across app reinstalls (local storage only)
- Admin credentials: username "tolgatunahan" password "1Liraversene"

## File Structure
- contexts/AuthContext.tsx - User/Admin auth state (STABLE)
- screens/LoginScreen.tsx - Login with admin+user toggle support (STABLE)
- screens/AdminDashboard.tsx - Pending/Approved user management (STABLE)
- utils/userManagement.ts - User/Admin storage functions (STABLE)
- navigation/RootNavigator.tsx - Auth flow routing (STABLE)

## Next Steps Available
- Add carrier (nakliyeciler) management features
- Add company (firmalar) management features
- Add job (seferler) management features
- Implement expo-secure-store for password security (future enhancement only)
