import type { ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";

export interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  /** Open in a new tab. Absolute http(s) and mailto/tel links are always rendered as plain anchors. */
  external?: boolean;
  className?: string;
}

const PLAIN_ANCHOR = /^(https?:|mailto:|tel:)/i;

/** A link that looks like a button. Internal hrefs use `next/link`. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
  className,
}: ButtonLinkProps) {
  const classes = clsx("btn", `btn--${variant}`, className);

  if (external || PLAIN_ANCHOR.test(href)) {
    const opensNewTab = external || /^https?:/i.test(href);
    return (
      <a
        className={classes}
        href={href}
        {...(opensNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link className={classes} href={href}>
      {children}
    </Link>
  );
}
