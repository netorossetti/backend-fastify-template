import { DateHelper } from "./date-helper";

describe("Date Helper", () => {
  test("Timestamp to date", () => {
    const result = DateHelper.timestampToDate(1729707467153);
    expect(result).toEqual(new Date(2024, 9, 23, 15, 17, 47, 153));
  });

  test("Timestamp to date", () => {
    const milisecondsts = DateHelper.dateToTimestamp(
      new Date(2024, 9, 23, 15, 17, 47, 153)
    );
    expect(milisecondsts).toEqual(1729707467153);
    const secondsts = DateHelper.dateToTimestamp(
      new Date(2024, 9, 23, 15, 17, 47, 153),
      "seconds"
    );
    expect(secondsts).toEqual(1729707467);
  });

  test("Convert to brasilia time", () => {
    const date = new Date(2024, 9, 23);
    expect(date.getUTCHours()).toEqual(3);
    const result = DateHelper.convertToBrasiliaTime(date);
    expect(result.getUTCHours()).toEqual(0);
  });

  test("Convert to utc time", () => {
    const date = new Date(2024, 9, 23);
    expect(date.getUTCHours()).toEqual(3);
    const result = DateHelper.convertToUTCTime(date);
    expect(result.getUTCHours()).toEqual(6);
  });

  test("To date format string", () => {
    const date = new Date(2024, 9, 23);
    const result = DateHelper.toDateFormatString(date);
    expect(result).toEqual("23/10/2024");
  });

  test("to time format string", () => {
    const date = new Date(2024, 9, 23, 12, 59, 48);
    const result = DateHelper.toTimeFormatString(date);
    expect(result).toEqual("12:59:48");
  });

  test("to date time format string", () => {
    const date = new Date(2024, 9, 23, 12, 59, 48);
    const result = DateHelper.toDateTimeFormatString(date);
    expect(result).toEqual("23/10/2024 12:59:48");
    const resultLocal = DateHelper.toDateTimeFormatString(date, true);
    expect(resultLocal).toEqual("23/10/2024 09:59:48");
  });

  test("String to date time", () => {
    const result = DateHelper.stringToDateTime("23/10/2024 09:59:48");
    expect(result).toEqual(new Date(2024, 9, 23, 9, 59, 48));
  });

  test("Add days", () => {
    const result = DateHelper.addDays(new Date(2024, 9, 29), 4);
    expect(result).toEqual(new Date(2024, 10, 2));
    const result2 = DateHelper.addDays(new Date(2024, 9, 29), -1);
    expect(result2).toEqual(new Date(2024, 9, 28));
  });

  test("Add months", () => {
    const result = DateHelper.addMonth(new Date(2024, 9, 29), 1);
    expect(result).toEqual(new Date(2024, 10, 29));
    const result2 = DateHelper.addMonth(new Date(2024, 9, 29), -1);
    expect(result2).toEqual(new Date(2024, 8, 29));
  });

  test("Add years", () => {
    const result = DateHelper.addYear(new Date(2024, 9, 29), 1);
    expect(result).toEqual(new Date(2025, 9, 29));
    const result2 = DateHelper.addYear(new Date(2024, 9, 29), -1);
    expect(result2).toEqual(new Date(2023, 9, 29));
  });

  test("Add hours", () => {
    const date = new Date(2024, 9, 29, 12);
    const result = DateHelper.addHours(date, 4);
    const diff = (result.getTime() - date.getTime()) / 60 / 60 / 1000;
    expect(diff).toEqual(4);
  });

  test("Add minutes", () => {
    const date = new Date(2024, 9, 29, 12, 0);
    const result = DateHelper.addMinutes(date, 4);
    const diff = (result.getTime() - date.getTime()) / 60 / 1000;
    expect(diff).toEqual(4);
  });

  test("Add seconds", () => {
    const date = new Date(2024, 9, 29, 12, 0, 0);
    const result = DateHelper.addSeconds(date, 4);
    const diff = (result.getTime() - date.getTime()) / 1000;
    expect(diff).toEqual(4);
  });

  test("Parse date string", () => {
    const result = DateHelper.parseDateString("20/01/2022");
    expect(result).toEqual(new Date(2022, 0, 20));
    const result1 = DateHelper.parseDateString("20/01/2022 10:10");
    expect(result1).toEqual(new Date(2022, 0, 20, 10, 10));
    const result2 = DateHelper.parseDateString("20/01/2022 10:10:10");
    expect(result2).toEqual(new Date(2022, 0, 20, 10, 10, 10));
    const result3 = DateHelper.parseDateString("20-01-2022T10:10:10");
    expect(result3).toBe(null);
  });

  test("Get month calendar range date", () => {
    const result = DateHelper.getMonthCalendarRange(2025, 5);
    expect(result.start).toEqual(new Date(2025, 3, 27));
    expect(result.end).toEqual(new Date(2025, 5, 7, 23, 59, 59, 999));
  });

  test("Get week calendar range date", () => {
    const result = DateHelper.getWeekCalendarRange(2025, 4, 1);
    expect(result.start).toEqual(new Date(2025, 2, 30));
    expect(result.end).toEqual(new Date(2025, 3, 5, 23, 59, 59, 999));
  });
});
