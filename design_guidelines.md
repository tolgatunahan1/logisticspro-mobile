# Design Guidelines: Nakliyeci Kayıt Uygulaması (Carrier Registration App)

## Architecture Decisions

### Authentication
**Auth Required** - Users must sign in with username/password to access shared carrier data.

**Implementation:**
- Custom username/password authentication (no SSO required for this business app)
- Login screen with:
  - Username field
  - Password field
  - "Giriş Yap" (Login) button
  - Simple error messages for invalid credentials
- Auto-login on subsequent app opens (persist session)
- Logout option in settings
- No sign-up flow needed (admin creates accounts)

### Navigation
**Stack-based navigation** - This is a single-purpose app focused on carrier management.

Navigation Structure:
- Main Stack:
  - Login Screen (if not authenticated)
  - Carrier List Screen (home/default)
  - Add/Edit Carrier Screen (modal)
  - Settings Screen (accessible from header)

No tab bar needed - keeps the interface simple and focused.

## Screen Specifications

### 1. Login Screen
**Purpose:** Authenticate users to access shared carrier database

**Layout:**
- **Header:** None (full screen with logo/app name at top)
- **Main Content:** Scrollable form (centered vertically)
  - App title: "Nakliyeci Kayıt"
  - Username input field
  - Password input field (secure entry)
  - Login button (full width)
  - Error message area (if login fails)
- **Safe Area Insets:** 
  - Top: insets.top + Spacing.xl
  - Bottom: insets.bottom + Spacing.xl

**Components:**
- Text inputs with clear labels
- Primary button for login
- Error text component

---

### 2. Carrier List Screen (Home)
**Purpose:** Display all registered carriers with search and quick actions

**Layout:**
- **Header:** Default navigation header (transparent)
  - Title: "Nakliyeciler" (Carriers)
  - Right button: Settings icon (gear)
  - Search bar integrated below title
- **Main Content:** Scrollable list
  - Search bar (filters by name, phone, or plate)
  - List of carrier cards showing:
    - Name (bold, larger text)
    - Phone number (with call icon)
    - License plate
    - Vehicle type
    - Edit/Delete actions (swipe or tap)
  - Empty state: "Henüz nakliyeci eklenmedi" message with Add button
- **Floating Element:** 
  - "+" FAB (Floating Action Button) in bottom-right corner
  - Opens Add Carrier screen
- **Safe Area Insets:**
  - Top: headerHeight + Spacing.xl
  - Bottom: insets.bottom + Spacing.xl (for FAB positioning)

**Components:**
- Search bar with clear button
- List/FlatList component
- Carrier card component
- Floating action button with shadow
- Empty state illustration

---

### 3. Add/Edit Carrier Screen
**Purpose:** Input or modify carrier information

**Layout:**
- **Header:** Default navigation header
  - Left button: "İptal" (Cancel) or back arrow
  - Title: "Nakliyeci Ekle" or "Düzenle"
  - Right button: "Kaydet" (Save)
- **Main Content:** Scrollable form
  - Input fields in order:
    1. Ad Soyad (Full Name) - required
    2. Telefon Numarası (Phone Number) - required, numeric keyboard
    3. Plaka (License Plate) - required, auto-uppercase
    4. Araç Tipi (Vehicle Type) - required, picker/dropdown with common types:
       - Kamyon (Truck)
       - Kamyonet (Van)
       - Tır (Semi-truck)
       - Açık Kasa (Flatbed)
       - Kapalı Kasa (Enclosed)
  - Delete button (only on edit mode, at bottom, destructive style)
- **Safe Area Insets:**
  - Top: Spacing.xl
  - Bottom: insets.bottom + Spacing.xl

**Components:**
- Text input fields with labels
- Picker/dropdown for vehicle type
- Header action buttons
- Delete button (destructive, with confirmation alert)

---

### 4. Settings Screen
**Purpose:** Account management and app preferences

**Layout:**
- **Header:** Default navigation header
  - Left button: Back arrow
  - Title: "Ayarlar" (Settings)
- **Main Content:** Scrollable list of settings options
  - User info section (username display)
  - "Çıkış Yap" (Logout) button with confirmation alert
- **Safe Area Insets:**
  - Top: Spacing.xl
  - Bottom: insets.bottom + Spacing.xl

**Components:**
- Settings list items
- Logout button (destructive style)
- Confirmation alert dialog

## Design System

### Color Palette
**Primary Colors:**
- Primary Blue: #2563EB (for CTAs, active states, FAB)
- Dark Text: #1F2937 (headings, primary text)
- Medium Text: #6B7280 (secondary text, labels)
- Light Gray: #F3F4F6 (backgrounds, input fields)
- White: #FFFFFF (cards, modals)

**Semantic Colors:**
- Success Green: #10B981 (successful saves)
- Destructive Red: #EF4444 (delete actions)
- Border Gray: #E5E7EB (dividers, input borders)

### Typography
**Font Family:** System default (SF Pro for iOS, Roboto for Android)

**Sizes:**
- Header/Title: 24px, bold
- Screen Title: 20px, semibold
- Card Title (Carrier Name): 18px, semibold
- Body Text: 16px, regular
- Secondary Text: 14px, regular
- Small Text: 12px, regular

### Spacing
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- xxl: 32px

### Components

**Floating Action Button (FAB):**
- Size: 56x56px circle
- Background: Primary Blue
- Icon: "+" (white, 24px)
- Position: 16px from right edge, 16px from bottom (+ bottom safe area)
- Shadow specifications:
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 2
- Press feedback: Scale to 0.95

**Carrier Card:**
- Background: White
- Padding: 16px
- Border radius: 12px
- Border: 1px solid #E5E7EB
- Press feedback: Light gray background (#F9FAFB)
- No shadow

**Input Fields:**
- Height: 48px
- Padding: 12px horizontal
- Border: 1px solid #E5E7EB
- Border radius: 8px
- Background: White
- Focus state: Border color changes to Primary Blue
- Label above input, 12px, medium text color

**Primary Button:**
- Height: 48px
- Background: Primary Blue
- Text: White, 16px, semibold
- Border radius: 8px
- Press feedback: Slightly darker blue (#1D4ED8)

**Search Bar:**
- Height: 40px
- Background: Light Gray (#F3F4F6)
- Border radius: 8px
- Placeholder text: "Ara..." (Search...)
- Magnifying glass icon on left
- Clear button (X) on right when active

### Interaction Design

**Touch Feedback:**
- All buttons: Opacity 0.7 on press
- FAB: Scale 0.95 on press
- Cards: Background color change on press
- List items: Highlight background on press

**Confirmation Alerts:**
- Delete carrier: "Bu nakliyeciyi silmek istediğinizden emin misiniz?"
- Logout: "Çıkış yapmak istediğinizden emin misiniz?"

**Swipe Actions (optional):**
- Swipe left on carrier card reveals delete action (red background)
- Swipe right reveals edit action (blue background)

### Accessibility
- Minimum touch target size: 44x44px
- Color contrast ratio: 4.5:1 for all text
- All inputs have clear labels
- Error messages announced for screen readers
- Tab order follows logical reading flow

### Assets Required
**Icons (use Feather icons from @expo/vector-icons):**
- Settings (gear icon)
- Add/Plus (for FAB)
- Search (magnifying glass)
- Phone (call icon on cards)
- Trash (delete)
- Edit (pencil)
- Check (save/confirm)
- X (close/cancel)
- Chevron-right (navigation)

**No custom graphics needed** - keep interface clean and functional for business use.