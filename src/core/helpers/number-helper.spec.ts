import { NumberHelper } from "./number-helper.js";

describe("Number Helper", () => {
  test("Round to", () => {
    const result = NumberHelper.roundTo(1234.4486, 2);
    expect(result).toEqual(1234.45);
  });
});
