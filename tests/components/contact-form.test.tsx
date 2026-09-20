import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "@/components/contact/ContactForm";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hello, I would like to discuss a project with you.",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function fill(user: ReturnType<typeof userEvent.setup>, values: Partial<typeof valid>) {
  if (values.name !== undefined) await user.type(screen.getByLabelText(/name/i), values.name);
  if (values.email !== undefined) await user.type(screen.getByLabelText(/email/i), values.email);
  if (values.message !== undefined)
    await user.type(screen.getByLabelText(/message/i), values.message);
}

describe("ContactForm", () => {
  it("renders labelled Name, Email and Message fields and a submit button", () => {
    render(<ContactForm />);
    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/message/i).tagName).toBe("TEXTAREA");
    expect(screen.getByTestId("contact-submit")).toBeEnabled();
    expect(screen.queryByTestId("contact-error")).toBeNull();
    expect(screen.queryByTestId("contact-success")).toBeNull();
    expect(screen.queryByTestId("contact-failure")).toBeNull();
  });

  it("shows an alert per invalid field on an empty submit and does not call the API", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByTestId("contact-submit"));

    const errors = await screen.findAllByTestId("contact-error");
    expect(errors).toHaveLength(3);
    for (const error of errors) {
      expect(error).toHaveAttribute("role", "alert");
      expect(error.textContent?.trim().length).toBeGreaterThan(0);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("flags only the offending field when just the email is invalid", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await fill(user, { ...valid, email: "not-an-email" });
    await user.click(screen.getByTestId("contact-submit"));

    const errors = await screen.findAllByTestId("contact-error");
    expect(errors).toHaveLength(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a too-short message", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await fill(user, { ...valid, message: "short" });
    await user.click(screen.getByTestId("contact-submit"));
    expect(await screen.findAllByTestId("contact-error")).toHaveLength(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("POSTs the JSON payload to /api/contact and shows the success state", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
    const user = userEvent.setup();
    render(<ContactForm />);
    await fill(user, valid);
    await user.click(screen.getByTestId("contact-submit"));

    expect(await screen.findByTestId("contact-success")).toBeInTheDocument();
    expect(screen.queryByTestId("contact-failure")).toBeNull();
    expect(screen.queryByTestId("contact-error")).toBeNull();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/contact");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual(valid);
    const headers = new Headers(init.headers);
    expect(headers.get("content-type")).toContain("application/json");
  });

  it("shows the failure state (not success) when the API responds 502", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: false }, 502));
    const user = userEvent.setup();
    render(<ContactForm />);
    await fill(user, valid);
    await user.click(screen.getByTestId("contact-submit"));

    expect(await screen.findByTestId("contact-failure")).toBeInTheDocument();
    expect(screen.queryByTestId("contact-success")).toBeNull();
  });

  it("shows the failure state when the network request rejects", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const user = userEvent.setup();
    render(<ContactForm />);
    await fill(user, valid);
    await user.click(screen.getByTestId("contact-submit"));

    expect(await screen.findByTestId("contact-failure")).toBeInTheDocument();
    expect(screen.queryByTestId("contact-success")).toBeNull();
  });

  it("keeps the entered values after a failure so the user can retry", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: false }, 502));
    const user = userEvent.setup();
    render(<ContactForm />);
    await fill(user, valid);
    await user.click(screen.getByTestId("contact-submit"));
    await screen.findByTestId("contact-failure");
    expect(screen.getByLabelText(/name/i)).toHaveValue(valid.name);

    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));
    await user.click(screen.getByTestId("contact-submit"));
    await waitFor(() => expect(screen.getByTestId("contact-success")).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
