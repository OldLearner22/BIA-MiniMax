const http = require("http");

setTimeout(() => {
  console.log("Testing API...");

  // Test statistics endpoint
  http
    .get("http://localhost:3001/api/incidents/statistics", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log("Statistics Response:", data);
      });
    })
    .on("error", (e) => {
      console.error("Error:", e.message);
    });
}, 2000);
