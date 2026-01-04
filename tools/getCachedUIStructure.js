import fs from 'fs/promises';
import path from 'path';

/**
 * Retrieves the cached UI structure analysis.
 * Use this instead of analyzeDandybreezeUI on subsequent runs.
 */
export const getCachedUIStructure = {
  name: 'getCachedUIStructure',
  description: 'Retrieve the cached Dandybreeze UI structure from a previous analysis. Much faster than re-analyzing.',
  input_schema: {
    type: 'object',
    properties: {},
    required: []
  },
  function: async () => {
    try {
      const cachePath = '/workspace/ui-customizer-skill/dandybreeze-structure-cache.json';
      const cacheContent = await fs.readFile(cachePath, 'utf-8');
      const structure = JSON.parse(cacheContent);

      return {
        success: true,
        structure,
        cachedAt: structure.analyzedAt
      };
    } catch (error) {
      return {
        success: false,
        error: 'Cache not found. Run analyzeDandybreezeUI first.',
        shouldAnalyze: true
      };
    }
  }
};
