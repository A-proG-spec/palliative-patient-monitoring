# UI FOUNDATION SPECIFICATION

## 1. Color Palette

### 1.1 Primary Colors - Imperial Blue

| Token | Hex Value | RGB | Usage |
|---|---|---|---|
| primary | `#002395` | RGB(0, 35, 149) | Buttons, links, headers, active states |
| primary-hover | `#001B73` | RGB(0, 27, 115) | Button hover states |
| primary-light | `#E8ECF7` | RGB(232, 236, 247) | Backgrounds, highlights (10% opacity) |
| primary-container | `#002395` | RGB(0, 35, 149) | Primary container backgrounds |
| on-primary | `#FFFFFF` | RGB(255, 255, 255) | Text on primary backgrounds |

### 1.2 Neutral Colors

| Token | Hex Value | Usage |
|---|---|---|
| background | `#F7F9FE` | Page backgrounds |
| surface | `#F7F9FE` | Surface backgrounds |
| surface-container-lowest | `#FFFFFF` | Cards, modals, inputs |
| surface-container-low | `#F1F4F9` | Subtle backgrounds |
| surface-container | `#ECEEF3` | Container backgrounds |
| surface-container-high | `#E6E8ED` | Higher elevation |
| surface-container-highest | `#E0E2E7` | Highest elevation |
| surface-dim | `#D8DADF` | Dimmed surfaces |

### 1.3 Text Colors

| Token | Hex Value | Usage |
|---|---|---|
| foreground / on-surface | `#181C20` | Main body text |
| on-surface-variant | `#424754` | Secondary text |
| text-secondary | `#52627A` | Secondary text, labels |
| text-muted | `#8290A7` | Muted/disabled text |
| on-primary-container | `#FFFFFF` | Text on primary containers |

### 1.4 Outline & Border Colors

| Token | Hex Value | Usage |
|---|---|---|
| outline | `#727785` | Borders, dividers |
| outline-variant | `#C2C6D6` | Subtle borders |
| border-base | `#E6EBF4` | Default borders |

### 1.5 Status Colors

| Token | Hex Value | Usage |
|---|---|---|
| success | `#43B982` | Success badges, confirmations |
| success-bg | `#EAF8F2` | Success backgrounds |
| warning | `#F5A34A` | Warning badges, alerts |
| warning-bg | `#FFF3E0` | Warning backgrounds |
| error / destructive | `#E74F3D` | Error messages, delete actions |
| error-bg | `#FCE8E8` | Error backgrounds |

### 1.6 Secondary & Tertiary Colors

| Token | Hex Value | Usage |
|---|---|---|
| secondary | `#DCE3ED` | Secondary elements |
| secondary-fixed | `#DCE3ED` | Fixed secondary |
| secondary-fixed-dim | `#C0C7D1` | Dimmed secondary |
| on-secondary-fixed-variant | `#40474F` | Text on secondary |
| tertiary | `#4C5C7D` | Tertiary elements |

### 1.7 Heatmap Colors (Map/Growth Display)

| Token | Hex Value |
|---|---|
| heatmap-low | `#69C79A` |
| heatmap-med-low | `#9BD6A9` |
| heatmap-med | `#F3D96A` |
| heatmap-high | `#F5A34A` |
| heatmap-extreme | `#E74F3D` |

---

## 2. Color Usage Guide

| Element | Token | Color |
|---|---|---|
| Primary Buttons | primary | `#002395` |
| Secondary Buttons | surface-container-lowest | `#FFFFFF` |
| Links | primary | `#002395` |
| Headings | on-surface | `#181C20` |
| Body Text | on-surface | `#181C20` |
| Secondary Text | on-surface-variant | `#424754` |
| Card Background | surface-container-lowest | `#FFFFFF` |
| Page Background | surface | `#F7F9FE` |
| Success Badge | success | `#43B982` |
| Warning Badge | warning | `#F5A34A` |
| Error Badge | error | `#E74F3D` |
| Borders | border-base | `#E6EBF4` |
| Input Background | surface-container-lowest | `#FFFFFF` |
| Input Border | border-base | `#E6EBF4` |
| Input Focus Border | primary | `#002395` |

---

## 3. Typography

### 3.1 Font Family

- Primary Font: **Inter** (Google Fonts)
- Fallback: system-ui, -apple-system, sans-serif

### 3.2 Font Sizes

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| hero-lg | 48px | 800 | 1.1 | -0.03em | Large hero text |
| hero-lg-mobile | 32px | 800 | 1.2 | -0.02em | Hero text on mobile |
| page-title | 32px | 700 | 1.15 | -0.01em | Page titles |
| heading-1 | 28px | 700 | 1.2 | -0.01em | Section headings |
| heading-2 | 24px | 600 | 1.3 | 0 | Sub-headings |
| heading-3 | 20px | 600 | 1.3 | 0 | Card titles |
| card-title | 16px | 700 | 1.4 | 0 | Card titles |
| body-lg | 17px | 400 | 1.6 | 0 | Large body text |
| body-md | 15px | 400 | 1.6 | 0 | Body text |
| body-sm | 13px | 400 | 1.5 | 0 | Small text |
| label-caps | 11px | 600 | 1 | 0.06em | Uppercase labels |
| data-kpi | 17px | 700 | 1 | 0 | KPI values |

---

## 4. Spacing

### 4.1 Spacing Scale

| Token | Value | Usage |
|---|---|---|
| space-micro | 4px | Tiny gaps, icons |
| space-xs | 6px | Small gaps |
| space-sm | 8px | Compact spacing |
| space-md | 16px | Default spacing |
| space-lg | 24px | Section spacing |
| space-xl | 32px | Large spacing |
| space-xxl | 48px | Extra large spacing |
| space-xxxl | 64px | Section separation |

### 4.2 Layout Spacing

| Token | Value | Usage |
|---|---|---|
| space-gutter | 24px | Horizontal padding |
| space-margin-mobile | 16px | Page margins on mobile |
| space-margin-desktop | 48px | Page margins on desktop |
| space-section | 64px | Section separation |

### 4.3 Container Sizes

| Token | Value |
|---|---|
| container-sm | 640px |
| container-md | 768px |
| container-lg | 1024px |
| container-xl | 1280px |
| container-2xl | 1320px |

---

## 5. Shadows

| Token | Value | Usage |
|---|---|---|
| shadow-none | none | No shadow |
| shadow-sm | 0 1px 2px rgba(0, 0, 0, 0.05) | Subtle elevation |
| shadow-md | 0 4px 6px rgba(0, 0, 0, 0.07) | Cards, panels |
| shadow-lg | 0 10px 15px rgba(0, 0, 0, 0.10) | Modals, dropdowns |
| shadow-xl | 0 20px 25px rgba(0, 0, 0, 0.15) | High elevation |
| shadow-card | 0 12px 35px rgba(50, 88, 150, 0.08) | Cards |
| shadow-nav | 0 2px 10px rgba(50, 88, 150, 0.05) | Navigation |
| glass-panel | 0 12px 35px rgba(50, 88, 150, 0.08) | Glass panels |

---

## 6. Border Radius (Max 10px)

| Token | Value | Usage |
|---|---|---|
| radius-none | 0 | No rounding |
| radius-sm | 2px | Very small elements |
| radius-md | 4px | Table cells, small elements |
| radius-lg | 6px | Buttons, inputs |
| radius-xl | 8px | Cards, panels |
| radius-2xl | 10px | **MAXIMUM** - Large cards, modals |
| radius-full | 9999px | Pills, badges (exception to 10px rule) |

### 6.1 Special Cases

| Element | Radius | Value |
|---|---|---|
| Buttons | radius-lg | 6px |
| Inputs | radius-lg | 6px |
| Cards | radius-xl | 8px |
| Modals | radius-2xl | 10px |
| Badges | radius-full | 9999px |
| Table Cells | radius-md | 4px |
| Select Dropdown | radius-lg | 6px |
| Textarea | radius-lg | 6px |
| Heatmap Cells | radius-sm | 2px |

### 6.2 Radius Exception Rules

| Rule | Description |
|---|---|
| Maximum radius | **10px** for all standard UI elements |
| Exception | Pills and badges can use `radius-full` (9999px) |
| Exception | Heatmap cells use 2px (near-sharp) |

---
