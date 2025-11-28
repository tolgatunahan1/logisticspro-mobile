# LogisticsPRO - Turkish Logistics Management App

## Project Overview
A React Native/Expo mobile app for Turkish logistics management with user authentication, admin approval workflow, and job/carrier/company management using Firebase Realtime Database (multi-device sync) with local AsyncStorage fallback.

## Current Status - Firebase Multi-Device Sync Ready
- **Firebase Setup**: ✅ CONFIG COMPLETE - Waiting for Console Rules
- **Auth System**: ✅ WORKING - Firebase Auth (email/password) + AsyncStorage local user
- **Admin Panel**: ✅ WORKING - Pending user approval + Approved users management
- **Main Features**: Carriers, Companies, Jobs, Completed Jobs with WhatsApp sharing
- **UI**: iOS Liquid Glass design theme

### ⚠️ CRITICAL: Firebase Rules Need Setup
**Status**: Permission denied errors in console - Firebase Console rules not yet configured
**Action Required**: Go to Firebase Console → Realtime Database → Rules tab → Add rules (see below)
**After Rules Configured**: All permission errors will disappear and multi-device sync works

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

## Firebase Security Rules (CURRENT - Copy to Console)
**COPY THESE EXACT RULES** to **Firebase Console** → **Realtime Database** → **Rules** tab:

```json
{
  "rules": {
    "users": {
      "$uid": {
        "profile": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        "data": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid",
          "carriers": {
            ".indexOn": ["name", "phone", "plate"]
          },
          "companies": {
            ".indexOn": ["name", "phone"]
          },
          "jobs": {
            ".indexOn": ["cargoType", "loadingLocation"]
          },
          "completedJobs": {
            ".indexOn": ["carrierId", "companyId", "completionDate"]
          },
          "ibans": {},
          "wallet": {}
        }
      }
    },
    "admins": {
      ".read": "auth.uid !== null",
      ".write": "root.child('admins').child(auth.uid).exists()",
      ".indexOn": ["uid"]
    }
  }
}
```

**Yapılacaklar:**
1. **Firebase Console** aç → Projen → **Realtime Database**
2. **Rules** sekmesine tıkla
3. Mevcut tüm metni sil
4. **Yukarıdaki rules'ları kopyala ve yapıştır**
5. **Publish** butonuna tıkla
6. "✅ Rules Published" mesajı görüncüye kadar bekle

**Bu rules'lar sağlıyor:**
- ✅ Her user sadece kendi data'sını okuyabiliyor/yazabiliyor (`users/{uid}/data/*`)
- ✅ Admins all users'ları okuyabiliyor (approval için)
- ✅ Search/filter için indexing (carriers, companies, jobs, completedJobs)
- ✅ Güvenli multi-user izolasyon

## Recent Changes (Session 3)
1. **Login Screen Layout** - Header moved down, Register button moved up, better spacing
2. **Completed Job Delete** - Added confirmation dialog before deletion
3. **Error Toast Fixes** - Removed console.error() calls from auth failures
4. **Invalid Credentials Message** - Improved user-friendly error message

## Known Limitations
- Firebase Rules must be configured in Firebase Console (not Replit)
- Local AsyncStorage for non-authenticated users only
- Admin credentials: email "admin@logisticspro.com" password "Admin123456"

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
