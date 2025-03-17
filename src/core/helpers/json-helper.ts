export class JsonHelper {
  static isJsonObject(value: object) {
    try {
      JSON.stringify(value);
      return true;
    } catch (e) {
      return false;
    }
  }
}
