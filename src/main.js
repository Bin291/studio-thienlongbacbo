import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createCharacter } from './character.js';
import { createVoxelWarrior } from './VoxelWarrior.js';
import { DEFAULT_APPEARANCE, BODY_SLIDERS } from './appearance.js';
import { piece } from './armorKit.js';
import { applyArmorTexturesToCharacter, clearArmorTexturesFromCharacter, TEXTURE_THEMES } from './armorTexture.js';
import guideMd from '../templates/HUONG-DAN-JS-TRICH-XUAT.md?raw';

// Presets (Grade 0 - 11 + Specials)
import grade0IronBladeMd from '../presets/grade0-iron-blade.md?raw';
import grade1SteelBladeMd from '../presets/grade1-steel-blade.md?raw';
import grade2CarbonsteelBladeMd from '../presets/grade2-carbonsteel-blade.md?raw';
import grade3TitaniumBladeMd from '../presets/grade3-titanium-blade.md?raw';
import grade4BloodgoldMd from '../presets/grade4-bloodgold.md?raw';
import grade5CryoFrostgoldMd from '../presets/grade5-cryo-frostgold.md?raw';
import grade6RadianiumMd from '../presets/grade6-radianium.md?raw';
import grade7NecroniumMd from '../presets/grade7-necronium.md?raw';
import grade8CryoniumMd from '../presets/grade8-cryonium.md?raw';
import grade9UmbraniumMd from '../presets/grade9-umbranium.md?raw';
import crimsonHellfireMd from '../presets/crimson-hellfire-knight.md?raw';
import spartanWarGodMd from '../presets/spartan-war-god.md?raw';
import vx19DominusMd from '../presets/vx19-dominus.md?raw';
import mirrorKnightMd from '../presets/mirror-knight.md?raw';
import goldenTurtleMd from '../presets/golden-turtle.md?raw';
import blackTortoiseMd from '../presets/black-tortoise.md?raw';
import warriorRoyalMd from '../presets/warrior-royal.md?raw';

import JSZip from 'jszip';

// ════════════════ 1. KHỞI TẠO BIẾN TRẠNG THÁI (ĐẶT ĐẦU FILE TRÁNH TDZ) ════════════════
let activeArmorBuilders = null; // { head, body, hands, legs, pal, name }
let currentAppearance = { ...DEFAULT_APPEARANCE, outfit: 'gambeson' };
let currentModelType = 'voxel'; // 'voxel' (VoxelWarrior) | 'classic' (Mannequin cũ)
let character = null;
let activeTab = 'md';
let extractedJsCode = '';
let currentArmorStyle = '3d_kit'; // '3d_kit' | 'texture_paint' | 'hybrid'
let currentTextureTheme = 'golden_dragon';
let antiClipEnabled = true;

// ════════════════ 2. SCENE & THREE.JS RENDERER ════════════════
const canvas = document.getElementById('c3d');
const wrap = document.getElementById('drop-target');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e131f);

// Ánh sáng chuẩn Studio
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x223344, 1.4);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
dirLight.position.set(4, 9, 6);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 25;
dirLight.shadow.camera.left = -2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.top = 2.5;
dirLight.shadow.camera.bottom = -0.5;
dirLight.shadow.bias = -0.0005;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x7090b0, 0.9);
fillLight.position.set(-5, 4, -4);
scene.add(fillLight);

// Sàn lưới studio
const gridHelper = new THREE.GridHelper(20, 40, 0x38bdf8, 0x1e293b);
gridHelper.position.y = -0.001;
scene.add(gridHelper);

const floorMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: 0x0a0e17, roughness: 0.85, metalness: 0.1 })
);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.y = -0.002;
floorMesh.receiveShadow = true;
scene.add(floorMesh);

// Camera & OrbitControls
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(0, 0.65, 3.8);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0.52, 0);
controls.maxDistance = 10;
controls.minDistance = 0.5;
controls.maxPolarAngle = Math.PI / 2 + 0.05;

function resize() {
  const w = wrap ? wrap.clientWidth : canvas.clientWidth;
  const h = wrap ? wrap.clientHeight : canvas.clientHeight;
  if (w > 0 && h > 0) {
    const curW = renderer.domElement.width / renderer.getPixelRatio();
    const curH = renderer.domElement.height / renderer.getPixelRatio();
    if (Math.abs(curW - w) > 1 || Math.abs(curH - h) > 1) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }
}
window.addEventListener('resize', resize);
resize();

// ════════════════ 3. ĐIỂM NEO (ANCHORS) ARMOR ════════════════
function getAnchors(char, part) {
  const p = char.parts;
  const dims = (mesh) => {
    const g = mesh.geometry.parameters;
    return [g.width, g.height, g.depth];
  };
  const A = (mesh, slot) => ({ mesh, dims: dims(mesh), slot });

  const hasFeetBuilder = !!activeArmorBuilders?.feet;
  const hasHandsBuilder = !!activeArmorBuilders?.hands;

  if (part === 'head') return [A(p.head, 'head')];

  if (part === 'body') {
    // Chuẩn 2026-09-08: Nếu không có builder 'hands' riêng, body gộp luôn cẳng tay (slot: 'forearm')
    if (!hasHandsBuilder) {
      return [
        A(p.torso, 'torso'),
        A(p.leftArm.mesh, 'upperArm'), A(p.rightArm.mesh, 'upperArm'),
        A(p.leftArm.forearm, 'forearm'), A(p.rightArm.forearm, 'forearm'),
      ];
    }
    return [A(p.torso, 'torso'), A(p.leftArm.mesh, 'upperArm'), A(p.rightArm.mesh, 'upperArm')];
  }

  if (part === 'legs') {
    // Chuẩn 2026-09-08: Nếu có builder 'feet' riêng, legs chỉ là Quần (đùi + cẳng chân)
    if (hasFeetBuilder) {
      return [
        A(p.leftLeg.mesh, 'thigh'), A(p.leftLeg.shin, 'shin'),
        A(p.rightLeg.mesh, 'thigh'), A(p.rightLeg.shin, 'shin'),
      ];
    }
    // Legacy: bao gồm cả bàn chân
    return [
      A(p.leftLeg.mesh, 'thigh'), A(p.leftLeg.shin, 'shin'), A(p.leftLeg.foot, 'foot'),
      A(p.rightLeg.mesh, 'thigh'), A(p.rightLeg.shin, 'shin'), A(p.rightLeg.foot, 'foot'),
    ];
  }

  if (part === 'feet') {
    return [A(p.leftLeg.foot, 'foot'), A(p.rightLeg.foot, 'foot')];
  }

  if (part === 'hands') {
    return [A(p.leftArm.forearm, 'forearm'), A(p.rightArm.forearm, 'forearm')];
  }

  return [];
}

function getAnchorsForClean(character, part) {
  const p = character.parts;
  const dims = (mesh) => {
    const g = mesh.geometry.parameters;
    return [g.width, g.height, g.depth];
  };
  const A = (mesh, slot) => ({ mesh, dims: dims(mesh), slot });
  if (part === 'head') return [A(p.head, 'head')];
  if (part === 'body') return [
    A(p.torso, 'torso'),
    A(p.leftArm.mesh, 'upperArm'), A(p.rightArm.mesh, 'upperArm'),
    A(p.leftArm.forearm, 'forearm'), A(p.rightArm.forearm, 'forearm'),
  ];
  if (part === 'legs') return [
    A(p.leftLeg.mesh, 'thigh'), A(p.leftLeg.shin, 'shin'), A(p.leftLeg.foot, 'foot'),
    A(p.rightLeg.mesh, 'thigh'), A(p.rightLeg.shin, 'shin'), A(p.rightLeg.foot, 'foot'),
  ];
  if (part === 'feet') return [A(p.leftLeg.foot, 'foot'), A(p.rightLeg.foot, 'foot')];
  if (part === 'hands') return [A(p.leftArm.forearm, 'forearm'), A(p.rightArm.forearm, 'forearm')];
  return [];
}

function disposeGroup(g) {
  g.traverse((o) => {
    if (o.isMesh) {
      if (o.geometry) o.geometry.dispose();
      if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
      else if (o.material) o.material.dispose();
    }
  });
}

function updateChipsUI() {
  const set = activeArmorBuilders;
  const chip = (id, fn, name) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (fn) {
      el.className = 'chip ready';
      el.innerHTML = `${name}: <b>Sẵn sàng (OK)</b>`;
    } else {
      el.className = 'chip missing';
      el.innerHTML = `${name}: <b>Chưa có</b>`;
    }
  };
  chip('chip-head', set?.head, 'Mũ');
  chip('chip-body', set?.body, 'Áo giáp');
  chip('chip-legs', set?.legs, 'Quần');

  const chipFeet = document.getElementById('chip-feet');
  const chipHands = document.getElementById('chip-hands');

  if (set?.feet) {
    chip('chip-feet', set.feet, 'Giày');
    if (chipHands) chipHands.style.display = set.hands ? 'inline-flex' : 'none';
    if (set.hands) chip('chip-hands', set.hands, 'Găng');
  } else if (set?.hands) {
    chip('chip-feet', set.legs, 'Giày (Chung)');
    if (chipHands) {
      chipHands.style.display = 'inline-flex';
      chip('chip-hands', set.hands, 'Găng tay');
    }
  } else {
    chip('chip-feet', null, 'Giày');
    if (chipHands) chipHands.style.display = 'none';
  }
}

function reapplyCurrentArmor() {
  if (!character) return;
  const allPossibleParts = ['head', 'body', 'hands', 'legs', 'feet'];

  // 1. Dọn dẹp giáp cũ trên toàn bộ anchors
  for (const pName of allPossibleParts) {
    const key = 'armor:' + pName;
    const testAnchors = getAnchorsForClean(character, pName);
    for (const a of testAnchors) {
      const prev = a.mesh.getObjectByName(key);
      if (prev) {
        a.mesh.remove(prev);
        disposeGroup(prev);
      }
    }
  }

  const parts = ['head', 'body'];
  if (activeArmorBuilders?.hands) parts.push('hands');
  parts.push('legs');
  if (activeArmorBuilders?.feet) parts.push('feet');

  let totalMeshes = 0;
  let totalCalls = 0;
  const isTextureOnly = currentArmorStyle === 'texture_paint';
  const isHybrid = currentArmorStyle === 'hybrid';

  for (const part of parts) {
    const key = 'armor:' + part;
    const anchors = getAnchors(character, part);
    const builder = activeArmorBuilders ? activeArmorBuilders[part] : null;
    const pal = activeArmorBuilders ? activeArmorBuilders.pal(activeArmorBuilders) : null;

    for (const a of anchors) {
      // Nếu chỉ dùng Texture Paint thuần thì không đắp khối 3D (trừ mũ giáp nếu có)
      if (builder && (!isTextureOnly || part === 'head')) {
        try {
          const grp = builder(a.dims[0], a.dims[1], a.dims[2], pal, a.slot);
          if (grp) {
            grp.name = key;
            a.mesh.add(grp);
            grp.traverse((o) => {
              if (o.isMesh) {
                totalMeshes++;
                totalCalls++;
              }
            });
          }
        } catch (e) {
          console.error(`Lỗi render món [${part}] slot [${a.slot}]:`, e);
        }
      }
    }
  }

  // Áp dụng Texture Paint lên thân nhân vật nếu ở chế độ Texture hoặc Hybrid
  if (isTextureOnly || isHybrid) {
    applyArmorTexturesToCharacter(character, currentTextureTheme);
  } else {
    clearArmorTexturesFromCharacter(character, currentAppearance);
  }

  // Áp dụng Anti-clipping (Làm thon các khối chi để 100% không bao giờ đâm thủng giáp)
  if (character && character.setArmorOcclusion) {
    if (antiClipEnabled) {
      character.setArmorOcclusion({
        slimTorso: isHybrid || (!isTextureOnly && !!activeArmorBuilders?.body),
        slimArms: !isTextureOnly && (!!activeArmorBuilders?.body || !!activeArmorBuilders?.hands),
        slimLegs: !isTextureOnly && (!!activeArmorBuilders?.legs || !!activeArmorBuilders?.feet),
        hideHair: !!activeArmorBuilders?.head,
      });
    } else {
      character.setArmorOcclusion({});
    }
  }

  const statEl = document.getElementById('mesh-stats');
  if (statEl) {
    const modeDesc = isTextureOnly ? '🎨 Chế độ Texture Paint' : (isHybrid ? '✨ Chế độ Hybrid' : '🧊 Chế độ 3D ArmorKit');
    statEl.textContent = `${totalMeshes} meshes armor · ${modeDesc}`;
  }
}

// ════════════════ 4. MANNEQUIN NHÂN VẬT GỐC ════════════════
function rebuildCharacter() {
  if (character) {
    scene.remove(character.root);
  }
  if (currentModelType === 'voxel') {
    character = createVoxelWarrior({ appearance: currentAppearance });
  } else {
    character = createCharacter({ appearance: currentAppearance });
  }
  scene.add(character.root);
  reapplyCurrentArmor();
}
rebuildCharacter();

// ════════════════ 5. PARSER VÀ BIÊN DỊCH MÃ MARKDOWN ════════════════
function extractJsFromMarkdown(mdText) {
  if (!mdText) return '';

  // 1. Tìm tất cả các khối ```javascript hoặc ```js trên dòng riêng
  const codeBlockRegex = /(?:^|\n)```(?:javascript|js)\s*\n([\s\S]*?)\n```/gi;
  let match;
  const allBlocks = [];
  while ((match = codeBlockRegex.exec(mdText)) !== null) {
    const chunk = match[1].trim();
    if (chunk) allBlocks.push(chunk);
  }

  // 2. Thử tìm khối ``` bất kỳ nếu chưa thấy js block
  if (allBlocks.length === 0) {
    const genericBlockRegex = /(?:^|\n)```[a-z]*\s*\n([\s\S]*?)\n```/gi;
    while ((match = genericBlockRegex.exec(mdText)) !== null) {
      const chunk = match[1].trim();
      if (chunk) allBlocks.push(chunk);
    }
  }

  if (allBlocks.length > 0) {
    // Kiểm tra xem có khối nào chứa định nghĩa hàm giáp thật sự không
    const isArmorBlock = (code) => {
      return /\b(function\s+(?:head|body|legs|feet|hands|buildHead|buildChest|buildWarrior|buildAssassin|buildArcher)|export\s+const\s+[A-Z_]+\s*=\s*\{)/.test(code);
    };

    const armorBlocks = allBlocks.filter(isArmorBlock);
    if (armorBlocks.length > 0) {
      // Ưu tiên khối chứa định nghĩa giáp hoàn chỉnh
      return armorBlocks.join('\n\n');
    }

    // Nếu không có khối nào chứa hàm giáp hoàn chỉnh, kiểm tra xem có code Three.js chạy được không
    const hasExecutableCode = allBlocks.some((b) => /\b(piece|THREE|box|glow)\b/.test(b) && !b.includes('<tênMón>'));
    if (!hasExecutableCode) {
      return ''; // Tài liệu hướng dẫn thuần túy
    }
    return allBlocks.join('\n\n');
  }

  // 3. Nếu không có khối code block nào:
  // Kiểm tra xem có phải là code JS thuần do người dùng dán vào không
  const hasArmorFns = /\b(function\s+(?:head|body|legs|feet|hands|build)|export\s+function|export\s+const)\b/.test(mdText);
  if (!hasArmorFns) {
    // Không phải code giáp, chỉ là văn bản markdown thông thường
    return '';
  }

  let clean = mdText.replace(/```[a-z]*/gi, '').replace(/```/g, '').trim();
  return clean;
}

function removeVietnameseTones(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function generateSafeFilename(rawTitle, defaultName = 'bo-giap-armor') {
  if (!rawTitle || typeof rawTitle !== 'string') return defaultName;

  // 1. Loại bỏ markdown formatting (#, *, `, _)
  let clean = rawTitle.replace(/^#+\s*/, '').replace(/[*_`]/g, '').trim();

  // 2. Bỏ các emoji hoặc icon ký tự đặc biệt ở đầu (như ⭐, 🛡️, ...)
  clean = clean.replace(/^[\p{Emoji}\p{Symbol}\s]+/u, '').trim();

  // 3. Chuẩn hóa tiếng Việt có dấu -> không dấu để tương thích 100% mọi OS (Windows/Linux/macOS)
  const noTone = removeVietnameseTones(clean);

  // 4. Thay thế ký tự đặc biệt thành dấu gạch nối
  let slug = noTone
    .replace(/[^a-zA-Z0-9\s-_]/g, ' ')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return slug || defaultName;
}

function extractTitleFromMarkdown(mdText) {
  if (!mdText) return 'Bộ Giáp Tùy Chỉnh';
  const titleMatch = mdText.match(/^#+\s*(.+)$/m);
  return titleMatch ? titleMatch[1].replace(/[*_`]/g, '').trim() : 'Bộ Giáp Tùy Chỉnh';
}

// Helper hàm cơ bản
const box = (w, h, d, color) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, metalness: 0.42, roughness: 0.55 }));
  m.castShadow = true; m.receiveShadow = true; return m;
};
const glow = (w, h, d, color) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, metalness: 0.2, roughness: 0.35 }));
  m.castShadow = true; return m;
};
const put = (g, mesh, x, y, z) => { mesh.position.set(x, y, z); g.add(mesh); return mesh; };
const shade = (c, f) => {
  const r = Math.min(255, ((c >> 16) & 255) * f) | 0;
  const g = Math.min(255, ((c >> 8) & 255) * f) | 0;
  const b = Math.min(255, (c & 255) * f) | 0;
  return (r << 16) | (g << 8) | b;
};

// Bảng vật liệu mặc định dự phòng nếu code người dùng gọi M(pal) mà chưa khai báo
const defaultMaterials = (pal) => ({
  plate:    { color: pal?.base ?? 0x15181e, metalness: 0.85, roughness: 0.38 },
  platelo:  { color: 0x0c0e12, metalness: 0.75, roughness: 0.52 },
  plateLo:  { color: 0x0c0e12, metalness: 0.75, roughness: 0.52 },
  plateHi:  { color: 0x2b313d, metalness: 0.90, roughness: 0.30 },
  copper:   { color: pal?.trim ?? 0xc68a4c, metalness: 0.95, roughness: 0.28 },
  gold:     { color: 0xd4af37, metalness: 0.88, roughness: 0.32 },
  jade:     { color: 0x2ecc71, metalness: 0.15, roughness: 0.35, emissive: 0x1b7943, emissiveIntensity: 0.6 },
  cyanCore: { color: 0x00f0ff, metalness: 0.2, roughness: 0.2, emissive: 0x00f0ff, emissiveIntensity: 0.9 },
  glow:     { color: 0x54e8cf, metalness: 0.10, roughness: 0.20, emissive: 0x54e8cf, emissiveIntensity: 0.95 },
  cloth:    { color: 0x4a154b, metalness: 0.05, roughness: 0.92 },
  leather:  { color: 0x3d271d, metalness: 0.08, roughness: 0.85 },
  steel:    { color: 0xa0a8b2, metalness: 0.92, roughness: 0.25 },
});

// BIÊN DỊCH TRỰC TIẾP QUA FUNCTION CONSTRUCTOR (100% tin cậy, không bị lỗi bare specifier module)
function compileArmorFromCode(userJs, armorName = 'Custom Armor') {
  const errBox = document.getElementById('error-box');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  errBox.style.display = 'none';
  errBox.textContent = '';

  // 0. Nếu không có code JS (ví dụ file markdown tài liệu, hướng dẫn đọc)
  if (!userJs || !userJs.trim()) {
    statusDot.className = 'dot';
    statusText.textContent = `Đã mở tài liệu: ${armorName} (Chế độ xem tài liệu / Hướng dẫn)`;
    document.getElementById('active-set-badge').textContent = armorName;
    return;
  }

  try {
    // 1. Dọn dẹp câu lệnh import và export
    let cleanCode = userJs
      .replace(/import\s+[^;]+;?/g, '')
      .replace(/export\s+default\s+/g, 'const __DEFAULT_EXPORT__ = ')
      .replace(/export\s+(?:async\s+)?(function|const|let|var)\s+/g, '$1 ')
      .replace(/export\s*\{[^}]*\};?/g, '')
      .replace(/```[a-z]*/gi, '')
      .replace(/```/g, '')
      .trim();

    // Chuyển đổi TẤT CẢ các dòng markdown, ghi chú, gạch đầu dòng thành comment để không bao giờ lỗi cú pháp
    cleanCode = cleanCode
      .split('\n')
      .map((line) => {
        const t = line.trim();
        if (
          t.startsWith('#') ||
          /^(?:---|___|\*\*\*)\s*$/.test(t) ||
          t.startsWith('>') ||
          t.startsWith('**') ||
          /^[-*+]\s+/.test(t) ||
          t.startsWith('|') ||
          t.startsWith('$$') ||
          t.startsWith('~~~') ||
          /^\d+\.\s+/.test(t) ||
          /^\[[ xX\-]\]\s+/.test(t) ||
          /^\[.+?\]\(.+?\)/.test(t)
        ) {
          return '// ' + line;
        }
        return line;
      })
      .join('\n');

    // Kiểm tra xem code người dùng đã tự định nghĩa M hay chưa
    const hasM = /\b(?:const|let|var|function)\s+M\b/.test(cleanCode);

    // 2. Wrap trong function có sẵn môi trường Three.js, piece, box, glow, defaultMaterials
    const wrappedCode = `
      ${!hasM ? 'const M = defaultMaterials;' : ''}

      // Code của người dùng:
      ${cleanCode}

      // Trích xuất an toàn không lo xung đột định danh
      const _head = typeof head !== 'undefined' ? head : (typeof buildHead !== 'undefined' ? buildHead : (typeof buildWarriorHead !== 'undefined' ? buildWarriorHead : (typeof buildAssassinHead !== 'undefined' ? buildAssassinHead : (typeof buildArcherHead !== 'undefined' ? buildArcherHead : null))));
      const _body = typeof body !== 'undefined' ? body : (typeof buildChest !== 'undefined' ? buildChest : (typeof buildBody !== 'undefined' ? buildBody : (typeof buildWarriorChest !== 'undefined' ? buildWarriorChest : (typeof buildAssassinChest !== 'undefined' ? buildAssassinChest : (typeof buildArcherChest !== 'undefined' ? buildArcherChest : null)))));
      const _hands = typeof hands !== 'undefined' ? hands : (typeof buildHands !== 'undefined' ? buildHands : (typeof buildWarriorHands !== 'undefined' ? buildWarriorHands : (typeof buildAssassinHands !== 'undefined' ? buildAssassinHands : (typeof buildArcherHands !== 'undefined' ? buildArcherHands : null))));
      const _legs = typeof legs !== 'undefined' ? legs : (typeof buildLeg !== 'undefined' ? buildLeg : (typeof buildLegs !== 'undefined' ? buildLegs : (typeof buildWarriorLeg !== 'undefined' ? buildWarriorLeg : (typeof buildAssassinLeg !== 'undefined' ? buildAssassinLeg : (typeof buildArcherLeg !== 'undefined' ? buildArcherLeg : null)))));
      const _feet = typeof feet !== 'undefined' ? feet : (typeof buildFoot !== 'undefined' ? buildFoot : (typeof buildFeet !== 'undefined' ? buildFeet : (typeof buildWarriorFoot !== 'undefined' ? buildWarriorFoot : (typeof buildAssassinFoot !== 'undefined' ? buildAssassinFoot : (typeof buildArcherFoot !== 'undefined' ? buildArcherFoot : null)))));
      const _pal = typeof palette !== 'undefined' ? palette : (typeof PALETTE !== 'undefined' ? PALETTE : (typeof palFor !== 'undefined' ? palFor : (typeof PAL !== 'undefined' ? PAL : null)));
      const _def = typeof __DEFAULT_EXPORT__ !== 'undefined' ? __DEFAULT_EXPORT__ : null;

      return {
        head: _head || _def?.head || null,
        body: _body || _def?.body || null,
        hands: _hands || _def?.hands || null,
        legs: _legs || _def?.legs || null,
        feet: _feet || _def?.feet || null,
        palette: _pal || _def?.palette || null,
      };
    `;

    const evaluator = new Function(
      'THREE',
      'piece',
      'box',
      'glow',
      'put',
      'shade',
      'defaultMaterials',
      wrappedCode
    );

    const exp = evaluator(THREE, piece, box, glow, put, shade, defaultMaterials);

    const headFn = exp.head;
    const bodyFn = exp.body;
    const handsFn = exp.hands;
    const legsFn = exp.legs;
    const feetFn = exp.feet;

    // Nếu không tìm thấy hàm giáp nào (chỉ là đoạn code minh họa hoặc file đọc tài liệu)
    if (!headFn && !bodyFn && !legsFn && !feetFn && !handsFn) {
      statusDot.className = 'dot';
      statusText.textContent = `Đã mở: ${armorName} (Chế độ xem tài liệu)`;
      document.getElementById('active-set-badge').textContent = armorName;
      updateChipsUI();
      return;
    }

    const palData = exp.palette || { base: 0x3a5a40, dark: 0x1a3828, trim: 0x54e8cf, steel: 0xb8c0cc };

    activeArmorBuilders = {
      name: armorName,
      head: headFn,
      body: bodyFn,
      hands: handsFn,
      legs: legsFn,
      feet: feetFn,
      pal: typeof palData === 'function' ? palData : () => palData,
    };

    updateChipsUI();
    reapplyCurrentArmor();

    statusDot.className = 'dot ok';
    statusText.textContent = `Đã nạp thành công: ${armorName}`;
    document.getElementById('active-set-badge').textContent = armorName;

  } catch (err) {
    // Kiểm tra xem đây có phải là tài liệu ghi chú thuần không
    const hasArmorFns = /\b(function\s+(?:head|body|legs|feet|hands|build)|export\s+function|export\s+const)\b/.test(userJs);
    if (!hasArmorFns) {
      statusDot.className = 'dot';
      statusText.textContent = `Đã mở: ${armorName} (Chế độ xem tài liệu)`;
      errBox.style.display = 'none';
      return;
    }

    console.error('Lỗi biên dịch giáp:', err);
    errBox.style.display = 'block';
    errBox.textContent = `❌ LỖI BIÊN DỊCH / THỰC THI CODE:\n${err.stack || err.message}`;
    statusDot.className = 'dot err';
    statusText.textContent = 'Biên dịch thất bại. Hãy kiểm tra hộp lỗi bên dưới.';
  }
}

// ════════════════ 6. BỘ PRESET MẪU ════════════════
const PRESET_MD = {
  // Giáp Chính Thức (Grade 0 -> Grade 11)
  "iron_blade": grade0IronBladeMd,
  "steel_blade": grade1SteelBladeMd,
  "carbonsteel_blade": grade2CarbonsteelBladeMd,
  "titanium_blade": grade3TitaniumBladeMd,
  "bloodgold": grade4BloodgoldMd,
  "cryo_frostgold": grade5CryoFrostgoldMd,
  "radianium": grade6RadianiumMd,
  "necronium": grade7NecroniumMd,
  "cryonium": grade8CryoniumMd,
  "umbranium": grade9UmbraniumMd,
  "crimson_hellfire": crimsonHellfireMd,
  "spartan_war_god": spartanWarGodMd,

  // Giáp Đặc Biệt & Thử Nghiệm
  "vx19_dominus": vx19DominusMd,
  "mirror_knight": mirrorKnightMd,
  "golden_turtle": goldenTurtleMd,
  "black_tortoise": blackTortoiseMd,
  "warrior_royal": warriorRoyalMd,
};

function loadPreset(key) {
  const md = PRESET_MD[key] || PRESET_MD.cryo_frostgold || PRESET_MD.golden_turtle;
  const editor = document.getElementById('md-editor');
  if (editor) {
    editor.value = md;
    handleApplyCode();
  }
}

// ════════════════ 7. SỰ KIỆN GIAO DIỆN & LIVE UPDATE ════════════════
function handleApplyCode() {
  const editor = document.getElementById('md-editor');
  const mdVal = editor ? editor.value : '';
  if (!mdVal.trim()) return;

  const title = extractTitleFromMarkdown(mdVal);
  extractedJsCode = extractJsFromMarkdown(mdVal);

  if (activeTab === 'js' && editor) {
    editor.value = extractedJsCode;
  }

  compileArmorFromCode(extractedJsCode, title);
}

// Bấm nút Áp dụng
const btnApply = document.getElementById('btn-apply-code');
if (btnApply) btnApply.addEventListener('click', handleApplyCode);

// TỰ ĐỘNG LIVE UPDATE KHI DÁN HOẶC GÕ VÀO TEXTAREA (DEBOUNCE 350ms)
let debounceTimer = null;
const editorEl = document.getElementById('md-editor');
if (editorEl) {
  editorEl.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      handleApplyCode();
    }, 350);
  });
  editorEl.addEventListener('paste', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      handleApplyCode();
    }, 150);
  });
}

// Phím tắt F5 hoặc Ctrl+Enter
window.addEventListener('keydown', (e) => {
  if (e.key === 'F5' || (e.ctrlKey && e.key === 'Enter')) {
    e.preventDefault();
    handleApplyCode();
  }
});

// Nạp file .md
const fileInput = document.getElementById('file-input');
const btnBrowse = document.getElementById('btn-browse-md');
if (btnBrowse && fileInput) {
  btnBrowse.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const val = ev.target?.result || '';
      if (editorEl) editorEl.value = val;
      handleApplyCode();
    };
    reader.readAsText(file);
  });
}

// Kéo thả file .md
const dropzone = document.getElementById('dropzone');
window.addEventListener('dragover', (e) => {
  e.preventDefault();
  if (dropzone) dropzone.style.display = 'flex';
});
window.addEventListener('dragleave', (e) => {
  if (e.relatedTarget === null && dropzone) dropzone.style.display = 'none';
});
window.addEventListener('drop', (e) => {
  e.preventDefault();
  if (dropzone) dropzone.style.display = 'none';
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const val = ev.target?.result || '';
      if (editorEl) editorEl.value = val;
      handleApplyCode();
    };
    reader.readAsText(file);
  }
});

// ════════════════ MODAL & LOGIC XUẤT FILE .MD ════════════════
const btnExport = document.getElementById('btn-export-md');
const exportModal = document.getElementById('export-modal');
const exportInput = document.getElementById('export-filename-input');
const btnConfirmExport = document.getElementById('btn-confirm-export');
const btnCancelExport = document.getElementById('btn-cancel-export');

let pendingExportContent = '';

function closeExportModal() {
  if (exportModal) exportModal.style.display = 'none';
  pendingExportContent = '';
}

function triggerDownloadExport() {
  if (!pendingExportContent) {
    closeExportModal();
    return;
  }

  let customName = exportInput ? exportInput.value.trim() : '';
  // Bỏ đuôi .md nếu người dùng gõ thêm
  customName = customName.replace(/\.md$/i, '').trim();

  // Loại bỏ các ký tự cấm của hệ điều hành trong tên file (\ / : * ? " < > |)
  customName = customName.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  if (!customName) {
    customName = 'bo-giap-armor';
  }

  const filename = `${customName}.md`;

  const blob = new Blob([pendingExportContent], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);

  closeExportModal();

  const statusEl = document.getElementById('status-text');
  if (statusEl) {
    statusEl.textContent = `✅ Đã xuất file thành công: ${filename}`;
  }
}

if (btnExport) {
  btnExport.addEventListener('click', () => {
    let content = '';
    if (activeTab === 'js' && editorEl) {
      if (editorEl.dataset.mdContent) {
        const currentJs = editorEl.value;
        const md = editorEl.dataset.mdContent;
        if (/```(?:javascript|js)\s*[\s\S]*?```/i.test(md)) {
          content = md.replace(/```(?:javascript|js)\s*[\s\S]*?```/i, '```javascript\n' + currentJs + '\n```');
        } else {
          content = md + '\n\n```javascript\n' + currentJs + '\n```';
        }
      } else {
        const title = activeArmorBuilders?.name || 'Bộ Giáp Tùy Chỉnh';
        content = `# ${title}\n\n\`\`\`javascript\n${editorEl.value}\n\`\`\``;
      }
    } else {
      content = editorEl ? editorEl.value : '';
    }

    if (!content.trim()) {
      alert('⚠️ Không có nội dung markdown để xuất!');
      return;
    }

    pendingExportContent = content;

    let rawTitle = extractTitleFromMarkdown(content);
    if (!rawTitle || rawTitle === 'Bộ Giáp Tùy Chỉnh') {
      if (activeArmorBuilders?.name) {
        rawTitle = activeArmorBuilders.name;
      } else {
        const selPreset = document.getElementById('sel-preset');
        if (selPreset && selPreset.selectedIndex > 0) {
          rawTitle = selPreset.options[selPreset.selectedIndex].text;
        }
      }
    }

    const safeName = generateSafeFilename(rawTitle, 'bo-giap-armor');

    if (exportModal && exportInput) {
      exportInput.value = safeName;
      exportModal.style.display = 'flex';
      setTimeout(() => {
        exportInput.focus();
        exportInput.select();
      }, 50);
    } else {
      // Fallback nếu modal không tồn tại
      pendingExportContent = content;
      triggerDownloadExport();
    }
  });
}

if (btnConfirmExport) {
  btnConfirmExport.addEventListener('click', triggerDownloadExport);
}

if (btnCancelExport) {
  btnCancelExport.addEventListener('click', closeExportModal);
}

if (exportInput) {
  exportInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerDownloadExport();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeExportModal();
    }
  });
}

if (exportModal) {
  exportModal.addEventListener('click', (e) => {
    if (e.target === exportModal) {
      closeExportModal();
    }
  });
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && exportModal && exportModal.style.display !== 'none') {
    closeExportModal();
  }
});


// Chụp tất cả các góc và lưu vào project screenshots/<N>/
const btnSnapAll = document.getElementById('btn-snap-all');
if (btnSnapAll) {
  btnSnapAll.addEventListener('click', async () => {
    try {
      btnSnapAll.disabled = true;
      const originalText = btnSnapAll.textContent;
      btnSnapAll.textContent = '⏳ Đang chụp...';
      const statusEl = document.getElementById('status-text');
      if (statusEl) statusEl.textContent = 'Đang chụp 9 góc nhìn nhân vật...';

      // Lưu góc máy hiện tại
      const origCamPos = camera.position.clone();
      const origTarget = controls.target.clone();

      const dist = 3.8;
      const ty = 0.52;
      const angles = [
        { name: '01_chinh_dien.png', pos: [0, ty, dist], target: [0, ty, 0] },
        { name: '02_goc_3_4_truoc.png', pos: [dist * 0.65, ty + 0.35, dist * 0.75], target: [0, ty, 0] },
        { name: '03_hong_phai.png', pos: [dist, ty, 0.001], target: [0, ty, 0] },
        { name: '04_goc_3_4_sau.png', pos: [dist * 0.65, ty + 0.35, -dist * 0.75], target: [0, ty, 0] },
        { name: '05_mat_sau.png', pos: [0, ty, -dist], target: [0, ty, 0] },
        { name: '06_hong_trai.png', pos: [-dist, ty, 0.001], target: [0, ty, 0] },
        { name: '07_can_canh_mu.png', pos: [0, 0.85, 1.25], target: [0, 0.82, 0] },
        { name: '08_can_canh_ao.png', pos: [0, 0.52, 1.6], target: [0, 0.50, 0] },
        { name: '09_can_canh_giay.png', pos: [0, 0.22, 1.8], target: [0, 0.20, 0] },
      ];

      const images = [];
      for (const a of angles) {
        camera.position.set(...a.pos);
        controls.target.set(...a.target);
        controls.update();
        renderer.render(scene, camera);
        images.push({
          name: a.name,
          data: renderer.domElement.toDataURL('image/png'),
        });
      }

      // Khôi phục góc máy ban đầu
      camera.position.copy(origCamPos);
      controls.target.copy(origTarget);
      controls.update();
      renderer.render(scene, camera);

      // 1. Đóng gói toàn bộ 9 ảnh góc nhìn vào file ZIP bằng JSZip
      let currentTitle = activeArmorBuilders?.name || '';
      if (!currentTitle) {
        const editor = document.getElementById('md-editor');
        if (editor?.value) currentTitle = extractTitleFromMarkdown(editor.value);
      }
      const safeArmorName = generateSafeFilename(currentTitle, 'armor-set');
      const zipFileName = `${safeArmorName}-screenshots.zip`;

      const zip = new JSZip();
      const folder = zip.folder(safeArmorName);
      for (const img of images) {
        const base64Data = img.data.replace(/^data:image\/\w+;base64,/, '');
        folder.file(img.name, base64Data, { base64: true });
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      a.download = zipFileName;
      a.click();
      URL.revokeObjectURL(a.href);

      // 2. Lưu dự phòng vào thư mục screenshots/<N>/ trên local server nếu có
      let serverSavedPath = '';
      try {
        const resp = await fetch('/api/save-screenshots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images }),
        });
        if (resp.ok) {
          const res = await resp.json();
          if (res?.relPath) serverSavedPath = res.relPath;
        }
      } catch (_) {
        // Tương thích khi deploy trên Vercel / GitHub Pages (không có backend local)
      }

      btnSnapAll.disabled = false;
      btnSnapAll.textContent = originalText;

      const msg = `✅ Đã chụp và đóng gói ${images.length} góc ảnh!\n📦 Đã tải file nén: ${zipFileName}${serverSavedPath ? `\n📁 Đồng thời lưu thư mục: ${serverSavedPath}` : ''}`;
      if (statusEl) statusEl.textContent = `✅ Đã tải file ZIP: ${zipFileName} (${images.length} góc ảnh)`;
      alert(msg);
    } catch (err) {
      console.error('Lỗi khi chụp ảnh full góc:', err);
      btnSnapAll.disabled = false;
      btnSnapAll.textContent = '📸 Chụp full góc';
      alert('❌ Lỗi khi chụp hoặc đóng gói file ZIP: ' + err.message);
    }
  });
}

// Cởi hết giáp
const btnStrip = document.getElementById('btn-strip-armor');
if (btnStrip) {
  btnStrip.addEventListener('click', () => {
    activeArmorBuilders = null;
    updateChipsUI();
    reapplyCurrentArmor();
    document.getElementById('active-set-badge').textContent = 'Default Body (Naked)';
    document.getElementById('status-text').textContent = 'Đã cởi bỏ toàn bộ giáp trên nhân vật.';
  });
}

// Chọn Preset
const selPreset = document.getElementById('sel-preset');
if (selPreset) {
  selPreset.addEventListener('change', (e) => {
    loadPreset(e.target.value);
  });
}

// Chuyển đổi tab MD / JS
document.querySelectorAll('.tab-strip .tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab-strip .tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    activeTab = tab.dataset.tab;
    if (editorEl) {
      if (activeTab === 'js') {
        extractedJsCode = extractJsFromMarkdown(editorEl.value);
        editorEl.dataset.mdContent = editorEl.value;
        editorEl.value = extractedJsCode;
      } else {
        if (editorEl.dataset.mdContent) {
          editorEl.value = editorEl.dataset.mdContent;
        }
      }
    }
  });
});

// Điều khiển nhân vật, vóc dáng & trang phục
const selCharModel = document.getElementById('sel-char-model');
if (selCharModel) {
  selCharModel.addEventListener('change', (e) => {
    currentModelType = e.target.value;
    rebuildCharacter();
  });
}

const selGender = document.getElementById('sel-gender');
if (selGender) {
  selGender.addEventListener('change', (e) => {
    currentAppearance.gender = e.target.value;
    rebuildCharacter();
  });
}
const selOutfit = document.getElementById('sel-outfit');
if (selOutfit) {
  selOutfit.addEventListener('change', (e) => {
    currentAppearance.outfit = e.target.value;
    rebuildCharacter();
  });
}

// Chống xuyên giáp (Anti-clipping / Occlusion Culling)
const chkHideSkin = document.getElementById('chk-hide-skin');
if (chkHideSkin) {
  chkHideSkin.addEventListener('change', (e) => {
    antiClipEnabled = e.target.checked;
    reapplyCurrentArmor();
  });
}

// Chế độ phong cách giáp: Khối 3D / Tô màu Texture / Kết hợp Hybrid
const selArmorStyle = document.getElementById('sel-armor-style');
const selTextureTheme = document.getElementById('sel-texture-theme');
if (selArmorStyle) {
  selArmorStyle.addEventListener('change', (e) => {
    currentArmorStyle = e.target.value;
    if (selTextureTheme) {
      selTextureTheme.style.display = currentArmorStyle === '3d_kit' ? 'none' : 'inline-block';
    }
    reapplyCurrentArmor();
  });
}
if (selTextureTheme) {
  selTextureTheme.addEventListener('change', (e) => {
    currentTextureTheme = e.target.value;
    reapplyCurrentArmor();
  });
}

// Xem hướng dẫn JS trích xuất và cách chống lộ da
const btnOpenGuide = document.getElementById('btn-open-guide');
if (btnOpenGuide && editorEl) {
  btnOpenGuide.addEventListener('click', () => {
    editorEl.value = guideMd;
    document.getElementById('status-text').textContent = 'Đã mở: Hướng Dẫn JavaScript Trích Xuất & Kỹ Thuật Chống Lộ Da!';
  });
}

// Thanh trượt vóc dáng
const slidersPanel = document.getElementById('body-sliders-panel');
const btnToggleSliders = document.getElementById('btn-toggle-sliders');
if (btnToggleSliders && slidersPanel) {
  btnToggleSliders.addEventListener('click', () => {
    slidersPanel.style.display = slidersPanel.style.display === 'block' ? 'none' : 'block';
  });
}

const btnResetBody = document.getElementById('btn-reset-body');
if (btnResetBody) {
  btnResetBody.addEventListener('click', () => {
    BODY_SLIDERS.forEach((s) => {
      currentAppearance[s.key] = s.def;
      const inp = document.getElementById(`slider-${s.key}`);
      if (inp) inp.value = s.def;
      const val = document.getElementById(`val-${s.key}`);
      if (val) val.textContent = s.def;
    });
    rebuildCharacter();
  });
}

const sContainer = document.getElementById('sliders-container');
if (sContainer) {
  BODY_SLIDERS.forEach((s) => {
    const row = document.createElement('div');
    row.className = 'slider-row';
    row.innerHTML = `
      <span>${s.label}:</span>
      <input type="range" id="slider-${s.key}" min="${s.min}" max="${s.max}" step="0.02" value="${currentAppearance[s.key] ?? s.def}">
      <span id="val-${s.key}">${currentAppearance[s.key] ?? s.def}</span>
    `;
    sContainer.appendChild(row);
    const inp = row.querySelector('input');
    inp.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      currentAppearance[s.key] = v;
      row.querySelector(`#val-${s.key}`).textContent = v.toFixed(2);
      rebuildCharacter();
    });
  });
}

// Preset camera
document.querySelectorAll('.btn-cam').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-cam').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const p = btn.dataset.cam;
    const dist = 3.8;
    const ty = 0.52;
    if (p === 'side') { camera.position.set(dist, ty, 0.001); controls.target.set(0, ty, 0); }
    else if (p === 'q') { camera.position.set(dist * 0.65, ty + 0.35, dist * 0.75); controls.target.set(0, ty, 0); }
    else if (p === 'back') { camera.position.set(0, ty, -dist); controls.target.set(0, ty, 0); }
    else if (p === 'head') { camera.position.set(0, 0.85, 1.25); controls.target.set(0, 0.82, 0); }
    else if (p === 'torso') { camera.position.set(0, 0.52, 1.6); controls.target.set(0, 0.50, 0); }
    else if (p === 'legs') { camera.position.set(0, 0.22, 1.8); controls.target.set(0, 0.20, 0); }
    else { camera.position.set(0, ty, dist); controls.target.set(0, ty, 0); }
  });
});

// Động tác / Hoạt ảnh
const selAnim = document.getElementById('sel-anim');
if (selAnim) {
  selAnim.addEventListener('change', (e) => {
    const anim = e.target.value;
    if (anim && character?.playAnim) {
      character.playAnim(anim, 0.8);
    }
  });
}

// ════════════════ 8. VÒNG LẶP RENDER ════════════════
const clock = new THREE.Clock();
const chkWalk = document.getElementById('chk-walk');

function animate() {
  requestAnimationFrame(animate);
  resize();
  const dt = Math.min(clock.getDelta(), 0.05);
  const isWalking = chkWalk ? chkWalk.checked : false;
  if (character) {
    character.update(dt, isWalking ? 4 : 0);
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Tự động load bộ mẫu ban đầu
loadPreset(selPreset?.value || 'cryo_frostgold');
