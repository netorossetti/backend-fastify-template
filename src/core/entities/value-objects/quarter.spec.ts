import { Quarter } from "./quarter";

describe("Class Quarter", () => {
  test("deve ser possivel instanciar um quadrimestre por uma string", () => {
    const quarter = new Quarter("2022/Q1");
    expect(quarter.value()).toEqual("2022/Q1");
  });
  test("deve ser possivel instanciar um quadrimestre por uma data", () => {
    const quarter = new Quarter(new Date(2022, 0, 5));
    expect(quarter.value()).toEqual("2022/Q1");
  });
  test("deve ser possivel instanciar um quadrimestre", () => {
    const data = new Date();
    const quarter = new Quarter();

    let quarterIdx = 2;
    if (data.getMonth() <= 4) quarterIdx = 1;
    else if (data.getMonth() >= 9) quarterIdx = 3;
    expect(quarter.value()).toEqual(`${data.getFullYear()}/Q${quarterIdx}`);
  });

  test("não deve ser possivel instanciar um quadrimestre com uma string inválida.", () => {
    expect(() => {
      new Quarter("nwovnow");
    }).toThrowError();
  });
});
