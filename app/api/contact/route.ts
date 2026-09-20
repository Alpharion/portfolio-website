import { z } from "zod";
import { contactSchema } from "@/lib/contact-schema";

/**
 * POST /api/contact
 * 200 `{ ok: true }` | 400 `{ ok: false, errors }` | 502 `{ ok: false }`.
 * If `CONTACT_FORM_ENDPOINT` is set the validated JSON is forwarded there; otherwise the
 * submission is logged server-side and reported as a success.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, errors: { form: ["Invalid JSON body"] } }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { ok: false, errors: z.flattenError(parsed.error).fieldErrors },
      { status: 400 },
    );
  }

  const endpoint = process.env.CONTACT_FORM_ENDPOINT;
  if (!endpoint) {
    console.info("[contact] new message", parsed.data);
    return Response.json({ ok: true });
  }

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (!upstream.ok) {
      console.error(`[contact] endpoint responded ${upstream.status}`);
      return Response.json({ ok: false }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[contact] failed to reach endpoint", error);
    return Response.json({ ok: false }, { status: 502 });
  }
}
