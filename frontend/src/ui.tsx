import type { ReactNode } from "react";

type IconName = "overview" | "layers" | "cube" | "chart" | "flask" | "shield" | "menu" | "sun" | "moon" | "alert" | "info" | "database";

const paths: Record<IconName, ReactNode> = {
  overview: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  layers: <><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></>,
  cube: <><path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z" /><path d="M12 11l8-4.5M12 11v9M12 11L4 6.5" /></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M21 20H3" /></>,
  flask: <><path d="M9 3h6M10 3v5l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-3.5L14 8V3" /><path d="M7.5 15h9" /></>,
  shield: <><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></>,
  alert: <><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 12v4" /></>,
  database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>,
};

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function Banner({ kind, children }: { kind: "warn" | "info" | "bad"; children: ReactNode }) {
  return (
    <div className={`banner ${kind}`} role={kind === "bad" ? "alert" : "note"}>
      <Icon name={kind === "warn" ? "alert" : kind === "bad" ? "alert" : "info"} />
      <div>{children}</div>
    </div>
  );
}

export function FigFrame({ src, title, caption, alt }: { src: string; title: string; caption: string; alt: string }) {
  return (
    <figure className="fig-frame" style={{ margin: 0 }}>
      <img src={src} alt={alt} loading="lazy" />
      <figcaption>
        <strong>{title}</strong>
        {caption}
      </figcaption>
    </figure>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="section-title">{children}</h3>;
}
