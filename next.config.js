const { execSync } = require("node:child_process");
const pkg = require("./package.json");

// Resolve build-time metadata. Vercel injects VERCEL_GIT_* on every deploy.
// In local dev we fall back to `git rev-parse` so the footer still shows a
// meaningful SHA.
function safeGit(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
}

const sha =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  safeGit("git rev-parse HEAD") ||
  "";

const ref =
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.GITHUB_REF_NAME ||
  safeGit("git rev-parse --abbrev-ref HEAD") ||
  "";

const commitMessage = (
  process.env.VERCEL_GIT_COMMIT_MESSAGE ||
  safeGit('git log -1 --pretty=%s') ||
  ""
).slice(0, 140);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_BUILD_SHA: sha,
    NEXT_PUBLIC_BUILD_REF: ref,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_BUILD_MESSAGE: commitMessage,
  },
};

module.exports = nextConfig;
