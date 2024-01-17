module.exports = {
  overrides: [
    {
      files: "*.sol",
      options: {
        bracketSpacing: false,
        printWidth: 120,
        tabWidth: 4,
        useTabs: false,
        singleQuote: false,
        explicitTypes: "always",
      },
    },
    {
      files: "*.ts",
      options: {
        printWidth: 120,
        semi: false,
        trailingComma: "es5",
      },
    },
    {
      files: "*.js",
      options: {
        printWidth: 120,
        semi: false,
        trailingComma: "es5",
      },
    },
  ],
}
