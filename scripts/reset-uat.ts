import { spawn } from "node:child_process";

const child = spawn(process.execPath, ["--experimental-strip-types", "scripts/seed-uat.ts", "--clear"], {
  cwd: process.cwd(),
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
