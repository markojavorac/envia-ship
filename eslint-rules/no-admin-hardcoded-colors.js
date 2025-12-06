/**
 * ESLint Rule: no-admin-hardcoded-colors
 *
 * Prevents hardcoded color classes in /app/admin/ and /components/admin/
 * Also enforces text-foreground on Label components
 */

const FORBIDDEN_PATTERNS = [
  "bg-white",
  "bg-black",
  "bg-gray-",
  "bg-blue-",
  "bg-red-",
  "bg-yellow-",
  "bg-orange-",
  "bg-purple-",
  "bg-pink-",
  "text-gray-",
  "text-blue-",
  "text-red-",
  "text-yellow-",
  "text-white",
  "text-black",
  "border-gray-",
  "border-blue-",
  "border-red-",
];

// Allowed for specific semantic purposes
const ALLOWED_EXCEPTIONS = [
  "text-green-500", // Success states, improvements, positive indicators
  "bg-green-500/10", // Success background
  "border-green-500", // Success borders
];

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow hardcoded color classes in admin section and enforce text-foreground on Labels",
      category: "Best Practices",
    },
    messages: {
      hardcodedColor:
        "Avoid '{{class}}' in admin. Use CSS variables: bg-card, text-foreground, border-border, text-primary, text-destructive",
      labelMissingTextColor:
        "Label components in admin must include 'text-foreground' in className to be readable on dark backgrounds",
    },
  },

  create(context) {
    const filename = context.getFilename();

    // Only check admin files
    if (!filename.includes("/app/admin/") && !filename.includes("/components/admin/")) {
      return {};
    }

    return {
      JSXElement(node) {
        // Check if this is a Label component
        const isLabel = node.openingElement.name.name === "Label";

        if (isLabel) {
          // Find className attribute
          const classNameAttr = node.openingElement.attributes.find(
            (attr) => attr.type === "JSXAttribute" && attr.name.name === "className"
          );

          if (classNameAttr) {
            const value = classNameAttr.value?.value || classNameAttr.value?.expression?.value;
            if (value && typeof value === "string") {
              // Check if className contains text-foreground or text-muted-foreground
              if (!value.includes("text-foreground") && !value.includes("text-muted-foreground")) {
                context.report({
                  node: classNameAttr,
                  messageId: "labelMissingTextColor",
                });
              }
            }
          } else {
            // Label without className at all
            context.report({
              node: node.openingElement,
              messageId: "labelMissingTextColor",
            });
          }
        }
      },

      JSXAttribute(node) {
        if (node.name.name !== "className") return;

        const value = node.value?.value || node.value?.expression?.value;
        if (!value || typeof value !== "string") return;

        const classes = value.split(/\s+/);

        // Allow text-white when used with bg-primary or other colored backgrounds
        const hasBgPrimary = classes.includes("bg-primary");
        const hasBgDestructive = classes.includes("bg-destructive");
        const hasBgSecondary = classes.includes("bg-secondary");
        const hasColoredBg = hasBgPrimary || hasBgDestructive || hasBgSecondary;

        for (const cls of classes) {
          // Check if explicitly allowed
          if (ALLOWED_EXCEPTIONS.includes(cls)) {
            continue;
          }

          const isForbidden = FORBIDDEN_PATTERNS.some((pattern) => {
            return pattern.endsWith("-") ? cls.startsWith(pattern) : cls === pattern;
          });

          // Allow text-white with colored backgrounds (for contrast)
          if (isForbidden && cls === "text-white" && hasColoredBg) {
            continue;
          }

          if (isForbidden) {
            context.report({
              node,
              messageId: "hardcodedColor",
              data: { class: cls },
            });
          }
        }
      },
    };
  },
};
