import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/contact-schema";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hello there, I would like to talk about a project.",
};

function issuePaths(input: unknown): string[] {
  const result = contactSchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((i) => String(i.path[0]));
}

describe("contactSchema", () => {
  it("accepts a valid payload", () => {
    const result = contactSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("trims whitespace from every field", () => {
    const result = contactSchema.parse({
      name: "  Ada Lovelace  ",
      email: "  ada@example.com  ",
      message: `   ${valid.message}   `,
    });
    expect(result).toEqual(valid);
  });

  describe("name", () => {
    it("rejects missing, empty and whitespace-only names", () => {
      expect(issuePaths({ ...valid, name: undefined })).toContain("name");
      expect(issuePaths({ ...valid, name: "" })).toContain("name");
      expect(issuePaths({ ...valid, name: "     " })).toContain("name");
    });

    it("enforces the 2-100 character bounds", () => {
      expect(issuePaths({ ...valid, name: "A" })).toContain("name");
      expect(contactSchema.safeParse({ ...valid, name: "Al" }).success).toBe(true);
      expect(contactSchema.safeParse({ ...valid, name: "a".repeat(100) }).success).toBe(true);
      expect(issuePaths({ ...valid, name: "a".repeat(101) })).toContain("name");
    });
  });

  describe("email", () => {
    it.each(["", "plainaddress", "no-at.example.com", "a@", "@example.com", "a b@example.com"])(
      "rejects %j",
      (email) => {
        expect(issuePaths({ ...valid, email })).toContain("email");
      },
    );

    it("rejects a missing email", () => {
      expect(issuePaths({ ...valid, email: undefined })).toContain("email");
    });

    it("accepts common valid shapes", () => {
      for (const email of ["a@b.co", "first.last+tag@sub.example.org"]) {
        expect(contactSchema.safeParse({ ...valid, email }).success).toBe(true);
      }
    });
  });

  describe("message", () => {
    it("rejects missing, empty and whitespace-only messages", () => {
      expect(issuePaths({ ...valid, message: undefined })).toContain("message");
      expect(issuePaths({ ...valid, message: "" })).toContain("message");
      expect(issuePaths({ ...valid, message: "          " })).toContain("message");
    });

    it("enforces the 10-5000 character bounds (after trimming)", () => {
      expect(issuePaths({ ...valid, message: "123456789" })).toContain("message");
      expect(issuePaths({ ...valid, message: "  123456789  " })).toContain("message");
      expect(contactSchema.safeParse({ ...valid, message: "1234567890" }).success).toBe(true);
      expect(contactSchema.safeParse({ ...valid, message: "m".repeat(5000) }).success).toBe(true);
      expect(issuePaths({ ...valid, message: "m".repeat(5001) })).toContain("message");
    });
  });

  it("reports one issue per invalid field", () => {
    const paths = issuePaths({ name: "", email: "nope", message: "short" });
    expect(new Set(paths)).toEqual(new Set(["name", "email", "message"]));
  });

  it("rejects non-object input", () => {
    expect(contactSchema.safeParse(null).success).toBe(false);
    expect(contactSchema.safeParse("string").success).toBe(false);
    expect(contactSchema.safeParse(undefined).success).toBe(false);
  });
});
