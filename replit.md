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

## Tech Stack
- **Framework**: Expo SDK 54 with React Native
- **Navigation**: React Navigation 7 (Native Stack)
- **Storage**: AsyncStorage for local data persistence
- **UI**: Custom components following iOS 26 liquid glass design principles
- **Language**: TypeScript

## Project Architecture

### Navigation Structure
```
RootNavigator (Stack)
├── LoginScreen (if not authenticated)
├── CarrierListScreen (home, with FAB for adding)
├── CarrierFormScreen (modal for add/edit)
└── SettingsScreen
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

## Running the App
1. Run `npm run dev` to start the Expo development server
2. Scan the QR code with Expo Go (Android) or Camera app (iOS)
3. Or open in web browser at the provided URL

## User Preferences
- Turkish language interface
- Simple, clean UI design
- Business-focused functionality

## Notes
- Data is stored locally on the device using AsyncStorage
- For true cross-device sync, a backend service would be required
- The app follows iOS 26 liquid glass design guidelines

## Recent Changes
- November 25, 2025: Initial MVP completed
  - Login system with username/password
  - Carrier CRUD operations
  - Search functionality
  - Settings with logout
