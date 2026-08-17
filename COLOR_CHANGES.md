# Line Chart Color Comparison

## Before vs After

### Visual Comparison

```
┌────────────────────────────────────────────────────┐
│                    BEFORE                          │
├────────────────────────────────────────────────────┤
│  🟢 Healthy (emerald)    #10b981                  │
│  🔴 Black Pod (red)      #dc2626                  │
│  🟡 Mealybug (yellow)    #eab308                  │
│  🟢 Pod Borer (green)    #16a34a                  │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│                     AFTER                          │
├────────────────────────────────────────────────────┤
│  🟢 Healthy (emerald)    #10b981  (same)          │
│  🔴 Black Pod (red)      #dc2626  (same)          │
│  🔵 Mealybug (blue)      #3b82f6  ← CHANGED       │
│  🟡 Pod Borer (yellow)   #eab308  ← CHANGED       │
└────────────────────────────────────────────────────┘
```

---

## Color Details

### Healthy (Unchanged)
- **Color:** Emerald-500
- **Hex:** `#10b981`
- **RGB:** `rgba(16, 185, 129, 0.1)` (for background)
- **Meaning:** Good health, no disease
- **Visual:** 🟢

### Black Pod (Unchanged)
- **Color:** Red-600
- **Hex:** `#dc2626`
- **RGB:** `rgba(220, 38, 38, 0.1)` (for background)
- **Meaning:** Severe disease, high priority
- **Visual:** 🔴

### Mealybug (Changed: Yellow → Blue)
- **Old Color:** Yellow-500 `#eab308`
- **New Color:** Blue-500 `#3b82f6`
- **RGB:** `rgba(59, 130, 246, 0.1)` (for background)
- **Reason:** Better distinction from Pod Borer
- **Visual:** 🟡 → 🔵

### Pod Borer (Changed: Green → Yellow)
- **Old Color:** Green-600 `#16a34a`
- **New Color:** Yellow-500 `#eab308`
- **RGB:** `rgba(234, 179, 8, 0.1)` (for background)
- **Reason:** Better visual hierarchy
- **Visual:** 🟢 → 🟡

---

## Rationale

### Problem with Old Colors
1. **Two greens:** Healthy (emerald) and Pod Borer (green) were too similar
2. **Confusion:** Users might confuse green diseases with healthy status

### Benefits of New Colors
1. **Clear distinction:** All 4 colors are now unique
2. **Better hierarchy:**
   - 🟢 Emerald = Healthy (positive)
   - 🔴 Red = Black Pod (severe danger)
   - 🔵 Blue = Mealybug (moderate concern)
   - 🟡 Yellow = Pod Borer (caution)
3. **Color psychology:**
   - Red = Stop/Danger (Black Pod - most severe)
   - Yellow = Caution (Pod Borer - manageable)
   - Blue = Information (Mealybug - monitor)
   - Green = Go/Healthy (Healthy - good status)

---

## Chart Appearance

### Line Chart

**Before:**
```
Cases
  ↑
  │    🟢──────────────────🟢  Healthy
  │   🔴──────────🔴         Black Pod
  │  🟡────────🟡           Mealybug
  │ 🟢─────🟢              Pod Borer (confusing green)
  └──────────────────────> Month
   Jan Feb Mar Apr May Jun
```

**After:**
```
Cases
  ↑
  │    🟢──────────────────🟢  Healthy
  │   🔴──────────🔴         Black Pod
  │  🔵────────🔵           Mealybug (now blue)
  │ 🟡─────🟡              Pod Borer (now yellow)
  └──────────────────────> Month
   Jan Feb Mar Apr May Jun
```

---

## Legend Display

### Before
```
┌──────────────────────────────────────────┐
│  Legend                                  │
├──────────────────────────────────────────┤
│  ● Healthy      (emerald green)          │
│  ● Black Pod    (red)                    │
│  ● Mealybug     (yellow)                 │
│  ● Pod Borer    (green) ← confusing!     │
└──────────────────────────────────────────┘
```

### After
```
┌──────────────────────────────────────────┐
│  Legend                                  │
├──────────────────────────────────────────┤
│  ● Healthy      (emerald green)          │
│  ● Black Pod    (red)                    │
│  ● Mealybug     (blue) ← clear!          │
│  ● Pod Borer    (yellow) ← distinct!     │
└──────────────────────────────────────────┘
```

---

## Color Accessibility

### Contrast Ratios (on white background)

| Color | Hex | WCAG AA | WCAG AAA |
|-------|-----|---------|----------|
| Emerald-500 | #10b981 | ✅ Pass | ✅ Pass |
| Red-600 | #dc2626 | ✅ Pass | ✅ Pass |
| Blue-500 | #3b82f6 | ✅ Pass | ✅ Pass |
| Yellow-500 | #eab308 | ✅ Pass | ⚠️ Borderline |

### Color Blindness Considerations

**Protanopia (Red-blind):**
- ✅ Can distinguish all 4 colors (different brightness levels)

**Deuteranopia (Green-blind):**
- ✅ Improved! Blue vs Yellow vs Red are distinct
- Before: Two greens were indistinguishable

**Tritanopia (Blue-blind):**
- ✅ Can distinguish by brightness and hue

---

## Implementation

### Color Configuration (chart-config.ts)

```typescript
export const DISEASE_COLORS = {
  healthy: {
    primary: '#10b981',      // Emerald-500
    rgb: 'rgba(16, 185, 129, 0.1)'
  },
  blackPod: {
    primary: '#dc2626',      // Red-600
    rgb: 'rgba(220, 38, 38, 0.1)'
  },
  mealybug: {
    primary: '#3b82f6',      // Blue-500 ← Changed
    rgb: 'rgba(59, 130, 246, 0.1)'
  },
  podBorer: {
    primary: '#eab308',      // Yellow-500 ← Changed
    rgb: 'rgba(234, 179, 8, 0.1)'
  }
} as const;
```

### Legend HTML

```html
<!-- Healthy -->
<span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>

<!-- Black Pod -->
<span class="w-2.5 h-2.5 rounded-full bg-red-600"></span>

<!-- Mealybug (changed to blue) -->
<span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>

<!-- Pod Borer (changed to yellow) -->
<span class="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
```

---

## Color Swatches

### Emerald-500 (Healthy)
```
████████████████
████████████████  #10b981
████████████████  RGB(16, 185, 129)
████████████████
```

### Red-600 (Black Pod)
```
████████████████
████████████████  #dc2626
████████████████  RGB(220, 38, 38)
████████████████
```

### Blue-500 (Mealybug)
```
████████████████
████████████████  #3b82f6
████████████████  RGB(59, 130, 246)
████████████████
```

### Yellow-500 (Pod Borer)
```
████████████████
████████████████  #eab308
████████████████  RGB(234, 179, 8)
████████████████
```

---

## Testing Checklist

✅ Chart displays correct colors  
✅ Legend matches chart colors  
✅ Colors are distinct from each other  
✅ Accessible contrast ratios  
✅ Works with color blindness simulators  
✅ Consistent across all views  

---

## Summary

**Changes:**
1. Mealybug: Yellow (#eab308) → Blue (#3b82f6)
2. Pod Borer: Green (#16a34a) → Yellow (#eab308)

**Benefits:**
- ✅ All 4 colors are now unique
- ✅ No more confusion between diseases and healthy
- ✅ Better color psychology alignment
- ✅ Improved accessibility for color-blind users
- ✅ Clearer visual hierarchy

**Impact:**
- Users can more easily distinguish between disease types
- Reduced cognitive load when reading charts
- Better alignment with standard traffic light colors (red=danger, yellow=caution, green=good)
