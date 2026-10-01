module.exports = {
  watchman: false,
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverageFrom: ["src/**/*.ts", "!src/main.ts", "!src/app.module.ts"],
  coverageReporters: ["text", "lcov", "html"],
};
