import { randomUUID } from "node:crypto";
import { TokenHelper } from "./token-helper";

describe("Token Helper", () => {
  test("sing / decoded valid token", () => {
    const token = TokenHelper.singToken({
      id: randomUUID(),
      tenantId: randomUUID(),
      name: "Flório",
      email: "florio@libertaetecnologia.com.br",
      role: "superAdmin",
    });
    expect(token).toEqual(expect.any(String));

    const decoded = TokenHelper.decodedToken(token);
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
