# Design Guidelines: Nakliyeci Kayıt Uygulaması (Carrier Registration App)

## Architecture Decisions

### Authentication
**Auth Required** - Custom username/password authentication.

**Implementation:**
- Login screen with username/password fields
- Auto-login on subsequent opens (persist session)
- Logout in settings with confirmation alert
- Admin creates accounts (no sign-up flow)

### Navigation
**Stack-based navigation:**
- Login Screen (if not authenticated)
- Carrier List Screen (home)
- Add/Edit Carrier Screen (modal presentation)
- Settings Screen (from header)

## Screen Specifications

### 1. Login Screen
**Purpose:** Authenticate users

**Layout:**
- **Header:** None
- **Main Content:** Centered scrollable form with:
  - App title "Nakliyeci Kayıt" (large, semibold, white)
  - Username input (glass morphism style)
  - Password input (secure, glass morphism style)
  - Login button (glass with gradient background)
  - Error message area
- **Safe Area Insets:**
  - Top: insets.top + Spacing.xl
  - Bottom: insets.bottom + Spacing.xl

**Visual Treatment:**
- Gradient background (soft blue-purple gradient)
- All input fields use frosted glass effect
- Smooth spring animations on input focus

---

### 2. Carrier List Screen (Home)
**Purpose:** Display carriers with search and quick actions

**Layout:**
- **Header:** Transparent navigation header
  - Large title: "Nakliyeciler" (with blur effect)
  - Right button: Settings icon (frosted glass circle)
  - Search bar below title (integrated, glass style)
- **Main Content:** Scrollable list with:
  - Glass-style search bar at top
  - List of carrier cards (glass morphism)
  - Empty state with illustration
- **Floating Element:**
  - Circular FAB (bottom-right, frosted glass with gradient)
  - Opens Add Carrier with slide-up animation
- **Safe Area Insets:**
  - Top: headerHeight + Spacing.xl
  - Bottom: insets.bottom + Spacing.xl

**Components:**
- Search bar (frosted glass, soft shadow)
- Carrier cards (glass morphism, subtle border)
- Floating action button with glow effect
- Empty state with soft illustration

**Animations:**
- List items fade in with stagger effect (100ms delay)
- Cards scale slightly on press (0.97)
- Search bar expands smoothly on focus

---

### 3. Add/Edit Carrier Screen
**Purpose:** Input/modify carrier information

**Layout:**
- **Header:** Glass-style navigation header
  - Left: "İptal" button
  - Title: "Nakliyeci Ekle" / "Düzenle"
  - Right: "Kaydet" button
- **Main Content:** Scrollable form
  - Glass-style input fields:
    1. Ad Soyad (required)
    2. Telefon Numarası (numeric keyboard)
    3. Plaka (auto-uppercase)
    4. Araç Tipi (picker with options: Kamyon, Kamyonet, Tır, Açık Kasa, Kapalı Kasa)
  - Delete button at bottom (edit mode only, glass style with red tint)
- **Safe Area Insets:**
  - Top: Spacing.xl
  - Bottom: insets.bottom + Spacing.xl

**Presentation:**
- Modal with slide-up animation (spring physics)
- Background blur/dimming
- Header buttons use haptic feedback

---

### 4. Settings Screen
**Purpose:** Account management

**Layout:**
- **Header:** Glass-style navigation header
  - Left: Back arrow
  - Title: "Ayarlar"
- **Main Content:** Scrollable list
  - User info section (glass card)
  - "Çıkış Yap" button (glass with red tint)
- **Safe Area Insets:**
  - Top: Spacing.xl
  - Bottom: insets.bottom + Spacing.xl

**Animations:**
- Items fade in on appear
- Logout button requires double-tap or confirmation alert

## Design System

### Color Palette
**Glass/Background:**
- Primary Gradient: Linear gradient from #667EEA to #764BA2
- Glass Overlay: White with 15% opacity
- Blur Background: System blur (light/dark adaptive)

**Text:**
- Primary: #1A1A1A (light mode) / #FFFFFF (dark mode)
- Secondary: #6B7280
- Tertiary: #9CA3AF

**Accents:**
- Primary Blue: #4F46E5
- Success: #10B981
- Destructive: #EF4444
- Border/Divider: White 20% opacity

### Glass Morphism Specifications
**All glass elements:**
- Background: White with 10-15% opacity
- Backdrop blur: 20px (use iOS backdrop filter)
- Border: 1px solid white with 30% opacity
- Subtle inner shadow for depth
- Border radius: 16-20px (extra rounded)

**Floating elements (FAB, modals):**
- Shadow: 
  - shadowOffset: {width: 0, height: 8}
  - shadowOpacity: 0.15
  - shadowRadius: 16
  - shadowColor: Primary Blue with 40% opacity
- Additional glow effect for FAB

### Typography
- **Font:** SF Pro (iOS system font)
- **Sizes:**
  - Large Title: 34px, bold (login screen)
  - Title: 28px, semibold (screen headers)
  - Headline: 20px, semibold (card titles)
  - Body: 17px, regular
  - Callout: 16px, regular
  - Caption: 13px, regular

### Spacing
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- xxl: 32px

### Components

**Carrier Card (Glass Style):**
- Background: White 12% opacity
- Backdrop blur: 20px
- Border: 1px white 25% opacity
- Border radius: 20px
- Padding: 20px
- Name: 20px semibold
- Details: 16px regular, secondary color
- Press: Scale to 0.97 with spring animation (tension: 300, friction: 20)

**Input Fields (Glass Style):**
- Height: 52px
- Background: White 10% opacity
- Backdrop blur: 10px
- Border: 1px white 30% opacity
- Border radius: 16px
- Padding: 16px horizontal
- Focus state: Border glows with primary blue (2px), smooth transition 200ms
- Label floating above when focused

**Floating Action Button:**
- Size: 64x64px
- Background: Linear gradient (Primary Blue to lighter blue)
- Backdrop blur: 10px
- Border: 1px white 40% opacity
- Icon: "+" white, 28px
- Position: 20px from edges + safe area
- Shadow + subtle glow effect
- Press: Scale 0.92, haptic medium impact

**Search Bar (Glass):**
- Height: 44px
- Background: White 8% opacity
- Backdrop blur: 20px
- Border radius: 14px
- Icon: Left aligned, 20px
- Clear button: Right, appears on input

**Buttons:**
- Height: 52px
- Glass background with gradient overlay
- Border radius: 16px
- Text: 17px, semibold
- Press: Opacity 0.8, scale 0.98

### Animations & Transitions

**Screen Transitions:**
- Stack navigation: Slide with parallax effect
- Modal presentation: Slide up with spring (duration: 400ms)
- Dismiss: Slide down with fade

**Micro-interactions:**
- All buttons: Scale on press (0.97-0.98)
- Cards: Lift on press (subtle shadow increase)
- Inputs: Border glow on focus (200ms ease-out)
- List items: Stagger fade-in (100ms intervals)
- Search: Expand/collapse with spring animation
- FAB: Rotate + on tap, haptic feedback

**Loading States:**
- Skeleton screens with shimmer effect (glass style)
- Activity indicators with blur background

### Accessibility
- Minimum touch target: 44x44px
- Color contrast: 4.5:1 minimum
- VoiceOver labels for all interactive elements
- Haptic feedback for important actions
- Reduced motion support (disable animations)
- Dynamic Type support

### Icons
**Use SF Symbols for iOS native feel:**
- gear (settings)
- plus (add)
- magnifyingglass (search)
- phone.fill (call)
- trash (delete)
- pencil (edit)
- checkmark (save)
- xmark (cancel)
- chevron.right (navigation)

All icons: 20-24px, with 1.5px stroke weight for consistency

**No custom illustrations needed** - rely on system icons and glass aesthetic for premium feel.