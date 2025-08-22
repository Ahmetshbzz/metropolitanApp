import { spawnSync } from "child_process";
import 'dotenv/config';
import { Elysia } from "elysia";

import { api } from "./api";
import { apiResponse } from "./api/middleware/versioning";
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

    return apiResponse({
      message: `Welcome to Metropolitan Backend`,
      version: `${process.env.API_VERSION || '0.305.6818'}-${branch}-${commitHash}`,
      instance: process.env.INSTANCE_ID || 'local',
      responseTime: `${responseTime}ms`,
      endpoints: {
        rest: process.env.API_PREFIX || '/api/v1',
        graphql: {
          store: '/graphql/store',
          admin: '/graphql/admin'
        },
        health: '/health',
        docs: '/swagger'
      }
    });
  })
  .use(api)  // Mount all API routes
  .listen(process.env.PORT || 3000);

// Initialize services and start server
initializeServices().then(() => {
  console.log(
    `🦊 Metropolitan Backend is running at ${app.server?.hostname}:${app.server?.port}`
  );
});
