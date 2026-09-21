// VoxelWarrior.js — Base Character phong cách LOW-POLY / FACETED VOXEL (Minecraft Dungeons × Roblox).
// Chiến binh bán khoả thân: quấn băng tay, đai đeo chéo ngực, đai lưng da xẻ tà, giáp vai PHẢI lệch.
//
// Dựng 100% bằng Three.js primitive (BoxGeometry) + `flatShading:true` ⇒ diện phẳng faceted nổi khối cơ bắp.
// Tách rời hoàn toàn khỏi scene setup: chỉ `import * as THREE from 'three'`. Dùng:
//   const w = new VoxelWarrior();  scene.add(w.root);
//   w.attachWeapon(mesh);          // cắm vũ khí vào lòng bàn tay phải (weaponSocket)
//   w.setState('run');             // 'idle' | 'run' | 'attack' | 'hit'
//   w.update(delta);               // gọi mỗi frame (giây)
//
// Hierarchy (pivot đặt ĐÚNG khớp nối ⇒ xoay FK tự nhiên):
//   root → pelvis → torso → head(+hair) · leftArm/rightArm(+shoulderArmor phải +weaponSocket) ·
//          belt(+vạt vải trước +vạt da hông) · leftLeg/rightLeg(đùi→bắp(ủng)→bàn chân)
import * as THREE from 'three';

// ── Bảng màu (bám ảnh thiết kế: chiến binh ngực trần, đai đỏ nâu, vạt sau xanh-xám) ──────────
const PAL = {
  skin:       '#EFA576', skinShadow: '#C9713F',    // da ấm + khối bóng (múi/lưng)
  hair:       '#2B2621', eye: '#241C15',           // tóc nâu-đen · mắt
  strap:      '#5C4030',                            // đai da chéo ngực
  sash:       '#6E3529', sashDark: '#5A2A20',       // đai lưng vải đỏ-nâu quấn eo
  skirtBack:  '#5A6A77', skirtBackHi: '#6E7E8A',    // vạt vải xanh-xám sau lưng (đặc trưng ảnh)
  skirtSide:  '#3E2C23',                            // vạt da hông
  wraps:      '#D6DAD2', wrapsDark: '#A8ADA4',      // băng quấn cẳng tay
  glove:      '#1D232B',                            // găng hở ngón (navy đậm)
  pants:      '#7C7168', pantsDark: '#5E554D',      // quần thụng taupe + gấu
  kneePad:    '#5A3A2A',                            // giáp gối da
  cloth:      '#D9D3C5',                            // vạt vải kem buông trước
  boots:      '#3A241C',                            // ủng da nâu đậm
  metal:      '#8A8F98',                            // khoá đai / đinh tán
};

// Suy màu ĐẬM/NHẠT hơn từ 1 màu (f<1 tối đi) — dùng cho bóng DA theo tông da người chơi chọn.
function shadeHex(c, f) {
  const n = (typeof c === 'string') ? parseInt(c.replace('#', ''), 16) : (c | 0);
  const r = Math.min(255, ((n >> 16) & 255) * f) | 0;
  const g = Math.min(255, ((n >> 8) & 255) * f) | 0;
  const b = Math.min(255, (n & 255) * f) | 0;
  return (r << 16) | (g << 8) | b;
}

// Palette theo NGOẠI HÌNH người chơi: chỉ DA + TÓC tuỳ biến (theo yêu cầu: giới tính + da + tóc);
// còn lại (đai/quần/ủng/vải) giữ tông art-directed cố định. gender đổi silhouette thân trên + kiểu tóc.
function palFromAppearance(ap = {}) {
  const skin = ap.skin != null ? ap.skin : PAL.skin;
  return Object.assign({}, PAL, {
    skin,
    skinShadow: shadeHex(ap.skin != null ? ap.skin : 0xEFA576, 0.80),
    hair: ap.hairColor != null ? ap.hairColor : PAL.hair,
  });
}

// Material dùng chung theo màu (flatShading) — tiết kiệm, giữ look faceted đồng nhất.
const _matCache = new Map();
function mat(color, { rough = 0.85, metal = 0.0 } = {}) {
  const key = `${typeof color === 'number' ? '#' + (color >>> 0).toString(16) : color}|${rough}|${metal}`;
  let m = _matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: rough, metalness: metal, flatShading: true });
    _matCache.set(key, m);
  }
  return m;
}

// Hộp faceted: box (có thể vát nhẹ bằng cách bo scale) đặt tại (x,y,z), tuỳ chọn xoay + đổ bóng.
function fbox(w, h, d, color, x = 0, y = 0, z = 0, opts = {}) {
  const geo = new THREE.BoxGeometry(w, h, d, opts.seg || 1, opts.seg || 1, opts.seg || 1);
  const m = new THREE.Mesh(geo, opts.mat || mat(color, opts));
  m.position.set(x, y, z);
  if (opts.rot) m.rotation.set(opts.rot[0] || 0, opts.rot[1] || 0, opts.rot[2] || 0);
  m.castShadow = true; m.receiveShadow = true;
  if (opts.name) m.name = opts.name;
  return m;
}
// Group có pivot đặt tại (x,y,z) — khớp nối.
function joint(name, x = 0, y = 0, z = 0) {
  const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); return g;
}

// AABB dọc (min/max Y) của một object trong hệ toạ độ CỦA CHÍNH NÓ — để tự canh cỡ + chạm đất.
// Không cần THREE.Box3: gấp 8 đỉnh boundingBox mỗi mesh qua ma trận (tương đối so với `obj`).
function localYRange(obj) {
  obj.updateWorldMatrix(true, true);
  const inv = obj.matrixWorld.clone().invert();
  let minY = Infinity, maxY = -Infinity;
  const v = new THREE.Vector3();
  obj.traverse((o) => {
    if (!o.isMesh || !o.geometry) return;
    const g = o.geometry; if (!g.boundingBox) g.computeBoundingBox();
    const bb = g.boundingBox; if (!bb) return;
    for (let i = 0; i < 8; i++) {
      v.set(i & 1 ? bb.max.x : bb.min.x, i & 2 ? bb.max.y : bb.min.y, i & 4 ? bb.max.z : bb.min.z);
      v.applyMatrix4(o.matrixWorld).applyMatrix4(inv);
      if (v.y < minY) minY = v.y; if (v.y > maxY) maxY = v.y;
    }
  });
  return { minY, maxY };
}

// ── Bộ phận: TAY (đối xứng qua `side`: -1 = trái, +1 = phải) ──────────────────
// Trả về { arm, elbow, hand } — `arm` là pivot VAI (gắn vào torso), `elbow` pivot khuỷu.
// Ảnh: VAI TRẦN (không giáp vai), bắp tay cơ bắp, cẳng tay quấn băng trắng, tay găng navy hở ngón.
function buildArm(side, P) {
  const upperLen = 0.42, foreLen = 0.40, armW = 0.24;
  const arm = joint(side < 0 ? 'leftArm' : 'rightArm', side * 0.44, 0.47, 0); // pivot ở vai (hạ xuống ngang vai thân, hết "vai cao hơn thân")
  // Khối đỉnh vai (che khe vai↔thân) — GOM group để giáp tay/thân ẨN khi mặc (setArmorOcclusion → slimArms).
  // ĐÃ BỎ "múi chuột"/khối bắp tay trước để tay phẳng, mượt (theo feedback).
  const shoulder = new THREE.Group(); shoulder.name = 'shoulderSkin'; arm.add(shoulder);
  shoulder.add(fbox(armW + 0.04, 0.16, armW + 0.04, P.skin, 0, 0.04, 0)); // đỉnh vai (phẳng, cùng tông da)
  arm.add(fbox(armW, upperLen, armW, P.skin, 0, -upperLen / 2, 0, { name: 'upperArm' })); // bắp tay (nền, giáp phủ)
  arm.userData.shoulder = shoulder;
  // Khuỷu → cẳng tay (da) + bàn tay. Fix "khối trồng khối" (2026-09-18): cẳng tay LIỀN CỠ với bắp tay
  // (bỏ thu nhỏ ×0.9 tạo bậc ở khuỷu) + thêm khối KHUỶU bắc cầu để tay liền mạch, không còn xếp tầng.
  const elbow = joint('elbow', 0, -upperLen, 0);
  elbow.add(fbox(armW * 1.03, 0.14, armW * 1.03, P.skin, 0, 0, 0, { name: 'elbowJoint' })); // khối khuỷu (bắc cầu upper↔fore)
  elbow.add(fbox(armW, foreLen, armW, P.skin, 0, -foreLen / 2, 0, { name: 'forearm' }));     // cẳng tay liền cỡ bắp tay
  // GOM group để giáp cẳng tay ẨN cổ tay khi mặc (setArmorOcclusion → slimArms). Chỉ còn 1 vòng CỔ TAY
  // (thay 3 vòng băng xếp tầng cũ) — hết cảm giác "khối trồng khối" ở cẳng tay.
  const wraps = new THREE.Group(); wraps.name = 'forearmWraps'; elbow.add(wraps);
  wraps.add(fbox(armW * 1.05, 0.11, armW * 1.05, PAL.wraps, 0, -foreLen + 0.05, 0));         // vòng băng cổ tay
  elbow.userData.wraps = wraps;
  const hand = joint('hand', 0, -foreLen - 0.02, 0);
  hand.add(fbox(armW * 0.96, 0.18, armW * 1.05, PAL.glove, 0, -0.08, 0, { name: 'hand' }));
  elbow.add(hand);
  arm.add(elbow);
  return { arm, elbow, hand };
}

// ── Bộ phận: CHÂN (đùi quần thụng → GIÁP GỐI → ủng cao → bàn chân) ─────────────
function buildLeg(side) {
  const thighLen = 0.5, shinLen = 0.42, legW = 0.28;
  const leg = joint(side < 0 ? 'leftLeg' : 'rightLeg', side * 0.2, -0.06, 0); // pivot hông
  leg.add(fbox(legW, thighLen * 0.82, legW, PAL.pants, 0, -thighLen * 0.41, 0, { name: 'thigh' }));  // đùi quần thụng
  leg.add(fbox(legW * 1.06, 0.14, legW * 1.06, PAL.pantsDark, 0, -thighLen * 0.86, 0));               // gấu quần (thắt lại)
  const knee = joint('knee', 0, -thighLen, 0);
  // Giáp gối da + đinh (cosmetic) — GOM group để ốp giáp chân (Greaves) ẨN khi mặc (slimLegs).
  const kneeCos = new THREE.Group(); kneeCos.name = 'kneeCos'; knee.add(kneeCos);
  kneeCos.add(fbox(legW * 0.98, 0.16, legW * 1.04, PAL.kneePad, 0, -0.02, 0.02));                     // giáp gối da
  kneeCos.add(fbox(0.06, 0.06, 0.05, PAL.metal, side * 0.11, -0.02, legW * 0.52));                    // đinh giáp gối
  knee.userData.kneeCos = kneeCos;
  // Ủng/cẳng chân: kéo dài PHỦ QUA khớp gối (đỉnh +0.03 trên pivot) và chớm khớp cổ chân (đáy -0.43),
  // để khi GẬP GỐI không hở khe ở đầu gối (trước đây đỉnh ống ở -0.08 dưới pivot ⇒ tách khối khi nhấc chân).
  knee.add(fbox(legW * 0.94, 0.46, legW * 0.94, PAL.boots, 0, -0.20, 0, { name: 'shin' }));            // ống chân phủ 2 khớp
  // Khối chỏm gối (boot) ngay tại pivot — đu theo gối, luôn che khe hở mặt trước khi gập.
  knee.add(fbox(legW * 0.9, 0.14, legW * 0.96, PAL.boots, 0, -0.02, 0.01));
  knee.add(fbox(legW * 1.0, 0.10, legW * 1.0, PAL.pantsDark, 0, -shinLen - 0.06, 0));                 // viền cổ ủng
  const foot = joint('foot', 0, -shinLen, 0);
  foot.add(fbox(legW, 0.16, legW + 0.18, PAL.boots, 0, -0.10, 0.08, { name: 'foot' }));               // bàn chân nhô trước
  knee.add(foot);
  leg.add(knee);
  return { leg, knee, foot };
}

// ── TÓC theo giới tính + kiểu (voxel, gom group để mũ giáp ẨN được). 3 kiểu nam / 3 kiểu nữ.
// style = index kiểu tóc (lấy modulo theo số kiểu của giới tính) — UI tạo nhân vật gửi 0..n-1.
function buildHair(hair, gender, style, hw, color) {
  const add = (w, h, d, x, y, z, r) => hair.add(fbox(w, h, d, color, x, y, z, r != null ? { rot: [r * 0.5, 0, r] } : {}));
  const addX = (w, h, d, x, y, z, rx) => hair.add(fbox(w, h, d, color, x, y, z, { rot: [rx, 0, 0] })); // chỉ ngả trục X
  // VỎ TÓC LIỀN KHỐI — CHỒNG NHAU nên nối liền, ôm khít đầu. TÁCH theo giới tính (fix 2026-09-18: vỏ
  // dùng-chung cũ có gáy DÀI buông xuống + 2 bên dài che tai ⇒ nam trông như tóc nữ/bob).
  //  • shellF (nữ): ôm đầy, gáy dài buông tới cổ, thái dương dài — nền cho các kiểu nữ.
  //  • shellM (nam): CẮT CUA — chỏm mỏng, gáy fade DỪNG CAO (không buông), 2 bên NGẮN trên tai, chân
  //    tóc trước cao & gọn ⇒ silhouette nam tính rõ, không còn khối tóc trùm như nữ.
  const shellF = () => {
    add(hw + 0.06, 0.22, hw + 0.06, 0, 0.45, -0.02);                                    // đỉnh (crown)
    add(hw + 0.06, 0.46, 0.14, 0, 0.24, -hw * 0.50);                                    // gáy sau dài (nối crown → cổ)
    for (const sx of [-1, 1]) add(0.11, 0.44, hw * 0.95, sx * (hw * 0.53), 0.22, -0.02); // 2 bên thái dương dài
    add(hw * 0.98, 0.14, 0.10, 0, 0.38, hw * 0.48);                                     // mái trước (bangs) ôm trán
  };
  const shellM = () => {
    add(hw + 0.05, 0.18, hw + 0.05, 0, 0.47, -0.02);                                    // chỏm mỏng ôm đỉnh
    add(hw + 0.02, 0.22, 0.12, 0, 0.40, -hw * 0.50);                                    // gáy NGẮN — fade dừng cao (không buông xuống cổ)
    for (const sx of [-1, 1]) add(0.09, 0.24, hw * 0.9, sx * (hw * 0.54), 0.40, -0.02);  // 2 bên NGẮN, trên tai
    add(hw * 0.96, 0.11, 0.09, 0, 0.44, hw * 0.48);                                     // chân tóc trước cao & gọn
  };
  const s = ((style % 3) + 3) % 3;
  if (gender === 'female') {
    shellF();
    if (s === 0) {          // Dài thẳng: buông dài sau lưng + 2 lọn dài trước vai
      add(hw + 0.02, 0.95, 0.15, 0, -0.20, -hw * 0.52);                                 // suối tóc sau lưng
      for (const sx of [-1, 1]) add(0.13, 0.80, hw * 0.9, sx * (hw * 0.56), -0.16, -0.02); // 2 lọn dài 2 bên
    } else if (s === 1) {   // Đuôi ngựa: búi cao sau đầu + đuôi buông THẲNG ra sau (chỉ ngả trục X)
      add(0.22, 0.20, 0.24, 0, 0.42, -hw * 0.52);                                       // búi (nối gáy)
      addX(0.16, 0.42, 0.16, 0, 0.06, -hw * 0.74, 0.30);                                // đoạn trên đuôi (ngả ra sau)
      addX(0.14, 0.46, 0.14, 0, -0.32, -hw * 0.90, 0.10);                               // đoạn dưới đuôi (gần thẳng)
    } else {                // Bob ngang cằm: 2 bên dài tới cằm
      for (const sx of [-1, 1]) add(0.15, 0.40, hw * 1.0, sx * (hw * 0.55), -0.08, -0.01);
    }
  } else {
    shellM();               // nền CẮT CUA nam tính cho cả 3 kiểu nam
    if (s === 0) {          // Gai: cắm gai lên đỉnh vỏ tóc (nối liền crown)
      const spikes = [[-0.14, 0.58, 0.02, -0.30], [-0.05, 0.62, 0.0, -0.10], [0.05, 0.63, -0.02, 0.10], [0.14, 0.58, 0.0, 0.30], [-0.02, 0.58, -0.16, -0.4], [0.08, 0.56, -0.16, 0.4]];
      for (const [x, y, z, r] of spikes) add(0.11, 0.22, 0.11, x, y, z, r);
    } else if (s === 1) {   // Cua gọn: chỉ vỏ tóc (đã ngắn/ôm) — không thêm gì
      /* shellM là đủ */
    } else {                // Vuốt ngược: gờ tóc vuốt cao ra sau trên đỉnh
      add(hw * 0.9, 0.16, hw * 0.85, 0, 0.55, -0.12, -0.18);
    }
  }
}

// ── Đầu + mặt (mắt, lông mày) + tóc theo giới tính/kiểu/màu ───────────────────
function buildHead(P, gender, style) {
  const head = joint('head', 0, 0.61, 0); // pivot cổ (hạ từ 0.72 → sát vai, khớp cổ ngắn — fix 2026-09-18)
  const hw = 0.42;
  head.add(fbox(hw, 0.42, hw, P.skin, 0, 0.24, 0, { name: 'face' }));
  // (ĐÃ BỎ khối hàm/cằm nhô ra trước — theo feedback, trông như khối chữ nhật thừa ở cằm.)
  // Mặt: lông mày (màu tóc) + mắt. Nữ: lông mày mảnh hơn.
  const browH = gender === 'female' ? 0.035 : 0.05;
  for (const sx of [-1, 1]) {
    head.add(fbox(0.13, browH, 0.05, P.hair, sx * 0.10, 0.30, hw * 0.5)); // lông mày
    head.add(fbox(0.09, 0.08, 0.04, PAL.eye, sx * 0.10, 0.22, hw * 0.51)); // mắt
  }
  // GOM tóc vào 1 group để mũ giáp có thể ẨN khi đội (setArmorOcclusion → hideHair).
  const hair = new THREE.Group(); hair.name = 'hairGroup'; head.add(hair);
  buildHair(hair, gender, style | 0, hw, P.hair);
  head.userData.hair = hair;
  return head;
}

// ── PHỤ KIỆN THEO LỚP (class cosmetic) ───────────────────────────────────────
// Đặc điểm nhận diện gắn lên nhân vật khi CHỌN LỚP (LL-CH-008, người dùng 2026-09-18). Bắt đầu với
// Heavy Gun (khoá `warrior`): NGẬM XÌ GÀ ở khoé miệng. Trả về Group để gắn vào ĐẦU (đu + co theo đầu);
// null nếu lớp chưa có phụ kiện. Thêm lớp khác: nối thêm nhánh dưới.
function buildClassCosmetic(classKey) {
  const hw = 0.42;
  if (classKey === 'warrior') { // Heavy Gun — ngậm xì gà
    const g = new THREE.Group(); g.name = 'classCosmetic';
    const cig = new THREE.Group();
    cig.position.set(0.12, 0.13, hw * 0.5);   // khoé miệng phải, ngay mặt trước
    cig.rotation.set(-0.14, -0.28, 0);        // chĩa ra trước, chếch xuống + lệch ngoài nhẹ
    cig.add(fbox(0.052, 0.052, 0.024, 0x2a1a10, 0, 0, -0.02));  // đầu ngậm (sẫm, trong miệng)
    cig.add(fbox(0.05, 0.05, 0.22, 0x5b3b22, 0, 0, 0.10));      // thân xì gà nâu (dài ra trước theo z)
    cig.add(fbox(0.052, 0.052, 0.03, 0x8a8a80, 0, 0, 0.205));   // tàn tro xám ở chóp
    // Đầu cháy: ember cam PHÁT SÁNG (emissive — toonify là no-op nên giữ nguyên).
    const ember = fbox(0.044, 0.044, 0.024, 0xff6a1e, 0, 0, 0.235);
    ember.material = new THREE.MeshStandardMaterial({ color: 0xff6a1e, emissive: 0xff4a10, emissiveIntensity: 1.6, roughness: 0.5, flatShading: true });
    cig.add(ember);
    g.add(cig);

    // ── KHÓI XÌ GÀ ── pool puff (khối xám mờ, MeshBasic không bị toon) bay LÊN từ đầu cháy + trôi NGƯỢC
    // hướng di chuyển (drift −Z head-local = sau lưng; mạnh theo `_moveSpeed`). Cập nhật ở _updateSmoke.
    const origin = new THREE.Vector3(0.056, 0.163, 0.434);     // vị trí đầu cháy trong khung ĐẦU (đã tính từ cig)
    const puffs = [];
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xcbcbcb, transparent: true, opacity: 0, depthWrite: false }));
      m.renderOrder = 6; m.castShadow = false; m.receiveShadow = false; m.scale.setScalar(0.001);
      m.position.copy(origin);           // khởi đầu ngay đầu cháy (không phải gốc đầu)
      g.add(m);
      puffs.push({ mesh: m, maxLife: 1.2 + Math.random() * 0.7, life: Math.random() * 1.6, seed: Math.random() * 6.28, t: 0 });
    }
    g.userData.smoke = { origin, puffs };
    return g;
  }
  return null;
}

// ── AnimationController: state machine + kinematics bằng Math.sin ─────────────
class AnimController {
  constructor(rig) {
    this.rig = rig;              // { pelvis, torso, head, la, ra, ll, rl } (joints + sub-joints)
    this.state = 'idle';
    this.t = 0;                  // đồng hồ state hiện tại
    this.attackT = 0;           // 0 = không chém; >0 = đang trong cú chém (giây còn lại)
    this.attackDur = 0.55;
    this.hitT = 0; this.hitDur = 0.32;
    this.runPhase = 0;          // pha bước chân — tiến theo TỐC ĐỘ THẬT (nhanh hơn khi Lên Nòng)
    this.speedN = 1;            // tốc độ chuẩn hoá (1 = MOVE_SPEED); adapter set trước update
    this.pose = 'none';         // tư thế cầm 2 tay theo vũ khí ('heavygun' = ôm súng nặng); 'none' = tay buông/vung
    // Idle "kiểm tra & nạp đạn" (Heavy Gun): đứng yên đủ lâu ⇒ diễn 1 lượt soi súng + thao tác băng đạn.
    this.idleAcc = 0; this.reloadT = 0; this.reloadMean = 20; this.reloadDur = 2.8; // idle → NGẪU NHIÊN soi/nạp đạn (xác suất Poisson, TB ~20s — không mốc cố định)
  }
  set(state) {
    if (state === 'attack') { this.attackT = this.attackDur; return; } // chém là ONE-SHOT, không đổi base state
    if (state === 'hit') { this.hitT = this.hitDur; return; }
    if (this.state !== state) { this.state = state; this.t = 0; }
  }
  update(dt) {
    this.t += dt;
    const r = this.rig, t = this.t;
    // reset các khớp về 0 mỗi frame rồi cộng dồn dáng (base + overlay)
    const zero = (j) => j && j.rotation.set(0, 0, 0);
    [r.torso, r.head, r.la.arm, r.la.elbow, r.ra.arm, r.ra.elbow, r.ll.leg, r.ll.knee, r.rl.leg, r.rl.knee].forEach(zero);
    let hipY = 0, hipRotZ = 0, hipRotY = 0;

    if (this.state === 'run') {
      // ── CHẠY: chân/tay ngược pha, thân lắc + nhấp nhô (Minecraft Dungeons) ──
      // NHỊP bước tiến theo tốc độ thật: chạy nhanh (Lên Nòng) ⇒ chân sải nhanh hơn, không trượt chân.
      this.runPhase += 9 * this.speedN * dt;
      const amp = 0.85, s = Math.sin(this.runPhase), c = Math.cos(this.runPhase);
      // Chân đùi: rotation.x > 0 ⇒ bàn chân ĐƯA RA SAU (-z). s>0 ⇒ chân TRÁI ra sau, chân PHẢI ra trước.
      r.ll.leg.rotation.x = s * amp;  r.rl.leg.rotation.x = -s * amp;
      // GẬP GỐI đúng pha: gập khi chân ở phía SAU và nhấc lên (đá gót ra sau) — chân trái ra sau khi s>0,
      // chân phải ra sau khi s<0. Trước đây gập ngược pha (khi chân ở TRƯỚC) nên nhìn như ĐI LÙI.
      r.ll.knee.rotation.x = Math.max(0, s) * 1.0;  r.rl.knee.rotation.x = Math.max(0, -s) * 1.0;
      // Tay vung NGƯỢC chân cùng bên (chân trái sau ⇒ tay trái trước): tay trái = -s, tay phải = +s.
      r.la.arm.rotation.x = -s * amp * 0.8;  r.ra.arm.rotation.x = s * amp * 0.8;
      r.la.elbow.rotation.x = -0.4 - Math.max(0, s) * 0.4;  r.ra.elbow.rotation.x = -0.4 - Math.max(0, -s) * 0.4;
      hipY = Math.abs(c) * 0.06;                 // nhấp nhô 2 lần/chu kỳ
      hipRotZ = s * 0.05; r.torso.rotation.y = s * 0.12; r.torso.rotation.x = 0.08; // lắc lư + chồm nhẹ
    } else {
      // ── IDLE: thở + đung đưa tay nhẹ ──
      const f = 1.7, s = Math.sin(t * f);
      hipY = s * 0.02;
      r.torso.rotation.x = s * 0.015;
      r.la.arm.rotation.z = s * 0.02;  r.ra.arm.rotation.z = -s * 0.02; // 2 tay buông SONG SONG thẳng xuống (chỉ đung đưa rất nhẹ khi thở)
      r.la.arm.rotation.x = s * 0.05;  r.ra.arm.rotation.x = -s * 0.05;
      r.la.elbow.rotation.x = -0.15;  r.ra.elbow.rotation.x = -0.15;
      r.head.rotation.y = Math.sin(t * 0.6) * 0.08; // liếc nhẹ
    }

    // ── HOLD POSE (Heavy Gun — HIP-FIRE 2 TAY) — GHI ĐÈ dáng tay của idle/run khi đang cầm súng ──
    // 'heavygun' (người dùng chốt 2026-09-21, theo spec grip chuẩn): BẮN HÔNG 2 TAY — tay PHẢI bóp cò ở báng
    // sau, khuỷu gập ~110° ép sát hông; tay TRÁI vươn RA TRƯỚC nắm tay cầm trên/ốp lót; nòng chĩa THẲNG RA
    // TRƯỚC (cùng hướng mặt) hơi CHÚI ~15°, thân súng ngang sát bụng. Đo trực tiếp IN-GAME (camera top-down)
    // qua hook __pose+__setHold rồi bake. LAUNCHER_HOLD = forward-chúi 15° + offset x/z ra hông-trước.
    if (this.pose === 'heavygun') {
      const b = Math.sin(t * 1.6) * 0.02;                          // thở rất nhẹ (đỡ tượng)
      r.ra.arm.rotation.set(0.15 + b, 0, -0.35);                   // vai phải: khuỷu gập đưa báng/cò về hông phải (bóp cò)
      r.ra.elbow.rotation.x = -1.30;                               // khuỷu ~110° ép sát thân chịu giật
      r.la.arm.rotation.set(-1.08 + b, 0.28, 0.55);                // tay trái vươn ra trước và qua phải, ôm chắc thân súng
      r.la.elbow.rotation.x = -0.22;                               // khuỷu trái đỡ thân/ốp súng
      r.torso.rotation.y = 0.05;                                   // thân hướng theo súng
      r.head.rotation.y = 0.0;                                     // đầu nhìn thẳng theo nòng

      // ── IDLE: KIỂM TRA & NẠP ĐẠN ── TẠM TẮT (2026-09-21): gesture cũ (soi nòng) làm dáng hip-fire trông
      // hỏng lúc bị bắt frame ⇒ user chê. Giữ code, bật lại sau khi làm gesture khớp dáng mới ("Kiểm tra vũ
      // khí"). Đặt RELOAD_ENABLED=true để bật. Mỗi frame idle ROLL xác suất (Poisson, TB ~reloadMean giây).
      const RELOAD_ENABLED = false;
      if (RELOAD_ENABLED && this.state === 'idle') {
        this.idleAcc += dt;
        if (this.reloadT <= 0 && this.idleAcc > 2.5 && Math.random() < dt / this.reloadMean) { this.reloadT = this.reloadDur; this.idleAcc = 0; }
      } else { this.idleAcc = 0; this.reloadT = 0; }
      if (this.reloadT > 0) {
        this.reloadT = Math.max(0, this.reloadT - dt);
        const p = 1 - this.reloadT / this.reloadDur;               // 0→1 tiến trình
        const env = Math.sin(Math.min(1, p) * Math.PI);           // 0→1→0 (nâng rồi hạ)
        r.ra.elbow.rotation.x -= env * 0.75;                      // gập khuỷu phải ⇒ nòng hếch lên trước mặt (soi)
        r.ra.arm.rotation.x -= env * 0.22;
        r.head.rotation.x += env * 0.38;                          // cúi đầu nhìn súng
        r.torso.rotation.x += env * 0.12;
        const mag = Math.sin(p * Math.PI * 3) * env;              // 3 nhịp rút/đẩy băng đạn
        r.la.arm.rotation.x += mag * 0.55;
        r.la.elbow.rotation.x += Math.abs(mag) * 0.7 - 0.25;
      }
    }

    // ── ATTACK overlay (one-shot): tay PHẢI chém bổ + xoay thân, có decay nặng ──
    if (this.attackT > 0) {
      this.attackT = Math.max(0, this.attackT - dt);
      const p = 1 - this.attackT / this.attackDur;    // 0→1
      // windup nhanh (0→0.3) giơ lên sau lưng; strike (0.3→0.55) bổ xuống; decay (0.55→1) rung nhẹ
      let swing;
      if (p < 0.3) swing = -2.4 * (p / 0.3);                    // giơ ra sau/lên
      else if (p < 0.55) swing = -2.4 + 4.2 * ((p - 0.3) / 0.25); // bổ xuống mạnh
      else swing = 1.8 - 1.8 * ((p - 0.55) / 0.45) + Math.sin((p - 0.55) * 40) * 0.12 * (1 - p); // giữ + rung tắt dần
      r.ra.arm.rotation.x = swing;
      r.ra.elbow.rotation.x = -0.3 - Math.max(0, -swing) * 0.5;
      const twist = Math.sin(Math.min(1, p / 0.55) * Math.PI) * 0.5; // xoay thân trên theo cú chém
      r.torso.rotation.y = -twist; r.torso.rotation.x += twist * 0.25;
      r.la.arm.rotation.x = twist * 0.6; // tay trái giữ thăng bằng
    }

    // ── HIT overlay (one-shot): giật ngửa nhanh ──
    if (this.hitT > 0) {
      this.hitT = Math.max(0, this.hitT - dt);
      const k = Math.sin((1 - this.hitT / this.hitDur) * Math.PI); // 0→1→0
      r.torso.rotation.x -= 0.4 * k; r.head.rotation.x -= 0.25 * k;
      r.la.arm.rotation.x -= 0.6 * k; r.ra.arm.rotation.x -= 0.6 * k;
      hipRotZ += k * 0.08;
    }

    // Áp hông (nhịp thở/nhấp nhô + lắc)
    r.pelvis.position.y = r._pelvisY + hipY;
    r.pelvis.rotation.z = hipRotZ; r.pelvis.rotation.y = hipRotY;
  }
}

export class VoxelWarrior {
  constructor(opts = {}) {
    const root = new THREE.Group(); root.name = 'VoxelWarrior';
    this.root = root;

    // NGOẠI HÌNH người chơi: giới tính CHỐT lúc tạo (không đổi khi chơi) + màu DA + kiểu/màu TÓC.
    const ap = opts.appearance || {};
    const gender = ap.gender === 'female' ? 'female' : 'male';
    const P = palFromAppearance(ap);
    const hairStyle = ap.hair | 0;
    this.gender = gender;

    // ── TUỲ CHỈNH VÓC DÁNG (bộ gọn, người dùng chốt 2026-09-18) ────────────────
    // Model VoxelWarrior mặc định tỉ lệ cố định; các slider dưới chỉ NHÂN thêm quanh 1.0 nên tắt
    // (=mặc định) thì hình y hệt bản cũ. Khoá theo BODY_SLIDERS (shared/appearance.js) để client/server
    // không lệch. head/fat tách khỏi height ⇒ đổi đầu/mập KHÔNG đổi tổng chiều cao (chỉ 'height' đổi).
    const numAp = (v, d) => (Number.isFinite(+v) ? +v : d);
    const headScale = Math.max(0.70, Math.min(1.50, numAp(ap.headScale, 1)));
    const fatMul    = Math.max(0.80, Math.min(1.40, numAp(ap.fat, 1)));
    const heightMul = Math.max(0.85, Math.min(1.15, numAp(ap.height, 1)));
    const bustAmt   = gender === 'female' ? Math.max(0, Math.min(1.8, numAp(ap.bust, 0.45))) : 0;
    const buttAmt   = Math.max(0, Math.min(1, numAp(ap.butt, 0.3)));

    // `body` — nhóm trong cùng để CANH CỠ + CHẠM ĐẤT (root để dành cho game đặt vị trí/ngã khi chết)
    const body = new THREE.Group(); body.name = 'body'; root.add(body);
    this.body = body;

    // pelvis (hông) — gốc mọi khớp; đặt cao để chân chạm y=0
    const pelvisY = 1.0;
    const pelvis = joint('pelvis', 0, pelvisY, 0); body.add(pelvis);
    pelvis.add(fbox(0.5, 0.24, 0.3, PAL.pants, 0, -0.02, 0, { name: 'hips' }));
    // Mông (slider 'butt') — khối vải sau hông, phồng dần theo giá trị; 0 ⇒ không thêm gì.
    if (buttAmt > 0.02) pelvis.add(fbox(0.36 + buttAmt * 0.12, 0.20 + buttAmt * 0.06, 0.14 + buttAmt * 0.20,
      PAL.pants, 0, -0.10, -0.11 - buttAmt * 0.07, { name: 'butt' }));

    // TORSO — gắn trên pelvis. Nền thân = DA (theo màu người chơi). RIÊNG chi tiết thân trên đổi theo
    // GIỚI TÍNH: nam = ngực trần cơ bắp (cơ ngực + 6 múi), nữ = áo ngực + vai hẹp hơn.
    const torso = joint('torso', 0, 0.14, 0); pelvis.add(torso);
    // Thân nền: nữ hẹp ngang hơn (0.56) cho dáng thon; nam giữ 0.62.
    const chestW = gender === 'female' ? 0.56 : 0.62;
    torso.add(fbox(chestW, 0.46, 0.34, P.skin, 0, 0.32, 0, { name: 'chest' }));            // thân trên (da) — GIỮ làm nền
    // CỔ: cột da nối vai ↔ đầu. Rút NGẮN ~nửa (0.24→0.13) + hạ y cho sát vai (fix "cổ khá cao" 2026-09-18);
    // đầu cũng hạ pivot 0.72→0.61 (buildHead) để mặt chạm đúng đỉnh cổ, không hở. Nữ cổ thanh hơn.
    torso.add(fbox(gender === 'female' ? 0.17 : 0.20, 0.13, gender === 'female' ? 0.17 : 0.20, P.skin, 0, 0.575, -0.01, { name: 'neck' }));
    // Chi tiết thân trên + đai — GOM group để giáp ngực (cuirass) ẨN khi mặc (setArmorOcclusion → slimTorso).
    const torsoCos = new THREE.Group(); torsoCos.name = 'torsoCosmetic'; torso.add(torsoCos);
    const shoulderW = gender === 'female' ? 0.58 : 0.66;                                   // nữ vai hẹp hơn
    torsoCos.add(fbox(shoulderW, 0.14, 0.36, P.skinShadow, 0, 0.50, 0));                   // vai/xương quai (da bóng)
    if (gender === 'female') {
      // Áo ngực (2 cup) + dây — thay cho ngực trần cơ bắp. Cup phồng theo slider 'bust' (0.45 ≈ hiện tại).
      const bs = 0.70 + bustAmt * 0.68;                                                    // 0.45→1.01 · 1.8→1.92 · 0→0.70
      torsoCos.add(fbox(0.50, 0.20, 0.12, PAL.sash, 0, 0.34, 0.15, { ch: 0 }));            // dải áo ngực ngang
      for (const sx of [-1, 1]) torsoCos.add(fbox(0.22 * bs, 0.18 * bs, 0.10 * bs, PAL.sash, sx * 0.13, 0.36, 0.15 + 0.03 * bs, { rot: [0.15, 0, -sx * 0.12] })); // cup (phồng theo bust)
      for (const sx of [-1, 1]) torsoCos.add(fbox(0.05, 0.24, 0.05, PAL.sashDark, sx * 0.16, 0.50, 0.14)); // dây vai
      // Eo thon: khối bụng thon nhẹ + đai lưng mảnh
      torsoCos.add(fbox(0.46, 0.30, 0.30, P.skin, 0, 0.06, 0));                            // bụng thon (da)
      torsoCos.add(fbox(0.56, 0.12, 0.35, PAL.sash, 0, -0.06, 0, { name: 'sash' }));       // đai lưng
    } else {
      // Nam: NGỰC PHẲNG (đã BỎ cơ ngực + 6 múi bụng theo feedback) — chỉ giữ đai chéo + đai lưng làm outfit.
      torsoCos.add(fbox(0.13, 0.82, 0.11, PAL.strap, 0.02, 0.30, 0.17, { rot: [0, 0, 0.55] })); // đai chéo
      torsoCos.add(fbox(0.11, 0.11, 0.11, PAL.metal, -0.17, 0.46, 0.18));                        // khoá vai
      torsoCos.add(fbox(0.64, 0.20, 0.37, PAL.sash, 0, 0.02, 0, { name: 'sash' }));              // đai lưng
      torsoCos.add(fbox(0.66, 0.05, 0.38, PAL.sashDark, 0, -0.06, 0));
      torsoCos.add(fbox(0.10, 0.16, 0.06, PAL.sashDark, 0.16, 0.02, 0.19, { rot: [0, 0, 0.3] }));
    }
    this._torsoCos = torsoCos;

    // ĐẦU + tóc (theo giới tính/kiểu/màu). headScale phóng/thu nhóm đầu quanh pivot cổ (kéo theo tóc +
    // neo giáp đầu). Tổng chiều cao được canh lại ở bước fit ⇒ đầu to = chibi (thân co lại), không cao thêm.
    const head = buildHead(P, gender, hairStyle); head.scale.setScalar(headScale); torso.add(head);

    // TAY: vai trần hai bên + weaponSocket ở tay phải
    const la = buildArm(-1, P); torso.add(la.arm);
    const ra = buildArm(+1, P); torso.add(ra.arm);
    // weaponSocket ở lòng bàn tay phải — Empty để attachWeapon
    const weaponSocket = joint('weaponSocket', 0, -0.12, 0.06);
    weaponSocket.rotation.set(Math.PI * 0.5, 0, 0); // trục cầm nắm hướng ra trước
    ra.hand.add(weaponSocket);
    this.weaponSocket = weaponSocket;
    // backSocket — đeo CHÉO SAU LƯNG, gắn thẳng vào torso (KHÔNG theo tay) để vũ khí đứng yên gọn
    // gàng khi chạy thay vì vung theo nhịp tay. Dùng lúc di chuyển (xem main.js equipWeapon).
    const backSocket = joint('backSocket', -0.06, 0.44, -0.17);
    backSocket.rotation.set(0.1, 0, 2.05); // nằm chéo qua lưng, đầu chếch lên vai trái
    torso.add(backSocket);
    this.backSocket = backSocket;

    // ĐAI DA + vạt vải kem trước + vạt da hông + VẠT XANH-XÁM lớn sau lưng (gắn pelvis)
    // Cả cụm đai/váy này ẨN khi mặc giáp thân (tà giáp/tassets thay thế) — setArmorOcclusion → slimTorso.
    const belt = joint('belt', 0, -0.06, 0); pelvis.add(belt); this._belt = belt;
    belt.add(fbox(0.56, 0.14, 0.36, PAL.strap, 0, 0, 0));                 // đai da nâu
    belt.add(fbox(0.16, 0.12, 0.06, PAL.metal, 0, 0, 0.20));              // khoá đai
    belt.add(fbox(0.26, 0.52, 0.06, PAL.cloth, 0, -0.32, 0.17));          // vạt vải kem buông trước (giữa)
    belt.add(fbox(0.28, 0.10, 0.06, PAL.pantsDark, 0, -0.10, 0.18));      // nếp gấp vạt trước (bóng)
    belt.add(fbox(0.20, 0.46, 0.08, PAL.skirtSide, -0.22, -0.28, 0.04, { rot: [0, 0, 0.10] }));  // vạt da hông trái (xẻ tà)
    belt.add(fbox(0.20, 0.46, 0.08, PAL.skirtSide, 0.22, -0.28, 0.04, { rot: [0, 0, -0.10] }));  // vạt da hông phải
    // Vạt vải XANH-XÁM lớn buông sau lưng — xẻ giữa thành 2 tà (đặc trưng mặt sau)
    belt.add(fbox(0.30, 0.60, 0.07, PAL.skirtBack, -0.11, -0.34, -0.17, { rot: [0, 0, 0.06] }));
    belt.add(fbox(0.30, 0.60, 0.07, PAL.skirtBack, 0.11, -0.34, -0.17, { rot: [0, 0, -0.06] }));
    belt.add(fbox(0.24, 0.16, 0.08, PAL.skirtBackHi, 0, -0.10, -0.18));   // nẹp trên vạt sau (sáng)

    // CHÂN
    const ll = buildLeg(-1); pelvis.add(ll.leg);
    const rl = buildLeg(+1); pelvis.add(rl.leg);

    // Rig cho controller
    const rig = { pelvis, torso, head, la, ra, ll, rl, _pelvisY: pelvisY };
    this.rig = rig;
    this.anim = new AnimController(rig);

    // ── ĐIỂM NEO GIÁP (armor anchors) ────────────────────────────────────────
    // Group RỖNG đặt tại TÂM mỗi đoạn cơ thể, làm con của khớp swing tương ứng. Giáp procedural
    // (setCharacterArmor trong models/armor.js) đọc `.geometry.parameters` để biết cỡ đoạn rồi ADD
    // khối giáp vào neo này ⇒ giáp đu theo đúng khớp (vai/khuỷu/hông/gối), không xuyên/lệch khi cử động.
    // Dùng Group (KHÔNG phải Mesh) nên bản thân neo không render; chỉ mang dims + làm cha. dims ở đơn vị
    // cục bộ CHƯA scale — armor group add vào sẽ tự co theo `body.scale` như mọi khối khác.
    const anchor = (parent, w, h, d, x, y, z) => {
      const a = new THREE.Group(); a.name = 'armorAnchor'; a.position.set(x, y, z);
      a.geometry = { parameters: { width: w, height: h, depth: d } };
      parent.add(a); return a;
    };
    this.armorAnchor = {
      head:    anchor(rig.head,     0.42,  0.42, 0.42,  0,  0.24, 0),      // tâm khối mặt
      torso:   anchor(rig.torso,    0.60,  0.58, 0.35,  0,  0.26, 0),      // tâm thân (ngực→eo)
      laUpper: anchor(rig.la.arm,   0.24,  0.42, 0.24,  0, -0.21, 0),      // bắp tay trái
      raUpper: anchor(rig.ra.arm,   0.24,  0.42, 0.24,  0, -0.21, 0),      // bắp tay phải
      laFore:  anchor(rig.la.elbow, 0.216, 0.40, 0.216, 0, -0.20, 0),      // cẳng tay trái
      raFore:  anchor(rig.ra.elbow, 0.216, 0.40, 0.216, 0, -0.20, 0),      // cẳng tay phải
      llThigh: anchor(rig.ll.leg,   0.28,  0.50, 0.28,  0, -0.25, 0),      // đùi trái (kéo xuống tới khớp gối để giáp đùi chớm greave, khỏi hở khe gối khi gập)
      rlThigh: anchor(rig.rl.leg,   0.28,  0.50, 0.28,  0, -0.25, 0),      // đùi phải
      llShin:  anchor(rig.ll.knee,  0.263, 0.46, 0.263, 0, -0.20, 0),      // cẳng chân trái (phủ qua khớp gối)
      rlShin:  anchor(rig.rl.knee,  0.263, 0.46, 0.263, 0, -0.20, 0),      // cẳng chân phải
      llFoot:  anchor(rig.ll.foot,  0.28,  0.16, 0.46,  0, -0.10, 0.08),   // bàn chân trái
      rlFoot:  anchor(rig.rl.foot,  0.28,  0.16, 0.46,  0, -0.10, 0.08),   // bàn chân phải
    };

    // Bóng: nhận + đổ
    root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

    // ── CANH CỠ + CHẠM ĐẤT ──────────────────────────────────────────────────
    // Model dựng thô cao ~2.8u (chân lút dưới 0). Đo AABB thật rồi co về TARGET_HEIGHT cho
    // hợp tỉ lệ với creature in-game (thú thường cao ~1.5–1.6u; hero nhỉnh hơn chút), đồng thời
    // nâng để bàn chân chạm đúng y=0. Chỉ đụng `body` — root vẫn do game điều khiển.
    // heightMul nhân vào chiều cao đích (slider 'height'); fatMul chỉ nhân BỀ NGANG (x,z) nên đổi độ mập
    // KHÔNG đổi chiều cao. Neo giáp nằm trong `body` nên co giãn theo cùng — giáp vẫn ôm khít.
    const TARGET_HEIGHT = (opts.height || 1.75) * heightMul;
    const { minY, maxY } = localYRange(body);
    const rawH = Math.max(0.001, maxY - minY);
    const k = TARGET_HEIGHT / rawH;
    body.scale.set(k * fatMul, k, k * fatMul);
    body.position.y = -minY * k;            // đẩy điểm thấp nhất (gót chân) lên y=0 (theo scale dọc = k)
    this.totalHeight = TARGET_HEIGHT;
    // Vũ khí (dựng cho nhân vật cũ ~1u, gắn trong `body` nên bị co theo k) cần phóng lại cho
    // hợp tay VoxelWarrior. Bù theo CHIỀU CAO THÔ: rawH×hệ-số ⇒ tự đúng dù đổi TARGET_HEIGHT.
    // (0.9 cho cây súng gọn hơn tỉ lệ tuyệt đối một chút, nhìn cân.) equipWeapon sẽ áp số này.
    this.weaponScale = rawH * 0.9;
    this._dead = false; this._deadT = 0;   // trạng thái nằm/đứng (tween trong update)
    this._moveSpeed = 0;                    // tốc độ di chuyển (adapter set mỗi frame) — khói xì gà trôi ngược
  }

  // Gắn/bỏ PHỤ KIỆN THEO LỚP (vd Heavy Gan ngậm xì gà) lên đầu. Gọi lại khi đổi lớp / dựng lại model.
  setClassCosmetic(classKey) {
    if (this._classCos) { this.rig.head.remove(this._classCos); this._classCos.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material?.dispose?.(); } }); this._classCos = null; }
    const g = buildClassCosmetic(classKey);
    if (g) { g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); this.rig.head.add(g); this._classCos = g; }
  }

  // Đặt tư thế cầm 2 tay theo vũ khí ('heavygun' | 'none'). Gọi khi trang bị/đổi vũ khí.
  setHoldPose(name) { this.anim.pose = name || 'none'; }

  // Cắm vũ khí rời vào lòng bàn tay phải. Trả lại mesh cũ (nếu có) để dọn.
  attachWeapon(mesh) {
    const prev = this._weapon || null;
    if (prev) this.weaponSocket.remove(prev);
    this._weapon = mesh || null;
    if (mesh) this.weaponSocket.add(mesh);
    return prev;
  }

  setState(state) { this.anim.set(state); return this; }
  attack() { this.anim.set('attack'); return this; }   // one-shot chém
  hit() { this.anim.set('hit'); return this; }          // one-shot giật
  setDead(v) { this._dead = !!v; return this; }          // true: nằm ngửa; false: đứng dậy

  // Ẩn các chi tiết CƠ THỂ/TRANG PHỤC gốc ở vùng đang mặc giáp, để giáp không bị da/vải lòi qua.
  // Gọi bởi setCharacterArmor (models/armor.js) sau khi gắn/gỡ giáp mỗi bộ phận.
  setArmorOcclusion(cfg = {}) {
    const vis = (o, v) => { if (o) o.visible = v; };
    if ('hideHair' in cfg) vis(this.rig.head.userData.hair, !cfg.hideHair);       // đội mũ → ẩn tóc gai
    if ('slimTorso' in cfg) { vis(this._torsoCos, !cfg.slimTorso); vis(this._belt, !cfg.slimTorso); } // giáp thân → ẩn ngực trần + đai/váy
    if ('slimArms' in cfg) {                                                       // giáp tay → ẩn băng quấn + da vai (khối cam)
      vis(this.rig.la.elbow.userData.wraps, !cfg.slimArms);
      vis(this.rig.ra.elbow.userData.wraps, !cfg.slimArms);
      vis(this.rig.la.arm.userData.shoulder, !cfg.slimArms);
      vis(this.rig.ra.arm.userData.shoulder, !cfg.slimArms);
    }
    if ('slimLegs' in cfg) {                                                       // giáp chân → ẩn giáp gối da
      vis(this.rig.ll.knee.userData.kneeCos, !cfg.slimLegs);
      vis(this.rig.rl.knee.userData.kneeCos, !cfg.slimLegs);
    }
    return this;
  }
  update(delta) {
    const dt = Math.min(0.05, delta || 0);               // kẹp dt tránh giật khi tab ẩn
    // Chết: NẰM XUỐNG (ngã ngửa quanh gốc chân), sống lại thì đứng lên — bám cách character.js.
    this._deadT += (((this._dead ? 1 : 0) - this._deadT) * Math.min(dt * 7, 1));
    const d = this._deadT, lie = d <= 0 ? 0 : d >= 1 ? 1 : d * d * (3 - 2 * d);
    this.root.rotation.x = -lie * Math.PI / 2 * 0.96;
    this.anim.update(dt);
    this._updateSmoke(dt);
  }
  // Khói xì gà (chỉ Heavy Gun có `_classCos.userData.smoke`): puff bay lên + trôi NGƯỢC hướng đi.
  _updateSmoke(dt) {
    const s = this._classCos && this._classCos.userData.smoke; if (!s) return;
    const mv = Math.min(2, this._moveSpeed || 0);         // tốc độ di chuyển (đơn vị/s) — trôi mạnh hơn khi chạy
    for (const p of s.puffs) {
      p.life -= dt;
      if (p.life <= 0) {                                  // hồi sinh puff ở đầu cháy
        p.life = p.maxLife; p.t = 0;
        p.mesh.position.copy(s.origin);
        p.mesh.position.x += (Math.random() - 0.5) * 0.02;
      } else {
        p.t += dt;
        const age = 1 - p.life / p.maxLife;               // 0→1
        p.mesh.position.y += 0.19 * dt;                   // bay LÊN
        p.mesh.position.z -= mv * 0.18 * dt;              // ĐỨNG YÊN ⇒ chỉ bốc thẳng (mv=0); DI CHUYỂN ⇒ trôi NGƯỢC (−Z head = sau lưng), mạnh theo tốc độ
        p.mesh.position.x += Math.sin(p.t * 3 + p.seed) * 0.016;  // lắc ngang nhẹ
        p.mesh.scale.setScalar(0.045 + age * 0.11);       // nở dần (to hơn cho dễ thấy)
        p.mesh.material.opacity = Math.sin(age * Math.PI) * 0.45; // mờ 2 đầu, đậm giữa
      }
    }
  }
}

// ── ADAPTER: bọc VoxelWarrior thành đúng "hợp đồng" character.js để cắm thẳng vào game ──
// Trả về { root, parts, update(dt,speed), hurt, swing, playAnim, setDead, setColor, totalHeight,
// appearance, attachWeapon } — cùng chữ ký createCharacter() nên spawnLocalPlayer dùng lẫn được.
// VoxelWarrior chỉ có 4 state idle/run/attack/hit ⇒ mọi `kind` chiêu quy về overlay attack/hit.
export function createVoxelWarrior(opts = {}) {
  const w = new VoxelWarrior(opts);
  w.root.name = 'character';
  const rig = w.rig;
  // Game cắm vũ khí vào parts.rightArm.hand (Group). Khung toạ độ tay ~ character.js (tay buông
  // xuống, con của khuỷu) ⇒ tư thế HOLD dùng lại được, có thể tinh chỉnh sau.
  // parts theo ĐÚNG "hợp đồng" character.js để setCharacterArmor/anchors() dùng lại y nguyên:
  //   torso/head = neo giáp thân/mũ · leftArm.mesh/.forearm = neo bắp tay/cẳng tay (slot upperArm/forearm)
  //   leftLeg.mesh/.shin/.foot = neo đùi/cẳng chân/bàn chân. hand/pivot/elbow giữ cho vũ khí + FX.
  const A = w.armorAnchor;
  const parts = {
    torso: A.torso, head: A.head, hips: rig.pelvis,
    leftArm:  { pivot: rig.la.arm, elbow: rig.la.elbow, hand: rig.la.hand, mesh: A.laUpper, forearm: A.laFore },
    rightArm: { pivot: rig.ra.arm, elbow: rig.ra.elbow, hand: rig.ra.hand, mesh: A.raUpper, forearm: A.raFore },
    leftLeg:  { pivot: rig.ll.leg, knee: rig.ll.knee, mesh: A.llThigh, shin: A.llShin, foot: A.llFoot },
    rightLeg: { pivot: rig.rl.leg, knee: rig.rl.knee, mesh: A.rlThigh, shin: A.rlShin, foot: A.rlFoot },
  };
  let dead = false;
  const MOVE_SPEED_REF = 4.0;   // = shared/constants MOVE_SPEED: mốc để chuẩn hoá nhịp chạy
  function update(dt, speed = 0) {
    if (!dead) w.setState(speed > 0.1 ? 'run' : 'idle'); // chỉ có run/idle: hễ di chuyển ⇒ chạy
    // Nhịp bước theo tốc độ thật (đã gồm haste): chạy nhanh ⇒ chân sải nhanh khớp, không trượt.
    w.anim.speedN = Math.max(0.55, Math.min(2.2, speed / MOVE_SPEED_REF));
    w._moveSpeed = speed;                 // khói xì gà trôi ngược mạnh hơn khi chạy nhanh
    w.update(dt);
  }
  return {
    root: w.root, parts, isVoxel: true,
    update,
    hurt() { w.hit(); },
    swing() { w.attack(); },
    playAnim(kind /*, dur */) { if (kind === 'hit') w.hit(); else w.attack(); },
    setDead(v) { dead = !!v; w.setDead(v); },
    setColor() { /* bảng màu art-directed cố định — không tô theo appearance */ },
    setArmorOcclusion(cfg) { w.setArmorOcclusion(cfg); },   // ẩn chi tiết cơ thể/vải khi mặc giáp
    setClassCosmetic(key) { w.setClassCosmetic(key); },     // phụ kiện theo lớp (Heavy Gun ngậm xì gà)
    setHoldPose(name) { w.setHoldPose(name); },             // tư thế 2 tay ôm súng (heavygun) vs buông (none)
    attachWeapon(mesh) { return w.attachWeapon(mesh); },
    // main.js (equipWeapon) tự quản add/remove/dispose bằng cách cầm thẳng 1 Group để gắn vũ khí
    // vào (không gọi attachWeapon() ở trên) — CẦN là `weaponSocket`, KHÔNG phải `parts.rightArm.hand`
    // thô: khớp tay VoxelWarrior không có sẵn hướng "cầm nắm ra trước" như character.js (hand buông
    // thẳng xuống theo cẳng tay), nên `weaponSocket` đã tự xoay bù +90° quanh X cho đúng hướng. Gắn
    // trực tiếp vào `hand` (bỏ qua weaponSocket) khiến vũ khí (trục +Y tác giả) chĩa LÊN qua vai
    // thay vì cầm ra trước — bug đã thấy khi soi live (Wand of Wizard tài liệu 2026-09-16).
    weaponSocket: w.weaponSocket,
    backSocket: w.backSocket,     // equipWeapon chuyển vũ khí qua đây khi đang di chuyển (đeo lưng gọn)
    weaponScale: w.weaponScale,   // equipWeapon phóng vũ khí theo số này cho hợp cỡ VoxelWarrior
    totalHeight: w.totalHeight,
    appearance: opts.appearance || {},
  };
}

export default VoxelWarrior;
