/**
 * EcoTrack AI - Carbon Footprint Awareness Platform
 * Core application logic: handles formulas, charting, state, local storage persistence,
 * and smart dynamic recommendations.
 */

// 1. Core State Management
const appState = {
  // Current user inputs
  inputs: {
    dailyTravel: 25,        // Daily km
    transportType: "car",   // car, bus, train, bike, walking
    electricity: 280,       // Monthly kWh
    solarOffset: 0,         // Solar energy coverage ratio (%)
    dietType: "mixed",      // mixed, vegetarian, vegan
    wasteLevel: "medium"    // low, medium, high
  },
  // Selection of checked eco checklist actions
  checkedActions: new Set(),
  // Historical entries saved locally
  history: []
};

// 2. Carbon Footprint Coefficients & Constants
const COEFF = {
  transport: {
    car: 0.18,      // kg CO2 per km
    bus: 0.08,      // kg CO2 per km
    train: 0.04,     // kg CO2 per km
    bike: 0.0,       // zero emissions
    walking: 0.0     // zero emissions
  },
  electricity: 0.45, // kg CO2 per kWh of grid energy
  diet: {
    vegan: 60,       // kg CO2 per month
    vegetarian: 105, // kg CO2 per month
    mixed: 215       // kg CO2 per month
  },
  waste: {
    low: 15,         // kg CO2 per month (high composting/recycling)
    medium: 35,      // kg CO2 per month (normal trash)
    high: 65         // kg CO2 per month (high packaging/no recycling)
  }
};

// Pre-packaged checklist actions for the carbon offsets simulator
const ECO_ACTIONS = [
  { id: "led_bulbs", label: "Upgrade home lighting to efficient LED bulbs", savings: 25, icon: "lightbulb", category: "energy" },
  { id: "public_transit", label: "Take bus or train for work commutes 3x/week", savings: 75, icon: "bus", category: "transport" },
  { id: "meatless_mondays", label: "Implement 'Meatless Mondays' (vegetarian days)", savings: 35, icon: "utensils", category: "diet" },
  { id: "composting", label: "Compost kitchen food wastes & recycle actively", savings: 20, icon: "trash-2", category: "waste" },
  { id: "cold_water", label: "Wash clothing in cold water instead of hot", savings: 15, icon: "droplet", category: "energy" },
  { id: "unplug_vampire", label: "Unplug idle computer/screens (reduce vampire power)", savings: 10, icon: "power", category: "energy" }
];

// 3. Document Element Cache
const DOM = {
  // Input elements
  travelSlider: document.getElementById("travelSlider"),
  travelValue: document.getElementById("travelValue"),
  electricitySlider: document.getElementById("electricitySlider"),
  electricityValue: document.getElementById("electricityValue"),
  solarSlider: document.getElementById("solarSlider"),
  solarValue: document.getElementById("solarValue"),
  // Results details
  totalEmissions: document.getElementById("totalEmissions"),
  netEmissions: document.getElementById("netEmissions"),
  netEmissionsLabel: document.getElementById("netEmissionsLabel"),
  scoreBadge: document.getElementById("scoreBadge"),
  scoreBadgeDesc: document.getElementById("scoreBadgeDesc"),
  scoreCardContainer: document.getElementById("scoreCardContainer"),
  // Categories values (kg CO2)
  valTransport: document.getElementById("valTransport"),
  valEnergy: document.getElementById("valEnergy"),
  valDiet: document.getElementById("valDiet"),
  valWaste: document.getElementById("valWaste"),
  // Equivalency translations
  equivTrees: document.getElementById("equivTrees"),
  equivDriving: document.getElementById("equivDriving"),
  equivSmartphones: document.getElementById("equivSmartphones"),
  // Charts
  svgDonut: document.getElementById("svgDonut"),
  donutLegend: document.getElementById("donutLegend"),
  // Recommendations and actions list
  recContainer: document.getElementById("recContainer"),
  actionsContainer: document.getElementById("actionsContainer"),
  offsetHeader: document.getElementById("offsetHeader"),
  // History panel
  logForm: document.getElementById("logForm"),
  logNameInput: document.getElementById("logName"),
  historyContainer: document.getElementById("historyContainer")
};

// 4. Initialize Application
window.addEventListener("DOMContentLoaded", () => {
  loadHistoryFromStorage();
  bindInputEvents();
  renderEcoActions();
  recalculateAll();
  lucide.createIcons();
});

// 5. Input Event Handlers & Binding
function bindInputEvents() {
  // Travel distance slider
  DOM.travelSlider.addEventListener("input", (e) => {
    appState.inputs.dailyTravel = parseFloat(e.target.value);
    DOM.travelValue.innerText = appState.inputs.dailyTravel;
    recalculateAll();
  });

  // Transport selection cards
  document.querySelectorAll("[data-transport]").forEach(card => {
    card.addEventListener("click", () => {
      // Remove ring classes from all siblings
      document.querySelectorAll("[data-transport]").forEach(c => {
        c.classList.remove("ring-2", "ring-emerald-600", "bg-emerald-50/50", "border-emerald-200");
        c.classList.add("border-stone-200");
      });
      // Add active ring classes to this card
      card.classList.add("ring-2", "ring-emerald-600", "bg-emerald-50/50", "border-emerald-200");
      card.classList.remove("border-stone-200");
      
      appState.inputs.transportType = card.getAttribute("data-transport");
      recalculateAll();
    });
  });

  // Electricity usage slider
  DOM.electricitySlider.addEventListener("input", (e) => {
    appState.inputs.electricity = parseFloat(e.target.value);
    DOM.electricityValue.innerText = appState.inputs.electricity;
    recalculateAll();
  });

  // Solar offset ratio slider
  DOM.solarSlider.addEventListener("input", (e) => {
    appState.inputs.solarOffset = parseFloat(e.target.value);
    DOM.solarValue.innerText = appState.inputs.solarOffset;
    recalculateAll();
  });

  // Diet selection cards
  document.querySelectorAll("[data-diet]").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll("[data-diet]").forEach(c => {
        c.classList.remove("ring-2", "ring-emerald-600", "bg-emerald-50/50", "border-emerald-200");
        c.classList.add("border-stone-200");
      });
      card.classList.add("ring-2", "ring-emerald-600", "bg-emerald-50/50", "border-emerald-200");
      card.classList.remove("border-stone-200");

      appState.inputs.dietType = card.getAttribute("data-diet");
      recalculateAll();
    });
  });

  // Waste selection cards
  document.querySelectorAll("[data-waste]").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll("[data-waste]").forEach(c => {
        c.classList.remove("ring-2", "ring-emerald-600", "bg-emerald-50/50", "border-emerald-200");
        c.classList.add("border-stone-200");
      });
      card.classList.add("ring-2", "ring-emerald-600", "bg-emerald-50/50", "border-emerald-200");
      card.classList.remove("border-stone-200");

      appState.inputs.wasteLevel = card.getAttribute("data-waste");
      recalculateAll();
    });
  });

  // Save history form
  DOM.logForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = DOM.logNameInput.value.trim() || `My Carbon Entry - ${new Date().toLocaleDateString()}`;
    saveCurrentFootprint(title);
    DOM.logNameInput.value = "";
  });
}

// 6. Recalculate Emissions Models
function recalculateAll() {
  const inputs = appState.inputs;

  // Monthly Calculations (Standardized parameters)
  // Travel: Daily km x 30 days x emissions factor
  const factor = COEFF.transport[inputs.transportType] || 0;
  const transportEmissions = inputs.dailyTravel * 30 * factor;

  // Energy: kWh x 0.45 x (1 - solarOffset%)
  const gridFactor = COEFF.electricity;
  const solarFactor = 1 - (inputs.solarOffset / 100);
  const energyEmissions = inputs.electricity * gridFactor * solarFactor;

  // Diet emissions directly from footprint coefficients
  const dietEmissions = COEFF.diet[inputs.dietType] || 150;

  // Waste emissions from level coefficients
  const wasteEmissions = COEFF.waste[inputs.wasteLevel] || 35;

  // Totals calculations
  const grossEmissions = transportEmissions + energyEmissions + dietEmissions + wasteEmissions;

  // Offset Simulator impact
  let totalOffsets = 0;
  appState.checkedActions.forEach(actionId => {
    const action = ECO_ACTIONS.find(a => a.id === actionId);
    if (action) {
      totalOffsets += action.savings;
    }
  });

  // Net calculation (cannot go below zero)
  const netEmissions = Math.max(0, grossEmissions - totalOffsets);

  // Update UI Elements
  updateDashboardGrid(grossEmissions, netEmissions, totalOffsets, {
    transport: transportEmissions,
    energy: energyEmissions,
    diet: dietEmissions,
    waste: wasteEmissions
  });
}

// 7. Update Dashboard Interface
function updateDashboardGrid(gross, net, offsets, categories) {
  // Main aggregate scores
  DOM.totalEmissions.innerText = Math.round(gross);
  DOM.netEmissions.innerText = Math.round(net);
  
  if (offsets > 0) {
    DOM.netEmissionsLabel.innerHTML = `Net Monthly Footprint <span class="text-xs text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full font-medium ml-1">-${Math.round(offsets)} kg saved</span>`;
  } else {
    DOM.netEmissionsLabel.innerText = "Net Monthly Footprint";
  }

  // Set category specific text numbers
  DOM.valTransport.innerText = Math.round(categories.transport);
  DOM.valEnergy.innerText = Math.round(categories.energy);
  DOM.valDiet.innerText = Math.round(categories.diet);
  DOM.valWaste.innerText = Math.round(categories.waste);

  // Score badge assignment (Green, Yellow, Red)
  let scoreClass = "";
  let scoreText = "";
  let scoreDesc = "";
  let borderGlow = "";

  if (net < 220) {
    scoreClass = "bg-emerald-600 text-white";
    scoreText = "Green Balance (Low)";
    scoreDesc = "Excellent sustainability rating. Your footprint is fully aligned with Paris Climate agreement standards!";
    borderGlow = "green-glow border-emerald-500/30";
  } else if (net >= 220 && net <= 480) {
    scoreClass = "bg-amber-500 text-white";
    scoreText = "Yellow Profile (Moderate)";
    scoreDesc = "Typical urban lifestyle footprint. You can cut down about 25% easily by adjusting commuting and lighting habits.";
    borderGlow = "yellow-glow border-amber-500/30";
  } else {
    scoreClass = "bg-rose-600 text-white";
    scoreText = "Red Threshold (High)";
    scoreDesc = "Heavy resource utilization. Explore clean public transport and reduce livestock proteins to decrease emissions rapidly.";
    borderGlow = "red-glow border-rose-500/30";
  }

  // Update badge UI
  DOM.scoreBadge.className = `inline-flex text-xs md:text-sm font-semibold tracking-wide uppercase px-3.5 py-1 rounded-full ${scoreClass}`;
  DOM.scoreBadge.innerText = scoreText;
  DOM.scoreBadgeDesc.innerText = scoreDesc;
  
  // Outer score display box background adjustments
  DOM.scoreCardContainer.className = `p-6 bg-white border rounded-2xl transition-all duration-500 ${borderGlow}`;

  // Update Real-World equivalents
  // 1 tree absorbs ~22 kg of CO2 per year. This tree equivalent calculations is per month, so tree_needed = Net_Emissions / (22 / 12)
  const treesNeeded = Math.round(net / (22 / 12));
  DOM.equivTrees.innerText = treesNeeded;

  // Gasoline passenger car emits ~0.18 kg CO2/km. km_driven = Net_Emissions / 0.18
  const drivingKm = Math.round(net / 0.18);
  DOM.equivDriving.innerText = drivingKm.toLocaleString();

  // One smartphone charge is ~0.008 kg. charges = Net_Emissions / 0.008
  const chargeCount = Math.round(net / 0.008);
  DOM.equivSmartphones.innerText = chargeCount.toLocaleString();

  // Draw Charts
  drawSVGDonut(categories);
  renderDynamicRecommendations(categories);
}

// 8. Render Smart Dynamic Recommendations - Ordered by Highest Source
function renderDynamicRecommendations(categories) {
  const sortedCategories = [
    { name: "transport", val: categories.transport, icon: "car", title: "Green Commuting", desc: {
        normal: "Commuting by car is your biggest emission contributor.",
        tips: [
          "Choose public transit or cycling for 2 or more commutes weekly to shave off 50+ kg CO₂/mo.",
          "Carpool with localized coworkers to divide your direct trip fuel usage.",
          "Keep car tires inflated correctly to improve vehicle gas mileage by up to 3.5%."
        ]
      }
    },
    { name: "energy", val: categories.energy, icon: "lightning-charge", title: "Smart Offsetting", desc: {
        normal: "Your residential grid electrical usage emits a substantial volume.",
        tips: [
          "Swap key light sockets to LED bulbs which use 80% less energy than standard models.",
          "Unplug television systems, video games, and standby monitors when leaving for the day.",
          "Lower washing machine water settings to cold washes to conserve 90% of electricity per cycle."
        ]
      }
    },
    { name: "diet", val: categories.diet, icon: "restaurant", title: "Sustainable Proteins", desc: {
        normal: "Animal agriculture accounts for critical green gases in your profile.",
        tips: [
          "Add 2 fully vegetarian or vegan dinners weekly to save up to 40 kg CO₂ monthly.",
          "Choose locally sourced seasonal vegetables over imported foods to minimize logistics impact.",
          "Trim down direct food scraps and compost organic leftovers in your garden or green waste."
        ]
      }
    },
    { name: "waste", val: categories.waste, icon: "recycle", title: "Circular Living", desc: {
        normal: "Municipal waste processing adds latent methane and transportation carbon.",
        tips: [
          "Switch completely to zero-waste reusable grocery bags and insulated drinking mugs.",
          "Opt for bulk refills rather than standard individual single-use food packaging.",
          "Compost raw food waste to reduce organic mass heading to heavy methane landfills."
        ]
      }
    }
  ];

  // Sort descending by emission val
  sortedCategories.sort((a, b) => b.val - a.val);

  DOM.recContainer.innerHTML = "";

  // Output 3 smart recommendations
  sortedCategories.slice(0, 3).forEach((item, index) => {
    // Pick appropriate card label colors
    let headerBorder = "border-stone-200";
    let iconBg = "bg-stone-100 text-stone-600";
    if (index === 0) {
      headerBorder = "border-emerald-200 bg-emerald-50/20";
      iconBg = "bg-emerald-100 text-emerald-800";
    }

    const tipsList = item.desc.tips.map(t => `<li class="flex items-start text-sm text-stone-600 mb-2">
      <span class="text-emerald-500 mr-2 font-bold">•</span>
      <span>${t}</span>
    </li>`).join("");

    const recCard = document.createElement("div");
    recCard.className = `p-5 bg-white border ${headerBorder} rounded-2xl transition-all duration-300`;
    recCard.innerHTML = `
      <div class="flex items-start gap-4">
        <div class="p-3 ${iconBg} rounded-xl shadow-sm flex items-center justify-center">
          <i data-lucide="${item.icon === 'lightning-charge' ? 'zap' : item.icon === 'restaurant' ? 'utensils' : item.icon}" class="w-5 h-5"></i>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h4 class="font-semibold text-stone-900">${item.title}</h4>
            ${index === 0 ? '<span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">Highest Category</span>' : ''}
          </div>
          <p class="text-xs text-stone-500 mb-3">${item.desc.normal} Here are your direct action steps:</p>
          <ul class="list-none pl-0">
            ${tipsList}
          </ul>
        </div>
      </div>
    `;

    DOM.recContainer.appendChild(recCard);
  });

  lucide.createIcons();
}

// 9. Generate SVG Donut Segment Calculation
function drawSVGDonut(categories) {
  const data = [
    { label: "Transport", value: categories.transport, color: "#10b981" }, // emerald-500
    { label: "Energy", value: categories.energy, color: "#f59e0b" },    // amber-500
    { label: "Diet", value: categories.diet, color: "#06b6d4" },      // cyan-500
    { label: "Waste", value: categories.waste, color: "#cbd5e1" }       // slate-300
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Clear existing SVG circles and labels
  DOM.svgDonut.innerHTML = "";
  DOM.donutLegend.innerHTML = "";

  // Radius, Circumference
  const r = 50;
  const c = 2 * Math.PI * r; // ~314.159

  let accumulatedAngle = 0;
  let legendHTML = "";

  if (total === 0) {
    // Draw default empty circle
    DOM.svgDonut.innerHTML += `
      <circle cx="70" cy="70" r="${r}" fill="none" stroke="#f4f4f5" stroke-width="15" />
      <text x="70" y="74" text-anchor="middle" class="text-[10px] font-bold fill-stone-400">0 kg CO2</text>
    `;
    return;
  }

  data.forEach((item) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    if (percentage <= 0) return;

    const strokeLength = (percentage / 100) * c;
    const strokeOffset = c - strokeLength + accumulatedAngle;

    // Create segment path (represented as dashed circle overlay)
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "70");
    circle.setAttribute("cy", "70");
    circle.setAttribute("r", r.toString());
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", item.color);
    circle.setAttribute("stroke-width", "16");
    circle.setAttribute("stroke-dasharray", `${strokeLength} ${c - strokeLength}`);
    circle.setAttribute("stroke-dashoffset", strokeOffset.toString());
    circle.setAttribute("transform", "rotate(-90 70 70)");
    circle.classList.add("chart-donut-segment", "cursor-pointer");
    
    // Simple interactivity: hover slice shows name
    circle.addEventListener("mouseenter", () => {
      document.getElementById("donutCenterText").innerHTML = `
        <tspan x="70" dy="0" class="text-xs font-bold fill-stone-800">${item.label}</tspan>
        <tspan x="70" dy="14" class="text-[10px] fill-stone-500 font-mono">${Math.round(percentToShow)}%</tspan>
      `;
    });
    
    circle.addEventListener("mouseleave", () => {
      document.getElementById("donutCenterText").innerHTML = `
        <tspan x="70" dy="0" class="text-xs font-bold fill-stone-700">Total</tspan>
        <tspan x="70" dy="14" class="text-[10px] fill-stone-500 font-mono">${Math.round(total)} kg</tspan>
      `;
    });

    DOM.svgDonut.appendChild(circle);

    // Build Legend
    const percentToShow = Math.round(percentage);
    legendHTML += `
      <div class="flex items-center justify-between text-xs sm:text-sm p-1.5 border-b border-stone-100 last:border-0 hover:bg-stone-50 rounded">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${item.color}"></span>
          <span class="text-stone-700 font-medium">${item.label}</span>
        </div>
        <div class="flex items-center gap-2 text-right">
          <span class="font-mono font-bold text-stone-900">${Math.round(item.value)} kg</span>
          <span class="text-stone-400 text-xs font-mono">(${percentToShow}%)</span>
        </div>
      </div>
    `;

    // Increment angle offset
    accumulatedAngle -= strokeLength;
  });

  // Adding inner circle covering for donut effect and middle title
  const innerTitleGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  innerTitleGroup.id = "donutCenterText";
  innerTitleGroup.innerHTML = `
    <text x="70" y="65" text-anchor="middle" class="font-sans">
      <tspan x="70" dy="0" class="text-xs font-bold fill-stone-700">Total</tspan>
      <tspan x="70" dy="14" class="text-[10px] fill-stone-500 font-mono">${Math.round(total)} kg</tspan>
    </text>
  `;
  DOM.svgDonut.appendChild(innerTitleGroup);

  // Output custom legend list
  DOM.donutLegend.innerHTML = legendHTML;
}

// 10. Render Eco Offsets Checklist Simulator
function renderEcoActions() {
  DOM.actionsContainer.innerHTML = "";

  ECO_ACTIONS.forEach(action => {
    const isChecked = appState.checkedActions.has(action.id);
    
    const card = document.createElement("div");
    card.id = `actionCard_${action.id}`;
    card.className = `action-card flex items-start gap-3.5 p-4 border rounded-2xl cursor-pointer bg-white hover:border-emerald-300 ${isChecked ? 'checked bg-emerald-50/40 border-emerald-500/50 shadow-sm' : 'border-stone-200'}`;
    
    // Define category badge details
    let catClass = "bg-stone-100 text-stone-600";
    if (action.category === "energy") catClass = "bg-amber-100 text-amber-800";
    if (action.category === "transport") catClass = "bg-emerald-100 text-emerald-800";
    if (action.category === "diet") catClass = "bg-cyan-100 text-cyan-800";
    if (action.category === "waste") catClass = "bg-blue-100 text-blue-800";

    card.innerHTML = `
      <div class="flex items-center h-5 mt-1">
        <input type="checkbox" id="check_${action.id}" ${isChecked ? 'checked' : ''} class="w-4 h-4 rounded text-emerald-600 border-stone-300 focus:ring-emerald-500 cursor-pointer">
      </div>
      <div class="flex-1">
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="text-xs font-medium uppercase px-2 py-0.5 rounded-full ${catClass}">${action.category}</span>
          <span class="text-xs font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full font-mono">-${action.savings} kg CO₂</span>
        </div>
        <p class="text-sm font-medium text-stone-800 leading-snug">${action.label}</p>
      </div>
    `;

    // Interactivity: clicking anywhere on the card toggles toggle state
    card.addEventListener("click", (e) => {
      // Don't fire twice if clicking directly on the checkbox
      if (e.target.tagName === 'INPUT') return;
      toggleActionCheckbox(action.id);
    });

    // Make direct checkbox clicks trigger standard recalculates too
    const checkEl = card.querySelector(`#check_${action.id}`);
    checkEl.addEventListener("change", () => {
      toggleActionCheckbox(action.id);
    });

    DOM.actionsContainer.appendChild(card);
  });

  updateOffsetSimulatorHeader();
}

// Toggle individual action checkbox impact
function toggleActionCheckbox(actionId) {
  const card = document.getElementById(`actionCard_${actionId}`);
  const checkbox = document.getElementById(`check_${actionId}`);

  if (appState.checkedActions.has(actionId)) {
    appState.checkedActions.delete(actionId);
    card.classList.remove("checked", "bg-emerald-50/40", "border-emerald-500/50", "shadow-sm");
    card.classList.add("border-stone-200");
    checkbox.checked = false;
  } else {
    appState.checkedActions.add(actionId);
    card.classList.add("checked", "bg-emerald-50/40", "border-emerald-500/50", "shadow-sm");
    card.classList.remove("border-stone-200");
    checkbox.checked = true;
  }

  updateOffsetSimulatorHeader();
  recalculateAll();
}

// Update Simulator Impact text banner
function updateOffsetSimulatorHeader() {
  let totalSaved = 0;
  appState.checkedActions.forEach(actionId => {
    const action = ECO_ACTIONS.find(a => a.id === actionId);
    if (action) totalSaved += action.savings;
  });

  if (totalSaved > 0) {
    DOM.offsetHeader.className = "p-4 bg-emerald-600 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md mb-6 transition-all duration-300";
    DOM.offsetHeader.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="p-2 bg-emerald-500 rounded-lg">
          <i data-lucide="leaf" class="w-5 h-5 text-white"></i>
        </div>
        <div>
          <h5 class="font-bold text-sm">Active Offsets Calculator</h5>
          <p class="text-xs text-emerald-100">You are reducing your gross footprint directly with these activities</p>
        </div>
      </div>
      <div class="text-center sm:text-right font-mono text-sm">
        <span class="text-xs block uppercase font-bold text-emerald-200 tracking-wider">Saving Monthly</span>
        <span class="text-lg font-bold">-${totalSaved} kg CO₂ / mo</span>
      </div>
    `;
  } else {
    DOM.offsetHeader.className = "p-4 bg-stone-100 text-stone-600 rounded-2xl flex items-center justify-between gap-3 mb-6 transition-all duration-300 border border-stone-200/80";
    DOM.offsetHeader.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="p-2 bg-stone-200 rounded-lg text-stone-500">
          <i data-lucide="sparkles" class="w-5 h-5"></i>
        </div>
        <div>
          <h5 class="font-bold text-sm text-stone-700">Offset Emissions Simulator</h5>
          <p class="text-xs text-stone-500">Toggle carbon reduction goals to visualize your net carbon score drop</p>
        </div>
      </div>
    `;
  }
  lucide.createIcons();
}

// 11. Historical Core Logs (LocalStorage)
function loadHistoryFromStorage() {
  try {
    const storageData = localStorage.getItem("ecotrack_history");
    if (storageData) {
      appState.history = JSON.parse(storageData);
    } else {
      // Default initial templates to help understand
      appState.history = [
        {
          id: "hist_1",
          title: "Initial Household Average",
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 30 days ago
          metrics: { dailyTravel: 45, transportType: "car", electricity: 320, solarOffset: 0, dietType: "mixed", wasteLevel: "high" },
          gross: 423,
          net: 423
        },
        {
          id: "hist_2",
          title: "Public Commuting Phase",
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 10 days ago
          metrics: { dailyTravel: 30, transportType: "train", electricity: 260, solarOffset: 0, dietType: "vegetarian", wasteLevel: "medium" },
          gross: 191,
          net: 191
        }
      ];
      saveToStorageKey();
    }
    renderHistoryLogs();
  } catch (error) {
    console.error("Local storage lookup failed:", error);
  }
}

function saveToStorageKey() {
  try {
    localStorage.setItem("ecotrack_history", JSON.stringify(appState.history));
  } catch (error) {
    console.error("Local store saves failed:", error);
  }
}

function saveCurrentFootprint(title) {
  // Calculations logic duplicated to secure static snapshot values
  const inputs = appState.inputs;
  const factor = COEFF.transport[inputs.transportType] || 0;
  const transportEmissions = inputs.dailyTravel * 30 * factor;
  const gridFactor = COEFF.electricity;
  const solarFactor = 1 - (inputs.solarOffset / 100);
  const energyEmissions = inputs.electricity * gridFactor * solarFactor;
  const dietEmissions = COEFF.diet[inputs.dietType] || 150;
  const wasteEmissions = COEFF.waste[inputs.wasteLevel] || 35;
  const grossEmissions = transportEmissions + energyEmissions + dietEmissions + wasteEmissions;

  let totalOffsets = 0;
  appState.checkedActions.forEach(actionId => {
    const action = ECO_ACTIONS.find(a => a.id === actionId);
    if (action) totalOffsets += action.savings;
  });

  const netEmissions = Math.max(0, grossEmissions - totalOffsets);

  const newLog = {
    id: "hist_" + Date.now(),
    title: title,
    date: new Date().toLocaleDateString(),
    metrics: JSON.parse(JSON.stringify(appState.inputs)), // deep clone metrics state
    gross: Math.round(grossEmissions),
    net: Math.round(netEmissions)
  };

  appState.history.unshift(newLog); // Place on top of stack
  saveToStorageKey();
  renderHistoryLogs();
}

function renderHistoryLogs() {
  DOM.historyContainer.innerHTML = "";

  if (appState.history.length === 0) {
    DOM.historyContainer.innerHTML = `
      <div class="text-center py-8 text-stone-400">
        <i data-lucide="archive" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        <p class="text-sm">No recorded carbon profiles yet.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  appState.history.forEach(item => {
    const card = document.createElement("div");
    card.className = "p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200";
    
    // Choose footprint level visual colors
    let textScoreColor = "text-emerald-700";
    let bgScoreColor = "bg-emerald-50 border-emerald-100";
    if (item.net >= 220 && item.net <= 480) {
      textScoreColor = "text-amber-700";
      bgScoreColor = "bg-amber-50 border-amber-100";
    } else if (item.net > 480) {
      textScoreColor = "text-rose-700";
      bgScoreColor = "bg-rose-50 border-rose-100";
    }

    card.innerHTML = `
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <h5 class="font-bold text-stone-800 text-sm leading-snug">${item.title}</h5>
          <span class="text-[10px] text-stone-400 font-mono">${item.date}</span>
        </div>
        <div class="flex flex-wrap gap-2 text-xs text-stone-500">
          <span class="font-medium">Travel: ${item.metrics.dailyTravel}km/d (${item.metrics.transportType})</span>
          <span class="text-stone-300">|</span>
          <span class="font-medium">Energy: ${item.metrics.electricity}kWh/mo</span>
          <span class="text-stone-300">|</span>
          <span class="font-medium">Diet: ${item.metrics.dietType}</span>
        </div>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-2.5 sm:pt-0 border-stone-200/60">
        <div class="text-right bg-white border px-3 py-1.5 rounded-xl ${bgScoreColor} font-mono">
          <span class="block text-[8px] uppercase tracking-wider text-stone-400 font-sans font-bold">Footprint</span>
          <span class="text-sm font-bold ${textScoreColor}">${item.net} kg</span>
        </div>
        <div class="flex items-center gap-1.5">
          <button class="load-log-btn p-2 text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Load this config">
            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
          </button>
          <button class="delete-log-btn p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete entry">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;

    // Bind reload configurations
    card.querySelector(".load-log-btn").addEventListener("click", () => {
      loadHistoricConfig(item);
    });

    // Bind delete logs
    card.querySelector(".delete-log-btn").addEventListener("click", () => {
      deleteHistoricConfig(item.id);
    });

    DOM.historyContainer.appendChild(card);
  });

  lucide.createIcons();
}

function loadHistoricConfig(item) {
  appState.inputs = JSON.parse(JSON.stringify(item.metrics)); // Restore metrics state

  // Update DOM sliders & input boxes
  DOM.travelSlider.value = appState.inputs.dailyTravel;
  DOM.travelValue.innerText = appState.inputs.dailyTravel;

  DOM.electricitySlider.value = appState.inputs.electricity;
  DOM.electricityValue.innerText = appState.inputs.electricity;

  DOM.solarSlider.value = appState.inputs.solarOffset;
  DOM.solarValue.innerText = appState.inputs.solarOffset;

  // Reactivate selection cards for transport
  document.querySelectorAll("[data-transport]").forEach(card => {
    if (card.getAttribute("data-transport") === appState.inputs.transportType) {
      card.classList.add("ring-2", "ring-emerald-600", "bg-emerald-50/50", "border-emerald-200");
      card.classList.remove("border-stone-200");
    } else {
      card.classList.remove("ring-2", "ring-emerald-600", "bg-emerald-50/50", "border-emerald-200");
      card.classList.add("border-stone-200");
    }
  });

  // Reactivate selection cards for diet
  document.querySelectorAll("[data-diet]").forEach(card => {
    if (card.getAttribute("data-diet") === appState.inputs.dietType) {
      card.classList.add("ring-2", "ring-emerald-600", "bg-emerald-50/50", "border-emerald-200");
      card.classList.remove("border-stone-200");
    } else {
      card.classList.remove("ring-2", "ring-emerald-600", "bg-emerald-50/50", "border-emerald-200");
      card.classList.add("border-stone-200");
    }
  });

  // Reactivate selection cards for waste
  document.querySelectorAll("[data-waste]").forEach(card => {
    if (card.getAttribute("data-waste") === appState.inputs.wasteLevel) {
      card.classList.add("ring-2", "ring-emerald-600", "bg-emerald-50/50", "border-emerald-200");
      card.classList.remove("border-stone-200");
    } else {
      card.classList.remove("ring-2", "ring-emerald-600", "bg-emerald-50/50", "border-emerald-200");
      card.classList.add("border-stone-200");
    }
  });

  recalculateAll();

  // Bring calculator section into focus smoothly
  document.getElementById("calculator-section").scrollIntoView({ behavior: 'smooth' });
}

function deleteHistoricConfig(itemId) {
  appState.history = appState.history.filter(item => item.id !== itemId);
  saveToStorageKey();
  renderHistoryLogs();
}
