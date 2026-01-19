# User Story: Evenly Spaced Slider Labels with Aligned Thumb

## Story

**As a** party planner using the calculator
**I want** the slider labels (10, 100, 200, 300) to be evenly spaced visually
**So that** the interface looks clean and professional, and I can easily understand where the slider is positioned

---

## Current Problem

- Labels are positioned at mathematically correct percentages for a linear scale
- This creates visually uneven spacing (10-125 bunched in first 40%, huge gaps after)
- Looks unprofessional and confusing

---

## Requirements

### Visual Layout
1. Four labels displayed: **10, 100, 200, 300**
2. Labels positioned at **evenly spaced intervals**: 0%, 33.33%, 66.66%, 100%
3. Clean, balanced visual appearance

### Slider-Label Alignment (Critical)
1. When slider thumb is at the "10" label position (0%), display shows **10**
2. When slider thumb is at the "100" label position (33.33%), display shows **100**
3. When slider thumb is at the "200" label position (66.66%), display shows **200**
4. When slider thumb is at the "300" label position (100%), display shows **300**
5. Intermediate positions interpolate smoothly between label values

### Piecewise Linear Scale
The slider uses a **non-linear (piecewise) scale**:

| Slider Position | Guest Count | Segment |
|-----------------|-------------|---------|
| 0%              | 10          | Start   |
| 33.33%          | 100         | First third |
| 66.66%          | 200         | Second third |
| 100%            | 300         | End     |

**Interpolation:**
- 0% to 33.33% → maps to 10-100 guests (90 guests over 33.33%)
- 33.33% to 66.66% → maps to 100-200 guests (100 guests over 33.33%)
- 66.66% to 100% → maps to 200-300 guests (100 guests over 33.33%)

### Continuous Selection
1. User can still select ANY integer value between 10-300
2. Slider moves smoothly without jumping
3. Display updates continuously as slider moves

---

## Acceptance Criteria

### AC1: Label Positioning
- [ ] Only 4 labels displayed: 10, 100, 200, 300
- [ ] Labels positioned at 0%, 33.33%, 66.66%, 100% respectively
- [ ] Labels appear evenly spaced visually

### AC2: Slider-Label Alignment
- [ ] Moving slider to "10" label position shows 10 in display
- [ ] Moving slider to "100" label position shows 100 in display
- [ ] Moving slider to "200" label position shows 200 in display
- [ ] Moving slider to "300" label position shows 300 in display

### AC3: Interpolation Accuracy
- [ ] At slider position 16.67% (halfway between 10 and 100), display shows ~55
- [ ] At slider position 50% (halfway between 100 and 200), display shows ~150
- [ ] At slider position 83.33% (halfway between 200 and 300), display shows ~250

### AC4: Reverse Calculation (Value to Position)
- [ ] Setting value to 10 positions slider at 0%
- [ ] Setting value to 55 positions slider at ~16.67%
- [ ] Setting value to 100 positions slider at 33.33%
- [ ] Setting value to 150 positions slider at 50%
- [ ] Setting value to 200 positions slider at 66.66%
- [ ] Setting value to 300 positions slider at 100%

### AC5: Fill Gradient
- [ ] Slider fill (golden color) extends from left to current thumb position
- [ ] Fill percentage matches thumb position correctly

### AC6: Existing Functionality Preserved
- [ ] Detail page links work for any guest count (no 404s)
- [ ] Bar setup page links work for any guest count
- [ ] Calculations remain accurate for any guest count
- [ ] All existing tests pass

---

## Technical Implementation

### Slider HTML Change
```html
<input type="range" id="guest-slider" min="0" max="100" value="33.33" step="0.01" />
```
- Use 0-100 range (percentage-based)
- Default value 33.33 = 100 guests

### JavaScript Functions Needed

```javascript
// Convert slider position (0-100) to guest count (10-300)
function sliderToGuests(sliderValue) {
  if (sliderValue <= 33.33) {
    // 0-33.33% maps to 10-100 guests
    return Math.round(10 + (sliderValue / 33.33) * 90);
  } else if (sliderValue <= 66.66) {
    // 33.33-66.66% maps to 100-200 guests
    return Math.round(100 + ((sliderValue - 33.33) / 33.33) * 100);
  } else {
    // 66.66-100% maps to 200-300 guests
    return Math.round(200 + ((sliderValue - 66.66) / 33.34) * 100);
  }
}

// Convert guest count (10-300) to slider position (0-100)
function guestsToSlider(guests) {
  if (guests <= 100) {
    // 10-100 guests maps to 0-33.33%
    return ((guests - 10) / 90) * 33.33;
  } else if (guests <= 200) {
    // 100-200 guests maps to 33.33-66.66%
    return 33.33 + ((guests - 100) / 100) * 33.33;
  } else {
    // 200-300 guests maps to 66.66-100%
    return 66.66 + ((guests - 200) / 100) * 33.34;
  }
}
```

### Label HTML
```html
<div class="flex justify-between mt-2 text-xs text-[var(--chocolate-40)] font-medium">
  <span>10</span>
  <span>100</span>
  <span>200</span>
  <span>300</span>
</div>
```

### Fill Gradient Update
```javascript
const fillPercent = sliderValue; // Direct percentage since slider is 0-100
slider.style.background = `linear-gradient(to right, var(--primary) ${fillPercent}%, var(--chocolate-10) ${fillPercent}%)`;
```

---

## Files to Modify

1. **src/components/InteractiveCalculator.astro**
   - Update slider HTML (min=0, max=100, step=0.01)
   - Update label HTML (4 evenly spaced labels using flexbox)
   - Add `sliderToGuests()` and `guestsToSlider()` functions
   - Update slider event handler to use new conversion
   - Update fill gradient calculation

2. **tests/calculator.spec.ts**
   - Update slider tests to use new percentage-based values
   - Add tests for piecewise interpolation accuracy

---

## Definition of Done

- [ ] All acceptance criteria pass manual testing
- [ ] Labels appear evenly spaced (visually balanced)
- [ ] Slider thumb aligns with labels at 10, 100, 200, 300
- [ ] Intermediate values interpolate correctly
- [ ] No 404 errors for any guest count
- [ ] All Playwright tests pass
- [ ] Works on desktop and mobile
