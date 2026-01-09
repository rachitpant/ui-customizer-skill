#!/usr/bin/env node
import { query } from "@anthropic-ai/claude-agent-sdk";

/**
 * Recursively redacts environment variable values from an object
 * Only redacts values for env vars with names suggesting they're sensitive
 * @param obj - The object to redact values from
 * @returns A new object with env values replaced by [REDACTED]
 */
function redactEnvValues(obj) {
  // Keywords that indicate a sensitive environment variable
  const sensitiveKeywords = [
    'KEY', 'TOKEN', 'SECRET', 'PASSWORD', 'API',
    'ACCOUNT', 'CREDENTIAL', 'AUTH', 'PRIVATE'
  ];

  // Only collect values from env vars with sensitive names
  const envValues = new Set(
    Object.entries(process.env)
      .filter(([key, value]) => {
        if (!value || value.length === 0) return false;
        const upperKey = key.toUpperCase();
        return sensitiveKeywords.some(keyword => upperKey.includes(keyword));
      })
      .map(([_, value]) => value)
  );

  function redact(value) {
    if (typeof value === "string") {
      // Check if this string contains any env value and redact it
      let redacted = value;
      for (const envVal of envValues) {
        if (envVal && redacted.includes(envVal)) {
          redacted = redacted.replace(new RegExp(escapeRegExp(envVal), "g"), "[REDACTED]");
        }
      }
      return redacted;
    } else if (Array.isArray(value)) {
      return value.map(redact);
    } else if (typeof value === "object" && value !== null) {
      const result = {};
      for (const key in value) {
        result[key] = redact(value[key]);
      }
      return result;
    }
    return value;
  }

  return redact(obj);
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * UI Customizer Agent
 *
 * This agent customizes the Dandybreeze UI based on user requests.
 * It uses built-in tools to read, modify, and deploy changes.
 */
async function main() {
  // Get UI customization request from command line arguments
  const uiChanges = process.argv.slice(2).join(' ');

  if (!uiChanges) {
    console.error("❌ Error: Please provide UI customization instructions");
    console.error("\nUsage: npm start \"<UI changes to make>\"");
    console.error("Example: npm start \"Make the header blue with white text\"");
    console.error("\nFor local testing, set DANDYBREEZE_PATH environment variable:");
    console.error("Example: DANDYBREEZE_PATH=~/code/dandybreeze npm start \"Make the header blue\"");
    process.exit(1);
  }

  // Allow overriding path for local testing
  const dandybreezePath = process.env.DANDYBREEZE_PATH || '/workspace/dandybreeze';

  console.log("=".repeat(60));
  console.log("UI Customizer Agent");
  console.log("=".repeat(60));
  console.log(`\nCustomization Request: ${uiChanges}`);
  console.log(`Dandybreeze Location: ${dandybreezePath}\n`);

  try {
    // Run the agent using the query API
    const prompt = `
You are customizing the Dandybreeze UI based on this request: ${uiChanges}

Dandybreeze is a Nuxt.js + NuxtHub application for farmers to accept weekly orders.
The application is located at ${dandybreezePath}

CRITICAL RULES:
- ONLY modify UI/styling - NEVER change functionality, API routes, or business logic
- ONLY edit Tailwind classes, CSS, and Vue template sections (not <script> blocks)
- Preserve all existing functionality - only change appearance

WORKFLOW:
1. First, explore the project structure to understand the codebase
   - Use Glob with path parameter: ${dandybreezePath}
   - Example: Glob pattern="**/*.vue" path="${dandybreezePath}"
2. Use Read to examine the files you need to modify (use full paths starting with ${dandybreezePath})
3. Use Edit to make the UI changes based on the user's request
4. After all changes are complete, use Bash to deploy:
   - Run: cd ${dandybreezePath} && npx wrangler deploy
   - Capture the deployment URL from the output
5. Report the deployment URL to the user

DEPLOYMENT NOTES:
- The deployment command should output a URL like: https://dandybreeze-xyz.workers.dev
- Extract and report this URL to the user
- If deployment fails, report the error and don't proceed

Current date is ${new Date().toDateString()}.
`.trim();

    for await (const message of query({
      prompt,
      options: {
        // Allow the agent to read, write, edit files, run bash commands, and search
        allowedTools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
        // Load settings from project sources
        settingSources: ["project"],
      },
    })) {
      // Stream output to console
      // The message structure from query() returns different types
      if (message && typeof message === "object") {
        // Redact any environment variable values before logging
        const redactedMessage = redactEnvValues(message);
        console.log(JSON.stringify(redactedMessage));
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("Customization Complete!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Failed to customize UI:");
    console.error(error);
    process.exit(1);
  }
}

// Run the agent
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
