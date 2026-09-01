# ui-foundation-spec.md


# PALLIATIVE PATIENT MONITORING SYSTEM - UI FOUNDATION SPECIFICATION

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

- **Primary Font: Outfit** (Google Fonts)
- Fallback: system-ui, -apple-system, sans-serif

```html
<!-- Google Font Import -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet">
```

```css
/* Tailwind CSS Configuration */
font-family: 'Outfit', system-ui, -apple-system, sans-serif;
```

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

## 7. Print Styles (NEW)

### 7.1 Print Font Configuration

```css
/* src/styles/print.css */

@media print {
  /* Font configuration - Outfit for print */
  body {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    background: white !important;
    color: black !important;
    font-size: 12pt;
  }

  /* Header font */
  .print-header h1 {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-weight: 700;
    color: #002395;
    font-size: 20pt;
    margin: 0;
  }

  /* Section headings */
  .print-section h2 {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-weight: 600;
    font-size: 14pt;
    color: #002395;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 4px;
    margin-bottom: 8px;
  }

  .print-section h3 {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-weight: 600;
    font-size: 12pt;
    color: #1f2937;
    margin: 6px 0;
  }

  /* Labels */
  .print-label {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-weight: 600;
    color: #4b5563;
  }

  /* Table headers */
  .print-table th {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-weight: 600;
    background-color: #f3f4f6;
    text-align: left;
    padding: 4px 8px;
    border: 1px solid #d1d5db;
  }

  .print-table td {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-weight: 400;
    padding: 4px 8px;
    border: 1px solid #d1d5db;
  }

  /* Badges */
  .print-badge {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-weight: 500;
    display: inline-block;
    padding: 1px 8px;
    border-radius: 4px;
    font-size: 9pt;
  }

  /* Footer */
  .print-footer {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-weight: 400;
    text-align: center;
    font-size: 9pt;
    color: #9ca3af;
    border-top: 1px solid #e5e7eb;
    padding-top: 12px;
    margin-top: 20px;
  }
}
```

### 7.2 Print Page Setup

```css
@media print {
  @page {
    size: A4;
    margin: 20mm;
  }
}
```

### 7.3 Print Color Preservation

```css
@media print {
  .print-color {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .print-bg {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
```

### 7.4 Print Table Styling

```css
@media print {
  .print-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10pt;
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
  }

  .print-table th {
    background-color: #f3f4f6;
    font-weight: 600;
    text-align: left;
    padding: 4px 8px;
    border: 1px solid #d1d5db;
  }

  .print-table td {
    padding: 4px 8px;
    border: 1px solid #d1d5db;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  thead {
    display: table-header-group;
  }
}
```

### 7.5 Print Badge Colors

```css
@media print {
  .print-badge-active {
    background-color: #d1fae5 !important;
    color: #065f46 !important;
  }

  .print-badge-discharged {
    background-color: #f3f4f6 !important;
    color: #4b5563 !important;
  }

  .print-badge-ordered {
    background-color: #fef3c7 !important;
    color: #92400e !important;
  }

  .print-badge-given {
    background-color: #d1fae5 !important;
    color: #065f46 !important;
  }

  .print-badge-pending {
    background-color: #fef3c7 !important;
    color: #92400e !important;
  }

  .print-badge-accepted {
    background-color: #d1fae5 !important;
    color: #065f46 !important;
  }

  .print-badge-declined {
    background-color: #fce4ec !important;
    color: #b71c1c !important;
  }
}
```

### 7.6 Print Card & Section Styling

```css
@media print {
  .print-card {
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 12px;
    page-break-inside: avoid;
  }

  .print-section {
    margin-bottom: 16px;
  }

  .print-avoid-break {
    page-break-inside: avoid;
  }

  .page-break {
    page-break-before: always;
  }

  .print-graph {
    width: 100%;
    max-width: 100%;
    margin: 8px 0;
  }
}
```

### 7.7 Print Header & Footer

```css
@media print {
  .print-header {
    text-align: center;
    border-bottom: 2px solid #002395;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }

  .print-header .subtitle {
    font-size: 12pt;
    color: #555;
  }

  .print-footer {
    text-align: center;
    font-size: 9pt;
    color: #9ca3af;
    border-top: 1px solid #e5e7eb;
    padding-top: 12px;
    margin-top: 20px;
  }

  .no-print {
    display: none !important;
  }
}
```

### 7.8 Complete Print CSS File

```css
/* src/styles/print.css */

/* ============================================
   PRINT STYLES - Palliative Patient Monitoring System
   Font: Outfit (Google Fonts)
   ============================================ */

@media print {
  /* ── Page Setup ── */
  @page {
    size: A4;
    margin: 20mm;
  }

  /* ── Base Styles ── */
  body {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    background: white !important;
    color: black !important;
    font-size: 12pt;
    line-height: 1.5;
  }

  /* ── Hide Non-Print Elements ── */
  .no-print {
    display: none !important;
  }

  /* ── Color Preservation ── */
  .print-color {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .print-bg {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* ── Header ── */
  .print-header {
    text-align: center;
    border-bottom: 2px solid #002395;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }

  .print-header h1 {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-weight: 700;
    color: #002395;
    font-size: 20pt;
    margin: 0;
  }

  .print-header .subtitle {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-weight: 400;
    font-size: 12pt;
    color: #555;
  }

  /* ── Sections ── */
  .print-section {
    margin-bottom: 16px;
  }

  .print-section h2 {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-weight: 600;
    font-size: 14pt;
    color: #002395;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 4px;
    margin-bottom: 8px;
  }

  .print-section h3 {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-weight: 600;
    font-size: 12pt;
    color: #1f2937;
    margin: 6px 0;
  }

  /* ── Cards ── */
  .print-card {
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 12px;
    page-break-inside: avoid;
  }

  /* ── Tables ── */
  .print-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10pt;
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
  }

  .print-table th {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-weight: 600;
    background-color: #f3f4f6;
    text-align: left;
    padding: 4px 8px;
    border: 1px solid #d1d5db;
  }

  .print-table td {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-weight: 400;
    padding: 4px 8px;
    border: 1px solid #d1d5db;
  }

  thead {
    display: table-header-group;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  /* ── Labels ── */
  .print-label {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-weight: 600;
    color: #4b5563;
  }

  /* ── Badges ── */
  .print-badge {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-weight: 500;
    display: inline-block;
    padding: 1px 8px;
    border-radius: 4px;
    font-size: 9pt;
  }

  .print-badge-active {
    background-color: #d1fae5 !important;
    color: #065f46 !important;
  }

  .print-badge-discharged {
    background-color: #f3f4f6 !important;
    color: #4b5563 !important;
  }

  .print-badge-ordered {
    background-color: #fef3c7 !important;
    color: #92400e !important;
  }

  .print-badge-given {
    background-color: #d1fae5 !important;
    color: #065f46 !important;
  }

  .print-badge-pending {
    background-color: #fef3c7 !important;
    color: #92400e !important;
  }

  .print-badge-accepted {
    background-color: #d1fae5 !important;
    color: #065f46 !important;
  }

  .print-badge-declined {
    background-color: #fce4ec !important;
    color: #b71c1c !important;
  }

  /* ── Graph ── */
  .print-graph {
    width: 100%;
    max-width: 100%;
    margin: 8px 0;
  }

  /* ── Page Breaks ── */
  .print-avoid-break {
    page-break-inside: avoid;
  }

  .page-break {
    page-break-before: always;
  }

  /* ── Footer ── */
  .print-footer {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-weight: 400;
    text-align: center;
    font-size: 9pt;
    color: #9ca3af;
    border-top: 1px solid #e5e7eb;
    padding-top: 12px;
    margin-top: 20px;
  }
}
```

### 7.9 Tailwind Print Utility Classes

Add these print utility classes to your Tailwind configuration:

```javascript
// tailwind.config.js

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.print-hide': {
          '@media print': {
            display: 'none !important',
          },
        },
        '.print-show': {
          '@media print': {
            display: 'block !important',
          },
        },
        '.print-color': {
          '@media print': {
            '-webkit-print-color-adjust': 'exact !important',
            'print-color-adjust': 'exact !important',
          },
        },
        '.print-bg': {
          '@media print': {
            '-webkit-print-color-adjust': 'exact !important',
            'print-color-adjust': 'exact !important',
          },
        },
        '.print-avoid-break': {
          '@media print': {
            'page-break-inside': 'avoid !important',
          },
        },
        '.print-page-break': {
          '@media print': {
            'page-break-before': 'always !important',
          },
        },
      });
    },
  ],
};
```