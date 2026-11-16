import App from "./App";

export default function Viewer() {
  return <section className="viewer-embed">
    <div className="viewer-heading">
      <span className="eyebrow">INTERACTIVE RESEARCH VIEWER</span>
      <h2>MRI & segmentation workspace</h2>
      <p>The original linked-plane and Three.js viewer is preserved below.</p>
    </div>
    <App />
  </section>;
}
