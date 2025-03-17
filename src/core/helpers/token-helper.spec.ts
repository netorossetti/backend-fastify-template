import { TokenHelper } from "./token-helper";

describe("Token Helper", () => {
  test.skip("decoded valid token", () => {
    const decoded = TokenHelper.decodedToken(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJlYWVmNDQyLWVkOWQtNDg2MC04ODk4LTE4ZTVkM2ZmZTZiYiIsIm5vbWUiOiJGbMOzcmlvIiwiZW1haWwiOiJmbG9yaW9AbGliZXJ0YWV0ZWNub2xvZ2lhLmNvbS5iciIsInRyb2NhU2VuaGEiOmZhbHNlLCJ1cGRhdGVkQXQiOiIyMDI0LTA2LTE0VDE2OjU4OjE5LjI2M1oiLCJyZWdyYSI6InN1cGVyQWRtaW4iLCJsb2NhbCI6ImRiZGV2LWxpYmVydGFlIiwiaWF0IjoxNzIyNDQ4NzY2LCJleHAiOjE3MjI0NTk1NjZ9.Vl63-7QWBe9dvMr3cW7-bSz2kbVQrMoaiT--Y8QMLNY"
    );
    expect(decoded).toEqual(
      expect.objectContaining({
        name: "Flório",
        email: "florio@libertaetecnologia.com.br",
        role: "superAdmin",
      })
    );
  });

  test("decoded invalid token", () => {
    expect(async () => {
      TokenHelper.decodedToken(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.123456.-1231536-70tYofFU6UQ"
      );
    }).rejects.toBeInstanceOf(Error);
  });
});
