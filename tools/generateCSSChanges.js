/**
 * This is a planning tool for Claude to organize CSS changes.
 * It doesn't actually modify files - just helps Claude think through the changes.
 */
export const generateCSSChanges = {
  name: 'generateCSSChanges',
  description: 'Plan and validate CSS/Tailwind changes based on user request. Returns a structured plan of what files to modify and how.',
  input_schema: {
    type: 'object',
    properties: {
      userRequest: {
        type: 'string',
        description: 'The user\'s UI customization request'
      },
      affectedFiles: {
        type: 'array',
        description: 'List of files that need to be modified',
        items: { type: 'string' }
      },
      changes: {
        type: 'array',
        description: 'Detailed list of changes to make',
        items: {
          type: 'object',
          properties: {
            file: { type: 'string' },
            description: { type: 'string' },
            oldValue: { type: 'string' },
            newValue: { type: 'string' }
          }
        }
      }
    },
    required: ['userRequest', 'affectedFiles', 'changes']
  },
  function: async ({ userRequest, affectedFiles, changes }) => {
    // This tool is mainly for Claude to organize its thoughts
    // The actual changes will be applied via applyChanges tool

    return {
      success: true,
      plan: {
        userRequest,
        affectedFiles,
        changes,
        totalChanges: changes.length,
        message: 'Change plan created. Use applyChanges to implement these modifications.'
      }
    };
  }
};
