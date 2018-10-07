module.exports = {
    transform: {
      "^.+\\.(tsx|ts)?$": "ts-jest",
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?|ts?)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  };