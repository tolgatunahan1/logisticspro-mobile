# Nakliyeci Kayıt - Apple iOS 26+ Modern Design Guidelines

## Design Philosophy: Liquid Glass UI + Minimal Modern

Modern Apple iOS 26+ tasarım prensiplerini takip eden, tüm cihazlarda uyumlu, premium bir kullanıcı deneyimi.

### Core Design Principles
1. **Liquid Glass Effect** - Frosted glass with dynamic light reflection
2. **Minimalism** - Clean, spacious layouts with purpose-driven elements
3. **Depth** - Layered UI with subtle shadows and transparency
4. **Typography-First** - Bold, readable text hierarchy (SF Pro)
5. **Motion** - Subtle, spring-based animations
6. **Accessibility** - All sizes, colors, device orientations supported

---

## Color Palette (iOS 26 Modern)

### Light Mode
- **Background**: Pure white #FFFFFF (root), soft gray #F5F5F7 (secondary)
- **Text**: Deep black #1D1D1D (primary), medium gray #8E8E93 (secondary)
- **Accent**: Vibrant blue #0A84FF (primary action), system colors
- **Glass**: White 12% opacity (frosted effect)
- **Success**: #34C759, **Destructive**: #FF3B30, **Warning**: #FF9500

### Dark Mode
- **Background**: Deep black #0A0A0A (root), dark gray #1C1C1E (secondary)
- **Text**: Pure white #FFFFFF (primary), light gray #A1A1A6 (secondary)
- **Accent**: Vibrant blue #0A84FF (consistent across modes)
- **Glass**: White 8% opacity (frosted effect)
- **System Colors**: Green #34C759, Red #FF3B30, Orange #FF9500

---

## Typography System (SF Pro)

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| **Display** | 34px | Bold (700) | App title, main headers |
| **Large Title** | 28px | Semibold (600) | Screen titles |
| **Title** | 24px | Semibold (600) | Card titles, section headers |
| **Headline** | 20px | Semibold (600) | List item titles |
| **Body** | 17px | Regular (400) | Primary text, descriptions |
| **Caption** | 16px | Regular (400) | Secondary text, details |
| **Small** | 14px | Regular (400) | Helper text, badges |

---

## Spacing System

```
xs:   4px  (4)
sm:   8px  (8)
md:   12px (12)
lg:   16px (16)
xl:   20px (20)
2xl:  24px (24)
3xl:  32px (32)
4xl:  40px (40)
5xl:  48px (48)
```

---

## Component Specifications

### Glass Morphism Elements (All Platforms)

**Base Glass Style:**
```
Background: White/Dark with opacity
- Light: rgba(255, 255, 255, 0.12)
- Dark: rgba(255, 255, 255, 0.08)

Backdrop Blur: 20px
Border: 1px white opacity
- Light: rgba(255, 255, 255, 0.3)
- Dark: rgba(255, 255, 255, 0.2)

Border Radius: 20px (cards), 16px (inputs), 14px (buttons)
```

### Input Fields
- **Height**: 52px
- **Padding**: 16px horizontal, 12px vertical
- **Font**: Body (17px)
- **Focus State**: Border changes to accent color (0A84FF), smooth transition
- **Placeholder**: Secondary gray text
- **Keyboard Avoidance**: Automatic on all devices

### Buttons
- **Height**: 52px
- **Style**: Glass morphism with accent color or gradient
- **Border Radius**: 12px
- **Press**: Scale 0.97, opacity 0.8
- **Haptic Feedback**: Light impact on press

### Cards
- **Padding**: 16px
- **Gap Between**: 12px
- **Press Animation**: Scale 0.98, shadow increase
- **Shadow**: Subtle, elevation-based

### Floating Action Button (FAB)
- **Size**: 64x64px
- **Style**: Glass with accent gradient
- **Icon**: 28px, centered
- **Position**: 16px from edges + safe area
- **Shadow**: Glow effect with accent color
- **Press**: Scale 0.92, haptic medium

### Search Bar
- **Height**: 44px
- **Style**: Glass morphism
- **Icon Placement**: Left 12px, size 18px
- **Clear Button**: Right 12px (visible on input)
- **Placeholder**: Secondary gray

---

## Screen Layouts

### Login Screen
- **Background**: System background
- **Content**: Centered, scrollable
- **Form Spacing**: 16px between elements
- **Elements**: App icon, title, username field, password field, login button
- **Safe Area**: Top 40px, bottom 24px

### Home Screen (Nakliyeciler)
- **Header**: Large title with blur effect, settings icon
- **Cards**: Horizontal scrollable or grid layout
- **Spacing**: 16px between cards
- **FAB**: Bottom-right corner
- **Safe Area**: Dynamic based on tab bar

### List Screens (Carriers, Companies)
- **Search Bar**: Fixed at top (glass style)
- **List Items**: 52px height, compact
- **Spacing**: 12px between items
- **Refresh**: Pull-to-refresh enabled
- **Empty State**: Centered icon, text, action button
- **FAB**: Bottom-right corner

### Form Screens (Add/Edit)
- **Keyboard Aware**: Automatic scroll on focus
- **Fields**: Full-width, 52px height
- **Spacing**: 16px between fields
- **Actions**: Header with cancel/save buttons
- **Delete Button**: Bottom (edit mode only)

### Settings Screen
- **List Layout**: Grouped sections
- **Items**: 56px height minimum
- **Actions**: Avatar, user info, logout button
- **Confirmation**: Alert dialog on logout

---

## Animations & Transitions

### Screen Transitions
- **Push**: Slide from right (300ms)
- **Modal**: Slide from bottom (350ms, spring)
- **Pop**: Slide to right (250ms)

### Interactive Elements
- **Button Press**: Instant scale + shadow change
- **Card Tap**: 0.98 scale with spring physics
- **List Item Load**: Stagger fade-in (40ms intervals)
- **Search Expand**: Spring animation (tension: 300, friction: 20)

### Loading States
- **Shimmer**: Subtle wave effect on glass backgrounds
- **Skeleton**: Placeholder cards with 12px border-radius
- **Activity**: Spinner with blur background

---

## Responsive Design (Cross-Device)

### iPhone SE / Small Devices (320-375px)
- **Padding**: 12px (reduced from 16px)
- **Font Scale**: 0.95x
- **Icon Size**: -2px
- **FAB**: 56px (reduced from 64px)

### Standard iPhones (375-428px)
- **Standard spacing/typography**

### iPhone Pro Max / Large Devices (428px+)
- **Column Layout**: 2-column grids where applicable
- **Padding**: 20px
- **Font Scale**: 1.05x

### iPad / Tablets (744px+)
- **Multi-column Layouts**: 2-3 columns for lists
- **Sidebar**: Navigation sidebar on left
- **Padding**: 24px
- **Card Width**: Max 400px

### Web (Desktop)
- **Max Width**: 800px (centered container)
- **Sidebar Navigation**: Left sidebar always visible
- **Hover States**: Visible pointer, card lift effect
- **Responsive Breakpoints**: Same as iPad/tablets

---

## Accessibility Standards

- **Touch Targets**: Minimum 44x44px
- **Color Contrast**: 4.5:1 (WCAG AA)
- **Font Scaling**: Dynamic Type support (100%-200%)
- **VoiceOver**: Labels on all interactive elements
- **Haptic Feedback**: Available on all interactions
- **Reduced Motion**: Respects system preference

---

## Icons (Feather from @expo/vector-icons)

**Icon Sizes by Context:**
- **Header**: 22px
- **Navigation**: 24px
- **Buttons**: 20px
- **Lists**: 18px
- **FAB**: 28px

**Common Icons:**
- Menu: `menu`
- Settings: `settings`
- Add: `plus`
- Search: `search`
- Phone: `phone`
- Message: `message-circle`
- Truck: `truck`
- Briefcase: `briefcase`
- Trash: `trash-2`
- Edit: `edit-2`
- Chevron: `chevron-right`
- Back: `arrow-left`
- Close: `x`

---

## Implementation Notes

1. **All screens** use helper components (ScreenScrollView, ScreenFlatList, ScreenKeyboardAwareScrollView)
2. **Safe area insets** automatically handled by helper components
3. **Glass effects** use `expo-glass-effect` on iOS, fallback to View on other platforms
4. **Colors** accessed via `useTheme()` hook for light/dark mode support
5. **Responsive design** implemented via Platform.select() and screen dimension detection
6. **Animations** use `react-native-reanimated` for smooth 60fps performance
7. **Cross-platform** compatible: iOS, Android, Web with unified experience
