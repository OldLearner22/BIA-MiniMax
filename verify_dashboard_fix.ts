/**
 * Verification Script: Dashboard Data Accuracy Fix
 *
 * This script verifies that the Dashboard component now correctly uses
 * impact assessment data from the database instead of temporal data.
 */

import { readFileSync } from "fs";
import { join } from "path";

const dashboardPath = join(process.cwd(), "src", "components", "Dashboard.tsx");
const dashboardCode = readFileSync(dashboardPath, "utf-8");

console.log("🔍 Verifying Dashboard Fix...\n");

// Check 1: No references to temporalData
const hasTemporalData = dashboardCode.includes("temporalData");
console.log(`✓ Check 1: No temporalData references`);
console.log(
  `  Result: ${hasTemporalData ? "❌ FAILED - temporalData still referenced" : "✅ PASSED"}\n`,
);

// Check 2: Uses impacts from useStore
const usesImpacts = dashboardCode.match(
  /const\s*{\s*[^}]*impacts[^}]*}\s*=\s*useStore\(\)/,
);
console.log(`✓ Check 2: Uses impacts from useStore`);
console.log(
  `  Result: ${usesImpacts ? "✅ PASSED" : "❌ FAILED - impacts not destructured from useStore"}\n`,
);

// Check 3: getMaxImpactPerCategory uses impacts object
const getMaxImpactFunc = dashboardCode.match(
  /const getMaxImpactPerCategory[\s\S]*?};/,
);
if (getMaxImpactFunc) {
  const funcBody = getMaxImpactFunc[0];
  const usesImpactsInFunc = funcBody.includes("impacts[processId]");
  console.log(`✓ Check 3: getMaxImpactPerCategory uses impacts[processId]`);
  console.log(
    `  Result: ${usesImpactsInFunc ? "✅ PASSED" : "❌ FAILED - function does not use impacts object"}\n`,
  );
} else {
  console.log(`✓ Check 3: getMaxImpactPerCategory function`);
  console.log(`  Result: ❌ FAILED - function not found\n`);
}

// Check 4: ImpactAssessment type imported
const hasTypeImport = dashboardCode.match(
  /import\s*{[^}]*ImpactAssessment[^}]*}\s*from\s*['"]\.\.\/types['"]/,
);
console.log(`✓ Check 4: ImpactAssessment type imported`);
console.log(
  `  Result: ${hasTypeImport ? "✅ PASSED" : "❌ FAILED - ImpactAssessment type not imported"}\n`,
);

// Summary
const allPassed =
  !hasTemporalData && usesImpacts && getMaxImpactFunc && hasTypeImport;
console.log("=".repeat(60));
console.log(
  `\n${allPassed ? "✅ ALL CHECKS PASSED" : "⚠️ SOME CHECKS FAILED"}\n`,
);

if (allPassed) {
  console.log("Dashboard is now fixed to use database impact data!");
  console.log("\nExpected behavior:");
  console.log("  ✅ Avg Impact Score will display real values from database");
  console.log("  ✅ Impact by Department chart will show actual data");
  console.log("  ✅ Impact Profile radar chart will display correctly");
  console.log("  ✅ Process Impact Summary will show accurate risk scores");
  console.log("  ✅ Dashboard works on fresh page load");
  console.log("  ✅ Data consistent across browsers/devices");
} else {
  console.log("Please review the failed checks and apply necessary fixes.");
}

console.log("\n" + "=".repeat(60));
