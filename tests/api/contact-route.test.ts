// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/contact/route";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hello, I would like to discuss a project with you.",
};

function post(body: unknown, raw = false): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("CONTACT_FORM_ENDPOINT", "");
  // The handler logs server-side when no endpoint is configured; keep test output quiet.
  vi.spyOn(console, "log").mockImplementation(() => undefined);
  vi.spyOn(console, "info").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("POST /api/contact", () => {
  describe("without CONTACT_FORM_ENDPOINT", () => {
    it("accepts a valid payload with 200 { ok: true } and does not call fetch", async () => {
      const res = await POST(post(valid) as never);
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("rejects an invalid payload with 400 and per-field errors", async () => {
      const res = await POST(post({ name: "", email: "nope", message: "short" }) as never);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.ok).toBe(false);
      expect(body.errors).toBeTruthy();
      const serialized = JSON.stringify(body.errors);
      for (const field of ["name", "email", "message"]) expect(serialized).toContain(field);
    });

    it("reports only the failing field", async () => {
      const res = await POST(post({ ...valid, email: "nope" }) as never);
      expect(res.status).toBe(400);
      const serialized = JSON.stringify((await res.json()).errors);
      expect(serialized).toContain("email");
      expect(serialized).not.toContain("name");
    });

    it("rejects an empty object with 400", async () => {
      const res = await POST(post({}) as never);
      expect(res.status).toBe(400);
      expect((await res.json()).ok).toBe(false);
    });

    it("rejects a malformed JSON body with a 4xx { ok: false }", async () => {
      const res = await POST(post("{not json", true) as never);
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
      expect((await res.json()).ok).toBe(false);
    });
  });

  describe("with CONTACT_FORM_ENDPOINT", () => {
    const endpoint = "https://forms.example.test/submit";

    beforeEach(() => {
      vi.stubEnv("CONTACT_FORM_ENDPOINT", endpoint);
    });

    it("forwards the validated JSON to the endpoint and returns 200 { ok: true }", async () => {
      fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
      const res = await POST(post(valid) as never);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0] as [string | URL, RequestInit];
      expect(String(url)).toBe(endpoint);
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string)).toMatchObject(valid);
    });

    it("forwards trimmed values", async () => {
      fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
      await POST(
        post({
          name: `  ${valid.name}  `,
          email: ` ${valid.email} `,
          message: ` ${valid.message} `,
        }) as never,
      );
      const init = fetchMock.mock.calls[0][1] as RequestInit;
      expect(JSON.parse(init.body as string)).toMatchObject(valid);
    });

    it("does not forward an invalid payload", async () => {
      const res = await POST(post({ ...valid, email: "bad" }) as never);
      expect(res.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("returns 502 { ok: false } when the upstream responds with an error", async () => {
      fetchMock.mockResolvedValue(new Response("boom", { status: 500 }));
      const res = await POST(post(valid) as never);
      expect(res.status).toBe(502);
      expect((await res.json()).ok).toBe(false);
    });

    it("returns 502 { ok: false } when the upstream request throws", async () => {
      fetchMock.mockRejectedValue(new Error("network down"));
      const res = await POST(post(valid) as never);
      expect(res.status).toBe(502);
      expect((await res.json()).ok).toBe(false);
    });
  });
});
