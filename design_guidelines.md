# LogisticsPRO - Modern Logistics Design Guidelines

## Design Philosophy: Liquid Glass UI + Dynamic Logistics

Premium Turkish carrier management app following Apple iOS 26+ design principles. Bright, modern aesthetic conveying movement, efficiency, and professional transportation services.

### Core Design Principles
1. **Liquid Glass Effect** - Frosted glass with dynamic light reflection
2. **Movement & Energy** - Visual elements suggesting flow and transportation
3. **Professional Logistics** - Vibrant blue and energetic orange color story
4. **Spacious Clarity** - Airy layouts with excellent contrast and readability
5. **Premium Accessibility** - High-end feel, inclusive design for all users
6. **Subtle Motion** - Spring-based animations suggesting efficiency

---

## Color Palette (Logistics Theme)

### Light Mode (Primary)
- **Background**: Pure white #FFFFFF (root), soft blue-gray #F7F9FC (secondary)
- **Primary Blue**: Vibrant logistics blue #0066FF (buttons, key actions, brand)
- **Accent Orange**: Energetic amber #FF8C00 (highlights, status, alerts)
- **Text**: Deep charcoal #1A1A1A (primary), cool gray #6B7280 (secondary)
- **Glass**: White with 10% opacity, blue tint on hover
- **Success**: Fresh green #10B981, **Destructive**: Warm red #EF4444, **Warning**: Amber #F59E0B
- **Borders**: Light blue-gray #E5E7EB

### Dark Mode
- **Background**: Deep navy #0A0E1A (root), dark slate #1C2130 (secondary)
- **Primary Blue**: Bright logistics blue #3B82F6 (slightly lighter for contrast)
- **Accent Orange**: Vibrant amber #FFA726 (warmer for dark backgrounds)
- **Text**: Pure white #FFFFFF (primary), light gray #D1D5DB (secondary)
- **Glass**: White 8% opacity with blue tint
- **System Colors**: Green #10B981, Red #EF4444, Orange #F59E0B
- **Borders**: Dark blue-gray #374151

---

## Typography System (SF Pro - Logistics Optimized)

| Level | Size | Weight | Usage | Line Height |
|-------|------|--------|-------|-------------|
| **Display** | 34px | Bold (700) | App title, hero text | 40px |
| **Large Title** | 28px | Semibold (600) | Screen titles | 34px |
| **Title** | 24px | Semibold (600) | Card headers, carriers | 30px |
| **Headline** | 20px | Semibold (600) | List items, shipments | 26px |
| **Body** | 17px | Regular (400) | Primary content | 24px |
| **Caption** | 16px | Regular (400) | Secondary info | 22px |
| **Small** | 14px | Medium (500) | Badges, status labels | 20px |

**Letter Spacing**: -0.3px for headlines, -0.2px for titles (tighter, professional look)

---

## Spacing System (Airy Layout)

```
xs:   4px   (tight spacing)
sm:   8px   (compact elements)
md:   12px  (standard gaps)
lg:   16px  (comfortable spacing)
xl:   20px  (section spacing)
2xl:  24px  (large gaps)
3xl:  32px  (major sections)
4xl:  48px  (hero spacing)
```

**Card Padding**: 20px (increased for airy feel)
**Screen Margins**: 16px standard, 20px on large devices

---

## Component Specifications

### Glass Morphism (Logistics Enhanced)

**Primary Glass Style:**
```
Background Color:
- Light: rgba(255, 255, 255, 0.10) with slight blue tint
- Dark: rgba(59, 130, 246, 0.08) with blue glow

Backdrop Blur: 24px (increased for premium feel)
Border: 1px solid
- Light: rgba(0, 102, 255, 0.15)
- Dark: rgba(59, 130, 246, 0.20)

Border Radius:
- Cards: 24px (modern, rounded)
- Inputs: 16px (friendly)
- Buttons: 14px (balanced)
- Modals: 28px (premium)
```

### Buttons

**Primary Action (Blue)**
- Height: 52px, Border Radius: 14px
- Background: Vibrant blue #0066FF gradient (light 10% lighter at top)
- Text: White, Semibold (600), 17px
- Press State: Scale 0.96, subtle glow effect
- Shadow: Light blue glow (shadowColor: #0066FF, opacity: 0.15, radius: 8)

**Secondary Action (Glass)**
- Glass background with blue tint
- Text: Primary blue
- Border: 1.5px blue

**Accent Action (Orange)**
- Background: Amber #FF8C00
- Use sparingly for urgent/highlight actions
- Shadow: Orange glow (shadowColor: #FF8C00, opacity: 0.12, radius: 6)

### Input Fields
- Height: 56px (slightly taller for touch)
- Padding: 18px horizontal
- Background: Glass with white tint
- Border: 1.5px light gray, changes to blue on focus
- Placeholder: Medium gray #9CA3AF
- Icon Left: 20px logistics icons (truck, user, building)

### Cards (Carrier/Shipment Cards)

**Standard Card:**
- Padding: 20px
- Border Radius: 24px
- Background: Glass effect
- Shadow: Soft elevation (offset: 0, 4; opacity: 0.08; radius: 12)
- Hover/Press: Lift effect (translateY: -2, shadow increase)

**Status Indicators:**
- Active: Blue dot + "Aktif" label
- In Transit: Orange pulse animation
- Completed: Green checkmark
- Pending: Gray with dashed border

### Floating Action Button (FAB)

- Size: 64x64px
- Position: Bottom-right, 20px from edges + safe area
- Background: Blue gradient with slight rotation
- Icon: White, 28px (truck, plus, phone)
- Shadow: Strong blue glow (opacity: 0.25, radius: 16)
- Press: Scale 0.90 with spring animation
- Haptic: Medium impact

### Navigation Elements

**Tab Bar (Bottom):**
- Height: 60px + safe area
- Background: Frosted glass with blue tint
- Icons: 26px, blue when active, gray when inactive
- Active Indicator: Small blue dot above icon
- Labels: 12px, medium weight

**Header Bar:**
- Height: 56px + safe area
- Background: Transparent with blur on scroll
- Title: Large Title (28px) or Title (24px)
- Icons: 24px, primary color
- Scroll Behavior: Glass effect appears when scrolled

---

## Screen Layouts & Navigation

### Architecture: Tab Navigation
**5 Tabs (Core Action in Center):**
1. **Ana Sayfa** (Home) - truck icon
2. **Nakliyeciler** (Carriers) - users icon
3. **Yeni Sevkiyat** (New Shipment - FAB style) - plus-circle icon
4. **Şirketler** (Companies) - briefcase icon
5. **Profil** (Profile) - user icon

### Key Screens

**Login Screen:**
- Centered content, scrollable
- LogisticsPRO logo (128px, blue gradient)
- App tagline: "Nakliye Yönetiminde Yeni Dönem"
- Input fields: Phone/Email, Password
- Primary button: "Giriş Yap"
- SSO options: Apple Sign In (required), Google Sign In
- Links: Privacy policy, Terms, "Şifremi Unuttum"
- Safe area: Top 40px, bottom 24px

**Home Dashboard:**
- Header: Transparent with greeting "Merhaba, [Name]"
- Quick stats cards (3-4): Active shipments, carriers, revenue
- Recent activity list (scrollable)
- Safe area: Top headerHeight + 20px, bottom tabBarHeight + 20px

**Carriers List (Nakliyeciler):**
- Search bar: Fixed glass style, 48px height
- Filter chips: Horizontal scroll (All, Active, Inactive)
- List items: 72px height, avatar left, name, phone, status right
- Swipe actions: Call (blue), Edit (gray), Delete (red)
- Empty state: Truck icon, "Henüz nakliyeci eklenmedi" text
- FAB: Bottom-right for adding carrier
- Safe area: Bottom tabBarHeight + 20px

**Add/Edit Forms:**
- Header: Cancel (left), "Kaydet" (right, blue)
- Scrollable form with keyboard aware
- Field groups with 16px spacing
- Required field indicator: Red asterisk
- Delete button (edit mode): Bottom, red, with confirmation
- Safe area: Bottom 24px when keyboard hidden

**Profile Screen:**
- Avatar: 96px circle, editable (tap to change)
- Name display: 24px semibold
- Settings list: Grouped sections
  - Account (name, phone, email)
  - Preferences (theme, language, notifications)
  - About (version, support, privacy)
  - Danger zone (logout, delete account nested)
- Logout: Alert confirmation "Çıkış yapmak istediğinizden emin misiniz?"

---

## Logistics Visual Elements

### Custom Assets Required
1. **App Icon**: Stylized truck with blue gradient, modern geometric design
2. **Empty State Illustrations**: Minimalist line art
   - Empty carriers: Truck outline
   - Empty shipments: Package/box outline
   - No results: Magnifying glass with truck
3. **Status Icons**: Custom designed
   - In transit: Animated truck moving
   - Delivered: Checkmark in circle
   - Pending: Clock icon
4. **Onboarding Graphics** (if applicable): 3 screens showing app value

### System Icons (Feather)
- Navigation: `home`, `users`, `plus-circle`, `briefcase`, `user`
- Actions: `phone`, `message-circle`, `edit-2`, `trash-2`, `check`, `x`
- Logistics: `truck`, `package`, `map-pin`, `navigation`, `calendar`
- Interface: `search`, `filter`, `settings`, `chevron-right`, `arrow-left`

**Icon Sizes:**
- Tab bar: 26px
- Header: 24px
- Cards: 20px
- Lists: 18px
- Buttons: 20px

---

## Animations & Micro-interactions

**Screen Transitions:**
- Push/Pop: Slide horizontal (280ms, spring)
- Modal: Slide from bottom (320ms, damping: 20)
- Tab switch: Crossfade (200ms)

**Interactive Feedback:**
- Button press: Scale 0.96 + shadow glow (instant)
- Card tap: Scale 0.98 + lift (spring physics)
- List item load: Staggered fade-in (50ms delay between items)
- Status change: Color transition (400ms) + haptic

**Loading States:**
- Shimmer effect on glass cards (blue tint wave)
- Activity indicator: Blue spinner with blur backdrop
- Pull-to-refresh: Custom truck icon rotation

---

## Accessibility & Responsive

**Touch Targets:** Minimum 44x44px (iOS standard)
**Color Contrast:** 4.5:1 minimum (WCAG AA)
**Dynamic Type:** Support 100%-200% scaling
**VoiceOver:** Turkish labels on all interactive elements
**Haptic Feedback:** Light (tap), Medium (action), Heavy (error)
**Reduced Motion:** Respect system preference, disable animations

**Responsive Breakpoints:**
- Small (320-375px): Reduced padding (12px), compact cards
- Standard (375-428px): Default spacing
- Large (428px+): 2-column grids, increased padding (20px)
- Tablet (744px+): 3-column, sidebar navigation, max-width 400px cards
- Web: Centered 800px container, hover states enabled

---

## Implementation Standards

- Use helper components for screen layouts (automatic safe area handling)
- Dark/light mode via `useTheme()` hook
- Glass effects: `expo-glass-effect` (iOS), fallback View (Android/Web)
- Animations: `react-native-reanimated` for 60fps performance
- Platform-specific adjustments via `Platform.select()`
- Turkish language strings throughout UI
- All interactive elements provide visual + haptic feedback