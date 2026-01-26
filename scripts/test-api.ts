const API_URL = "http://localhost:3001/api";

const testApi = async () => {
  try {
    console.log("Testing API...");

    // 1. Processes
    console.log("1. Testing Processes...");
    const processesRes = await fetch(`${API_URL}/processes`);
    if (!processesRes.ok) throw new Error("Failed to fetch processes");
    const processes = await processesRes.json();
    console.log(`Fetched ${processes.length} processes`);

    const newProcess = {
      name: "Test Process API",
      owner: "Tester",
      department: "IT",
      description: "Test description",
      criticality: "high",
      status: "draft",
    };
    const createProcessRes = await fetch(`${API_URL}/processes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProcess),
    });
    if (!createProcessRes.ok) throw new Error("Failed to create process");
    const createdProcess = await createProcessRes.json();
    console.log("Created process:", createdProcess.id);

    // 2. Resources
    console.log("\n2. Testing Resources...");
    const resourcesRes = await fetch(`${API_URL}/resources`);
    if (!resourcesRes.ok) throw new Error("Failed to fetch resources");
    const resources = await resourcesRes.json();
    console.log(`Fetched ${resources.length} resources`);

    // 3. Dependencies
    console.log("\n3. Testing Dependencies...");
    // Create a dummy dependency
    if (processes.length > 0) {
      const depData = {
        sourceProcessId: processes[0].id,
        targetProcessId: createdProcess.id,
        type: "technical",
        criticality: 3,
        description: "Test Dep",
      };
      const createDepRes = await fetch(`${API_URL}/dependencies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(depData),
      });
      if (!createDepRes.ok) throw new Error("Failed to create dependency");
      const createdDep = await createDepRes.json();
      console.log("Created dependency:", createdDep.id);
    }

    const depsRes = await fetch(`${API_URL}/dependencies`);
    if (!depsRes.ok) throw new Error("Failed to fetch dependencies");
    const deps = await depsRes.json();
    console.log(`Fetched ${deps.length} dependencies`);

    // 4. Links
    console.log("\n4. Testing Links...");
    const linksRes = await fetch(`${API_URL}/process-resource-links`);
    if (!linksRes.ok) throw new Error("Failed to fetch links");
    const links = await linksRes.json();
    console.log(`Fetched ${links.length} links`);

    console.log("\nAPI Test Success!");
  } catch (error) {
    console.error("API Test Failed:", error);
    process.exit(1);
  }
};

testApi();
