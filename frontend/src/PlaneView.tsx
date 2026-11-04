import { useEffect, useRef } from "react";
import { Volume, idx } from "./nifti";
import { LABELS } from "./labels";

export type Axis = "axial" | "coronal" | "sagittal";
export type Cursor = [number, number, number];

interface Props {
  axis: Axis;
  mri: Volume;
  channel: number;
  mask: Volume | null;
  cursor: Cursor;
  onCursor: (c: Cursor) => void;
  max: number; // intensity window upper bound
}

const SCALE = 2;

function planeSize(v: Volume, axis: Axis): [number, number] {
  const [nx, ny, nz] = v.dims;
  if (axis === "axial") return [nx, ny];
  if (axis === "coronal") return [nx, nz];
  return [ny, nz];
}

function voxel(axis: Axis, u: number, w: number, c: Cursor): Cursor {
  if (axis === "axial") return [u, w, c[2]];
  if (axis === "coronal") return [u, c[1], w];
  return [c[0], u, w];
}

export default function PlaneView({ axis, mri, channel, mask, cursor, onCursor, max }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [W, H] = planeSize(mri, axis);

  useEffect(() => {
    const canvas = ref.current!;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(W, H);
    for (let w = 0; w < H; w++) {
      for (let u = 0; u < W; u++) {
        const [x, y, z] = voxel(axis, u, w, cursor);
        const val = Math.max(0, Math.min(1, (mri.data[idx(mri, x, y, z, channel)] as number) / max));
        let r = val * 255, g = r, b = r;
        if (mask) {
          const lab = mask.data[idx(mask, x, y, z)] as number;
          const col = LABELS[lab]?.color;
          if (col) { r = 0.5 * r + 0.5 * col[0]; g = 0.5 * g + 0.5 * col[1]; b = 0.5 * b + 0.5 * col[2]; }
        }
        // flip vertically so "up" is up on screen
        const o = ((H - 1 - w) * W + u) * 4;
        img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    // crosshair
    const [cu, cw] = axis === "axial" ? [cursor[0], cursor[1]] : axis === "coronal" ? [cursor[0], cursor[2]] : [cursor[1], cursor[2]];
    ctx.strokeStyle = "rgba(0,255,120,0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cu + 0.5, 0); ctx.lineTo(cu + 0.5, H);
    ctx.moveTo(0, H - 1 - cw + 0.5); ctx.lineTo(W, H - 1 - cw + 0.5);
    ctx.stroke();
  }, [axis, mri, channel, mask, cursor, max, W, H]);

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const u = Math.floor(((e.clientX - r.left) / r.width) * W);
    const w = H - 1 - Math.floor(((e.clientY - r.top) / r.height) * H);
    onCursor(voxel(axis, u, w, cursor)); // one shared voxel index drives all three planes
  };

  return (
    <canvas ref={ref} onClick={onClick} className="plane" style={{ width: W * SCALE, height: H * SCALE }} />
  );
}
