"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { siteContent } from "@/data/site-content";
import { Container } from "@/components/layout/Container";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Site header with the primary nav. Client component for the active-link state and the mobile
 * menu toggle. The menu is always in the DOM; its open state is exposed via `aria-expanded` on
 * the toggle and `data-open` on `.site-nav__menu` so CSS can show/hide it at small widths.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const menuId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="site-header" data-testid="site-header">
      <Container className="site-header__inner">
        <Link href="/" className="site-header__brand" onClick={() => setOpen(false)}>
          {siteContent.site.name}
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <button
            type="button"
            className="site-nav__toggle"
            data-testid="nav-toggle"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
          <div id={menuId} className="site-nav__menu" data-open={open ? "true" : "false"}>
            <ul className="site-nav__list">
              {siteContent.nav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx("site-nav__link", active && "is-active")}
                      data-testid="nav-link"
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </Container>
    </header>
  );
}
