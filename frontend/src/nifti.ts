import * as nifti from "nifti-reader-js";

export interface Volume {
  dims: [number, number, number]; // nx, ny, nz
  channels: number; // 1 for labels, 4 for the MRI
  data: ArrayLike<number>;
}

export async function loadNifti(url: string): Promise<Volume> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  let buf = await res.arrayBuffer();
  if (nifti.isCompressed(buf)) buf = nifti.decompress(buf) as ArrayBuffer;
  if (!nifti.isNIFTI(buf)) throw new Error(`${url}: not a NIfTI file`);
  const header = nifti.readHeader(buf)!;
  const raw = nifti.readImage(header, buf);
  let data: ArrayLike<number>;
  switch (header.datatypeCode) {
    case nifti.NIFTI1.TYPE_UINT8: data = new Uint8Array(raw); break;
    case nifti.NIFTI1.TYPE_INT16: data = new Int16Array(raw); break;
    case nifti.NIFTI1.TYPE_INT32: data = new Int32Array(raw); break;
    case nifti.NIFTI1.TYPE_FLOAT32: data = new Float32Array(raw); break;
    case nifti.NIFTI1.TYPE_FLOAT64: data = new Float64Array(raw); break;
    case nifti.NIFTI1.TYPE_UINT16: data = new Uint16Array(raw); break;
    default: throw new Error(`Unsupported NIfTI datatype ${header.datatypeCode}`);
  }
  const [nx, ny, nz] = [header.dims[1], header.dims[2], header.dims[3]];
  const channels = header.dims[0] >= 4 ? header.dims[4] : 1;
  return { dims: [nx, ny, nz], channels, data };
}

export const idx = (v: Volume, x: number, y: number, z: number, c = 0) =>
  x + y * v.dims[0] + z * v.dims[0] * v.dims[1] + c * v.dims[0] * v.dims[1] * v.dims[2];
