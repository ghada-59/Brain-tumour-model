import { useEffect, useState } from "react";
import { Icon } from "./ui";
import Overview from "./pages/Overview";
import ViewerPage from "./pages/ViewerPage";
import Review3DPage from "./pages/Review3DPage";
import EvalPage from "./pages/EvalPage";
import MethodPage from "./pages/MethodPage";
import LimitsPage from "./pages/LimitsPage";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: "overview" as const, title: "Overview" },
  { id: "viewer", label: "MRI & Segmentation", icon: "layers" as const, title: "MRI Sequences & Segmentation" },
  { id: "review3d", label: "3D Review", icon: "cube" as const, title: "3D Review" },
  { id: "eval", label: "Model Evaluation", icon: "chart" as const, title: "Model Evaluation" },
  { id: "method", label: "Methodology", icon: "flask" as const, title: "Methodology" },
  { id: "limits", label: "Limitations", icon: "shield" as const, title: "Limitations & Scope" },
];

function currentSection(): string {
  const h = window.location.hash.replace("#", "");
  return SECTIONS.some((s) => s.id === h) ? h : "overview";
}

export default function Shell() {
  const [section, setSection] = useState(currentSection);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    (localStorage.getItem("bt-theme") as "dark" | "light") || "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("bt-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onHash = () => setSection(currentSection());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (id: string) => {
    window.location.hash = id;
    setSection(id);
    setMenuOpen(false);
  };

  const active = SECTIONS.find((s) => s.id === section)!;

  return (
    <div className="shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <h1>Brain Tumour Segmentation</h1>
          <div className="sub">Research Workstation</div>
        </div>
        <nav className="nav" aria-label="Main">
          <div className="nav-label">Project</div>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`nav-btn ${section === s.id ? "active" : ""}`}
              onClick={() => navigate(s.id)}
              aria-current={section === s.id ? "page" : undefined}
            >
              <Icon name={s.icon} /> {s.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          Educational prototype · de-identified research data.<br />
          Not a medical device · not clinically validated.
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
            <Icon name="menu" /> Menu
          </button>
          <h2>{active.title}</h2>
          <button
            className="theme-btn"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} size={14} />
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </header>

        {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.4)" }} />}

        <div className="content">
          {section === "overview" && <Overview onNavigate={navigate} />}
          {section === "viewer" && <ViewerPage />}
          {section === "review3d" && <Review3DPage />}
          {section === "eval" && <EvalPage />}
          {section === "method" && <MethodPage />}
          {section === "limits" && <LimitsPage />}
        </div>
      </div>
    </div>
  );
}
