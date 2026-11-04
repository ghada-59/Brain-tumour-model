import { useEffect, useMemo, useState } from "react";
import PlaneView, { Cursor } from "./PlaneView";
import Surface3D from "./Surface3D";
import { Volume, loadNifti } from "./nifti";
import { CHANNEL_NAMES, LABELS } from "./labels";

type Overlay = "none" | "reference" | "prediction";

interface CaseData { mri: Volume; reference: Volume; prediction: Volume }

export default function App() {
  const [cases, setCases] = useState<string[]>([]);
  const [caseId, setCaseId] = useState("");
  const [data, setData] = useState<CaseData | null>(null);
  const [error, setError] = useState("");
  const [channel, setChannel] = useState(0);
  const [overlay, setOverlay] = useState<Overlay>("reference");
  const [cursor, setCursor] = useState<Cursor>([0, 0, 0]);
  const [opacity, setOpacity] = useState(0.8);
  const [reset, setReset] = useState(0);

  useEffect(() => {
    fetch("/cases/index.json")
      .then((r) => { if (!r.ok) throw new Error("Run `python -m brain_tumour.export <CASE_ID>` first."); return r.json(); })
      .then((ids: string[]) => { setCases(ids); setCaseId(ids[0] ?? ""); })
      .catch((e) => setError(String(e.message ?? e)));
  }, []);

  useEffect(() => {
    if (!caseId) return;
    setData(null);
    const base = `/cases/${caseId}`;
    Promise.all([loadNifti(`${base}/mri.nii.gz`), loadNifti(`${base}/reference.nii.gz`), loadNifti(`${base}/prediction.nii.gz`)])
      .then(([mri, reference, prediction]) => {
        setData({ mri, reference, prediction });
        setCursor([Math.floor(mri.dims[0] / 2), Math.floor(mri.dims[1] / 2), Math.floor(mri.dims[2] / 2)]);
      })
      .catch((e) => setError(String(e.message ?? e)));
  }, [caseId]);

  const mask = useMemo(() => (data && overlay !== "none" ? data[overlay] : null), [data, overlay]);
  const max = useMemo(() => {
    if (!data) return 1;
    const [nx, ny, nz] = data.mri.dims;
    const off = channel * nx * ny * nz;
    let m = 0;
    for (let i = 0; i < nx * ny * nz; i += 7) m = Math.max(m, data.mri.data[off + i] as number);
    return m * 0.8 || 1;
  }, [data, channel]);

  return (
    <div className="app">
      <header>
        <h1>3D Brain Tumour Model</h1>
        <p className="warn">Educational prototype using de-identified research data. Not a medical device; not clinically validated.</p>
      </header>
      {error && <div className="error">{error}</div>}
      <div className="controls">
        <label>Case <select value={caseId} onChange={(e) => setCaseId(e.target.value)}>{cases.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Sequence <select value={channel} onChange={(e) => setChannel(Number(e.target.value))}>{CHANNEL_NAMES.map((n, i) => <option key={n} value={i}>{n}</option>)}</select></label>
        <label>Overlay <select value={overlay} onChange={(e) => setOverlay(e.target.value as Overlay)}>
          <option value="none">None</option><option value="reference">Reference annotation</option><option value="prediction">Your model</option></select></label>
        <label>3D opacity <input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} /></label>
        <button onClick={() => setReset((n) => n + 1)}>Reset 3D view</button>
      </div>
      <div className="legend">
        {Object.entries(LABELS).map(([k, v]) => (
          <span key={k}><i style={{ background: `rgb(${v.color.join(",")})` }} />{k} · {v.name}</span>
        ))}
        <span><i style={{ background: "#333" }} />0 · Background</span>
      </div>
      {data ? (
        <div className="grid">
          {(["axial", "coronal", "sagittal"] as const).map((a) => (
            <figure key={a}>
              <figcaption>{a} — {CHANNEL_NAMES[channel]} — {overlay === "none" ? "no overlay" : overlay}</figcaption>
              <PlaneView axis={a} mri={data.mri} channel={channel} mask={mask} cursor={cursor} onCursor={setCursor} max={max} />
            </figure>
          ))}
          <figure>
            <figcaption>3D surface — {overlay === "none" ? "choose an overlay" : overlay} (display-downsampled)</figcaption>
            <Surface3D mask={mask} opacity={opacity} resetSignal={reset} />
          </figure>
        </div>
      ) : !error && <p>Loading…</p>}
    </div>
  );
}
