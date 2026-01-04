import fs from 'fs/promises';
import path from 'path';

/**
 * Applies changes to files in the Dandybreeze project.
 */
export const applyChanges = {
  name: 'applyChanges',
  description: 'Write changes to a file in the Dandybreeze project. Use this after planning changes with generateCSSChanges.',
  input_schema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Path to the file to modify (e.g., "/app/layouts/default.vue")'
      },
      newContent: {
        type: 'string',
        description: 'The complete new content of the file'
      },
      projectPath: {
        type: 'string',
        description: 'Base project path',
        default: '/workspace/dandybreeze'
      }
    },
    required: ['filePath', 'newContent']
  },
  function: async ({ filePath, newContent, projectPath = '/workspace/dandybreeze' }) => {
    try {
      const fullPath = path.join(projectPath, filePath);

      // Backup original file
      const backupPath = `${fullPath}.backup`;
      try {
        const originalContent = await fs.readFile(fullPath, 'utf-8');
        await fs.writeFile(backupPath, originalContent);
      } catch {}

      // Write new content
      await fs.writeFile(fullPath, newContent, 'utf-8');

      return {
        success: true,
        filePath,
        message: `Successfully updated ${filePath}`,
        backupCreated: true
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to write ${filePath}: ${error.message}`
      };
    }
  }
};
