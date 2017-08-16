module.exports = {
  "extends": "airbnb",
  "globals": {
    "FormData": true,
    "window": true,
    "document": true
  },
  "env": {
    "browser": true,
    "node": true,
    "serviceworker": true,
  },
  "rules": {
    "max-len": ["error", { "code": 80, "ignoreTemplateLiterals": true, "ignoreStrings": true }],
    "no-return-assign": 1,
    "quotes": ["error", "double"],
    "no-mixed-operators": ["error", {
      "allowSamePrecedence": true
    }],
    "import/named": 2,
    "import/no-extraneous-dependencies": [
      "error",
      {
        "devDependencies": ["**/*.spec.*", "**/test/**/*", "webpack.config.js"]
      }
    ],
    "import/prefer-default-export": 1,
    "jsx-a11y/no-static-element-interactions": 1,
    "jsx-a11y/alt-text": 1,
    "react/no-array-index-key": 1,
    "react/prop-types": 0,
    "react/require-default-props": 0,
    "react/forbid-prop-types": 1
  }
};
