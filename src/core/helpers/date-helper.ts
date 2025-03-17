import dayjs from "dayjs";

export class DateHelper {
  // Função para converter timestamp para data
  static timestampToDate(value: number | null | undefined) {
    if (!value) return null;
    let timestamp = value;
    // Verifica se o timestamp está informado em segundos e converte para milisegundos
    if (value.toString().trim().length === 10) timestamp = timestamp * 1000;
    return new Date(timestamp);
  }

  // Função para converter data para timestamp
  static dateToTimestamp(
    data: Date | null | undefined,
    type: "seconds" | "milliseconds" = "milliseconds"
  ): number | null {
    if (data === null || data === undefined) {
      return null;
    }
    const timestamp = data.getTime();
    return type === "milliseconds" ? timestamp : Math.floor(timestamp / 1000);
  }

  static convertToBrasiliaTime(date: Date) {
    return dayjs(date).add(-3, "hour").toDate();
  }

  static convertToUTCTime(date: Date) {
    return dayjs(date).add(3, "hour").toDate();
  }

  /**
   * Get the formatted date according to the string of tokens passed in.
   *
   * To escape characters, wrap them in square brackets (e.g. [MM]).
   * ```
   * dayjs().format()// => current date in ISO8601, without fraction seconds e.g. '2020-04-02T08:02:17-05:00'
   * dayjs('2019-01-25').format('[YYYYescape] YYYY-MM-DDTHH:mm:ssZ[Z]')// 'YYYYescape 2019-01-25T00:00:00-02:00Z'
   * dayjs('2019-01-25').format('DD/MM/YYYY') // '25/01/2019'
   * ```
   * Docs: https://day.js.org/docs/en/display/format
   */
  static toFormatString(
    dateValue: Date | null | undefined,
    format: string
  ): string {
    try {
      if (!dateValue) return "";
      return dayjs(dateValue).format(format);
    } catch (error) {
      return "";
    }
  }

  static toDateFormatString(
    dateValue: Date | null | undefined
  ): string | null | undefined {
    if (!dateValue) return dateValue;
    return dayjs(dateValue).format("DD/MM/YYYY");
  }

  static toTimeFormatString(
    dateValue: Date | null | undefined
  ): string | null | undefined {
    if (!dateValue) return dateValue;
    return dayjs(dateValue).format("HH:mm:ss");
  }

  static toDateTimeFormatString(
    dateValue: Date | null | undefined,
    convertToLocalDateTime: boolean = false
  ): string | null | undefined {
    if (!dateValue) return dateValue;
    if (convertToLocalDateTime)
      dateValue = this.convertToBrasiliaTime(dateValue);
    return dayjs(dateValue).format("DD/MM/YYYY HH:mm:ss");
  }

  static stringToDate(
    dateFormatString: string | null | undefined,
    dateLocation: "pt-BR" | "UTC" = "pt-BR"
  ): Date | null | undefined {
    if (dateFormatString === undefined || dateFormatString === null)
      return dateFormatString;

    if (!this.isDateValid(dateFormatString))
      throw new Error(
        'Function "stringToDate" recieve invalid date string format. Need to recieve value in this format "dd/MM/yyyy".'
      );

    const [day, month, year] = dateFormatString.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    return dateLocation === "UTC" ? this.convertToUTCTime(date) : date;
  }

  static stringToTime(
    timeString: string | null | undefined,
    dateLocation: "pt-BR" | "UTC" = "pt-BR"
  ): Date | null | undefined {
    if (timeString === undefined || timeString === null) return timeString;

    if (!this.isTimeValid(timeString))
      throw new Error(
        'Function "stringToTime" recieve invalid date string format. Need to recieve value in this format "hh:mm:ss".'
      );

    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    const date = new Date(1900, 0, 1, hours, minutes, seconds);

    return dateLocation === "UTC" ? this.convertToUTCTime(date) : date;
  }

  static stringToDateTime(
    dateTimeString: string | null | undefined
  ): Date | null | undefined {
    if (dateTimeString === undefined || dateTimeString === null)
      return dateTimeString;

    if (!this.isStringDateTimeValid(dateTimeString))
      throw new Error(
        'Function "stringToDateTime" recieve invalid date string format. Need to recieve value in this format "dd/MM/yyyy hh:mm:ss".'
      );

    const [datePart, timePart] = dateTimeString.split(" ");
    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

  // Função para adicionar dias a uma data
  static addDays(date: Date, days: number): Date {
    return dayjs(date).add(days, "day").toDate();
  }

  static addMonth(date: Date, months: number): Date {
    return dayjs(date).add(months, "month").toDate();
  }

  static addYear(date: Date, years: number): Date {
    return dayjs(date).add(years, "year").toDate();
  }

  static parseDateString(dateString: string): Date | null {
    const datePatterns = [
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/,
      /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/,
    ];

    for (const pattern of datePatterns) {
      const match = dateString.match(pattern);
      if (match) {
        const [day, month, year, hour, minute, second] = match
          .slice(1)
          .map(Number);
        const date = new Date(
          year,
          month - 1,
          day,
          hour || 0,
          minute || 0,
          second || 0
        );
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    return null;
  }

  static isDateValid(dateString: string): boolean {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/;

    if (!regex.test(dateString)) {
      return false;
    }

    const [day, month, year] = dateString.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  static isStringDateTimeValid(dateTimeString: string): boolean {
    const regex =
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{4}) (0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;

    if (!regex.test(dateTimeString)) {
      return false;
    }

    const [datePart, timePart] = dateTimeString.split(" ");
    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    const date = new Date(year, month - 1, day, hours, minutes, seconds);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day &&
      date.getHours() === hours &&
      date.getMinutes() === minutes &&
      date.getSeconds() === seconds
    );
  }

  static isTimeValid(timeString: string): boolean {
    const regex = /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;

    if (!regex.test(timeString)) {
      return false;
    }

    const [hours, minutes, seconds] = timeString.split(":").map(Number);

    return (
      hours >= 0 &&
      hours <= 23 &&
      minutes >= 0 &&
      minutes <= 59 &&
      seconds >= 0 &&
      seconds <= 59
    );
  }
}
