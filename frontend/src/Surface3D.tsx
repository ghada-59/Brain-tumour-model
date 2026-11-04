import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Volume, idx } from "./nifti";
import { LABELS } from "./labels";

interface Props {
  mask: Volume | null;
  opacity: number;
  resetSignal: number;
}

const STEP = 2; // display downsampling only; metrics always use the full voxel mask

/** Voxel-shell view of the mask: only boundary voxels are drawn, so it looks like a surface. */
export default function Surface3D({ mask, opacity, resetSignal }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef<{ camera: THREE.PerspectiveCamera; controls: OrbitControls; mat: THREE.MeshStandardMaterial[] } | null>(null);

  useEffect(() => {
    const el = host.current!;
    const w = el.clientWidth, h = 420;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111418);
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 2000);
    camera.position.set(0, 0, 220);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    el.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dl = new THREE.DirectionalLight(0xffffff, 1.0);
    dl.position.set(1, 1, 1);
    scene.add(dl);
    const controls = new OrbitControls(camera, renderer.domElement);

    const mats: THREE.MeshStandardMaterial[] = [];
    if (mask) {
      const [nx, ny, nz] = mask.dims;
      const geo = new THREE.BoxGeometry(STEP, STEP, STEP);
      const groups: Record<number, THREE.Matrix4[]> = { 1: [], 2: [], 3: [] };
      const at = (x: number, y: number, z: number) =>
        x < 0 || y < 0 || z < 0 || x >= nx || y >= ny || z >= nz ? 0 : (mask.data[idx(mask, x, y, z)] as number);
      for (let z = 0; z < nz; z += STEP)
        for (let y = 0; y < ny; y += STEP)
          for (let x = 0; x < nx; x += STEP) {
            const l = at(x, y, z);
            if (!l) continue;
            const edge = !at(x + STEP, y, z) || !at(x - STEP, y, z) || !at(x, y + STEP, z) ||
              !at(x, y - STEP, z) || !at(x, y, z + STEP) || !at(x, y, z - STEP);
            if (edge) groups[l]?.push(new THREE.Matrix4().makeTranslation(x - nx / 2, y - ny / 2, z - nz / 2));
          }
      for (const [k, ms] of Object.entries(groups)) {
        if (!ms.length) continue;
        const c = LABELS[Number(k)].color;
        const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(c[0] / 255, c[1] / 255, c[2] / 255), transparent: true });
        mats.push(mat);
        const mesh = new THREE.InstancedMesh(geo, mat, ms.length);
        ms.forEach((m, i) => mesh.setMatrixAt(i, m));
        scene.add(mesh);
      }
    }
    state.current = { camera, controls, mat: mats };

    let raf = 0;
    const loop = () => { controls.update(); renderer.render(scene, camera); raf = requestAnimationFrame(loop); };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      controls.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [mask]);

  useEffect(() => { state.current?.mat.forEach((m) => { m.opacity = opacity; }); }, [opacity, mask]);
  useEffect(() => {
    const s = state.current;
    if (!s) return;
    s.camera.position.set(0, 0, 220);
    s.controls.target.set(0, 0, 0);
    s.controls.update();
  }, [resetSignal, mask]);

  return <div ref={host} className="surface" />;
}
