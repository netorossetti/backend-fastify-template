export class NumberHelper {
  static roundTo(num: number, places: number = 2) {
    const factor = 10 ** places;
    return Math.round(num * factor) / factor;
  }
}
