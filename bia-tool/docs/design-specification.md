# Design Specification - BIA Tool (Glassmorphism)

## 1. Direction & Rationale

**Style**: **Glassmorphism (Dark Mode First)**
**Essence**: A futuristic, reliable "Command Center" for risk management. The interface uses deep, dark backgrounds with translucent, frosted-glass panels to organize complex data. This creates a sense of depth and hierarchy, essential for visualizing the multi-layered nature of business dependencies and risks.
**Reference**: macOS Dark Mode, Windows 11 Mica (Dark), High-end Fintech Dashboards.

**Why Glassmorphism for BIA?**
- **Depth for Data**: Translucent layers visually separate "surface" data (Process List) from "deep" data (underlying dependencies), mimicking the actual layered nature of business operations.
- **Focus**: Dark mode reduces eye strain during long assessment sessions, while glowing accents highlight critical risks immediately.

## 2. Design Tokens

### 2.1 Colors (Dark Mode System)

| Token Name | Value | Usage |
| :--- | :--- | :--- |
| **Background** | `linear-gradient(135deg, #0F172A 0%, #1E293B 100%)` | Main app background (Deep Slate) |
| **Surface-Glass** | `rgba(30, 41, 59, 0.7)` + `blur(20px)` | Cards, Sidebars, Modals |
| **Surface-Hover** | `rgba(51, 65, 85, 0.6)` + `blur(20px)` | Interactive elements hover state |
| **Border-Glass** | `rgba(255, 255, 255, 0.1)` | Subtle 1px definition for all panels |
| **Primary** | `#38BDF8` (Sky Blue 400) | Primary Actions, Active States, Links |
| **Secondary** | `#818CF8` (Indigo 400) | Secondary Actions, Charts |
| **Critical** | `#F87171` (Red 400) | High Risk, Error, Non-compliant |
| **Warning** | `#FBBF24` (Amber 400) | Medium Risk, Alerts |
| **Success** | `#34D399` (Emerald 400) | Compliant, Low Risk |
| **Text-Primary** | `#F8FAFC` (Slate 50) | Headings, Main Data |
| **Text-Secondary**| `#94A3B8` (Slate 400) | Labels, Meta-data |

### 2.2 Typography (Inter / Roboto)

| Role | Size | Weight | Line Height | Color |
| :--- | :--- | :--- | :--- | :--- |
| **H1 (Page Title)** | 32px | Bold (700) | 1.2 | Text-Primary |
| **H2 (Section)** | 24px | SemiBold (600) | 1.3 | Text-Primary |
| **H3 (Card Title)** | 18px | Medium (500) | 1.4 | Text-Primary |
| **Body (Default)** | 14px | Regular (400) | 1.5 | Text-Secondary |
| **Data (Table)** | 14px | Medium (500) | 1.5 | Text-Primary |
| **Label** | 12px | Medium (500) | 1.5 | Text-Secondary |

### 2.3 Spacing & Effects

- **Grid**: 4pt baseline. Common spacers: 16px, 24px, 32px.
- **Radius**:
  - `xl`: 24px (Main Containers/Modals)
  - `lg`: 16px (Cards)
  - `md`: 8px (Buttons/Inputs)
- **Shadows**:
  - `glass-shadow`: `0 8px 32px 0 rgba(0, 0, 0, 0.37)` (Deep depth)
  - `glow-primary`: `0 0 15px rgba(56, 189, 248, 0.3)` (Active elements)

## 3. Components

### 3.1 Glass Card (Container)
**Structure**:
- Background: `rgba(30, 41, 59, 0.7)` (Dark Blue-Grey)
- Backdrop Filter: `blur(12px)`
- Border: `1px solid rgba(255, 255, 255, 0.08)`
- Shadow: `glass-shadow`
**Usage**: Wraps all major content sections (Charts, Forms, Tables).

### 3.2 Navigation Sidebar
**Structure**:
- Position: Fixed Left, Full Height.
- Background: `rgba(15, 23, 42, 0.8)` (Darker than cards).
- Border-Right: `1px solid rgba(255, 255, 255, 0.05)`.
- **Item State**:
  - Default: Text-Secondary, No BG.
  - Active: Text-Primary, BG `rgba(56, 189, 248, 0.1)`, Left Border `3px solid Primary`.

### 3.3 Data Tables (Glass)
**Structure**:
- **Header**: `rgba(0,0,0,0.2)` background, Text-Secondary (Uppercase, 11px).
- **Rows**: Transparent background. Bottom border `rgba(255,255,255,0.05)`.
- **Hover**: Row BG changes to `rgba(255,255,255,0.03)`.
- **Cells**: Text-Primary for key data, Text-Secondary for meta.

### 3.4 Impact Sliders (Input)
**Structure**:
- **Track**: `rgba(255,255,255,0.1)` height 4px.
- **Fill**: Gradient `Primary` to `Secondary` based on value.
- **Thumb**: 20px circle, White, `glow-primary` shadow.
- **Value Label**: Floating tooltip above thumb, Glass background.

### 3.5 Charts (Visuals)
**Style**:
- **Grid Lines**: `rgba(255,255,255,0.05)` (Very subtle).
- **Line/Area**: Neon gradients (e.g., Primary fading to transparent).
- **Points**: Solid white dots with colored glow.
- **Tooltip**: Dark Glass, High blur, White text.

## 4. Layout & Responsive

### 4.1 Dashboard Layout (SPA)
**Desktop ( > 1200px)**:
- **Sidebar**: Fixed 250px width.
- **Main Content**: `margin-left: 250px`, Padding 32px.
- **Grid**: 12-column fluid grid.
- **Pattern**:
  - Top: Global Stats (4 Cards, 3-cols each).
  - Middle: Risk Radar (Left, 4-cols) + Recent Assessments (Right, 8-cols).

### 4.2 Impact Wizard Layout
**Structure**:
- **Stepper**: Horizontal top bar. Glass pill shape.
- **Form Area**: Central Glass Card (Max-width 800px).
- **Help Panel**: Collapsible Right Drawer (Glass overlay).

### 4.3 Responsive Adaptation
- **Tablet (< 1024px)**: Sidebar collapses to Icon rail (64px). Grid becomes 2-col.
- **Mobile (< 768px)**:
  - Sidebar becomes Bottom Nav or Hamburger Menu.
  - Grid becomes 1-col stack.
  - Tables convert to Card Lists (Label: Value pairs).
  - Glass Blur reduced to 5px for performance.

## 5. Interaction & Animation

**Standard Duration**: 300ms `ease-out`.

1.  **Hover Lift**: Cards translate Y `-4px` and shadow intensifies.
2.  **Modal Entry**: Fade In + Scale Up (0.95 -> 1.0).
3.  **Page Transition**:
    - Current View: Fade Out (Opacity 1 -> 0).
    - New View: Fade In + Slide Up (20px -> 0).
4.  **Loading State**: Shimmer effect (Gradient opacity scan) over glass cards.

## 6. ISO 22301 Compliance Notes
- **Contrast**: Ensure all text on glass meets WCAG AA (4.5:1). Use `#F8FAFC` on dark glass.
- **Clarity**: Do not let glass effects obscure critical risk data. Critical alerts must use solid colors (Red) or high-opacity backgrounds, not just subtle glows.
