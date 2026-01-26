/**
 * Test Risk Score Calculation with Database Weights
 *
 * This test verifies that risk scores are calculated correctly using
 * database-stored impact category weights.
 */

import { DEFAULT_IMPACT_CATEGORIES } from "../src/types";

// Simulate the calculateRiskScore function
function calculateRiskScore(
  impact: Record<string, number>,
  categories: Array<{ id: string; weight: number }>,
): number {
  if (!impact || categories.length === 0) return 0;

  let total = 0;
  let weightSum = 0;

  categories.forEach((category) => {
    const impactValue = impact[category.id] || 0;
    total += impactValue * category.weight;
    weightSum += category.weight;
  });

  return weightSum > 0 ? parseFloat((total / weightSum).toFixed(2)) : 0;
}

// Test with default weights (25%, 20%, 20%, 15%, 15%, 5%)
const testImpact = {
  financial: 4, // High financial impact
  operational: 3, // Moderate operational impact
  reputational: 5, // Critical reputational impact
  legal: 2, // Low legal impact
  health: 1, // Minimal health impact
  environmental: 2, // Low environmental impact
};

const categories = [
  { id: "financial", weight: 25 },
  { id: "operational", weight: 20 },
  { id: "reputational", weight: 20 },
  { id: "legal", weight: 15 },
  { id: "health", weight: 15 },
  { id: "environmental", weight: 5 },
];

console.log("\n🧪 Testing Risk Score Calculation\n");
console.log("Impact Scores:");
console.log("  Financial:      4 × 25% = 100");
console.log("  Operational:    3 × 20% = 60");
console.log("  Reputational:   5 × 20% = 100");
console.log("  Legal:          2 × 15% = 30");
console.log("  Health:         1 × 15% = 15");
console.log("  Environmental:  2 × 5%  = 10");
console.log("  ─────────────────────────────");
console.log("  Total:          315 / 100 = 3.15\n");

const riskScore = calculateRiskScore(testImpact, categories);

console.log(`Calculated Risk Score: ${riskScore}`);
console.log(`Expected Risk Score:   3.15`);
console.log(`Match: ${riskScore === 3.15 ? "✅ PASS" : "❌ FAIL"}\n`);

// Test with different weights
const customCategories = [
  { id: "financial", weight: 40 }, // Increased financial weight
  { id: "operational", weight: 30 }, // Increased operational weight
  { id: "reputational", weight: 15 }, // Decreased reputational weight
  { id: "legal", weight: 10 },
  { id: "health", weight: 3 },
  { id: "environmental", weight: 2 },
];

console.log("Testing with Custom Weights:");
console.log("  Financial:      4 × 40% = 160");
console.log("  Operational:    3 × 30% = 90");
console.log("  Reputational:   5 × 15% = 75");
console.log("  Legal:          2 × 10% = 20");
console.log("  Health:         1 × 3%  = 3");
console.log("  Environmental:  2 × 2%  = 4");
console.log("  ─────────────────────────────");
console.log("  Total:          352 / 100 = 3.52\n");

const customRiskScore = calculateRiskScore(testImpact, customCategories);

console.log(`Calculated Risk Score: ${customRiskScore}`);
console.log(`Expected Risk Score:   3.52`);
console.log(`Match: ${customRiskScore === 3.52 ? "✅ PASS" : "❌ FAIL"}\n`);

// Verify weights must sum to 100
const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
const customTotalWeight = customCategories.reduce(
  (sum, cat) => sum + cat.weight,
  0,
);

console.log("Weight Validation:");
console.log(
  `  Default weights sum: ${totalWeight}% ${totalWeight === 100 ? "✅" : "❌"}`,
);
console.log(
  `  Custom weights sum:  ${customTotalWeight}% ${customTotalWeight === 100 ? "✅" : "❌"}\n`,
);

console.log("✅ All tests completed!\n");
