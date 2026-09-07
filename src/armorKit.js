import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// ARMOR KIT — Bộ nguyên thuỷ dựng giáp vát cạnh 45° & gộp mesh (Three.js)

const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _s = new THREE.Vector3(1, 1, 1);

function slabGeo(w, h, d, ch) {
  const c = Math.max(0.001, Math.min(ch, w * 0.32, h * 0.32, d * 0.32));
  const iw = w - 2 * c, ih = h - 2 * c;
  const sh = new THREE.Shape();
  const x0 = -iw / 2, y0 = -ih / 2, x1 = iw / 2, y1 = ih / 2;
  sh.moveTo(x0 + c, y0);
  sh.lineTo(x1 - c, y0); sh.quadraticCurveTo(x1, y0, x1, y0 + c);
  sh.lineTo(x1, y1 - c); sh.quadraticCurveTo(x1, y1, x1 - c, y1);
  sh.lineTo(x0 + c, y1); sh.quadraticCurveTo(x0, y1, x0, y1 - c);
  sh.lineTo(x0, y0 + c); sh.quadraticCurveTo(x0, y0, x0 + c, y0);
  const g = new THREE.ExtrudeGeometry(sh, {
    depth: d - 2 * c, bevelEnabled: true, bevelThickness: c, bevelSize: c, bevelSegments: 1, curveSegments: 1,
  });
  g.translate(0, 0, -d / 2 + c);
  g.computeVertexNormals();
  return g;
}

export function piece(mats) {
  const buckets = new Map();
  const stack = [new THREE.Matrix4()];
  const top = () => stack[stack.length - 1];

  function emit(matKey, geo, pos, rot) {
    if (geo.index) { const g2 = geo.toNonIndexed(); geo.dispose(); geo = g2; }
    const m = new THREE.Matrix4().compose(
      _v.set(pos?.[0] || 0, pos?.[1] || 0, pos?.[2] || 0),
      _q.setFromEuler(_e.set(rot?.[0] || 0, rot?.[1] || 0, rot?.[2] || 0)),
      _s.set(1, 1, 1),
    );
    geo.applyMatrix4(top().clone().multiply(m));
    let arr = buckets.get(matKey);
    if (!arr) buckets.set(matKey, (arr = []));
    arr.push(geo);
  }

  const api = {
    push(pos, rot) {
      const m = new THREE.Matrix4().compose(_v.set(pos?.[0] || 0, pos?.[1] || 0, pos?.[2] || 0), _q.setFromEuler(_e.set(rot?.[0] || 0, rot?.[1] || 0, rot?.[2] || 0)), _s.set(1, 1, 1));
      stack.push(top().clone().multiply(m));
      return api;
    },
    pop() { if (stack.length > 1) stack.pop(); return api; },
    both(fn) { fn(-1); fn(1); return api; },

    slab(matKey, w, h, d, pos, opts) {
      emit(matKey, slabGeo(w, h, d, opts?.ch ?? Math.min(w, h, d) * 0.22), pos, opts?.rot);
      return api;
    },
    cover(matKey, w, h, d, kx, ky, kz, pos, opts) {
      const ox = (kx - 1) * w / 2, oy = (ky - 1) * h / 2, oz = (kz - 1) * d / 2;
      const safe = Math.min(ox + oy, oy + oz, ox + oz) * 0.9;
      const ch = Math.max(0.0015, Math.min(safe, Math.min(w * kx, h * ky, d * kz) * 0.2, opts?.chMax ?? Infinity));
      return api.slab(matKey, w * kx, h * ky, d * kz, pos, { ch, rot: opts?.rot });
    },
    box(matKey, w, h, d, pos, opts) {
      emit(matKey, new THREE.BoxGeometry(w, h, d), pos, opts?.rot);
      return api;
    },
    cyl(matKey, rTop, rBot, h, pos, opts) {
      emit(matKey, new THREE.CylinderGeometry(rTop, rBot, h, opts?.seg ?? 12), pos, opts?.rot);
      return api;
    },
    torus(matKey, r, tube, pos, opts) { emit(matKey, new THREE.TorusGeometry(r, tube, 6, opts?.seg ?? 14), pos, opts?.rot); return api; },
    // KHỐI CẦU (nguyên) hoặc VÒM CẦU (thetaLength < PI) — MẶT CONG THẬT (không bát giác như slab), dùng
    // cho vai/khớp tròn cần "1 khối cong xuống" thay vì nhiều tấm vát chồng (tránh nhìn "cục xếp bí").
    sphere(matKey, r, pos, opts) {
      emit(matKey, new THREE.SphereGeometry(r, opts?.seg ?? 14, opts?.segV ?? 10, opts?.phiStart ?? 0, opts?.phiLength ?? Math.PI * 2, opts?.thetaStart ?? 0, opts?.thetaLength ?? Math.PI), pos, opts?.rot);
      return api;
    },

    bandStack(matKey, o) {
      const n = o.count ?? 3;
      const trimKey = o.trim, gap = o.gap ?? 0;
      if (o.liner !== false) {
        const lk = 0.97 * Math.min(1, 1 + (o.taper ?? 0));
        api.slab(o.linerMat || matKey, o.w * lk, o.h, o.d * lk, [o.x ?? 0, o.y ?? 0, o.z ?? 0], { ch: Math.min(o.w, o.d) * 0.1 });
      }
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0 : i / (n - 1);
        const k = 1 + (o.taper ?? 0) * t;
        const bh = o.h / n;
        const y = (o.y ?? 0) + o.h / 2 - bh * (i + 0.5);
        const z = (o.z ?? 0) + (o.zStep ?? 0) * t;
        api.slab(matKey, o.w * k, bh - gap, o.d * k, [o.x ?? 0, y, z], { ch: o.ch ?? bh * 0.3 });
        if (trimKey && i < n - 1) api.box(trimKey, o.w * k * 1.005, bh * 0.09, o.d * k * 1.005, [o.x ?? 0, y - bh / 2, z]);
      }
      return api;
    },
    frame(matKey, w, h, z, o) {
      const t = o?.t ?? Math.min(w, h) * 0.09, d = o?.d ?? t * 0.9, x = o?.x ?? 0, y = o?.y ?? 0;
      api.slab(matKey, w, t, d, [x, y + h / 2 - t / 2, z], { ch: t * 0.3 });
      api.slab(matKey, w, t, d, [x, y - h / 2 + t / 2, z], { ch: t * 0.3 });
      api.slab(matKey, t, h - 2 * t, d, [x - w / 2 + t / 2, y, z], { ch: t * 0.3 });
      api.slab(matKey, t, h - 2 * t, d, [x + w / 2 - t / 2, y, z], { ch: t * 0.3 });
      return api;
    },
    rivets(matKey, n, r, from, to) {
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0.5 : i / (n - 1);
        api.cyl(matKey, r, r, r * 1.2, [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t], { rot: [Math.PI / 2, 0, 0], seg: 6 });
      }
      return api;
    },
    belt(leatherKey, buckleKey, o) {
      api.slab(leatherKey, o.w, o.h, o.d, [0, o.y, 0], { ch: o.h * 0.3 });
      if (buckleKey) {
        api.slab(buckleKey, o.h * 1.5, o.h * 1.35, o.d * 0.1, [o.x ?? 0, o.y, o.d / 2 + o.d * 0.03], { ch: o.h * 0.25 });
        api.box(leatherKey, o.h * 0.8, o.h * 0.65, o.d * 0.14, [o.x ?? 0, o.y, o.d / 2 + o.d * 0.05]);
      }
      return api;
    },
    pouch(leatherKey, metalKey, w, h, d, pos) {
      api.slab(leatherKey, w, h, d, pos, { ch: Math.min(w, h, d) * 0.28 });
      api.slab(leatherKey, w * 1.06, h * 0.34, d * 1.1, [pos[0], pos[1] + h * 0.36, pos[2]], { ch: h * 0.1 });
      if (metalKey) api.box(metalKey, w * 0.18, h * 0.14, d * 0.2, [pos[0], pos[1] + h * 0.16, pos[2] + d * 0.55]);
      return api;
    },
    ropeCoil(ropeKey, hookKey, r, pos, rot) {
      api.push(pos, rot);
      for (let i = 0; i < 3; i++) api.torus(ropeKey, r * (1 - i * 0.12), r * 0.17, [0, -i * r * 0.34, 0], { rot: [Math.PI / 2, 0, 0], seg: 12 });
      if (hookKey) {
        api.cyl(hookKey, r * 0.09, r * 0.09, r * 0.7, [0, -r * 1.05, 0], { seg: 6 });
        api.torus(hookKey, r * 0.22, r * 0.08, [0, -r * 1.45, 0], { rot: [Math.PI / 2, 0, 0], seg: 10 });
      }
      api.pop();
      return api;
    },

    build() {
      const g = new THREE.Group();
      for (const [key, geos] of buckets) {
        if (!geos.length) continue;
        let merged = null;
        try { merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false); } catch { merged = null; }
        if (!merged) continue;
        if (geos.length > 1) for (const x of geos) x.dispose();
        const spec = mats[key] || { color: 0xff00ff };
        const mesh = new THREE.Mesh(merged, new THREE.MeshStandardMaterial({
          color: spec.color,
          metalness: spec.metalness ?? 0.5,
          roughness: spec.roughness ?? 0.55,
          emissive: spec.emissive ?? 0x000000,
          emissiveIntensity: spec.emissiveIntensity ?? 1,
        }));
        mesh.castShadow = true; mesh.receiveShadow = true;
        g.add(mesh);
      }
      return g;
    },
  };
  return api;
}
