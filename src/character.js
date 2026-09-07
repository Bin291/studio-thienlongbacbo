import * as THREE from 'three';
import { DEFAULT_APPEARANCE } from './appearance.js';

// Nhân vật ghép khối (kiểu Roblox) nhưng CÓ KHỚP THẬT:
//   đầu + cổ + ngực + bụng + tay hai đốt (cánh tay/cẳng tay) + chân hai đốt (đùi/cẳng chân).
// Cây khớp: root > hips > [chân trái, chân phải, bụng > ngực > [tay, cổ > đầu]]
// appearance: { height, legLen, torsoLen, armLen, fat, headScale, chest, bust, belly, butt,
//               skin, shirt, pants, hair, hairColor, gender, outfit }

export const STUD = 0.2;

// Tỷ lệ các đốt theo "stud" (×STUD). Tổng chiều cao vẫn = 5 stud = 1.0 như bản cũ
export const B = {
  thigh: 1.00, shin: 0.80, foot: 0.20,        // chân  = 2.00
  belly: 0.72, chest: 1.00, neck: 0.28,       // thân  = 2.00
  head: 1.00,                                 // đầu   = 1.00
  upperArm: 0.95, forearm: 0.85, hand: 0.20,  // tay   = 2.00
};
// Bề ngang / bề dày (stud)
export const W = {
  chest: 2.05, chestD: 1.00,
  belly: 1.75, bellyD: 0.92,
  neck: 0.55, neckD: 0.55,
  head: 1.88, headD: 1.00,
  arm: 0.80, armD: 0.80,
  leg: 0.84, legD: 0.90,
};

const SWING_DUR = 0.25;
const HIT_DUR = 0.3;
const FLINCH_DUR = 0.28;
function smoothstep(t) { return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t); }

export const ANIM_POSES = {
  slash:      { rightArm: -1.3, rightElbow: -0.55 },
  thrust:     { rightArm: -1.6, rightElbow: -0.15, leftArm: -0.7, leftElbow: -0.3 },
  slam:       { leftArm: -2.5, rightArm: -2.5, leftElbow: -0.1, rightElbow: -0.1, leftKnee: 0.45, rightKnee: 0.45 },
  chargeBash: { leftArm: -0.85, rightArm: -0.85, leftElbow: -1.0, rightElbow: -1.0, leftKnee: 0.3, rightKnee: 0.55 },
  guard:      { leftArm: -1.15, rightArm: -1.15, leftElbow: -1.35, rightElbow: -1.35 },
  blink:      { leftArm: 0.55, rightArm: -0.95, leftElbow: -0.1, rightElbow: -0.5, leftKnee: 0.35 },
  tear:       { rightArm: -1.5, rightElbow: -0.65, leftArm: 0.35, leftElbow: -0.2 },
  bowBig:     { leftArm: -0.9, rightArm: 0.7, rightElbow: -1.5 },
  castPoint:  { rightArm: -1.05, rightElbow: -0.15, leftArm: 0.2, leftElbow: -0.15 },
  roll:       { leftArm: -0.6, rightArm: -0.6, leftElbow: -0.9, rightElbow: -0.9, leftKnee: 0.75, rightKnee: 0.75 },
};
export const ANIM_DUR = { slash: SWING_DUR, thrust: 0.30, slam: 0.55, chargeBash: 0.38, guard: 0.4, blink: 0.28, tear: 0.34, bowBig: 0.5, castPoint: 0.32, roll: 0.32 };

function boxMesh(w, h, d, color, slot) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.85 }));
  mesh.castShadow = true; mesh.receiveShadow = true;
  mesh.userData.slot = slot;
  return mesh;
}

function buildHair(style, color, hw, hh, hd) {
  const g = new THREE.Group(); g.userData.slot = 'hair';
  const topY = hh / 2;
  const mk = (w, h, d, x, y, z) => { const m = boxMesh(w, h, d, color, 'hair'); m.position.set(x, y, z); g.add(m); };
  const cap = (t, sc = 1.04, dy = -0.03) => mk(hw * sc, hh * t, hd * sc, 0, topY + hh * dy, 0);
  const back = (h, d, y, w = 1.06) => mk(hw * w, hh * h, hd * d, 0, topY + hh * y, -hd * 0.52);
  const sides = (h, y, w = 0.24) => { for (const sx of [-1, 1]) mk(hw * w, hh * h, hd * 1.04, sx * hw * (0.5 + w * 0.12), topY + hh * y, 0); };

  switch (style) {
    case 1: cap(0.20, 1.02, -0.06); break;
    case 2:
      cap(0.26, 1.03);
      for (const dx of [-0.32, -0.16, 0, 0.16, 0.32]) mk(hw * 0.12, hh * 0.36, hd * 0.55, dx * hw, topY + hh * 0.24, 0);
      break;
    case 3:
      cap(0.42, 1.06);
      mk(hw * 1.06, hh * 0.26, hd * 0.24, 0, topY - hh * 0.28, hd * 0.45);
      sides(0.5, -0.3, 0.18);
      break;
    case 4:
      cap(0.30, 1.04);
      mk(hw * 0.52, hh * 0.26, hd * 1.04, -hw * 0.27, topY + hh * 0.19, 0);
      mk(hw * 0.46, hh * 0.22, hd * 0.22, -hw * 0.24, topY - hh * 0.20, hd * 0.45);
      break;
    case 5:
      cap(0.28, 1.03);
      mk(hw * 0.34, hh * 0.34, hd * 0.62, 0, topY + hh * 0.32, -hd * 0.06);
      break;
    case 6:
      cap(0.13, 1.02, -0.07);
      mk(hw * 0.22, hh * 0.64, hd * 1.00, 0, topY + hh * 0.28, 0);
      break;
    case 7:
      mk(hw * 1.16, hh * 0.58, hd * 1.30, 0, topY + hh * 0.12, 0);
      for (const sx of [-1, 1]) mk(hw * 0.46, hh * 0.46, hd * 1.05, sx * hw * 0.60, topY - hh * 0.02, 0);
      mk(hw * 0.9, hh * 0.34, hd * 0.5, 0, topY + hh * 0.40, -hd * 0.1);
      break;
    case 8:
      cap(0.24, 1.03);
      for (const dx of [-0.3, -0.1, 0.1, 0.3]) mk(hw * 0.18, hh * 0.30, hd * 1.35, dx * hw, topY + hh * 0.20, -hd * 0.42);
      break;
    case 9:
      cap(0.40, 1.06);
      back(1.05, 0.34, -0.60);
      sides(0.95, -0.55, 0.22);
      break;
    case 10:
      cap(0.40, 1.06);
      back(2.10, 0.32, -1.12);
      sides(1.70, -0.92, 0.22);
      break;
    case 11:
      cap(0.40, 1.06);
      mk(hw * 1.06, hh * 0.24, hd * 0.24, 0, topY - hh * 0.26, hd * 0.45);
      for (const sx of [-1, 1]) {
        mk(hw * 0.30, hh * 0.22, hd * 0.30, sx * hw * 0.60, topY - hh * 0.42, -hd * 0.05);
        mk(hw * 0.24, hh * 0.95, hd * 0.24, sx * hw * 0.62, topY - hh * 1.00, -hd * 0.05);
      }
      break;
    case 12:
      cap(0.36, 1.05);
      mk(hw * 0.34, hh * 0.24, hd * 0.30, 0, topY - hh * 0.12, -hd * 0.55);
      mk(hw * 0.28, hh * 1.20, hd * 0.28, 0, topY - hh * 0.85, -hd * 0.60);
      break;
    case 13:
      cap(0.34, 1.05);
      mk(hw * 0.52, hh * 0.50, hd * 0.62, 0, topY + hh * 0.34, -hd * 0.24);
      mk(hw * 0.9, hh * 0.20, hd * 0.28, 0, topY - hh * 0.22, -hd * 0.50);
      break;
    case 14:
      cap(0.42, 1.08);
      back(0.90, 0.32, -0.56, 1.08);
      sides(0.92, -0.58, 0.26);
      mk(hw * 1.08, hh * 0.24, hd * 0.24, 0, topY - hh * 0.26, hd * 0.46);
      break;
    case 15:
      cap(0.40, 1.06);
      back(0.80, 0.34, -0.44, 1.10);
      back(0.75, 0.30, -1.02, 0.86);
      back(0.60, 0.26, -1.50, 0.62);
      sides(1.30, -0.76, 0.24);
      break;
    default: break;
  }
  return g;
}

export function createCharacter(opts = {}) {
  const ap = { ...DEFAULT_APPEARANCE };
  if (opts.palette?.torso != null) ap.shirt = opts.palette.torso;
  Object.assign(ap, opts.appearance || {});

  const root = new THREE.Group(); root.name = 'character';
  const female = ap.gender === 'female';
  const s = STUD, H = ap.height, F = ap.fat;

  const vy = (n) => n * s * H;
  const wx = (n) => n * s * F;
  const hs = (n) => n * s * ap.headScale;

  const shoulderK = female ? 0.90 : 1.0;
  const waistK = female ? 0.92 : 1.0;

  const thighH = vy(B.thigh) * ap.legLen, shinH = vy(B.shin) * ap.legLen, footH = vy(B.foot);
  const bellyH = vy(B.belly) * ap.torsoLen, chestH = vy(B.chest) * ap.torsoLen, neckH = vy(B.neck);
  const upperArmH = vy(B.upperArm) * ap.armLen, forearmH = vy(B.forearm) * ap.armLen, handH = vy(B.hand);
  const headW = hs(W.head), headH = hs(B.head), headD = hs(W.headD);

  const chestK = 1 + ap.chest * 0.28, chestKD = 1 + ap.chest * 0.30;
  const bellyK = 1 + ap.belly * 0.38, bellyKD = 1 + ap.belly * 0.58;
  const chestW = wx(W.chest) * shoulderK * chestK, chestD = wx(W.chestD) * chestKD;
  const bellyW = wx(W.belly) * waistK * bellyK, bellyD = wx(W.bellyD) * bellyKD;
  const neckW = wx(W.neck), neckD = wx(W.neckD);
  const armW = wx(W.arm), armD = wx(W.armD);
  const legW = wx(W.leg), legD = wx(W.legD);

  const legTopY = thighH + shinH + footH;

  const isGambeson = ap.outfit === 'gambeson';
  const underColor = ap.underArmor || 0x14171d;
  const shirtOn = ap.outfit === 'shirt';
  const bodyColor = isGambeson ? underColor : (shirtOn ? ap.shirt : ap.skin);
  const bodySlot = isGambeson || shirtOn ? 'torso' : 'skin';
  const limbColor = isGambeson ? underColor : ap.skin;
  const neckColor = isGambeson ? underColor : ap.skin;
  const pantsColor = isGambeson ? underColor : ap.pants;

  const hips = new THREE.Group(); hips.name = 'hips'; hips.position.y = legTopY; root.add(hips);

  const belly = boxMesh(bellyW, bellyH, bellyD, bodyColor, bodySlot); belly.name = 'belly';
  belly.position.y = bellyH / 2; hips.add(belly);

  const shorts = boxMesh(bellyW * 1.08, bellyH * 1.00, bellyD * 1.08, pantsColor, 'legs'); shorts.name = 'shorts';
  shorts.position.y = bellyH * 0.26; hips.add(shorts);

  if (ap.butt > 0.02) {
    const r = bellyD * (0.14 + ap.butt * 0.34);
    for (const sx of [-1, 1]) {
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10),
        new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.85 }));
      cheek.castShadow = true; cheek.userData.slot = 'legs';
      cheek.scale.set(1, 0.92, 0.82);
      cheek.position.set(sx * Math.min(bellyW * 0.24, bellyW / 2 - r * 0.7), bellyH * 0.20, -(bellyD / 2) + r * 0.35);
      hips.add(cheek);
    }
  }

  const chestPivot = new THREE.Group(); chestPivot.name = 'chest'; chestPivot.position.y = bellyH; hips.add(chestPivot);
  const chest = boxMesh(chestW, chestH, chestD, bodyColor, bodySlot); chest.name = 'torso';
  chest.position.y = chestH / 2; chestPivot.add(chest);

  if (female && ap.bust > 0.02) {
    const r = chestD * (0.16 + ap.bust * 0.28);
    if (!shirtOn && !isGambeson) {
      const band = boxMesh(chestW * 1.03, chestH * 0.34, chestD * 1.05, ap.shirt, 'torso'); band.name = 'bra';
      band.position.y = chestH * 0.46; chestPivot.add(band);
    }
    for (const sx of [-1, 1]) {
      const cup = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10),
        new THREE.MeshStandardMaterial({ color: isGambeson ? underColor : ap.shirt, roughness: 0.85 }));
      cup.castShadow = true; cup.userData.slot = 'torso';
      cup.scale.set(1, 0.88, 0.78);
      cup.position.set(sx * Math.min(chestW * 0.22, chestW / 2 - r * 0.78), chestH * 0.48, chestD / 2 - r * 0.45);
      chestPivot.add(cup);
    }
  }

  const neckPivot = new THREE.Group(); neckPivot.name = 'neck'; neckPivot.position.y = chestH; chestPivot.add(neckPivot);
  const neck = boxMesh(neckW, neckH, neckD, neckColor, isGambeson ? 'torso' : 'skin');
  neck.position.y = neckH / 2; neckPivot.add(neck);

  const headPivot = new THREE.Group(); headPivot.name = 'headJoint'; headPivot.position.y = neckH; neckPivot.add(headPivot);
  const head = boxMesh(headW, headH, headD, ap.skin, 'skin'); head.name = 'head';
  head.position.y = headH / 2; headPivot.add(head);
  const hairGroup = buildHair(ap.hair | 0, ap.hairColor, headW, headH, headD);
  head.add(hairGroup);

  for (const sx of [-1, 1]) {
    const eye = boxMesh(headW * 0.15, headH * 0.20, headD * 0.10, 0x2a2119, 'eye');
    eye.position.set(sx * headW * 0.22, headH * 0.06, headD * 0.5);
    head.add(eye);
  }

  function makeArm(sx, name) {
    const shoulder = new THREE.Group(); shoulder.name = name;
    shoulder.position.set(sx * (chestW / 2 + armW / 2), chestH, 0);
    const upper = boxMesh(armW, upperArmH, armD, limbColor, isGambeson ? 'torso' : 'skin');
    upper.position.y = -upperArmH / 2; shoulder.add(upper);
    let sleeve = null;
    if (shirtOn) {
      sleeve = boxMesh(armW * 1.10, upperArmH * 0.46, armD * 1.10, ap.shirt, 'torso');
      sleeve.position.y = -upperArmH * 0.21; shoulder.add(sleeve);
    }
    const elbow = new THREE.Group(); elbow.name = name + 'Elbow'; elbow.position.y = -upperArmH; shoulder.add(elbow);
    const fore = boxMesh(armW * 0.90, forearmH, armD * 0.90, limbColor, isGambeson ? 'hands' : 'skin');
    fore.position.y = -forearmH / 2; elbow.add(fore);
    const palm = boxMesh(armW * 1.02, handH, armD * 1.02, limbColor, isGambeson ? 'hands' : 'skin');
    palm.position.y = -(forearmH + handH / 2); elbow.add(palm);
    const hand = new THREE.Group(); hand.name = name + 'Hand';
    hand.position.set(0, -(forearmH + handH / 2), armD * 0.2); elbow.add(hand);
    chestPivot.add(shoulder);
    return { pivot: shoulder, elbow, mesh: upper, sleeve, forearm: fore, hand };
  }
  const leftArm = makeArm(-1, 'armL');
  const rightArm = makeArm(1, 'armR');

  function makeLeg(sx, name) {
    const hip = new THREE.Group(); hip.name = name; hip.position.set(sx * legW * 0.52, 0, 0);
    const thigh = boxMesh(legW, thighH, legD, limbColor, isGambeson ? 'legs' : 'skin');
    thigh.position.y = -thighH / 2; hip.add(thigh);
    const knee = new THREE.Group(); knee.name = name + 'Knee'; knee.position.y = -thighH; hip.add(knee);
    const shin = boxMesh(legW * 0.90, shinH, legD * 0.90, limbColor, isGambeson ? 'legs' : 'skin');
    shin.position.y = -shinH / 2; knee.add(shin);
    const foot = boxMesh(legW * 1.06, footH, legD * 1.5, pantsColor, 'legs');
    foot.position.set(0, -(shinH + footH / 2), legD * 0.24); knee.add(foot);
    hips.add(hip);
    return { pivot: hip, knee, mesh: thigh, shin, foot };
  }
  const leftLeg = makeLeg(-1, 'legL');
  const rightLeg = makeLeg(1, 'legR');

  // Quản lý chống xuyên thấu (Anti-Clipping):
  // Làm thon nhẹ các khối thịt bên trong (scale 0.82 - 0.92) để thịt nằm gọn gàng bên trong phiến giáp
  // và tuyệt đối không bao giờ chọc thủng vai, nách, khuỷu hay đầu gối khi chuyển động!
  function setArmorOcclusion(cfg = {}) {
    const sTorso = cfg.slimTorso ? 0.92 : 1.0;
    const sArm = cfg.slimArms ? 0.82 : 1.0;
    const sLeg = cfg.slimLegs ? 0.88 : 1.0;

    chest.scale.set(sTorso, 1.0, sTorso);
    belly.scale.set(sTorso, 1.0, sTorso);
    if (shorts) shorts.scale.set(sTorso, 1.0, sTorso);

    leftArm.mesh.scale.set(sArm, 0.94, sArm);
    rightArm.mesh.scale.set(sArm, 0.94, sArm);
    leftArm.forearm.scale.set(sArm, 1.0, sArm);
    rightArm.forearm.scale.set(sArm, 1.0, sArm);

    leftLeg.mesh.scale.set(sLeg, 1.0, sLeg);
    rightLeg.mesh.scale.set(sLeg, 1.0, sLeg);
    leftLeg.shin.scale.set(sLeg, 1.0, sLeg);
    rightLeg.shin.scale.set(sLeg, 1.0, sLeg);

    if (cfg.hideHair && hairGroup) {
      hairGroup.visible = false;
    } else if (hairGroup) {
      hairGroup.visible = true;
    }
  }

  const parts = { torso: chest, chest, belly, head, neck, hips, chestPivot, headPivot, leftArm, rightArm, leftLeg, rightLeg, hair: hairGroup };

  root.traverse((o) => { if (o.isMesh && o.material && o.material.emissive) o.userData._emi = o.material.emissive.getHex(); });

  let phase = 0, idleT = 0;
  let wingL = null, wingR = null;
  let hitT = 0, flinchT = 0, hitLit = false;
  let deadV = false, deadT = 0;
  let animKind = null, animT = 0, animDur = 0;

  const REST_ELBOW = 0.10;
  const ARM_SWING = 0.72;

  function update(dt, speed = 0) {
    deadT += ((deadV ? 1 : 0) - deadT) * Math.min(dt * 7, 1);
    const lie = smoothstep(deadT), stand = 1 - lie;
    root.rotation.x = -lie * Math.PI / 2 * 0.96;

    const moving = speed > 0.001 && !deadV;
    const amp = Math.min(speed * 0.9, 0.9);
    if (moving) phase += dt * 8.0; else idleT += dt;
    const swing = moving ? Math.sin(phase) * amp : 0;
    const cosP = moving ? Math.cos(phase) : 0;

    leftLeg.pivot.rotation.x = swing * stand;
    rightLeg.pivot.rotation.x = -swing * stand;
    leftLeg.knee.rotation.x = 1.25 * Math.max(0, cosP) * amp * stand;
    rightLeg.knee.rotation.x = 1.25 * Math.max(0, -cosP) * amp * stand;

    const aL = -swing * ARM_SWING * stand, aR = swing * ARM_SWING * stand;
    leftArm.pivot.rotation.x = aL;
    rightArm.pivot.rotation.x = aR;
    leftArm.elbow.rotation.x = -(REST_ELBOW + 0.42 * Math.max(0, -aL)) * stand;
    rightArm.elbow.rotation.x = -(REST_ELBOW + 0.42 * Math.max(0, -aR)) * stand;

    if (animT > 0 && !deadV) {
      animT = Math.max(0, animT - dt);
      const k = Math.sin((1 - animT / animDur) * Math.PI);
      const pose = ANIM_POSES[animKind] || ANIM_POSES.slash;
      if (pose.leftArm != null) leftArm.pivot.rotation.x = pose.leftArm * k;
      if (pose.rightArm != null) rightArm.pivot.rotation.x = pose.rightArm * k;
      if (pose.leftElbow != null) leftArm.elbow.rotation.x = pose.leftElbow * k;
      if (pose.rightElbow != null) rightArm.elbow.rotation.x = pose.rightElbow * k;
      if (pose.leftKnee != null) leftLeg.knee.rotation.x = pose.leftKnee * k;
      if (pose.rightKnee != null) rightLeg.knee.rotation.x = pose.rightKnee * k;
    }

    if (!wingL || !wingL.parent) wingL = root.getObjectByName('armorWingL') || null;
    if (!wingR || !wingR.parent) wingR = root.getObjectByName('armorWingR') || null;
    if (wingL || wingR) {
      const beat = moving ? Math.sin(phase * 2) * 0.34 : Math.sin(idleT * 1.5) * 0.12;
      if (wingL) { wingL.rotation.y = (0.24 + beat) * stand; wingL.rotation.z = beat * 0.4 * stand; }
      if (wingR) { wingR.rotation.y = (-0.24 - beat) * stand; wingR.rotation.z = -beat * 0.4 * stand; }
    }

    const sink = moving ? 0.03 * amp * (1 - Math.abs(cosP)) : 0;
    const breath = moving ? 0 : Math.sin(idleT * 1.8) * 0.004;
    hips.position.y = legTopY - sink * stand + breath * stand;

    if (flinchT > 0 && !deadV) {
      flinchT = Math.max(0, flinchT - dt);
      const k = Math.sin((1 - flinchT / FLINCH_DUR) * Math.PI);
      chestPivot.rotation.x = -0.35 * k; headPivot.rotation.x = -0.22 * k;
      leftArm.pivot.rotation.x -= 0.7 * k; rightArm.pivot.rotation.x -= 0.7 * k;
    } else if (chestPivot.rotation.x !== 0 || headPivot.rotation.x !== 0) {
      const b = Math.min(dt * 12, 1);
      chestPivot.rotation.x += (0 - chestPivot.rotation.x) * b;
      headPivot.rotation.x += (0 - headPivot.rotation.x) * b;
    }

    if (hitT > 0) {
      hitT = Math.max(0, hitT - dt); hitLit = true;
      const k = hitT / HIT_DUR;
      root.traverse((o) => { if (o.isMesh && o.material && o.material.emissive) { o.material.emissive.setRGB(0.92, 0.06, 0.06); o.material.emissiveIntensity = k; } });
    } else if (hitLit) {
      hitLit = false;
      root.traverse((o) => { if (o.isMesh && o.material && o.material.emissive) { o.material.emissive.setHex(o.userData._emi || 0); o.material.emissiveIntensity = 1; } });
    }
  }

  function hurt() { hitT = HIT_DUR; flinchT = FLINCH_DUR; }
  function playAnim(kind, dur) {
    if (deadV) return;
    animKind = ANIM_POSES[kind] ? kind : 'slash';
    animDur = dur || ANIM_DUR[animKind] || SWING_DUR;
    animT = animDur;
  }
  function swing() { playAnim('slash'); }
  function setDead(v) { deadV = !!v; }
  function setColor(slot, color) {
    root.traverse((o) => { if (o.isMesh && o.userData.slot === slot) o.material.color.set(color); });
  }

  const totalHeight = legTopY + bellyH + chestH + neckH + headH;
  return { root, parts, update, hurt, swing, playAnim, setDead, setColor, setArmorOcclusion, totalHeight, appearance: ap };
}
