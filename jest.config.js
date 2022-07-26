/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testPathIgnorePatterns: ["/sveltekit/tests"],
  extensionsToTreatAsEsm: [".ts"],
};
