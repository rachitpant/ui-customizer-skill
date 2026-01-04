import fs from 'fs/promises';
import path from 'path';

/**
 * Analyzes the Dandybreeze project structure to understand:
 * - Vue component locations
 * - Tailwind config
 * - CSS files
 * - Layout structure
 *
 * Saves the analysis to cache for future runs.
 */
export const analyzeDandybreezeUI = {
  name: 'analyzeDandybreezeUI',
  description: 'Scan the Dandybreeze project to understand its UI structure. Run this once on first execution. Results are cached for future runs.',
  input_schema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Path to the Dandybreeze project directory',
        default: '/workspace/dandybreeze'
      }
    },
    required: ['projectPath']
  },
  function: async ({ projectPath }) => {
    try {
      const structure = {
        layouts: [],
        pages: [],
        components: [],
        cssFiles: [],
        tailwindConfig: null,
        analyzedAt: new Date().toISOString()
      };

      // Find all Vue files
      const findVueFiles = async (dir, category) => {
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              await findVueFiles(fullPath, category);
            } else if (entry.name.endsWith('.vue')) {
              structure[category].push(fullPath.replace(projectPath, ''));
            }
          }
        } catch (err) {
          // Directory might not exist
        }
      };

      // Scan layouts
      await findVueFiles(path.join(projectPath, 'app/layouts'), 'layouts');

      // Scan pages
      await findVueFiles(path.join(projectPath, 'app/pages'), 'pages');

      // Scan components
      await findVueFiles(path.join(projectPath, 'app/components'), 'components');

      // Find root app.vue
      try {
        await fs.access(path.join(projectPath, 'app.vue'));
        structure.components.push('/app.vue');
      } catch {}

      // Find CSS files
      try {
        const cssDir = path.join(projectPath, 'app/assets/css');
        const cssEntries = await fs.readdir(cssDir);
        structure.cssFiles = cssEntries
          .filter(f => f.endsWith('.css'))
          .map(f => `/app/assets/css/${f}`);
      } catch {}

      // Check Tailwind config
      try {
        await fs.access(path.join(projectPath, 'tailwind.config.js'));
        structure.tailwindConfig = '/tailwind.config.js';
      } catch {}

      // Save to cache
      const cacheDir = '/workspace/ui-customizer-skill';
      await fs.mkdir(cacheDir, { recursive: true });
      await fs.writeFile(
        path.join(cacheDir, 'dandybreeze-structure-cache.json'),
        JSON.stringify(structure, null, 2)
      );

      return {
        success: true,
        structure,
        message: `Found ${structure.layouts.length} layouts, ${structure.pages.length} pages, ${structure.components.length} components, ${structure.cssFiles.length} CSS files`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};
