# User Story: Guest Count Slider Enhancement

## Story

**As a** party planner using the calculator
**I want** a smooth slider that allows me to select any guest count between 10-300
**So that** I can get accurate calculations for my exact party size without confusion about what number I'm selecting

---

## Current Problem

- Slider positions don't align with guide labels
- Limited to 14 preset values that don't match visual guides
- Users experience "snap back" behavior
- Detail pages only exist for preset values, causing 404 errors for other selections

---

## Requirements

### Slider Behavior
1. Continuous slider from 10 to 300 guests
2. Guide labels positioned correctly: **10, 25, 50, 75, 100, 125, 200, 300**
3. Slider thumb aligns with guide labels when at those values
4. Slider allows selection of ANY integer value between 10-300
5. No visual "snap back" - slider stays where user places it

### Display Behavior
1. Large display number shows exact selected value (e.g., 67, 143, 250)
2. Calculations update in real-time for exact guest count
3. Results reflect the exact number selected

### Detail Page Behavior
1. "Get Full Breakdown" button works for ANY guest count
2. Detail page displays calculations for exact guest count selected
3. No 404 errors regardless of guest count selected

---

## Acceptance Criteria

### AC1: Slider Visual Alignment
- [ ] Guide labels (10, 25, 50, 75, 100, 125, 200, 300) are positioned at correct percentages on slider track
- [ ] When slider is at position 0%, display shows "10"
- [ ] When slider thumb is directly under "50" label, display shows "50"
- [ ] When slider thumb is directly under "100" label, display shows "100"
- [ ] When slider is at position 100%, display shows "300"

### AC2: Continuous Selection
- [ ] User can select value 10 (minimum)
- [ ] User can select value 300 (maximum)
- [ ] User can select any integer between 10-300 (e.g., 67, 143, 211)
- [ ] Slider moves smoothly without jumping or snapping
- [ ] Display updates continuously as slider moves

### AC3: Calculation Accuracy
- [ ] Selecting 50 guests shows calculation for exactly 50 guests
- [ ] Selecting 67 guests shows calculation for exactly 67 guests
- [ ] Selecting 143 guests shows calculation for exactly 143 guests
- [ ] Per-person and total servings update correctly for any value

### AC4: Detail Page Navigation
- [ ] Clicking "Get Full Breakdown" with 50 guests selected navigates successfully
- [ ] Clicking "Get Full Breakdown" with 67 guests selected navigates successfully
- [ ] Clicking "Get Full Breakdown" with 143 guests selected navigates successfully
- [ ] Detail page shows correct calculations matching the selected guest count
- [ ] No 404 errors for any guest count between 10-300

### AC5: Multi-Drink & Bar Setup
- [ ] Bar setup pages work for any guest count
- [ ] Multi-drink calculations are accurate for any guest count
- [ ] "Get Your Bar Breakdown" works for any guest count without 404

---

## Technical Approach Options

### Option A: Dynamic Query Parameter (Recommended)
- Slider passes exact guest count via URL query parameter: `?guests=67`
- Detail pages read query parameter and calculate dynamically
- Fallback to URL path guest count if no query parameter
- Minimal page generation changes

### Option B: Generate All Pages
- Generate pages for every guest count 10-300
- 290 additional pages per drink/event combination
- Significant build time increase
- Not recommended due to scale

---

## Label Positioning Math

For a slider from 10 to 300 (range of 290):

| Label | Value | Position Formula | Percentage |
|-------|-------|------------------|------------|
| 10    | 10    | (10-10)/290      | 0%         |
| 25    | 25    | (25-10)/290      | 5.17%      |
| 50    | 50    | (50-10)/290      | 13.79%     |
| 75    | 75    | (75-10)/290      | 22.41%     |
| 100   | 100   | (100-10)/290     | 31.03%     |
| 125   | 125   | (125-10)/290     | 39.66%     |
| 200   | 200   | (200-10)/290     | 65.52%     |
| 300   | 300   | (300-10)/290     | 100%       |

---

## Definition of Done

- [ ] All acceptance criteria pass manual testing
- [ ] Slider works on desktop Chrome, Firefox, Safari
- [ ] Slider works on mobile (touch drag)
- [ ] No console errors
- [ ] Playwright tests updated and passing
- [ ] Code reviewed and merged
