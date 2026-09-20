import { FadeIn } from "@/components/motion";

/**
 * Decorative hero artwork: a glass terminal window, a small "web vitals" card and two status
 * chips floating over soft orbit rings. Pure markup + CSS (no images, no data), hidden from
 * assistive tech, with a reserved aspect ratio so it never shifts layout. The float / orbit
 * motion is CSS and is switched off under prefers-reduced-motion (styles/components.css).
 */
export function HeroVisual() {
  return (
    <div className="hero__visual" aria-hidden="true">
      <FadeIn className="hero__visual-stage" delay={0.2} direction="left">
        <span className="hero__orbit hero__orbit--outer" />
        <span className="hero__orbit hero__orbit--inner" />

        <div className="hero__window">
          <div className="hero__window-bar">
            <i />
            <i />
            <i />
            <span>~/portfolio</span>
          </div>
          <div className="hero__window-body">
            <p>
              <span className="hero__code-prompt">$</span> pnpm build
            </p>
            <p className="hero__code-dim">▲ compiling routes…</p>
            <p>
              <span className="hero__code-ok">✓</span> 8 pages generated
            </p>
            <p>
              <span className="hero__code-ok">✓</span> all tests passed
            </p>
            <p>
              <span className="hero__code-ok">✓</span> ready in{" "}
              <span className="hero__code-key">1.4s</span>
              <span className="hero__code-cursor" />
            </p>
          </div>
        </div>

        <div className="hero__vitals">
          <p className="hero__vitals-label">Web vitals</p>
          <p className="hero__vitals-value">Good</p>
          <svg viewBox="0 0 120 32" className="hero__vitals-chart" focusable="false">
            <polyline points="0,26 18,20 34,23 52,12 70,15 88,6 104,9 120,2" />
          </svg>
          <div className="hero__vitals-bars">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <span className="hero__chip hero__chip--deploy">Deploy ready</span>
        <span className="hero__chip hero__chip--types">Type-safe</span>
      </FadeIn>
    </div>
  );
}
