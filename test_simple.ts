import http from "http";

// Test health endpoint
const req = http
  .get("http://localhost:3001/health", (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      console.log("Health Check Response:", data);

      // Now test processes endpoint
      const req2 = http
        .get("http://localhost:3001/api/processes", (res2) => {
          let data2 = "";
          console.log("Processes request received, status:", res2.statusCode);
          res2.on("data", (chunk) => (data2 += chunk));
          res2.on("end", () => {
            try {
              const parsed = JSON.parse(data2);
              console.log(
                "Processes Response:",
                typeof parsed === "object"
                  ? JSON.stringify(parsed).substring(0, 100)
                  : data2,
              );
            } catch (e) {
              console.log("Processes raw response:", data2.substring(0, 100));
            }
            process.exit(0);
          });
        })
        .on("error", (err) => {
          console.error("Processes error:", err.message);
          process.exit(1);
        });
      req2.setTimeout(5000);
    });
  })
  .on("error", (err) => {
    console.error("Health check error:", err.message);
    process.exit(1);
  });

req.setTimeout(5000);
