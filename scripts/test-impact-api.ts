async function testImpactCategoriesAPI() {
  console.log("\n🧪 Testing Impact Categories API...\n");

  try {
    // Test GET /api/impact-categories
    console.log("1. Testing GET /api/impact-categories");
    const getResponse = await fetch(
      "http://localhost:3001/api/impact-categories",
    );
    const categories = await getResponse.json();
    console.log(`   ✅ Retrieved ${categories.length} categories`);
    console.log(
      `   Total weight: ${categories.reduce((sum: number, cat: any) => sum + cat.weight, 0)}%\n`,
    );

    // Test POST /api/impact-categories/bulk with updated weights
    console.log("2. Testing POST /api/impact-categories/bulk (update weights)");
    const updatedCategories = categories.map((cat: any, i: number) => ({
      ...cat,
      weight:
        i === 0
          ? 30
          : i === 1
            ? 25
            : i === 2
              ? 20
              : i === 3
                ? 15
                : i === 4
                  ? 8
                  : 2,
    }));

    const totalWeight = updatedCategories.reduce(
      (sum: number, cat: any) => sum + cat.weight,
      0,
    );
    console.log(`   Attempting to save with total weight: ${totalWeight}%`);

    const postResponse = await fetch(
      "http://localhost:3001/api/impact-categories/bulk",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: updatedCategories }),
      },
    );

    if (postResponse.ok) {
      const result = await postResponse.json();
      console.log(
        `   ✅ Successfully saved ${result.categories.length} categories\n`,
      );
    } else {
      const error = await postResponse.json();
      console.log(`   ❌ Failed: ${error.error}\n`);
    }

    // Test validation with invalid total (not 100%)
    console.log("3. Testing validation (weights not totaling 100%)");
    const invalidCategories = categories.map((cat: any, i: number) => ({
      ...cat,
      weight: 10, // All 10% = 60% total (invalid)
    }));

    const invalidResponse = await fetch(
      "http://localhost:3001/api/impact-categories/bulk",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: invalidCategories }),
      },
    );

    if (!invalidResponse.ok) {
      const error = await invalidResponse.json();
      console.log(`   ✅ Correctly rejected: ${error.error}`);
      console.log(`   Current total: ${error.currentTotal}%\n`);
    } else {
      console.log(`   ❌ Should have been rejected but wasn't\n`);
    }

    console.log("✅ All API tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testImpactCategoriesAPI();
