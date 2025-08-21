import { spawnSync } from "child_process";
import 'dotenv/config';
import { Elysia } from "elysia";

import { initializeServices } from "./init";

// Get git commit hash dynamically
const getGitCommitHash = () => {
  try {
    const { stdout } = spawnSync("git", ["rev-parse", "HEAD"], { encoding: 'utf8' });
    return stdout.toString().trim();
  } catch (_e) {
    return "unknown";
  }
};

// Get git branch name dynamically
const getGitBranch = () => {
  try {
    const { stdout } = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { encoding: 'utf8' });
    return stdout.toString().trim();
  } catch (_e) {
    return "unknown";
  }
};

const app = new Elysia()
  .get("/", () => {
    const startTime = process.hrtime.bigint();
    const commitHash = getGitCommitHash();
    const branch = getGitBranch();
    const endTime = process.hrtime.bigint();
    const responseTime = (Number(endTime - startTime) / 1000000).toFixed(15); // Convert to milliseconds with precision

    return `Welcome to Metropolitan. From ${process.env.API_VERSION || '0.305.6818'}-${branch}-${commitHash} (${process.env.INSTANCE_ID || 'local'}) in ${responseTime}ms.`;
  })
  .listen(process.env.PORT || 3000);

// Initialize services and start server
initializeServices().then(() => {
  console.log(
    `🦊 Metropolitan Backend is running at ${app.server?.hostname}:${app.server?.port}`
  );
});
