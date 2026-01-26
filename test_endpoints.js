const http = require("http");

const endpoints = [
  "processes",
  "impacts",
  "recovery-objectives",
  "dependencies",
  "recovery-options",
  "cost-benefit-analyses",
  "business-resources",
  "exercises",
];

let completed = 0;

endpoints.forEach((ep) => {
  const req = http
    .get(`http://localhost:3001/api/${ep}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          const count = Array.isArray(parsed) ? parsed.length : "object";
          console.log(
            `✓ /api/${ep}: Status ${res.statusCode}, Items: ${count}`,
          );
        } catch (e) {
          console.log(`✗ /api/${ep}: Status ${res.statusCode}, Parse Error`);
        }
        if (++completed === endpoints.length) process.exit(0);
      });
    })
    .on("error", (err) => {
      console.log(`✗ /api/${ep}: ${err.message}`);
      if (++completed === endpoints.length) process.exit(0);
    });

  req.setTimeout(2000);
});
