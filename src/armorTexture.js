import * as THREE from 'three';

// Hệ thống vẽ hoa văn giáp trực tiếp lên bề mặt nhân vật (Texture Paint)
// 100% không bị xuyên thấu, không bị lộ da thịt, ôm sát đường cong và chuyển động mượt mà.

export const TEXTURE_THEMES = {
  golden_dragon: {
    id: 'golden_dragon',
    name: '⭐ Hoàng Triều Kim Long (Rồng Vàng Dát Ngọc)',
    baseColor: '#12141a',
    plateColor: '#20242e',
    trimColor: '#d4af37',
    trimDark: '#8a6d1a',
    gemColor: '#10b981',
    glowColor: '#34d399',
    accentColor: '#800020',
  },
  black_tortoise: {
    id: 'black_tortoise',
    name: '⭐ Huyền Vũ Thiết Giáp (Chiến Thần Hắc Ám)',
    baseColor: '#0a0c10',
    plateColor: '#161922',
    trimColor: '#00f0ff',
    trimDark: '#0284c7',
    gemColor: '#38bdf8',
    glowColor: '#00f0ff',
    accentColor: '#1e293b',
  },
  azure_dragon: {
    id: 'azure_dragon',
    name: '⭐ Thanh Long Hiệp Khách (Vân Khí Cổ Phong)',
    baseColor: '#0f172a',
    plateColor: '#1e293b',
    trimColor: '#38bdf8',
    trimDark: '#0369a1',
    gemColor: '#2dd4bf',
    glowColor: '#22d3ee',
    accentColor: '#0284c7',
  },
  phoenix_flame: {
    id: 'phoenix_flame',
    name: '⭐ Chu Tước Liệt Hỏa (Hỏa Phượng Hoàng)',
    baseColor: '#1a0505',
    plateColor: '#380b0b',
    trimColor: '#f59e0b',
    trimDark: '#b45309',
    gemColor: '#ef4444',
    glowColor: '#fbbf24',
    accentColor: '#7f1d1d',
  },
};

export function createArmorTexture(part, theme = TEXTURE_THEMES.golden_dragon, resolution = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d');
  const w = resolution, h = resolution;

  ctx.fillStyle = theme.baseColor;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 4;
  for (let i = 0; i < h; i += 16) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(w, i);
    ctx.stroke();
  }

  if (part === 'torso') {
    drawTorsoArmor(ctx, w, h, theme);
  } else if (part === 'belly') {
    drawBellyArmor(ctx, w, h, theme);
  } else if (part === 'arm') {
    drawArmArmor(ctx, w, h, theme);
  } else if (part === 'leg') {
    drawLegArmor(ctx, w, h, theme);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function drawTorsoArmor(ctx, w, h, theme) {
  const cx = w / 2;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, theme.plateColor);
  grad.addColorStop(0.5, '#2e3442');
  grad.addColorStop(1, theme.plateColor);
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(w * 0.15, h * 0.08);
  ctx.lineTo(w * 0.85, h * 0.08);
  ctx.lineTo(w * 0.90, h * 0.65);
  ctx.lineTo(cx, h * 0.94);
  ctx.lineTo(w * 0.10, h * 0.65);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = theme.trimColor;
  ctx.lineWidth = 14;
  ctx.stroke();

  ctx.strokeStyle = theme.trimDark;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(w * 0.32, h * 0.40, w * 0.15, h * 0.20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w * 0.68, h * 0.40, w * 0.15, h * 0.20, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = theme.trimDark;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(cx, h * 0.10);
  ctx.lineTo(cx, h * 0.90);
  ctx.stroke();

  ctx.fillStyle = theme.accentColor;
  ctx.beginPath();
  ctx.moveTo(w * 0.18, h * 0.08);
  ctx.lineTo(w * 0.34, h * 0.08);
  ctx.lineTo(w * 0.84, h * 0.92);
  ctx.lineTo(w * 0.68, h * 0.92);
  ctx.closePath();
  ctx.fill();

  const gemY = h * 0.38;
  ctx.save();
  ctx.shadowColor = theme.glowColor;
  ctx.shadowBlur = 24;

  ctx.fillStyle = theme.trimColor;
  ctx.beginPath();
  ctx.arc(cx, gemY, w * 0.14, 0, Math.PI * 2);
  ctx.fill();

  const gemGrad = ctx.createRadialGradient(cx, gemY, 4, cx, gemY, w * 0.10);
  gemGrad.addColorStop(0, '#ffffff');
  gemGrad.addColorStop(0.3, theme.glowColor);
  gemGrad.addColorStop(1, theme.gemColor);
  ctx.fillStyle = gemGrad;
  ctx.beginPath();
  ctx.arc(cx, gemY, w * 0.10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const rivets = [
    [w * 0.22, h * 0.16],
    [w * 0.78, h * 0.16],
    [w * 0.18, h * 0.60],
    [w * 0.82, h * 0.60],
  ];
  ctx.fillStyle = theme.trimColor;
  for (const [rx, ry] of rivets) {
    ctx.beginPath();
    ctx.arc(rx, ry, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBellyArmor(ctx, w, h, theme) {
  const cx = w / 2;

  ctx.fillStyle = theme.plateColor;
  for (let i = 0; i < 3; i++) {
    const y = h * (0.08 + i * 0.22);
    ctx.fillRect(w * 0.18, y, w * 0.64, h * 0.18);
    ctx.strokeStyle = theme.trimDark;
    ctx.lineWidth = 4;
    ctx.strokeRect(w * 0.18, y, w * 0.64, h * 0.18);
  }

  const beltY = h * 0.62;
  const beltH = h * 0.32;
  ctx.fillStyle = '#1e140e';
  ctx.fillRect(w * 0.05, beltY, w * 0.90, beltH);
  ctx.strokeStyle = theme.trimColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(w * 0.05, beltY, w * 0.90, beltH);

  ctx.fillStyle = theme.trimColor;
  ctx.beginPath();
  ctx.roundRect(cx - w * 0.18, beltY + h * 0.03, w * 0.36, beltH - h * 0.06, 8);
  ctx.fill();

  ctx.fillStyle = theme.gemColor;
  ctx.beginPath();
  ctx.arc(cx, beltY + beltH / 2, w * 0.08, 0, Math.PI * 2);
  ctx.fill();
}

function drawArmArmor(ctx, w, h, theme) {
  const cx = w / 2;

  ctx.fillStyle = theme.plateColor;
  ctx.fillRect(w * 0.12, h * 0.06, w * 0.76, h * 0.36);
  ctx.strokeStyle = theme.trimColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(w * 0.12, h * 0.06, w * 0.76, h * 0.36);

  ctx.fillStyle = theme.plateColor;
  ctx.fillRect(w * 0.15, h * 0.50, w * 0.70, h * 0.42);
  ctx.strokeStyle = theme.trimColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(w * 0.15, h * 0.50, w * 0.70, h * 0.42);

  ctx.fillStyle = theme.glowColor;
  ctx.fillRect(cx - w * 0.12, h * 0.62, w * 0.24, h * 0.18);
  ctx.strokeStyle = theme.trimDark;
  ctx.lineWidth = 4;
  ctx.strokeRect(cx - w * 0.12, h * 0.62, w * 0.24, h * 0.18);
}

function drawLegArmor(ctx, w, h, theme) {
  const cx = w / 2;

  ctx.fillStyle = theme.plateColor;
  ctx.fillRect(w * 0.14, h * 0.05, w * 0.72, h * 0.40);
  ctx.strokeStyle = theme.trimColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(w * 0.14, h * 0.05, w * 0.72, h * 0.40);

  ctx.fillStyle = theme.trimColor;
  ctx.beginPath();
  ctx.moveTo(cx, h * 0.45);
  ctx.lineTo(cx + w * 0.22, h * 0.55);
  ctx.lineTo(cx, h * 0.65);
  ctx.lineTo(cx - w * 0.22, h * 0.55);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = theme.gemColor;
  ctx.beginPath();
  ctx.arc(cx, h * 0.55, w * 0.07, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = theme.plateColor;
  ctx.fillRect(w * 0.16, h * 0.68, w * 0.68, h * 0.28);
  ctx.strokeStyle = theme.trimColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(w * 0.16, h * 0.68, w * 0.68, h * 0.28);
}

export function applyArmorTexturesToCharacter(character, themeKey = 'golden_dragon') {
  if (!character || !character.parts) return;
  const theme = TEXTURE_THEMES[themeKey] || TEXTURE_THEMES.golden_dragon;
  const p = character.parts;

  if (p.torso) {
    const tex = createArmorTexture('torso', theme);
    p.torso.material = new THREE.MeshStandardMaterial({
      map: tex,
      metalness: 0.75,
      roughness: 0.35,
    });
  }

  if (p.belly) {
    const tex = createArmorTexture('belly', theme);
    p.belly.material = new THREE.MeshStandardMaterial({
      map: tex,
      metalness: 0.65,
      roughness: 0.45,
    });
  }

  for (const arm of [p.leftArm, p.rightArm]) {
    if (arm?.mesh) {
      const tex = createArmorTexture('arm', theme);
      arm.mesh.material = new THREE.MeshStandardMaterial({
        map: tex,
        metalness: 0.70,
        roughness: 0.40,
      });
    }
    if (arm?.forearm) {
      const tex = createArmorTexture('arm', theme);
      arm.forearm.material = new THREE.MeshStandardMaterial({
        map: tex,
        metalness: 0.80,
        roughness: 0.30,
      });
    }
  }

  for (const leg of [p.leftLeg, p.rightLeg]) {
    if (leg?.mesh) {
      const tex = createArmorTexture('leg', theme);
      leg.mesh.material = new THREE.MeshStandardMaterial({
        map: tex,
        metalness: 0.70,
        roughness: 0.40,
      });
    }
    if (leg?.shin) {
      const tex = createArmorTexture('leg', theme);
      leg.shin.material = new THREE.MeshStandardMaterial({
        map: tex,
        metalness: 0.78,
        roughness: 0.32,
      });
    }
  }
}

export function clearArmorTexturesFromCharacter(character, appearance) {
  if (!character || !character.parts) return;
  const ap = appearance || character.appearance;
  const p = character.parts;
  const isGambeson = ap.outfit === 'gambeson';
  const underColor = ap.underArmor || 0x14171d;
  const shirtOn = ap.outfit === 'shirt';
  const bodyColor = isGambeson ? underColor : (shirtOn ? ap.shirt : ap.skin);
  const limbColor = isGambeson ? underColor : ap.skin;

  const resetMat = (mesh, col, roughness = 0.85, metalness = 0.1) => {
    if (!mesh) return;
    if (mesh.material?.map) mesh.material.map.dispose();
    mesh.material = new THREE.MeshStandardMaterial({ color: col, roughness, metalness });
  };

  resetMat(p.torso, bodyColor);
  resetMat(p.belly, bodyColor);
  resetMat(p.neck, isGambeson ? underColor : ap.skin);

  for (const arm of [p.leftArm, p.rightArm]) {
    resetMat(arm?.mesh, limbColor);
    resetMat(arm?.forearm, limbColor);
    resetMat(arm?.hand, limbColor);
  }
  for (const leg of [p.leftLeg, p.rightLeg]) {
    resetMat(leg?.mesh, limbColor);
    resetMat(leg?.shin, limbColor);
    resetMat(leg?.foot, isGambeson ? underColor : ap.pants);
  }
}
