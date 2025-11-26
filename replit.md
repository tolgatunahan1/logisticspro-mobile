# Nakliyeci Kayıt - Carrier Registration App

## Overview
A mobile application for registering and managing carriers (nakliyeci). Users can log in with a username and password, and all users with the same credentials can view and edit the shared carrier data.

## Current State
MVP completed with the following features:
- User login with username/password
- Add, edit, and delete carriers
- Carrier information: Name, Phone, Plate, Vehicle Type
- Search and filter carriers
- Settings screen with logout functionality
- Data persistence using AsyncStorage (local storage)
- Account management with profile update
- Push notifications for account updates (via Expo Go)
- IBAN management for payments
- Wallet screen for transaction tracking
- Completed jobs tracking
- Carrier availability notifications

## Tech Stack
- **Framework**: Expo SDK 54 with React Native
- **Navigation**: React Navigation 7 (Native Stack + Bottom Tabs)
- **Storage**: AsyncStorage for local data persistence
- **Notifications**: expo-notifications for push notifications
- **UI**: Custom components following iOS 26 liquid glass design principles
- **Language**: Turkish interface, TypeScript

## Project Architecture

### Navigation Structure
```
RootNavigator (Stack)
├── LoginScreen (if not authenticated)
├── BottomTabNavigator
│   ├── CarrierStack
│   │   ├── CarrierListScreen (home)
│   │   └── CarrierFormScreen (modal)
│   ├── JobsStack
│   │   ├── PlannedJobsScreen
│   │   └── CompletedJobsScreen
│   ├── AvailabilityScreen
│   └── SettingsStack
│       └── SettingsScreen (IBAN management, account settings)
└── WalletScreen (tab for payments)
```

### Key Directories
- `/screens` - Screen components
- `/components` - Reusable UI components
- `/contexts` - React contexts (AuthContext)
- `/hooks` - Custom hooks (useTheme, useScreenInsets)
- `/utils` - Utility functions (storage.ts)
- `/constants` - Theme and design tokens
- `/navigation` - Navigation configuration

### Data Models
**Carrier**:
- id: string
- name: string
- phone: string
- plate: string
- vehicleType: string (kamyon, kamyonet, tir, acik_kasa, kapali_kasa)
- createdAt: number
- updatedAt: number

**IBAN**:
- id: string
- ibanNumber: string
- nameSurname: string

## Running the App
1. Run `npm run dev` to start the Expo development server
2. Scan the QR code with Expo Go (Android) or Camera app (iOS)
3. Or open in web browser at the provided URL

## User Preferences
- Turkish language interface
- Simple, clean UI design
- Business-focused functionality
- No pinch-to-zoom on web/mobile
- iOS 26 liquid glass design

## Replit Performance Optimization

### IDE Settings (Yapman Gerekenler - Manual Steps)

**1. Always On - KAPALı**
```
Sağ üst → Tools → Deploy → Always On → Off
```
✅ Mobil uygulamalar için gerekli değil
✅ CPU/CPU tasarrufu sağlar

**2. Preview Auto-Open - KAPALI**
```
Sağ üst → Run → "Preview Auto-Open" → Off
```
✅ Konsol log akışı donmaz
✅ Expo çıktılarını daha rahat görebilirsin

**3. Autosave - "On Blur" yap**
```
Ayarlar → Editor Preferences → Autosave: On Change → On Blur
```
✅ Yazarken proje kasmaz
✅ Dosya dışına tıklayınca kaydeder

**4. Auto-Format - Açık Kalsın**
```
Ayarlar → Editor Preferences → Auto-Format: On
```
✅ Kod biçimi tutarlı kalır

**5. Package Installation Mode - Classic**
```
Üst menü → Workspace Settings → Package Installation Mode → Classic
```
✅ Paketleri sen kontrol et
✅ node_modules daha stabil kalır

**6. Node.js Sürümü - Sabitleme**
```
.nvmrc dosyasında Node sürümü belirtilmiştir → v20.11.0
```
✅ Otomatik sürüm değişimi olmaz
✅ Expo istikrarlı kalır

**7. Watcher Yükünü Hafiflet - Yapıldı**
```
.editorconfig dosyası oluşturuldu
```
✅ Replit otomatik dosya izleyicisi optimize edildi
✅ TypeScript dosyaları: LF line endings
✅ Tutarlı formatting kuralları

**8. Gereksiz Klasörleri İgnore Et - Yapıldı**
```
.replitignore dosyası oluşturuldu
```
✅ node_modules (paketi tekrar yükleme)
✅ .expo (cache dosyaları)
✅ dist (build çıktıları)
✅ .git, .vscode, .DS_Store, *.log da ignored
✅ Replit çok daha hafif çalışacak

## Notes
- Data is stored locally on the device using AsyncStorage
- For true cross-device sync, a backend service would be required
- The app follows iOS 26 liquid glass design guidelines
- Push notifications work on physical devices with Expo Go
- Web preview doesn't support push notifications (test on physical device)

## Recent Changes
- November 26, 2025: Performance optimization guide added
  - expo-notifications package installed
  - Account update notifications enabled
  - Replit IDE optimization recommendations documented
  - All source code exported (all-source-code.txt)
  
- Previous: November 25, 2025
  - Complete app MVP with bottom tabs
  - IBAN management
  - Wallet screen
  - Availability notifications
