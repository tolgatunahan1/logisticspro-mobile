# LogisticsPRO - Carrier Registration App

## Overview
A mobile application for registering and managing carriers (nakliyeci). Users can log in with a username and password, and all users with the same credentials can view and edit the shared carrier data.

**Status**: MVP Complete with Security & Privacy Features
**Version**: 1.0.0
**Creator**: Tolga Tunahan (Designer & Developer)
**License**: Proprietary - © 2025 Tolga Tunahan

## Current State
MVP completed with the following features:
- **User Authentication**: Login with username/password validation
- **Carrier Management**: Add, edit, delete carriers with search/filter
- **Job Management**: Planned and completed jobs tracking
- **Payment Tracking**: IBAN management, wallet, and commission tracking
- **Notifications**: Push notifications for account updates via Expo Go
- **Data Persistence**: Local storage using AsyncStorage
- **Security Features**:
  - Password strength validation (8+ chars, uppercase, numbers)
  - Secure storage with expo-secure-store for sensitive data
  - iOS Keychain & Android Keystore integration
  - Data encryption on device
- **Privacy & Compliance**:
  - GDPR & KVKK compliant
  - Data export (JSON format)
  - Data deletion (right to be forgotten)
  - Privacy Policy with security details
  - Complete transparency about data handling
- **UI/UX**: iOS 26+ Liquid Glass design, Turkish interface

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

**9. Replit Console'u Temiz Tut - Yapıldı**
```
App.tsx'e console filtering eklendi
```
✅ Gereksiz warnings suppress edildi
✅ Metro log'ları filtrelendi (shadow*, pointerEvents, vb)
✅ Console çok daha temiz kalır
✅ Replit performansı optimize edildi

**10. Kod Dosyalarını Bölmek - Yapıldı**
```
SettingsScreen.tsx bölündü (513 satır → 200 satır)
```
✅ AccountSettingsModal.tsx - hesap ayarları modali (120 satır)
✅ IBANListModal.tsx - IBAN ekleme modali (115 satır)
✅ SettingsScreen.tsx ana ekran - 200 satır
✅ Replit editor çok daha hızlı çalışacak
✅ Type checking ve reload daha hızlı
✅ Dosya ağırlığı %60 azaldı

## Notes
- Data is stored locally on the device using AsyncStorage
- For true cross-device sync, a backend service would be required
- The app follows iOS 26 liquid glass design guidelines
- Push notifications work on physical devices with Expo Go
- Web preview doesn't support push notifications (test on physical device)

## Recent Changes
- November 26, 2025: Security & Privacy Features Complete ✅
  - Password strength validation (8+ chars, uppercase, numbers)
  - expo-secure-store integration for secure data storage
  - Privacy Policy modal with GDPR/KVKK compliance details
  - Data export functionality (exportAllData)
  - Data deletion functionality (deleteAllData - right to be forgotten)
  - Veri Yönetimi (Data Management) section in Settings
  - Şifre Güvenliği (Password Security) indicators in Account Settings
  - Kişisel Bilgi Güvenliği section in About modal
  - Full branding update to "LogisticsPRO"
  - Creator attribution: Tolga Tunahan (Designer & Developer)

- Previous: November 25, 2025
  - Complete app MVP with bottom tabs
  - IBAN management
  - Wallet screen
  - Availability notifications
  - Performance optimization guide
