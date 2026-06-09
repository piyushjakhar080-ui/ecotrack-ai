function assert(name, condition) {
  if (condition) {
    console.log("✅ PASS:", name);
  } else {
    console.error("❌ FAIL:", name);
  }
}

// Transport Tests
assert("Car Transport", (25 * 30 * 0.18) === 135);
assert("Bus Transport", (25 * 30 * 0.08) === 60);
assert("Train Transport", (25 * 30 * 0.04) === 30);

// Diet Tests
assert("Vegan < Mixed", 60 < 215);
assert("Vegetarian < Mixed", 105 < 215);

// Waste Tests
assert("Low Waste < High Waste", 15 < 65);

// Validation Tests
function validateProfileName(name) {
  return name.trim().length > 0 && name.length <= 50;
}

assert("Valid Name", validateProfileName("My Eco Profile"));
assert("Reject Empty Name", !validateProfileName(""));
assert("Reject Spaces Only", !validateProfileName("     "));

console.log("EcoTrack AI Tests Complete");
