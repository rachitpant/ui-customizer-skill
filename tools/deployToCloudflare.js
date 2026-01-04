import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Deploys the customized Dandybreeze to Cloudflare Workers.
 */
export const deployToCloudflare = {
  name: 'deployToCloudflare',
  description: 'Deploy the customized Dandybreeze project to Cloudflare Workers and return the deployment URL',
  input_schema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Path to the Dandybreeze project',
        default: '/workspace/dandybreeze'
      },
      deploymentName: {
        type: 'string',
        description: 'Unique name for this deployment (e.g., "dandybreeze-abc123")'
      }
    },
    required: ['deploymentName']
  },
  function: async ({ projectPath = '/workspace/dandybreeze', deploymentName }) => {
    try {
      // Update wrangler.jsonc with unique deployment name
      const wranglerPath = path.join(projectPath, 'wrangler.jsonc');
      let wranglerConfig = await fs.readFile(wranglerPath, 'utf-8');

      // Parse JSONC (JSON with comments)
      const configMatch = wranglerConfig.match(/"name":\s*"([^"]+)"/);
      if (configMatch) {
        wranglerConfig = wranglerConfig.replace(
          `"name": "${configMatch[1]}"`,
          `"name": "${deploymentName}"`
        );
        await fs.writeFile(wranglerPath, wranglerConfig);
      }

      // Run wrangler deploy
      const { stdout, stderr } = await execAsync('npx wrangler deploy', {
        cwd: projectPath,
        env: {
          ...process.env,
          CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
          CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN
        }
      });

      // Extract deployment URL from output
      const urlMatch = stdout.match(/https:\/\/[^\s]+/);
      const deploymentUrl = urlMatch ? urlMatch[0] : null;

      return {
        success: true,
        deploymentUrl,
        deploymentName,
        output: stdout,
        message: deploymentUrl
          ? `Successfully deployed to ${deploymentUrl}`
          : 'Deployed successfully, but could not extract URL from output'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stderr: error.stderr
      };
    }
  }
};
