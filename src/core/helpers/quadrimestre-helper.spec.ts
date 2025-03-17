import { QuarterHelper } from "./quadrimestre-helper";

describe("Quadrimestre Helper", () => {
  test("Is quarter", () => {
    const result = QuarterHelper.isQuarter("2030/Q3");
    expect(result).toBe(true);
  });

  test("Not is quarter", () => {
    const result = QuarterHelper.isQuarter("2030/Q6");
    expect(result).toBe(false);
  });

  test("To quarter", () => {
    const quarter1 = QuarterHelper.toQuarter(new Date(2000, 0, 1));
    const quarter2 = QuarterHelper.toQuarter(new Date(2000, 4, 1));
    const quarter3 = QuarterHelper.toQuarter(new Date(2000, 8, 1));

    expect(quarter1).toEqual("2000/Q1");
    expect(quarter2).toEqual("2000/Q2");
    expect(quarter3).toEqual("2000/Q3");
  });

  test("To quarter range", () => {
    const result = QuarterHelper.toQuarterRange("2022/Q1");
    expect(result.startDate).toEqual(new Date(2022, 0, 1, 0, 0, 0));
    expect(result.endDate).toEqual(new Date(2022, 3, 30, 23, 59, 59, 999));

    expect(() => {
      QuarterHelper.toQuarterRange("2022-Q1");
    }).toThrowError();
  });

  test("Add quarter", () => {
    const result = QuarterHelper.addQuarter("2024/Q2", -1 * (4 - 1));
    expect(result).toEqual("2023/Q2");

    expect(() => {
      QuarterHelper.addQuarter("2022-Q1");
    }).toThrowError();
  });

  test("Quarter to array", () => {
    const result = QuarterHelper.quarterToArray(
      "2023/Q1",
      new Date(2025, 0, 1)
    );
    expect(result).toEqual([
      "2023/Q1",
      "2023/Q2",
      "2023/Q3",
      "2024/Q1",
      "2024/Q2",
      "2024/Q3",
      "2025/Q1",
    ]);
  });
});
