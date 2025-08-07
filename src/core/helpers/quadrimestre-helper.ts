export class QuarterHelper {
  static isQuarter(value: string): boolean {
    const regex = new RegExp(/^\d{4}\/Q[1-3]$/);
    return regex.test(value);
  }

  static toQuarter(date: Date): string {
    const ano = date.getFullYear();
    const mes = date.getMonth();

    const quadrimestre = mes < 4 ? 1 : mes > 7 ? 3 : 2;

    return `${ano}/Q${quadrimestre}`;
  }

  static toQuarterRange(quarter: string): {
    startDate: Date;
    endDate: Date;
  } {
    if (!this.isQuarter(quarter))
      throw new Error(`"${quarter}" não é um quadrimestre válido.`);

    const [year, quarterStr] = quarter.split("/");
    const yearNum = parseInt(year);

    let startMonth: number;
    let endMonth: number;

    switch (quarterStr) {
      case "Q1":
        startMonth = 0; // Janeiro
        endMonth = 3; // Abril
        break;
      case "Q2":
        startMonth = 4; // Maio
        endMonth = 7; // Agosto
        break;
      case "Q3":
        startMonth = 8; // Setembro
        endMonth = 11; // Dezembro
        break;
      default:
        throw new Error("Invalid quarter format");
    }

    const startDate = new Date(yearNum, startMonth, 1);
    const endDate = new Date(yearNum, endMonth + 1, 0, 23, 59, 59, 999);

    return { startDate, endDate };
  }

  static addQuarter(quarter: string, quantity: number = 1): string {
    if (!this.isQuarter(quarter))
      throw new Error(`"${quarter}" não é um quadrimestre válido.`);
    if (quantity === 0) return quarter;

    const [sYear, sQuarter] = quarter.split("/Q");
    let year = parseInt(sYear);
    let idxQuarter = parseInt(sQuarter);

    if (quantity > 0) {
      for (let i = 1; i <= quantity; i++) {
        if (idxQuarter >= 3) {
          year = year + 1;
          idxQuarter = 1;
        } else {
          idxQuarter = idxQuarter + 1;
        }
      }
    } else {
      for (let i = -1; i >= quantity; i--) {
        if (idxQuarter <= 1) {
          year = year - 1;
          idxQuarter = 3;
        } else {
          idxQuarter = idxQuarter - 1;
        }
      }
    }
    return `${year}/Q${idxQuarter}`;
  }

  static quarterToArray(quarter: string, until: Date = new Date()): string[] {
    if (!this.isQuarter(quarter)) return [];
    const maxQuarter = this.toQuarter(until);
    if (maxQuarter < quarter) return [];
    const quaters: string[] = [];
    let lastQuarter = quarter;
    while (lastQuarter <= maxQuarter) {
      quaters.push(lastQuarter);
      lastQuarter = this.addQuarter(lastQuarter, 1) ?? maxQuarter;
    }
    return quaters;
  }
}
