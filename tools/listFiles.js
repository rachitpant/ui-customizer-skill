import fs from 'fs/promises';
import path from 'path';

/**
 * Lists files in the Dandybreeze project matching a pattern.
 */
export const listFiles = {
  name: 'listFiles',
  description: 'List files in the Dandybreeze project by glob pattern (e.g., "app/layouts/*.vue" or "*.css")',
  input_schema: {
    type: 'object',
    properties: {
      pattern: {
        type: 'string',
        description: 'Pattern to match files (e.g., "app/pages/*.vue")'
      },
      projectPath: {
        type: 'string',
        description: 'Base path to search from',
        default: '/workspace/dandybreeze'
      }
    },
    required: ['pattern']
  },
  function: async ({ pattern, projectPath = '/workspace/dandybreeze' }) => {
    try {
      const files = [];

      // Simple pattern matching (not full glob, but sufficient for our use case)
      const searchPath = path.join(projectPath, pattern.replace('*', ''));
      const dir = path.dirname(searchPath);
      const ext = path.extname(pattern);

      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith(ext)) {
          files.push(path.join(dir, entry.name).replace(projectPath, ''));
        }
      }

      return {
        success: true,
        files,
        count: files.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};
