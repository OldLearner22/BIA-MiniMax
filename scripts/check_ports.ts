import net from "net";

const portsToCheck = [3001, 5000, 5173];

async function isPortFree(port: number) {
  return new Promise<boolean>((resolve) => {
    const server = net
      .createServer()
      .once("error", (err: any) => {
        if (err.code === "EADDRINUSE") resolve(false);
        else resolve(false);
      })
      .once("listening", () => {
        server.close().once("close", () => resolve(true));
      })
      .listen(port, "127.0.0.1");
  });
}

async function main() {
  console.log("Checking required dev ports...");
  const occupied: number[] = [];
  for (const p of portsToCheck) {
    const free = await isPortFree(p);
    if (!free) occupied.push(p);
  }

  if (occupied.length > 0) {
    console.error(
      `
Error: Required ports already in use: ${occupied.join(", ")}
- Stop any running development servers that may be occupying these ports.
- If you want to forcibly free them, consider using "npx kill-port ${occupied.join(" ")}" or manually terminating the processes.
`,
    );
    process.exit(1);
  }

  console.log("All dev ports are available.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Port check failed:", e);
  process.exit(1);
});
