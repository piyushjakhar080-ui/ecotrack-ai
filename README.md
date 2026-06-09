# 🌱 EcoTrack AI — Carbon Footprint Awareness & Offsetting Simulator

EcoTrack AI is a premium, beginner-friendly, responsive single-page carbon footprint tracker. Built with pure **Vanilla HTML, Tailwind CSS (v4), and JavaScript (ES6)**, it is completely lightweight, lightning-fast, and has **zero complex framework dependencies**.

This project displays standard engineering practices in vanilla DOM scripting and vector graphics, making it an excellent learning tool or a showcase piece ready to deploy to **GitHub Pages**.

---

## 🚀 Key Features

1. **Interactive Parameters Calculator**:
   - **Commuting**: Configure daily travel distances (km) and select transit types (*Car, Bus, Train, Bicycle, Walking*).
   - **Household Energy**: Adjust electricity rates (kWh) and toggle offset clean solar energy coverage.
   - **Protein Diet Nutrition**: Compare footprints between *Standard Mixed (regular meat), Vegetarian, or 100% plant-based Vegan* lives.
   - **Household Waste Management**: Gauge impact levels from active composting (*Low*) up to non-recyclable wrapping (*High*).

2. **Real-time Circular Gauge (SVG Donut Chart)**:
   - Dynamic SVG paths computed dynamically inside client JavaScript representing breakdown proportions for each category showing on hover details.

3. **Relative Impact Equivalency Translations**:
   - Translates abstract CO₂ metrics into clean physical analogies:
     - Number of **forest trees** required for yearly gas absorption.
     - Mileage equivalents in standard internal combustion passenger **gas vehicles**.
     - Equivalent **smartphone full recharges**.

4. **Gamified Offsets Checklist Simulator**:
   - Simulate changing lighting types, transit routines, and diet schedules. Checking habits instantly offsets the raw footprint, altering the profile score.

5. **Sorting Smart Recommendation List**:
   - The interface identifies the user's highest CO₂ contributor, sorts priorities, and places matching, actionable energy advice on top.

6. **Local Storage Database Persistence**:
   - Save calculation runs into a persistent local storage log stack. Load past structures instantly with one click, or clear previous logs easily.

7. **Monthly Carbon Goal Tracker (New Feature!)**:
   - Set a personalized monthly carbon emissions goal (ceiling) in kg CO₂ directly.
   - Dynamic real-time calculation of your progress status, percentage, and interactive visual indicator.
   - High-contrast, responsive color-coded progress bar (Green/Yellow/Red warning states) reflecting carbon performance levels.
   - Persistent goal configuration stored locally in standard browser localStorage.

---

## 🎯 Monthly Carbon Goal Tracker: How It Works

The Monthly Carbon Goal Tracker helps users visual and enforce a personal emissions ceiling. Here's how it operates under the hood:

1. **User Goal Selection**:
   - Enter a target value (default: `300` kg CO₂ / month) within the dedicated input.
   - The platform saves the chosen goal inside `localStorage` under the `ecotrack_goal` key, keeping it persistent between restarts and device refreshes.

2. **Goal Progress Percentage Formula**:
   $$\text{Progress \%} = \left(\frac{\text{Current Net Monthly Footprint}}{\text{Goal}}\right) \times 100$$
   - The value is dynamically evaluated to one decimal place on every slider input movement, diet button swap, and offset toggle check.

3. **Intelligent Performance States & Progress Bar**:
   - **Green Bar State ($\le 100\%$ of Goal)**: The footprint is securely below or equal to the ceiling budget limit. Prompts positive confirmation.
   - **Amber Bar State ($> 100\%$ and $\le 120\%$ of Goal)**: The footprint is slightly within $20\%$ exceeding the budget. Prompts caution tips.
   - **Red Bar State ($> 120\%$ of Goal)**: The footprint is significantly over the target. Prompts corrective alert instructions.

---

## 📸 Screenshots

*Place your active screenshot links or files here to display application states!*

| Green (Within Goal Target) | Yellow (Minor Warning State) | Red (Critical Exceeded State) |
| :--- | :--- | :--- |
| *[Insert Green Screenshot Placeholder]* | *[Insert Yellow Screenshot Placeholder]* | *[Insert Red Screenshot Placeholder]* |

---

## 📊 Scientific Calculations Model

Carbon calculations use verified carbon offset averages (represented as **monthly kg CO₂ emissions**):

### 1. Transportation
$$\text{Commute Emission (kg/month)} = \text{Daily distance (km)} \times 30 \text{ days} \times \text{Transit Factor}$$
- **Car**: `0.18` kg CO₂/km
- **Bus**: `0.08` kg CO₂/km
- **Train**: `0.04` kg CO₂/km
- **Bicycle / Walk**: `0.00` kg CO₂/km (Zero carbon Commutes)

### 2. Residential Electricity
$$\text{Electricity Emission (kg/month)} = \text{kWh Consumed} \times 0.45 \text{ kg/kWh} \times (1 - \text{Solar Share \%})$$
- *Grid Baseline Coefficient*: `0.45` kg CO₂ per kWh produced.

### 3. Diet & Nutrition
- **Standard Mixed**: `215` kg CO₂/month
- **Vegetarian**: `105` kg CO₂/month
- **Vegan**: `60` kg CO₂/month

### 4. Household Waste
- **Low (Active Recycling/Compost)**: `15` kg CO₂/month
- **Moderate (Standard Container average)**: `35` kg CO₂/month
- **High (Unsorted volume)**: `65` kg CO₂/month

---

## 📁 File Structure

The project represents a standard vanilla asset outline:
```bash
├── index.html       # Primary semantic visual layout containing Tailwind v4 linkages
├── style.css        # Theme, Plus Jakarta Sans custom scrollbars, and range sliders stylesheet
└── script.js        # Core DOM binders, math systems, SVG render engines, and storage logic
```

---

## 🛠️ Local Development & Execution

Since the project uses entirely vanilla, compiler-free technologies, there is no need for `npm install`, node_modules, bundlers, or any local setup. You can double-click **`index.html`** or load the files directly:

### Option A: Direct Browser Startup
Simply open the folder on your computer and double-click `index.html` to run the active site immediately.

### Option B: VS Code Live Server
1. Clone this repository to your workstation.
2. Open the directory inside **VS Code**.
3. Install the **Live Server** extension.
4. Click **Go Live** in the bottom status rail to load on `http://127.0.0.1:5500`.

### Option C: GitHub Pages Deployment
1. Create a new repository on GitHub.
2. Upload `index.html`, `style.css`, and `script.js` directly to the `main` branch.
3. Under the **Settings** tab of your repository, go to **Pages**.
4. Set source to **Deploy from a branch**, select the `main` branch (root folder), and click **Save**.
5. Your platform is live globally at `https://<username>.github.io/<repository-name>/`!

---

## 🎨 Creative Theme & Aesthetic Choices

The **EcoTrack AI** dashboard is designed to look like a high-end, premium, cloud analytical portal:
- **Warm Orchid Botanical Slate Color Palette**: Using custom slate grays (`#fcfbf9`) paired with lush emerald headers and deep warm charcoal text (`#1c1917`).
- **Clean Bento Grid Geometry**: Modules are laid out in custom responsive grid structures, utilizing micro-transition transformations (such as focus hover indicators and active card rings).
- **Plus Jakarta Sans Family**: Imported display typography providing highly polished visual hierarchy.

*Developed with care as a premium, lightweight, fully-featured open-source carbon footprints awareness tool.*

 
## Accessibility

- Keyboard-friendly controls
- Responsive design
- Clear visual indicators
- Accessible form labels

## Testing

See TESTING.md for detailed testing results.

## Live Demo

https://piyushjakhar080-ui.github.io/ecotrack-ai/
