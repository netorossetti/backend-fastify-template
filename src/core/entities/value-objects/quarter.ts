import { QuarterHelper } from "src/core/helpers/quadrimestre-helper";

export class Quarter {
  private _value: string;
  private _startDate: Date;
  private _endDate: Date;

  value() {
    return this._value;
  }

  startDate() {
    return this._startDate;
  }

  endDate() {
    return this._endDate;
  }

  constructor(value?: string | Date) {
    if (!value) this._value = QuarterHelper.toQuarter(new Date());
    else if (value instanceof Date)
      this._value = QuarterHelper.toQuarter(value);
    else {
      if (!QuarterHelper.isQuarter(value))
        throw new Error(`${value} is not a quarter.`);
      this._value = value;
    }
    const { startDate, endDate } = QuarterHelper.toQuarterRange(this._value);
    this._startDate = startDate;
    this._endDate = endDate;
  }

  equals(quarter: Quarter) {
    return quarter.value() === this.value();
  }
}
