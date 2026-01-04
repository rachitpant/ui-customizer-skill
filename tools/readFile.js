import fs from 'fs/promises';
import path from 'path';

/**
 * Reads a file from the Dandybreeze project.
 */
export const readFile = {
  name: 'readFile',
  description: 'Read the contents of a file from the Dandybreeze project (Vue component, CSS, config, etc.)',
  input_schema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Path to the file relative to project root (e.g., "/app/layouts/default.vue")'
      },
      projectPath: {
        type: 'string',
        description: 'Base project path',
        default: '/workspace/dandybreeze'
      }
    },
    required: ['filePath']
  },
  function: async ({ filePath, projectPath = '/workspace/dandybreeze' }) => {
    try {
      const fullPath = path.join(projectPath, filePath);
      const content = await fs.readFile(fullPath, 'utf-8');

      return {
        success: true,
        filePath,
        content,
        size: content.length
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read ${filePath}: ${error.message}`
      };
    }
  }
};
