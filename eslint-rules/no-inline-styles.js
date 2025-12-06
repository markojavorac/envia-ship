/**
 * ESLint Rule: no-inline-styles
 *
 * Prevents inline style={{}} attributes
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow inline style attributes",
    },
    messages: {
      noInlineStyle: "Avoid inline styles. Use Tailwind classes instead.",
    },
  },

  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name === "style" && node.value) {
          context.report({
            node,
            messageId: "noInlineStyle",
          });
        }
      },
    };
  },
};
