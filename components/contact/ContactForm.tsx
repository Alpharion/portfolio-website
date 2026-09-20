"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";

type SubmitState = "idle" | "success" | "failure";

interface ContactResponse {
  ok: boolean;
  errors?: Partial<Record<keyof ContactInput, string[]>>;
}

const FIELDS = ["name", "email", "message"] as const;

/** Contact form: react-hook-form + the shared zod schema, posting JSON to `/api/contact`. */
export function ContactForm() {
  const baseId = useId();
  const [status, setStatus] = useState<SubmitState>("idle");
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values: ContactInput) => {
    setStatus("idle");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json().catch(() => ({ ok: false }))) as ContactResponse;

      if (response.ok && result.ok) {
        reset();
        setStatus("success");
        return;
      }

      if (result.errors) {
        for (const field of FIELDS) {
          const message = result.errors[field]?.[0];
          if (message) setError(field, { type: "server", message });
        }
      }
      setStatus("failure");
    } catch {
      setStatus("failure");
    }
  };

  const fieldId = (field: (typeof FIELDS)[number]) => `${baseId}-${field}`;
  const errorId = (field: (typeof FIELDS)[number]) => `${baseId}-${field}-error`;
  const describedBy = (field: (typeof FIELDS)[number]) =>
    errors[field] ? errorId(field) : undefined;

  const renderError = (field: (typeof FIELDS)[number]) =>
    errors[field] ? (
      <p
        className="contact-form__error"
        id={errorId(field)}
        role="alert"
        data-testid="contact-error"
      >
        {errors[field]?.message}
      </p>
    ) : null;

  return (
    <form
      className="contact-form"
      data-testid="contact-form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="contact-form__field">
        <label className="contact-form__label" htmlFor={fieldId("name")}>
          Name
        </label>
        <input
          id={fieldId("name")}
          className="contact-form__input"
          type="text"
          autoComplete="name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describedBy("name")}
          {...register("name")}
        />
        {renderError("name")}
      </div>

      <div className="contact-form__field">
        <label className="contact-form__label" htmlFor={fieldId("email")}>
          Email
        </label>
        <input
          id={fieldId("email")}
          className="contact-form__input"
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={describedBy("email")}
          {...register("email")}
        />
        {renderError("email")}
      </div>

      <div className="contact-form__field">
        <label className="contact-form__label" htmlFor={fieldId("message")}>
          Message
        </label>
        <textarea
          id={fieldId("message")}
          className="contact-form__input"
          rows={6}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy("message")}
          {...register("message")}
        />
        {renderError("message")}
      </div>

      {status === "success" ? (
        <p
          className="contact-form__status contact-form__status--success"
          role="status"
          data-testid="contact-success"
        >
          Thanks for your message. I will get back to you soon.
        </p>
      ) : null}
      {status === "failure" ? (
        <p
          className="contact-form__status contact-form__status--failure"
          role="alert"
          data-testid="contact-failure"
        >
          Something went wrong sending your message. Please check the form and try again.
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn--primary contact-form__submit"
        data-testid="contact-submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
