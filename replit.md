# LogisticsPRO - Carrier Registration App

## Overview
A mobile application for registering and managing carriers (nakliyeci). Single-user direct access app (multi-account will be integrated later). Features trip creation, WhatsApp-based information sharing, IBAN payment tracking, commission management, wallet tracking, and push notifications.

**Status**: MVP Complete - V1.0.1
**Version**: 1.0.1 (CHECKPOINT - STABLE RELEASE)
**Creator**: Tolga Tunahan (Designer & Developer)
**License**: Proprietary - © 2025 Tolga Tunahan

## V1.0.1 Checkpoint Summary (November 26, 2025)

### ✅ COMPLETED FEATURES & FIXES

**Architecture:**
- Removed admin panel and login system - app now auto-logs in with default "LogisticsPRO" user
- Direct navigation to MainTabs on app start (no authentication flow)
- Single user hardcoded in AuthContext for immediate access

**UI/UX Fixes:**
- ✅ Pinch-to-zoom completely disabled on web (CSS font-size 16px rule + viewport meta tags)
- ✅ Input auto-zoom on keyboard focus eliminated (global CSS override)
- ✅ Removed viewport zoom triggers - user cannot zoom via pinch or browser controls
- ✅ Added `hitSlop={8}` to all delete buttons for better touch targets

**Bug Fixes:**
- ✅ Fixed IBAN delete button - removed Alert.alert async callback, now direct delete
- ✅ Fixed Bildiri (Notification) delete button - same pattern, works instantly
- ✅ Settings screen cleaned up - removed unused Account Settings section
- ✅ Removed Notifications import where not used

**Form Improvements:**
- ✅ Bildiri form all fields are now OPTIONAL (no validation errors)
- ✅ Empty fields default to placeholder text: "Adı belirtilmedi", "Yer belirtilmedi", "Bilgi yok"
- ✅ Phone and vehicle type already optional

**Screen Status:**
- ✅ HomeScreen - Works
- ✅ CarrierListScreen - Works
- ✅ JobListScreen - Works
- ✅ AvailabilityScreen (Bildiri) - Works (optional form fields, delete working)
- ✅ WalletScreen - Works
- ✅ SettingsScreen - Works (IBAN management only, no account section)

## Current State
Single-user mobile app fully functional:
- **User Authentication**: Auto-login as "LogisticsPRO" (no UI, happens in background)
- **Carrier Management**: Add, edit, delete carriers
- **Job Management**: Planned and completed jobs tracking
- **Availability Notifications**: Add/delete carrier availability "bildiri" with optional fields
- **Payment Tracking**: IBAN management (add/delete), wallet, commission tracking
- **Push Notifications**: expo-notifications integration (works on native)
- **Data Persistence**: Local AsyncStorage
- **Web Compatibility**: Works on web with zoom disabled
- **UI Design**: iOS 26+ Liquid Glass design, Turkish interface

## Tech Stack
- **Framework**: Expo SDK 54 with React Native
- **Navigation**: React Navigation 7 (Native Stack + Bottom Tabs)
- **Storage**: AsyncStorage for local data persistence
- **Notifications**: expo-notifications for push notifications
- **UI**: Custom components following iOS 26 liquid glass design principles
- **Language**: Turkish interface, TypeScript
- **Platform**: Web + Native (iOS/Android via Expo Go)

## Project Architecture

### Navigation Structure
```
RootNavigator (Stack)
├── MainTabs (BottomTabNavigator - direct entry, no login)
│   ├── HomeStack
│   │   ├── HomeScreen (home tab - carriers list)
│   │   └── CarrierFormScreen (add/edit modal)
│   ├── JobsStack
│   │   ├── JobListScreen (job management)
│   │   ├── JobFormScreen (add/edit jobs)
│   │   ├── CompletedJobListScreen
│   │   └── CompletedJobFormScreen
│   ├── AvailabilityScreen (Bildiri notifications)
│   ├── WalletScreen (payments tab)
│   └── SettingsStack
│       └── SettingsScreen (IBAN management, About, Privacy)
```

### Key Directories
- `/screens` - Screen components
- `/components` - Reusable UI components (ScreenScrollView, ScreenKeyboardAwareScrollView, Card, etc.)
- `/contexts` - AuthContext (single user auto-login)
- `/hooks` - useTheme, useScreenInsets
- `/utils` - storage.ts (data persistence)
- `/constants` - theme.ts (design tokens)
- `/navigation` - Navigation config

### Data Models (AsyncStorage)
**Carrier**: id, name, phone, plate, vehicleType, createdAt, updatedAt
**PlannedJob**: companyId, cargoType, tonnage, dimensions, loadingLocation, deliveryLocation, dates, costs
**CompletedJob**: Similar to PlannedJob with completion data
**CarrierAvailability** (Bildiri): carrierName, carrierPhone, currentLocation, destinationLocation, notes, capacity, loadType, expiresAt
**IBAN**: id, ibanNumber, nameSurname

## CRITICAL FIX PATTERNS (November 26, 2025)

### Pattern 1: Delete Functions - MUST NOT USE Alert.alert with async callbacks
❌ WRONG:
```javascript
const handleDelete = (item) => {
  Alert.alert("Sil", "Silmek istediğinize emin misiniz?", [
    { text: "İptal", style: "cancel" },
    {
      text: "Sil",
      style: "destructive",
      onPress: async () => { // ← FAILS on web
        await deleteItem(item.id);
      },
    },
  ]);
};
```

✅ CORRECT:
```javascript
const handleDelete = async (item) => {
  await deleteItem(item.id);
  // Optionally show Alert after
};
```

### Pattern 2: Web Input Auto-Zoom
**Solution implemented in App.tsx:**
```javascript
// Add to App.tsx useEffect
const style = document.createElement('style');
style.textContent = `
  input, textarea, select {
    font-size: 16px !important;
  }
  input:focus, textarea:focus, select:focus {
    font-size: 16px !important;
  }
`;
document.head.appendChild(style);
```

**Also in app.json web config:**
```json
"meta": {
  "viewport": "width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"
}
```

### Pattern 3: Safe Area Insets on Forms
Use `ScreenKeyboardAwareScrollView` component at root level for forms with TextInput fields. NEVER nest it.

## Running the App
1. `npm run dev` - Start Expo dev server
2. Scan QR code with Expo Go (iOS/Android)
3. Or open web URL at http://localhost:8081

## User Preferences
- Turkish language interface
- Single-user app (no login screen)
- Simple, clean business-focused UI
- NO zoom on web/mobile
- iOS 26 liquid glass design with frosted glass effects
- Optional form fields (no validation errors)
- Direct delete actions (no confirmation dialogs on web)

## Important Notes

### What NOT to Do
- ❌ Never use Alert.alert with async callbacks inside onPress
- ❌ Never remove zoom prevention from App.tsx or app.json viewport
- ❌ Never add required field validation to Bildiri form
- ❌ Never nest ScreenKeyboardAwareScrollView inside other components
- ❌ Never use Alert.alert for deletions on web (use direct state updates)

### Web Compatibility Issues Fixed
1. Alert.alert nested callbacks - Don't use them, use direct async handlers
2. Input auto-zoom - Fixed with CSS fontSize 16px rule
3. Pinch zoom - Fixed with viewport meta + touchmove listener + CSS
4. Window.location.reload - Not used (Expo doesn't support it)

### Package Notes
- All packages in package.json are Expo Go compatible
- No additional native modules added
- TypeScript with React Native (NOT React)
- No HTML/CSS - all React Native styles

## Recent Changes (V1.0.1 - November 26, 2025)

### Major Changes
1. **Removed Admin System** - No login screen, direct app access
2. **Fixed Web Zoom** - CSS override + viewport meta + touch listener
3. **Fixed Delete Buttons** - Removed Alert.alert callbacks across app
4. **Optional Form Fields** - Bildiri form no longer requires all fields
5. **Settings Cleanup** - Removed account settings section

### Files Modified
- App.tsx - Added web zoom prevention CSS
- app.json - Updated web viewport config
- AuthContext.tsx - Hardcoded single user auto-login
- SettingsScreen.tsx - Removed account settings, cleaned imports
- AvailabilityScreen.tsx - Fixed delete button, made form optional
- screens/JobFormScreen.tsx, CarrierFormScreen.tsx - All delete handlers fixed

## ROLLBACK INSTRUCTION
If you need to return to V1.0.1: **Use project checkpoints feature**
- This entire state is saved as of November 26, 2025, ~14:00 UTC
- All web zoom issues fixed
- All delete buttons working
- Form fields optional
- Single-user auto-login working
- App completely stable

## Future Work (Multi-Account Integration)
- Multi-user system will be added later
- Authentication UI will be re-introduced when needed
- Current single-user code can be wrapped in auth flow then

---

**Last Checkpoint**: V1.0.1 (November 26, 2025) - STABLE & PRODUCTION READY
**Creator**: Tolga Tunahan
**License**: Proprietary - © 2025 Tolga Tunahan
