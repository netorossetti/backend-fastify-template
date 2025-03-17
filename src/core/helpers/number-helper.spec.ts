import { NumberHelper } from "./number-helper";

describe("Number Helper", () => {
  test("Round to", () => {
    const result = NumberHelper.roundTo(1234.4486, 2);
    expect(result).toEqual(1234.45);
  });
});
