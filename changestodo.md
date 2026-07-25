# TODO: Disease Distribution Chart Redesign

## 🎯 Objective
Replace the **Pie Chart** with a **Vertical Column Chart** that displays the total occurrence of each disease only. Ignore disease severity (Mild, Moderate, Severe) and aggregate them into their corresponding disease category.

---

## 📌 UI/UX Changes
- [ ] Replace the **Pie Chart** with a **Vertical Column Chart**.
- [ ] Rename the section title to **Disease Occurrence Distribution**.
- [ ] Display one column per disease category only.
- [ ] Remove severity-based visualization from this chart.
- [ ] Add data labels showing the total count on top of each column.
- [ ] Display the total number of detections in the chart subtitle or footer.
- [ ] Use consistent colors for each disease category across the dashboard.
- [ ] Sort columns by highest occurrence (descending).

---

## 📊 Chart Categories
The chart should only contain the following columns:

- [ ] Healthy
- [ ] Black Pod Disease
- [ ] Mealybug
- [ ] Cacao Pod Borer

> **Note:** Mild, Moderate, and Severe detections must be aggregated into their corresponding disease category (e.g., Mild Black Pod + Moderate Black Pod + Severe Black Pod = Black Pod Disease total).

---

## 📂 Data Processing Changes
- [ ] Aggregate scan records by **disease type only**.
- [ ] Exclude severity from chart calculations.
- [ ] Combine all severity levels into a single disease count.
- [ ] Ensure the chart updates automatically when scan data changes.
- [ ] Keep disease labels consistent with the Disease Summary table.

---

## 🛠 Component Changes
- [ ] Change the chart type from **Pie** to **Column/Bar**.
- [ ] Update the chart configuration to support vertical columns.
- [ ] Remove any legend or tooltip information related to severity.
- [ ] Configure the X-axis to display disease names.
- [ ] Configure the Y-axis to display total scan counts.
- [ ] Ensure responsive behavior across desktop and mobile devices.

---

## ✅ Expected Result
The chart should provide a clear comparison of the total number of detections for each disease category:

- Healthy
- Black Pod Disease
- Mealybug
- Cacao Pod Borer

Severity (Mild, Moderate, Severe) should **not** be represented in this visualization and should only be used in detailed reports or tables.
