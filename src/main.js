import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createCharacter } from './character.js';
import { DEFAULT_APPEARANCE, BODY_SLIDERS } from './appearance.js';
import { piece } from './armorKit.js';
import { applyArmorTexturesToCharacter, clearArmorTexturesFromCharacter, TEXTURE_THEMES } from './armorTexture.js';
import guideMd from '../templates/HUONG-DAN-JS-TRICH-XUAT.md?raw';
import JSZip from 'jszip';

// ════════════════ 1. KHỞI TẠO BIẾN TRẠNG THÁI (ĐẶT ĐẦU FILE TRÁNH TDZ) ════════════════
let activeArmorBuilders = null; // { head, body, hands, legs, pal, name }
let currentAppearance = { ...DEFAULT_APPEARANCE, outfit: 'gambeson' };
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
  character = createCharacter({ appearance: currentAppearance });
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
  "iron_blade": "# Bộ Giáp Iron Blade (Minecraft Style - No Gem)\n\nBộ giáp sắt Grade 0 theo chuẩn Armor-Roadmap 3.0 (Dùng chung cho cả 3 lớp).\n- **Chất liệu**: Thép sắt bạc sáng, nẹp kim loại, lõi mắt ngọc xanh Cyan.\n- **Phong cách**: Khối phẳng mượt chuẩn phong cách Minecraft Iron Armor, không góc vát cầu kỳ.\n- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).\n- **Chống lộ da**: Đã phủ tà giáp hông/đũng và cổ giáp cao.\n\n```javascript\n// Sẵn có hàm piece() từ armorKit\n\n// ═══════════════════════════════════════════════════════════════════════════\n// GRADE 0 — IRON BLADE (Minecraft Style, không ngọc) — Sắt.\n// 2026-09-08: bộ CHÍNH THỨC theo Armor-Roadmap 3.0 — DÙNG CHUNG cho cả 3 lớp (xem LL-AR-001 §3.5c).\n// Thiết kế phẳng mượt, tông sắt bạc ánh kim chuẩn Minecraft Iron Armor.\n// ═══════════════════════════════════════════════════════════════════════════\n\nconst M = (pal) => ({\n  ironPlate: { color: 0xd0d7de, metalness: 0.88, roughness: 0.22 }, // Thép sắt bạc sáng\n  ironHi:    { color: 0xf0f3f6, metalness: 0.95, roughness: 0.15 }, // Mặt viền sắt bắt sáng\n  ironLo:    { color: 0x8c959f, metalness: 0.75, roughness: 0.35 }, // Rãnh sắt xám chìm\n  trimMetal: { color: 0xafb8c1, metalness: 0.85, roughness: 0.25 }, // Viền nẹp kim loại\n  leather:   { color: 0x3d271d, metalness: 0.08, roughness: 0.85 }, // Đai da\n  cloth:     { color: 0x21262d, metalness: 0.05, roughness: 0.90 }, // Vải lót tối\n  bladeCore: { color: 0x38bdf8, metalness: 0.20, roughness: 0.20, emissive: 0x0284c7, emissiveIntensity: 0.85 }, // Lõi xanh\n});\n\n// 1. MŨ SẮT PHẲNG MƯỢT (Head)\nexport function head(w, h, d, pal) {\n  const b = piece(M(pal));\n\n  // Khối mũ trùm vuông vắn, phẳng mượt chuẩn Minecraft\n  b.cover('ironPlate', w, h, d, 1.12, 1.05, 1.12, [0, h * 0.05, 0]);\n  b.slab('ironHi', w * 1.14, h * 0.10, d * 1.14, [0, h * 0.52, 0], { ch: 0 });\n\n  // Kính chắn mắt phẳng gọn gàng\n  b.slab('bladeCore', w * 0.60, h * 0.14, d * 0.10, [0, h * 0.18, d * 0.58], { ch: 0 });\n  b.slab('ironLo', w * 1.14, h * 0.12, d * 0.18, [0, h * 0.32, d * 0.56], { ch: 0 });\n\n  // Ốp má phẳng hai bên\n  b.both((sx) => {\n    b.slab('ironPlate', w * 0.15, h * 0.60, d * 1.05, [sx * w * 0.48, -h * 0.10, 0], { ch: 0 });\n  });\n\n  // Che cằm\n  b.slab('ironLo', w * 0.85, h * 0.25, d * 0.15, [0, -h * 0.35, d * 0.52], { ch: 0 });\n\n  return b.build();\n}\n\n// Helper cẳng tay phẳng\nfunction forearmArmor(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.cover('ironPlate', w, h, d, 1.16, 1.15, 1.16, [0, -h * 0.05, 0]); // ống cẳng tay, kéo nhẹ xuống che mu bàn tay\n  b.slab('ironHi', w * 1.18, h * 0.12, d * 1.18, [0, h * 0.35, 0], { ch: 0 });\n  b.slab('bladeCore', w * 0.25, h * 0.35, d * 0.12, [0, -h * 0.10, d * 0.62], { ch: 0 });\n  return b.build();\n}\n\n// 2. ÁO GIÁP SẮT (Body)\nexport function body(w, h, d, pal, slot) {\n  const mats = M(pal);\n\n  if (slot === 'upperArm') {\n    const b = piece(mats);\n    b.cover('ironPlate', w, h, d, 1.2, 1.15, 1.2, [0, 0, 0]); // ống bắp tay (kéo dài che khuỷu)\n    b.slab('ironHi', w * 1.18, h * 0.12, d * 1.18, [0, h * 0.38, 0], { ch: 0 });\n    return b.build();\n  }\n\n  if (slot === 'forearm') {\n    return forearmArmor(w, h, d, pal);\n  }\n\n  // Thân áo chính\n  const b = piece(mats);\n  const fz = d * 0.58;\n\n  b.cover('ironPlate', w, h, d, 1.18, 1.02, 1.20, [0, 0, 0]);\n  b.slab('ironLo', w * 0.55, h * 0.4, d * 0.55, [0, h * 0.62, 0], { ch: 0 }); // cổ giáp cao (khử hở cổ)\n\n  // Cầu vai phẳng vuông vắn kiểu khối lập phương\n  b.both((sx) => {\n    b.slab('ironHi', w * 0.45, h * 0.25, d * 1.22, [sx * w * 0.55, h * 0.42, 0], { ch: 0 });\n  });\n\n  // Ngực áo phẳng hoàn toàn\n  b.slab('trimMetal', w * 0.50, h * 0.35, d * 0.10, [0, h * 0.12, fz], { ch: 0 });\n\n  // Thắt lưng da & nẹp hông phẳng\n  b.slab('leather', w * 1.12, h * 0.14, d * 1.14, [0, -h * 0.44, 0], { ch: 0 });\n  b.slab('ironHi', w * 0.28, h * 0.16, d * 0.12, [0, -h * 0.44, d * 0.58], { ch: 0 });\n\n  // Tà giáp phủ hông/đũng (khử hở da giữa Áo giáp và Quần)\n  b.slab('ironPlate', w * 1.16, h * 0.55, d * 1.18, [0, -h * 0.82, 0], { ch: 0 });\n  for (const sz of [1, -1]) b.slab('ironPlate', w * 0.55, h * 0.34, d * 0.16, [0, -h * 1.02, sz * fz * 0.55], { ch: 0 });\n\n  return b.build();\n}\n\n// 3. QUẦN SẮT (Legs)\nexport function legs(w, h, d, pal, slot) {\n  const b = piece(M(pal));\n\n  if (slot === 'shin') {\n    b.cover('ironPlate', w, h, d, 1.10, 1.02, 1.12, [0, 0, 0]);\n    b.slab('ironHi', w * 0.35, h * 0.25, d * 0.12, [0, h * 0.25, d * 0.58], { ch: 0 });\n    return b.build();\n  }\n\n  // Đùi\n  b.cover('ironPlate', w, h, d, 1.10, 1.02, 1.12, [0, 0, 0]);\n  b.slab('trimMetal', w * 1.12, h * 0.10, d * 1.14, [0, h * 0.38, 0], { ch: 0 });\n  return b.build();\n}\n\n// 4. GIÀY SẮT (Feet)\nexport function feet(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.cover('ironPlate', w, h, d, 1.14, 1.35, 1.40, [0, h * 0.18, d * 0.08]);\n  b.slab('ironHi', w * 0.40, h * 0.14, d * 0.35, [0, h * 0.15, d * 0.60], { ch: 0 });\n  b.cover('ironLo', w, h, d, 1.16, 0.50, 1.42, [0, -h * 0.48, d * 0.06]);\n  return b.build();\n}\n\nexport const IRON_BLADE = { head, body, legs, feet };\n\n```\n",
  "steel_blade": "# Bộ Giáp Steel Blade (Huy Hiệu Chữ H Phát Sáng)\n\nBộ giáp thép Grade 1 theo chuẩn Armor-Roadmap 3.0 (Dùng chung cho cả 3 lớp).\n- **Chất liệu**: Thép xám bạc sáng, nẹp thép bắt sáng, lõi xanh phát sáng.\n- **Điểm nhấn**: Huy hiệu chữ H phát sáng dán dính sát bề mặt ngực giáp, cầu vai phẳng vuông vắn.\n- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).\n\n```javascript\n// Sẵn có hàm piece() từ armorKit\n\n// ═══════════════════════════════════════════════════════════════════════════\n// GRADE 1 — STEEL BLADE (Chữ H dán dính ngực) — Thép.\n// 2026-09-08: bộ CHÍNH THỨC theo Armor-Roadmap 3.0 — DÙNG CHUNG cho cả 3 lớp (xem LL-AR-001 §3.5c).\n// Toạ độ Z tấm ngực đã tinh chỉnh để chữ H dán phẳng trực tiếp lên mặt giáp, không tách lớp lơ lửng.\n// ═══════════════════════════════════════════════════════════════════════════\n\nconst M = (pal) => ({\n  steelMain: { color: 0xc8d1d9, metalness: 0.90, roughness: 0.20 }, // Thép xám bạc sáng\n  steelHi:   { color: 0xf0f3f6, metalness: 0.95, roughness: 0.12 }, // Viền thép bắt sáng\n  steelDark: { color: 0x484f58, metalness: 0.80, roughness: 0.35 }, // Khung sắt tối\n  innerSuit: { color: 0x161b22, metalness: 0.05, roughness: 0.90 }, // Áo lót tối màu\n  bladeGlow: { color: 0x38bdf8, metalness: 0.20, roughness: 0.20, emissive: 0x0284c7, emissiveIntensity: 0.85 }, // Lõi xanh phát sáng\n});\n\n// 1. MŨ STEEL BLADE (Head)\nexport function head(w, h, d, pal) {\n  const b = piece(M(pal));\n\n  b.cover('steelMain', w, h, d, 1.12, 1.05, 1.12, [0, h * 0.04, 0]);\n  b.slab('bladeGlow', w * 0.65, h * 0.12, d * 0.08, [0, h * 0.18, d * 0.58], { ch: 0 });\n  b.slab('steelDark', w * 0.85, h * 0.25, d * 0.12, [0, -h * 0.35, d * 0.52], { ch: 0 });\n\n  return b.build();\n}\n\n// Helper cẳng tay\nfunction forearmArmor(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.cover('steelMain', w, h, d, 1.12, 1.02, 1.12, [0, 0, 0]);\n  b.slab('bladeGlow', w * 0.20, h * 0.35, d * 0.10, [0, 0, d * 0.58], { ch: 0 });\n  return b.build();\n}\n\n// 2. ÁO GIÁP STEEL BLADE (Body)\nexport function body(w, h, d, pal, slot) {\n  const mats = M(pal);\n\n  if (slot === 'upperArm') {\n    const b = piece(mats);\n    b.cover('steelMain', w, h, d, 1.14, 0.95, 1.14, [0, -h * 0.05, 0]);\n    return b.build();\n  }\n\n  if (slot === 'forearm') {\n    return forearmArmor(w, h, d, pal);\n  }\n\n  const b = piece(mats);\n\n  // Tấm giáp ngực có độ dày d * 0.10 nằm ở fz = d * 0.56\n  // Mặt trước tấm giáp ngực chính xác ở Z = fz + (d * 0.10 / 2) = d * 0.61\n  const chestPlateFrontZ = d * 0.61;\n  // Chữ H dày d * 0.01 dán đè trực tiếp lên mặt giáp\n  const hZ = chestPlateFrontZ + 0.005;\n\n  // Áo lót & Cầu vai\n  b.cover('steelDark', w, h, d, 1.12, 1.02, 1.14, [0, 0, 0]);\n  b.both((sx) => {\n    b.slab('steelHi', w * 0.45, h * 0.22, d * 1.20, [sx * w * 0.55, h * 0.40, 0], { ch: 0 });\n  });\n\n  // Tấm thép ngực chính\n  b.slab('steelMain', w * 0.85, h * 0.45, d * 0.10, [0, h * 0.10, d * 0.56], { ch: 0 });\n\n  // CHỮ \"H\" PHÁT SÁNG DÁN DÍNH SÁT MẶT NGỰC (Khớp Z = hZ)\n  const hWidth = w * 0.35;\n  const hHeight = h * 0.25;\n  const barThickness = w * 0.08;\n\n  // 2 Cột dọc của chữ H\n  b.both((sx) => {\n    b.slab('bladeGlow', barThickness, hHeight, d * 0.01, [sx * (hWidth / 2 - barThickness / 2), h * 0.10, hZ], { ch: 0 });\n  });\n  // Thanh ngang của chữ H\n  b.slab('bladeGlow', hWidth, barThickness, d * 0.01, [0, h * 0.10, hZ], { ch: 0 });\n\n  // Đai thắt lưng\n  b.slab('steelHi', w * 1.10, h * 0.14, d * 1.12, [0, -h * 0.42, 0], { ch: 0 });\n\n  // Cổ giáp cao (khử hở cổ) + tà giáp phủ hông/đũng (khử hở da giữa Áo giáp và Quần)\n  b.slab('steelDark', w * 0.55, h * 0.4, d * 0.55, [0, h * 0.62, 0], { ch: 0 });\n  b.slab('steelMain', w * 1.14, h * 0.55, d * 1.16, [0, -h * 0.82, 0], { ch: 0 });\n  for (const sz of [1, -1]) b.slab('steelMain', w * 0.55, h * 0.34, d * 0.16, [0, -h * 1.02, sz * (d * 0.56) * 0.55], { ch: 0 });\n\n  return b.build();\n}\n\n// 3. QUẦN STEEL BLADE (Legs)\nexport function legs(w, h, d, pal, slot) {\n  const b = piece(M(pal));\n\n  if (slot === 'shin') {\n    b.cover('steelMain', w, h, d, 1.10, 1.02, 1.12, [0, 0, 0]);\n    b.slab('steelHi', w * 0.35, h * 0.25, d * 0.10, [0, h * 0.25, d * 0.58], { ch: 0 });\n    return b.build();\n  }\n\n  b.cover('steelMain', w, h, d, 1.10, 1.02, 1.12, [0, 0, 0]);\n  b.slab('steelHi', w * 0.40, h * 0.35, d * 0.10, [0, 0, d * 0.58], { ch: 0 });\n\n  return b.build();\n}\n\n// 4. GIÀY STEEL BLADE (Feet)\nexport function feet(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.cover('steelMain', w, h, d, 1.14, 1.35, 1.40, [0, h * 0.18, d * 0.08]);\n  b.slab('steelHi', w * 0.40, h * 0.14, d * 0.35, [0, h * 0.15, d * 0.60], { ch: 0 });\n  b.cover('steelDark', w, h, d, 1.16, 0.50, 1.42, [0, -h * 0.48, d * 0.06]);\n  return b.build();\n}\n\nexport const STEEL_BLADE = { head, body, legs, feet };\n\n```\n",
  "carbonsteel_blade": "# Bộ Giáp Carbonsteel Blade (Bóng Đêm Thép Carbon)\n\nBộ giáp thép carbon Grade 2 theo chuẩn Armor-Roadmap 3.0 (Dùng chung cho cả 3 lớp).\n- **Chất liệu**: Thép carbon đen mun Titan, viền nẹp bạc xước, lõi xanh Cyan.\n- **Điểm nhấn**: Kính Visor lõi đôi song song, biểu tượng Lưỡi Kiếm Chéo áp sát ngực, cầu vai vát góc nhọn.\n- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).\n\n```javascript\n// Sẵn có hàm piece() từ armorKit\n\n// ═══════════════════════════════════════════════════════════════════════════\n// GRADE 2 — CARBONSTEEL BLADE (Bóng Đêm Thép Carbon) — Thép Carbon.\n// 2026-09-08: bộ CHÍNH THỨC theo Armor-Roadmap 3.0 — DÙNG CHUNG cho cả 3 lớp (xem LL-AR-001 §3.5c).\n// Tông đen mun carbon Titan, ký hiệu Lưỡi Kiếm Chéo áp sát ngực, cầu vai vát góc nhọn, visor lõi đôi.\n// ═══════════════════════════════════════════════════════════════════════════\n\nconst M = (pal) => ({\n  carbonMain: { color: 0x1a1d24, metalness: 0.88, roughness: 0.25 }, // Thép Carbon đen mun Titan\n  carbonHi:   { color: 0x38414e, metalness: 0.92, roughness: 0.18 }, // Mặt vát xám thép bắt sáng\n  carbonDark: { color: 0x0f1115, metalness: 0.80, roughness: 0.40 }, // Khung sắt đen thẫm\n  silverTrim: { color: 0x78869b, metalness: 0.95, roughness: 0.15 }, // Viền nẹp bạc xước\n  innerSuit:  { color: 0x08090c, metalness: 0.05, roughness: 0.95 }, // Áo lót siêu đen\n  bladeGlow:  { color: 0x00d2ff, metalness: 0.20, roughness: 0.20, emissive: 0x0088cc, emissiveIntensity: 0.90 }, // Lõi xanh Cyan\n});\n\n// 1. MŨ CARBONSTEEL (Head) — Kính Visor Lõi Đôi Song Song + Vành Trán Cạnh Vát\nexport function head(w, h, d, pal) {\n  const b = piece(M(pal));\n\n  // Khối mũ trùm chính bằng thép carbon\n  b.cover('carbonMain', w, h, d, 1.12, 1.05, 1.12, [0, h * 0.04, 0]);\n\n  // Nẹp trán vát cạnh góc nhọn\n  b.slab('carbonHi', w * 1.14, h * 0.10, d * 0.18, [0, h * 0.40, d * 0.55], { ch: h * 0.02 });\n\n  // KÍNH VISOR LÕI ĐÔI SONG SONG\n  b.slab('bladeGlow', w * 0.55, h * 0.06, d * 0.06, [0, h * 0.22, d * 0.58], { ch: 0 });\n  b.slab('bladeGlow', w * 0.55, h * 0.06, d * 0.06, [0, h * 0.12, d * 0.58], { ch: 0 });\n\n  // Giáp che cằm\n  b.slab('carbonDark', w * 0.85, h * 0.28, d * 0.12, [0, -h * 0.35, d * 0.52], { ch: 0 });\n\n  return b.build();\n}\n\n// Helper cẳng tay: Tấm nẹp vát lưỡi thép sắc nhọn\nfunction forearmArmor(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.cover('carbonMain', w, h, d, 1.12, 1.02, 1.12, [0, 0, 0]);\n  b.slab('carbonHi', w * 0.25, h * 0.60, d * 0.10, [0, 0, d * 0.58], { ch: h * 0.03 });\n  b.slab('bladeGlow', w * 0.08, h * 0.30, d * 0.08, [0, 0, d * 0.64], { ch: 0 });\n  return b.build();\n}\n\n// 2. ÁO GIÁP CARBONSTEEL (Body) — Cầu vai vát nhọn + Ký hiệu LƯỠI KIẾM CHÉO áp sát ngực\nexport function body(w, h, d, pal, slot) {\n  const mats = M(pal);\n\n  if (slot === 'upperArm') {\n    const b = piece(mats);\n    b.cover('carbonMain', w, h, d, 1.14, 0.95, 1.14, [0, -h * 0.05, 0]);\n    b.slab('carbonHi', w * 1.16, h * 0.10, d * 1.16, [0, h * 0.36, 0], { ch: 0 });\n    return b.build();\n  }\n\n  if (slot === 'forearm') {\n    return forearmArmor(w, h, d, pal);\n  }\n\n  const b = piece(mats);\n\n  // Tọa độ Z tấm ngực: fz = d * 0.56, độ dày = d * 0.10\n  // Bề mặt ngực chính xác ở Z = d * 0.61. Vệt phát sáng dán đè Z = d * 0.615\n  const chestZ = d * 0.56;\n  const glowZ = d * 0.615;\n\n  // Khung áo lót tối màu\n  b.cover('carbonDark', w, h, d, 1.12, 1.02, 1.14, [0, 0, 0]);\n\n  // CẦU VAI VÁT GÓC NHỌN (Angular Pauldrons)\n  b.both((sx) => {\n    b.slab('carbonHi', w * 0.48, h * 0.24, d * 1.22, [sx * w * 0.58, h * 0.42, 0], { ch: h * 0.05 });\n    b.slab('silverTrim', w * 0.12, h * 0.26, d * 1.24, [sx * w * 0.78, h * 0.42, 0], { ch: 0 });\n  });\n\n  // Tấm thép Carbon ngực chính\n  b.slab('carbonMain', w * 0.85, h * 0.48, d * 0.10, [0, h * 0.08, chestZ], { ch: 0 });\n\n  // BIỂU TƯỢNG \"LƯỠI KIẾM VÁT CHÉO\" PHÁT SÁNG (Dán sát 100% vào ngực, thay thế chữ H)\n  b.both((sx) => {\n    // Vệt kiếm chéo\n    b.slab('bladeGlow', w * 0.08, h * 0.30, d * 0.01, [sx * w * 0.12, h * 0.08, glowZ], { ch: 0, rot: [0, 0, sx * -0.4] });\n  });\n  // Tâm lõi vuông kết nối\n  b.slab('bladeGlow', w * 0.12, h * 0.12, d * 0.01, [0, h * 0.08, glowZ + 0.002], { ch: 0 });\n\n  // Đai thắt lưng thép\n  b.slab('silverTrim', w * 1.10, h * 0.14, d * 1.12, [0, -h * 0.42, 0], { ch: 0 });\n\n  // Cổ giáp cao (khử hở cổ) + tà giáp phủ hông/đũng (khử hở da giữa Áo giáp và Quần)\n  b.slab('carbonDark', w * 0.55, h * 0.4, d * 0.55, [0, h * 0.62, 0], { ch: 0 });\n  b.slab('carbonMain', w * 1.14, h * 0.55, d * 1.16, [0, -h * 0.82, 0], { ch: 0 });\n  for (const sz of [1, -1]) b.slab('carbonMain', w * 0.55, h * 0.34, d * 0.16, [0, -h * 1.02, sz * (d * 0.56) * 0.55], { ch: 0 });\n\n  return b.build();\n}\n\n// 3. QUẦN CARBONSTEEL (Legs)\nexport function legs(w, h, d, pal, slot) {\n  const b = piece(M(pal));\n\n  if (slot === 'shin') {\n    b.cover('carbonMain', w, h, d, 1.10, 1.02, 1.12, [0, 0, 0]);\n    b.slab('carbonHi', w * 0.38, h * 0.28, d * 0.10, [0, h * 0.22, d * 0.58], { ch: h * 0.03 });\n    return b.build();\n  }\n\n  b.cover('carbonMain', w, h, d, 1.10, 1.02, 1.12, [0, 0, 0]);\n  b.slab('carbonHi', w * 0.42, h * 0.38, d * 0.10, [0, 0, d * 0.58], { ch: h * 0.03 });\n\n  return b.build();\n}\n\n// 4. GIÀY CARBONSTEEL (Feet)\nexport function feet(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.cover('carbonMain', w, h, d, 1.14, 1.35, 1.40, [0, h * 0.18, d * 0.08]);\n  b.slab('silverTrim', w * 0.42, h * 0.14, d * 0.35, [0, h * 0.15, d * 0.60], { ch: 0 });\n  b.cover('carbonDark', w, h, d, 1.16, 0.50, 1.42, [0, -h * 0.48, d * 0.06]);\n  return b.build();\n}\n\nexport const CARBONSTEEL_BLADE = { head, body, legs, feet };\n\n```\n",
  "bloodgold": "# Bộ Giáp Huyết Kim (Vermilium / Bloodgold Set)\n\nBộ giáp Grade 4 chính thức theo \"Bảng dựng 13 bộ giáp\" — CRAFT tier đầu tiên (Dùng chung cả 3 lớp).\n- **Chất liệu**: Vermilium đỏ huyết thẫm kim loại, nẹp vàng kim cổ điển, chi tiết vàng sáng, khe visor đen bí ẩn.\n- **Phong cách**: Kỹ thuật tạo hình Trim-layering (§14) — nẹp vàng đè lên nền đỏ, vát cạnh ch rộng tạo đường viền mảnh bắt sáng mà không ghép khối nhỏ.\n- **Điểm nhấn**: Vành vương miện răng cưa, khung nẹp vàng quanh ngực & tà giáp, cầu vai vòm dome có váy vai rủ che khe nách, áo choàng đỏ sau lưng.\n- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).\n\n```javascript\n// Sẵn có hàm piece() từ armorKit\n\n// ═══════════════════════════════════════════════════════════════════════════\n// GRADE 4 — GIÁP HUYẾT KIM (Vermilium / Bloodgold Armor) — CRAFT tier đầu tiên.\n// 2026-09-08: bộ CHÍNH THỨC theo \"Bảng dựng 13 bộ\" — DÙNG CHUNG cả 3 lớp (xem LL-AR-001 §3.5c).\n//\n// TRIẾT LÝ DỰNG (theo góp ý design + HUONG-DAN §14 \"chi tiết sắc nét không cần khối nhỏ\"):\n//   • Vermilium = đỏ huyết THẪM, KIM LOẠI (metalness cao) — \"lấp lánh\" đến từ metalness/envmap, KHÔNG\n//     phải emissive (luật hoãn-glow: giáp gốc không tự phát sáng, glow để dành cho cấp cường hoá).\n//   • Hoa văn/viền = hệ NẸP VÀNG cổ điển: tấm slab MỎNG (d≈0.02-0.05) đè lên nền → viền nổi sắc nét,\n//     tối ưu 100% hiệu năng (không ghép hàng nghìn khối nhỏ).\n//   • Cạnh vát `ch` rộng → mép bắt sáng thành đường viền mảnh, khối \"ra chất giáp\" chỉ với 1 tấm.\n//   • Phẳng mượt, BỌC KÍN 360° (mũ kín có khe visor — grade cao nên sang/kín, không hở mặt).\n// ═══════════════════════════════════════════════════════════════════════════\n\nconst M = () => ({\n  plate:   { color: 0x7d1620, metalness: 0.82, roughness: 0.32 }, // Vermilium đỏ huyết thẫm (nền chính)\n  plateHi: { color: 0xa82b30, metalness: 0.88, roughness: 0.22 }, // đỏ sáng — khối bắt sáng\n  plateLo: { color: 0x430910, metalness: 0.70, roughness: 0.50 }, // đỏ tối — khe/lót/gáy\n  gold:    { color: 0xd9a825, metalness: 0.92, roughness: 0.24 }, // vàng cổ điển — viền nẹp chính\n  goldHi:  { color: 0xf1d268, metalness: 0.96, roughness: 0.16 }, // vàng sáng — điểm nhấn/đỉnh vương miện\n  goldDk:  { color: 0x8a6410, metalness: 0.82, roughness: 0.40 }, // vàng hun tối — nẹp phụ/đáy\n  dark:    { color: 0x160a0d, metalness: 0.50, roughness: 0.42 }, // khe visor / rãnh tối\n});\n\n// Viền NẸP VÀNG khung chữ nhật quanh 1 mặt phẳng (kỹ thuật trim-layering: 4 thanh mỏng nổi lên nền).\n// cx/cy = tâm, fw/fh = kích thước khung, z = mặt đặt (nhô ra), t = bề dày thanh.\nfunction goldFrame(b, cx, cy, z, fw, fh, t, mat = 'gold') {\n  b.slab(mat, fw, t, 0.03, [cx, cy + fh / 2 - t / 2, z], { ch: t * 0.3 });          // thanh trên\n  b.slab(mat, fw, t, 0.03, [cx, cy - fh / 2 + t / 2, z], { ch: t * 0.3 });          // thanh dưới\n  b.slab(mat, t, fh - 2 * t, 0.03, [cx - fw / 2 + t / 2, cy, z], { ch: t * 0.3 });  // thanh trái\n  b.slab(mat, t, fh - 2 * t, 0.03, [cx + fw / 2 - t / 2, cy, z], { ch: t * 0.3 });  // thanh phải\n}\n\n// ── 1. MŨ HUYẾT KIM (Head) — vòm đỏ kín + VƯƠNG MIỆN VÀNG trán + sống mũ vàng + khe visor tối ──\nexport function head(w, h, d, pal) {\n  const b = piece(M(pal));\n\n  // Vòm mũ đỏ bọc kín đầu (chamfer rộng cho mép bắt sáng mềm)\n  b.cover('plate', w, h, d, 1.16, 1.08, 1.16, [0, h * 0.05, 0]);\n  b.slab('plateLo', w * 1.1, h * 0.5, d * 0.55, [0, -h * 0.02, -d * 0.42], { ch: h * 0.1 }); // gáy sau che tóc\n  b.slab('plate', w * 1.05, h * 0.4, d * 0.5, [0, -h * 0.34, d * 0.5], { ch: h * 0.1 });      // hàm/cằm dưới (kín)\n\n  // VƯƠNG MIỆN VÀNG quanh trán — đai + 5 răng nhọn (trim-layering: khối mỏng nổi)\n  b.slab('gold', w * 1.22, h * 0.11, d * 1.22, [0, h * 0.28, 0], { ch: h * 0.02 });\n  for (let i = -2; i <= 2; i++) {\n    const big = i === 0;\n    b.slab(big ? 'goldHi' : 'gold', w * 0.08, h * (big ? 0.2 : 0.13), d * 0.06,\n      [i * w * 0.24, h * (0.4 + (big ? 0.03 : 0)), d * 0.5], { ch: w * 0.02 });\n  }\n\n  // Sống mũ vàng chạy dọc đỉnh (ridge) + gờ sáng\n  b.slab('gold', w * 0.12, h * 0.48, d * 0.92, [0, h * 0.5, -d * 0.02], { ch: h * 0.03 });\n  b.slab('goldHi', w * 0.04, h * 0.06, d * 0.94, [0, h * 0.72, -d * 0.02], { ch: h * 0.015 });\n\n  // Khe visor: thanh ngang mắt (tối) + rãnh dọc chữ T + 2 nẹp vàng kẹp trên-dưới khe\n  b.slab('dark', w * 0.62, h * 0.11, d * 0.1, [0, h * 0.02, d * 0.6], { ch: h * 0.02 });\n  b.slab('dark', w * 0.1, h * 0.34, d * 0.1, [0, -h * 0.12, d * 0.6], { ch: h * 0.02 });\n  b.slab('gold', w * 0.66, h * 0.03, d * 0.08, [0, h * 0.1, d * 0.61], { ch: h * 0.01 });\n  b.slab('goldDk', w * 0.66, h * 0.03, d * 0.08, [0, -h * 0.06, d * 0.61], { ch: h * 0.01 });\n\n  // Nẹp má vàng mảnh 2 bên (trim-layering, ôm dọc hàm)\n  b.both((sx) => b.slab('goldDk', w * 0.05, h * 0.62, d * 0.5, [sx * w * 0.56, -h * 0.06, d * 0.16], { ch: h * 0.01 }));\n\n  return b.build();\n}\n\n// Cẳng tay (gộp vào Áo giáp, slot 'forearm') — ống đỏ + 2 đai vàng + nẹp dọc.\nfunction forearmArmor(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.cover('plate', w, h, d, 1.18, 1.16, 1.18, [0, -h * 0.05, 0]);          // ống cẳng tay + mu bàn tay\n  b.slab('gold', w * 1.22, h * 0.09, d * 1.22, [0, h * 0.34, 0], { ch: h * 0.02 });  // đai vàng khuỷu\n  b.slab('goldDk', w * 1.22, h * 0.07, d * 1.22, [0, -h * 0.42, 0], { ch: h * 0.02 }); // đai vàng cổ tay\n  b.slab('goldDk', w * 0.09, h * 0.7, d * 0.06, [0, -h * 0.05, d * 0.58], { ch: h * 0.01 }); // nẹp dọc mu tay\n  return b.build();\n}\n\n// ── 2. ÁO GIÁP HUYẾT KIM (Body) — ngực đỏ khung vàng + huy hiệu + pauldron dome viền vàng + tà đỏ viền vàng ──\nexport function body(w, h, d, pal, slot) {\n  if (slot === 'forearm') return forearmArmor(w, h, d, pal);\n  if (slot === 'upperArm') {\n    const b = piece(M(pal));\n    b.cover('plate', w, h, d, 1.2, 1.5, 1.2, [0, h * 0.1, 0]);              // ống bắp tay (bù occlusion sArm)\n    b.slab('gold', w * 1.24, h * 0.09, d * 1.24, [0, h * 0.34, 0], { ch: h * 0.02 }); // đai vàng vai-tay\n    return b.build();\n  }\n\n  const b = piece(M(pal));\n  const fz = d * 0.58;\n\n  // ── phủ da cốt lõi (bọc kín 360) ──\n  b.slab('plateLo', w * 0.56, h * 0.44, d * 0.86, [0, h * 0.62, 0], { ch: h * 0.08 });  // cổ giáp cao\n  b.slab('gold', w * 0.62, h * 0.08, d * 0.92, [0, h * 0.44, 0], { ch: h * 0.02 });      // vòng cổ vàng\n  b.cover('plate', w, h, d, 1.22, 1.04, 1.24, [0, 0, 0]);                                 // thân/ngực chính\n  b.slab('plate', w * 1.16, h * 0.6, d * 1.18, [0, -h * 0.82, 0], { ch: h * 0.06 });      // hông/bụng dưới (nối tà)\n\n  // ── NGỰC: tấm lồi bắt sáng + KHUNG VÀNG cổ điển + huy hiệu kim cương ──\n  b.slab('plateHi', w * 0.92, h * 0.72, d * 0.24, [0, h * 0.08, fz], { ch: h * 0.1 });    // tấm ngực lồi\n  goldFrame(b, 0, h * 0.08, fz + d * 0.12, w * 0.82, h * 0.66, w * 0.06);                 // khung vàng quanh ngực\n  b.slab('goldHi', w * 0.26, h * 0.26, d * 0.06, [0, h * 0.12, fz + d * 0.14], { rot: [0, 0, Math.PI / 4], ch: w * 0.05 }); // huy hiệu kim cương vàng\n  b.slab('plateLo', w * 0.13, h * 0.13, d * 0.05, [0, h * 0.12, fz + d * 0.17], { rot: [0, 0, Math.PI / 4], ch: w * 0.03 }); // tâm huy hiệu (đỏ tối)\n\n  // ── đai eo vàng + nẹp dọc bụng ──\n  b.slab('gold', w * 1.24, h * 0.12, d * 1.26, [0, -h * 0.42, 0], { ch: h * 0.02 });\n  b.slab('goldDk', w * 0.1, h * 0.3, d * 0.06, [0, -h * 0.6, fz], { ch: h * 0.015 });\n\n  // ── PAULDRON: dome đỏ sâu z (bao cung vung bắp tay) + viền vàng mép + chóp vàng + váy vai rủ ──\n  b.both((sx) => {\n    b.slab('plateLo', w * 0.52, h * 0.66, d * 1.5, [sx * w * 0.9, h * 0.02, 0], { ch: h * 0.08 });   // VÁY VAI RỦ (che khe tay áo lộ)\n    b.slab('plate', w * 0.6, h * 0.34, d * 1.6, [sx * w * 0.8, h * 0.44, 0], { ch: h * 0.1 });      // đế dome (sâu z)\n    b.slab('plateHi', w * 0.5, h * 0.22, d * 1.4, [sx * w * 0.78, h * 0.66, 0], { ch: h * 0.1 });    // mái vòm trên\n    b.slab('gold', w * 0.64, h * 0.06, d * 1.62, [sx * w * 0.8, h * 0.3, 0], { ch: h * 0.02 });       // viền vàng mép dưới\n    b.slab('goldHi', w * 0.14, h * 0.14, d * 0.14, [sx * w * 0.86, h * 0.78, 0], { rot: [0, 0, sx * 0.5], ch: w * 0.03 }); // chóp vàng đỉnh vai\n  });\n\n  // ── ÁO CHOÀNG đỏ sau lưng (tĩnh, ngắn, lùi sâu -fz để không chạm chân khi bước) ──\n  b.both((sx) => {\n    b.slab('plateLo', w * 0.56, h * 1.3, d * 0.09, [sx * w * 0.4, -h * 0.1, -fz - d * 0.14], { ch: h * 0.05 });\n    b.slab('gold', w * 0.56, h * 0.05, d * 0.11, [sx * w * 0.4, -h * 0.74, -fz - d * 0.14], { ch: h * 0.015 });\n  });\n\n  // ── TÀ GIÁP đỏ viền vàng (trước dài + 2 hông + sau) — tabard hoàng gia ──\n  const sy = -h * 1.28;\n  b.push([0, sy, fz * 0.9]);\n  b.slab('plate', w * 0.84, h * 0.96, d * 0.14, [0, h * 0.1, 0], { ch: h * 0.05 });\n  goldFrame(b, 0, h * 0.02, d * 0.09, w * 0.66, h * 0.78, w * 0.05);                        // khung vàng trên tà trước\n  b.slab('goldHi', w * 0.18, h * 0.18, d * 0.05, [0, h * 0.12, d * 0.1], { rot: [0, 0, Math.PI / 4], ch: w * 0.04 }); // giọt kim cương giữa tà\n  b.pop();\n  b.both((sx) => {\n    b.push([sx * w * 0.56, sy, 0], [0, Math.PI / 2, 0]);\n    b.slab('plate', w * 0.5, h * 0.72, d * 0.13, [0, 0, 0], { ch: h * 0.05 });\n    b.slab('gold', w * 0.52, h * 0.05, d * 0.14, [0, -h * 0.34, 0], { ch: h * 0.015 });\n    b.pop();\n  });\n  b.push([0, sy, -fz * 0.9]);\n  b.slab('plate', w * 0.8, h * 0.66, d * 0.13, [0, 0, 0], { ch: h * 0.05 });\n  b.pop();\n  for (const sz of [1, -1]) b.slab('plate', w * 0.46, h * 0.4, d * 0.12, [0, -h * 1.48, sz * fz * 0.5], { ch: h * 0.05 }); // đũng giữa\n\n  return b.build();\n}\n\n// ── 3. QUẦN HUYẾT KIM (Legs) — đùi/cẳng đỏ + nẹp vàng dọc + đai gối vàng ──\nexport function legs(w, h, d, pal, slot) {\n  const b = piece(M(pal));\n  if (slot === 'shin') {\n    b.cover('plate', w, h, d, 1.16, 1.08, 1.2, [0, 0, 0]);\n    b.slab('gold', w * 1.2, h * 0.08, d * 1.24, [0, h * 0.4, 0], { ch: h * 0.02 });          // đai gối vàng\n    b.slab('goldDk', w * 0.5, h * 0.5, d * 0.06, [0, -h * 0.05, d * 0.6], { ch: h * 0.02 });   // nẹp ống chân vàng tối\n    return b.build();\n  }\n  // đùi\n  b.cover('plate', w, h, d, 1.16, 1.06, 1.2, [0, 0, 0]);\n  b.slab('gold', w * 1.22, h * 0.1, d * 1.26, [0, h * 0.42, 0], { ch: h * 0.02 });            // đai hông-đùi vàng\n  b.slab('plateHi', w * 0.6, h * 0.42, d * 0.2, [0, -h * 0.05, d * 0.62], { ch: h * 0.08 });   // giáp đùi trước lồi\n  b.slab('goldDk', w * 0.5, h * 0.06, d * 0.08, [0, -h * 0.24, d * 0.72], { ch: h * 0.015 });  // gờ vàng đáy giáp đùi\n  return b.build();\n}\n\n// ── 4. GIÀY HUYẾT KIM (Feet) — ủng đỏ mũi vuông + mũi vàng + đai cổ chân vàng ──\nexport function feet(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.cover('plate', w, h, d, 1.16, 1.4, 1.5, [0, h * 0.22, d * 0.12]);\n  b.slab('plateHi', w * 1.12, h * 0.5, d * 0.5, [0, h * 0.02, d * 0.72], { ch: h * 0.14 });    // mũi ủng vuông lồi\n  b.slab('gold', w * 1.16, h * 0.1, d * 0.42, [0, h * 0.22, d * 0.74], { ch: h * 0.02 });       // mũi vàng\n  b.slab('gold', w * 1.2, h * 0.08, d * 1.24, [0, h * 0.42, 0], { ch: h * 0.02 });              // đai cổ chân vàng\n  b.cover('plateLo', w, h, d, 1.18, 0.65, 1.52, [0, -h * 0.5, d * 0.1]);                        // đế ủng tối\n  return b.build();\n}\n\nexport const BLOODGOLD = { head, body, legs, feet };\n\n```\n",
  "titanium_blade": "# Bộ Giáp Titanium Blade (Đông Phương Sát Thủ Set)\n\nBộ giáp titan Grade 3 theo chuẩn Armor-Roadmap 3.0 (Dùng chung cho cả 3 lớp).\n- **Chất liệu**: Thép Titan đen mờ, viền đồng hun chạm khắc cổ, lụa đỏ rực rủ đai, mắt thú đỏ phát sáng.\n- **Điểm nhấn**: Nón lá thép chỏm nhọn, cầu vai giáp thú 2 đầu gai nhọn, đai vải lụa đỏ rủ dài trước đùi.\n- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).\n\n```javascript\n// Sẵn có hàm piece() từ armorKit\n\n// ═══════════════════════════════════════════════════════════════════════════\n// GRADE 3 — TITANIUM BLADE (Đông Phương Sát Thủ Set) — Titan.\n// 2026-09-08: bộ CHÍNH THỨC theo Armor-Roadmap 3.0 — DÙNG CHUNG cho cả 3 lớp (xem LL-AR-001 §3.5c).\n// Mũ nón lá thép chỏm nhọn, cầu vai giáp thú 2 đầu gai nhọn, đai vải đỏ thẫm rủ hông.\n// ═══════════════════════════════════════════════════════════════════════════\n\nconst M = (pal) => ({\n  titanPlate: { color: 0x242830, metalness: 0.88, roughness: 0.28 }, // Thép Titan đen mờ\n  titanHi:    { color: 0x64748b, metalness: 0.95, roughness: 0.18 }, // Viền kim loại xước bắt sáng\n  bronzeTrim: { color: 0xb8860b, metalness: 0.90, roughness: 0.25 }, // Đồng hun chạm khắc cổ\n  redCloth:   { color: 0x991b1b, metalness: 0.05, roughness: 0.85 }, // Vải lụa đỏ rực rủ đai\n  innerSuit:  { color: 0x0f1115, metalness: 0.05, roughness: 0.92 }, // Vải lót đen mun\n  glowRed:    { color: 0xef4444, metalness: 0.10, roughness: 0.20, emissive: 0xb91c1c, emissiveIntensity: 0.85 }, // Lõi mắt thú phát sáng\n});\n\n// 1. MŨ NÓN LÁ TITAN (Head) — Nón lá kim loại có chỏm cao\nexport function head(w, h, d, pal) {\n  const b = piece(M(pal));\n\n  // Mũ trùm nền đen bọc kín đầu\n  b.cover('innerSuit', w, h, d, 1.12, 1.05, 1.12, [0, h * 0.04, 0]);\n\n  // Vành nón lá kim loại xòe rộng\n  b.slab('titanPlate', w * 2.20, h * 0.12, d * 2.20, [0, h * 0.35, 0], { ch: h * 0.08 });\n  b.slab('bronzeTrim', w * 2.24, h * 0.04, d * 2.24, [0, h * 0.31, 0], { ch: 0 });\n\n  // Chỏm nón lá vát nhọn vươn cao\n  b.slab('titanHi', w * 0.45, h * 0.35, d * 0.45, [0, h * 0.55, 0], { ch: h * 0.06 });\n  b.slab('bronzeTrim', w * 0.18, h * 0.30, d * 0.18, [0, h * 0.82, 0], { ch: 0 });\n\n  // Khăn che cằm & nẹp mặt nạ\n  b.slab('titanPlate', w * 0.85, h * 0.30, d * 0.15, [0, -h * 0.35, d * 0.52], { ch: 0 });\n\n  return b.build();\n}\n\n// Helper cẳng tay: găng tay giáp nẹp đồng quấn dây đỏ\nfunction forearmArmor(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.cover('innerSuit', w, h, d, 1.10, 1.02, 1.10, [0, 0, 0]);\n  b.cover('titanPlate', w, h, d, 1.15, 0.85, 1.15, [0, -h * 0.02, 0]);\n\n  // Tấm nẹp cẳng tay chạm hoa văn đồng\n  b.slab('bronzeTrim', w * 0.30, h * 0.65, d * 0.12, [0, 0, d * 0.60], { ch: h * 0.03 });\n  b.slab('redCloth', w * 1.18, h * 0.08, d * 1.18, [0, h * 0.25, 0], { ch: 0 });\n  b.slab('redCloth', w * 1.18, h * 0.08, d * 1.18, [0, -h * 0.25, 0], { ch: 0 });\n\n  return b.build();\n}\n\n// 2. ÁO GIÁP TITANIUM (Body) — Cầu vai 2 đầu giáp thú + Đai lụa đỏ\nexport function body(w, h, d, pal, slot) {\n  const mats = M(pal);\n\n  if (slot === 'upperArm') {\n    const b = piece(mats);\n    b.cover('innerSuit', w, h, d, 1.10, 1.02, 1.10, [0, 0, 0]);\n    b.cover('titanPlate', w, h, d, 1.15, 0.92, 1.15, [0, -h * 0.04, 0]);\n    b.slab('redCloth', w * 1.18, h * 0.10, d * 1.18, [0, -h * 0.35, 0], { ch: 0 });\n    return b.build();\n  }\n\n  if (slot === 'forearm') {\n    return forearmArmor(w, h, d, pal);\n  }\n\n  const b = piece(mats);\n  const fz = d * 0.58;\n\n  // Lót giáp đen bọc kín chống hở da\n  b.cover('innerSuit', w, h, d, 1.18, 1.12, 1.20, [0, -h * 0.05, 0]);\n  b.cover('titanPlate', w, h, d, 1.22, 1.04, 1.24, [0, 0, 0]);\n\n  // CẦU VAI GIÁP THÚ 2 ĐẦU GỜ NỔI (Monster Skull Pauldrons)\n  b.both((sx) => {\n    // Khối giáp vai chính\n    b.slab('titanHi', w * 0.58, h * 0.32, d * 1.28, [sx * w * 0.62, h * 0.44, 0], { ch: h * 0.06 });\n    // Đầu thú 1 (gai ngoài)\n    b.slab('bronzeTrim', w * 0.25, h * 0.28, d * 0.30, [sx * w * 0.85, h * 0.52, d * 0.30], { ch: h * 0.04 });\n    // Đầu thú 2 (gai trong)\n    b.slab('bronzeTrim', w * 0.25, h * 0.28, d * 0.30, [sx * w * 0.85, h * 0.52, -d * 0.30], { ch: h * 0.04 });\n    // Mắt đỏ phát sáng trên đầu thú\n    b.slab('glowRed', w * 0.10, h * 0.10, d * 0.10, [sx * w * 0.92, h * 0.55, d * 0.30], { ch: 0 });\n    b.slab('glowRed', w * 0.10, h * 0.10, d * 0.10, [sx * w * 0.92, h * 0.55, -d * 0.30], { ch: 0 });\n  });\n\n  // Tấm ngực chạm rồng / hoa văn đồng\n  b.slab('bronzeTrim', w * 0.78, h * 0.42, d * 0.10, [0, h * 0.10, fz + 0.02], { ch: h * 0.04 });\n  b.slab('titanHi', w * 0.40, h * 0.25, d * 0.06, [0, h * 0.10, fz + 0.08], { ch: 0 });\n\n  // ĐAI VẢI LỤA ĐỎ THẮT LƯNG RỦ DẢI GIỮA\n  b.slab('redCloth', w * 1.26, h * 0.18, d * 1.28, [0, -h * 0.44, 0], { ch: 0 });\n  b.slab('bronzeTrim', w * 0.30, h * 0.22, d * 0.12, [0, -h * 0.44, fz + 0.05], { ch: 0 });\n\n  // Dải lụa đỏ rủ dài xuống đùi\n  b.slab('redCloth', w * 0.32, h * 0.80, d * 0.06, [0, -h * 0.85, fz + 0.03], { ch: 0 });\n\n  return b.build();\n}\n\n// 3. QUẦN TITANIUM (Legs) — Giáp đùi xếp lớp kiểu Đông Phương\nexport function legs(w, h, d, pal, slot) {\n  const b = piece(M(pal));\n\n  if (slot === 'shin') {\n    b.cover('innerSuit', w, h, d, 1.10, 1.05, 1.12, [0, 0, 0]);\n    b.cover('titanPlate', w, h, d, 1.14, 0.92, 1.16, [0, 0, 0]);\n    b.slab('bronzeTrim', w * 0.38, h * 0.28, d * 0.10, [0, h * 0.22, d * 0.60], { ch: 0 });\n    b.slab('redCloth', w * 1.16, h * 0.06, d * 1.18, [0, h * 0.40, 0], { ch: 0 });\n    return b.build();\n  }\n\n  // Đùi\n  b.cover('innerSuit', w, h, d, 1.10, 1.05, 1.12, [0, 0, 0]);\n  b.cover('titanPlate', w, h, d, 1.14, 0.95, 1.16, [0, 0, 0]);\n  b.slab('bronzeTrim', w * 0.42, h * 0.35, d * 0.10, [0, 0, d * 0.60], { ch: 0 });\n\n  return b.build();\n}\n\n// 4. GIÀY TITANIUM (Feet) — Ủng da đen bịt đồng cổ điển\nexport function feet(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.cover('innerSuit', w, h, d, 1.14, 1.35, 1.40, [0, h * 0.18, d * 0.08]);\n  b.slab('bronzeTrim', w * 0.42, h * 0.15, d * 0.38, [0, h * 0.15, d * 0.62], { ch: 0 });\n  b.slab('redCloth', w * 1.16, h * 0.08, d * 1.18, [0, h * 0.35, 0], { ch: 0 });\n  return b.build();\n}\n\nexport const TITANIUM_BLADE = { head, body, legs, feet };\n\n```\n",
  "golden_turtle": "# Bộ Giáp Kim Quy Hoàng Triều (Golden Turtle Dynasty Set)\n\nBộ giáp hoàng kim lấy cảm hứng từ Thần Kim Quy và hoa văn Đại Việt cổ điển.\n- **Phong cách**: `armorKit` vát cạnh 45 độ, đan xen phiến giáp vàng kim và ngọc lục bảo.\n- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).\n- **Ghi chú**: Cẳng tay gộp vào Áo giáp (`slot === 'forearm'`), Giày (`feet`) có hàm riêng.\n\n```javascript\n// Sẵn có hàm piece() từ armorKit\n\n// ═══════════════════════════════════════════════════════════════════════════\n// BỘ GIÁP KIM QUY HOÀNG TRIỀU (Golden Turtle Dynasty Set)\n// Chuẩn kiến trúc 2026-09-08: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).\n// ═══════════════════════════════════════════════════════════════════════════\n\nconst M = (pal) => ({\n  gold:     { color: 0xd4af37, metalness: 0.88, roughness: 0.32 },\n  goldDark: { color: 0x8a6d1a, metalness: 0.82, roughness: 0.45 },\n  jade:     { color: 0x1f7a4d, metalness: 0.15, roughness: 0.35, emissive: 0x0a3820, emissiveIntensity: 0.4 },\n  cloth:    { color: 0x6e1b24, metalness: 0.05, roughness: 0.92 },\n  steel:    { color: 0x9ba2ad, metalness: 0.92, roughness: 0.30 },\n  glow:     { color: 0x54e8cf, metalness: 0.1,  roughness: 0.2, emissive: 0x54e8cf, emissiveIntensity: 0.9 },\n});\n\n// 1. MŨ (Head)\nexport function head(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.bandStack('gold', { w: w * 1.12, h: h * 1.25, d: d * 1.24, y: h * 0.18, count: 4, taper: 0.08, trim: 'goldDark' });\n  b.cover('gold', w, h, d, 0.95, 0.22, 1.05, [0, h * 0.86, 0]);\n  b.slab('jade', w * 0.64, h * 0.24, d * 0.14, [0, h * 0.42, d * 0.65], { ch: h * 0.04 });\n  b.slab('glow', w * 0.22, h * 0.14, d * 0.08, [0, h * 0.42, d * 0.72], { ch: h * 0.02 });\n\n  b.both((sx) => {\n    b.slab('gold', w * 0.18, h * 0.82, d * 1.05, [sx * w * 0.48, -h * 0.12, d * 0.05], { ch: h * 0.06 });\n  });\n\n  b.slab('goldDark', w * 0.86, h * 0.28, d * 0.22, [0, -h * 0.45, d * 0.54], { ch: h * 0.05 });\n  return b.build();\n}\n\n// Helper cẳng tay (gộp vào Áo giáp theo chuẩn 2026-09-08)\nfunction forearmArmor(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.cover('cloth', w, h, d, 1.12, 1.05, 1.12, [0, 0, 0]);\n  b.bandStack('gold', { w: w * 1.25, h: h * 0.78, d: d * 1.25, y: -h * 0.1, count: 3, taper: 0.04, trim: 'goldDark' });\n  b.slab('jade', w * 0.36, h * 0.32, d * 0.16, [0, -h * 0.15, d * 0.65], { ch: h * 0.03 });\n  return b.build();\n}\n\n// 2. ÁO GIÁP (Body) — gồm Ngực/thân + Bắp tay (upperArm) + Cẳng tay (forearm)\nexport function body(w, h, d, pal, slot) {\n  const mats = M(pal);\n\n  if (slot === 'upperArm') {\n    const b = piece(mats);\n    b.bandStack('gold', { w: w * 1.24, h: h * 0.85, d: d * 1.24, y: -h * 0.22, count: 3, taper: 0.05, trim: 'goldDark' });\n    b.slab('goldDark', w * 1.28, h * 0.08, d * 1.28, [0, -h * 0.62, 0], { ch: h * 0.02 });\n    b.slab('gold', w * 1.15, h * 0.48, d * 0.92, [0, h * 0.24, 0], { ch: h * 0.04 });\n    b.slab('jade', w * 0.32, h * 0.28, d * 0.14, [0, h * 0.46, d * 0.60], { ch: h * 0.03 });\n    return b.build();\n  }\n\n  if (slot === 'forearm') {\n    return forearmArmor(w, h, d, pal);\n  }\n\n  const b = piece(mats);\n  b.slab('cloth', w * 0.48, h * 0.42, d * 0.75, [0, h * 0.62, 0], { ch: h * 0.08 });\n  b.slab('goldDark', w * 0.52, h * 0.08, d * 0.80, [0, h * 0.52, 0], { ch: h * 0.02 });\n  b.cover('gold', w, h, d, 1.22, 1.05, 1.25, [0, 0, 0]);\n\n  b.both((sx) => {\n    b.slab('gold', w * 0.48, h * 0.35, d * 1.28, [sx * w * 0.58, h * 0.42, 0], { ch: h * 0.06 });\n    b.slab('jade', w * 0.24, h * 0.22, d * 0.15, [sx * w * 0.58, h * 0.48, d * 0.58], { ch: h * 0.03 });\n  });\n\n  b.slab('jade', w * 0.38, h * 0.38, d * 0.18, [0, h * 0.15, d * 0.64], { ch: h * 0.04 });\n  b.slab('glow', w * 0.16, h * 0.16, d * 0.10, [0, h * 0.15, d * 0.72], { ch: h * 0.02 });\n\n  const sy = -h * 0.82;\n  b.slab('goldDark', w * 1.16, h * 0.15, d * 1.20, [0, -h * 0.48, 0], { ch: h * 0.02 });\n  b.slab('cloth', w * 0.75, h * 0.52, d * 0.12, [0, sy - h * 0.05, d * 0.60], { ch: h * 0.03 });\n  b.slab('gold', w * 0.55, h * 0.38, d * 0.14, [0, sy, d * 0.62], { ch: h * 0.03 });\n  b.slab('cloth', w * 0.95, h * 0.62, d * 0.12, [0, sy - h * 0.08, -d * 0.60], { ch: h * 0.03 });\n\n  return b.build();\n}\n\n// 3. QUẦN (Legs) — Đùi (thigh) & Cẳng chân (shin)\nexport function legs(w, h, d, pal, slot) {\n  const b = piece(M(pal));\n  if (slot === 'shin') {\n    b.cover('cloth', w, h, d, 1.08, 1.02, 1.16, [0, h * 0.10, 0]);\n    b.bandStack('gold', { w: w * 1.20, h: h * 0.78, d: d * 1.24, y: -h * 0.1, count: 3, taper: 0.03, trim: 'goldDark' });\n    b.slab('jade', w * 0.34, h * 0.35, d * 0.15, [0, h * 0.25, d * 0.62], { ch: h * 0.03 });\n    return b.build();\n  }\n  // đùi (thigh / default)\n  b.cover('cloth', w, h, d, 1.08, 1.04, 1.18, [0, 0, 0]);\n  b.slab('gold', w * 1.18, h * 0.14, d * 1.20, [0, h * 0.35, 0], { ch: h * 0.02 });\n  b.slab('jade', w * 0.35, h * 0.28, d * 0.15, [0, -h * 0.25, d * 0.62], { ch: h * 0.04 });\n  return b.build();\n}\n\n// 4. GIÀY (Feet) — Bàn chân / Ủng riêng\nexport function feet(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.cover('gold', w, h, d, 1.18, 1.42, 1.48, [0, h * 0.22, d * 0.12]);\n  b.slab('jade', w * 0.45, h * 0.15, d * 0.40, [0, h * 0.18, d * 0.65], { ch: h * 0.02 });\n  b.cover('goldDark', w, h, d, 1.20, 0.65, 1.50, [0, -h * 0.52, d * 0.10]);\n  return b.build();\n}\n\nexport const GOLDEN_TURTLE = { head, body, legs, feet };\n\n```\n",
  "black_tortoise": "# Bộ Giáp Huyền Vũ Chiến Thần (Black Tortoise War God Set)\n\nBộ chiến giáp cận chiến hạng nặng phong cách Huyền Vũ (Chiến Binh - Warrior).\n- **Chất liệu**: Thép đen Titan, viền đồng hun cổ, ngọc lục bảo phát quang, lụa tím hoàng gia.\n- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).\n\n```javascript\n// Sẵn có hàm piece() từ armorKit\n\n// ═══════════════════════════════════════════════════════════════════════════\n// BỘ GIÁP HUYỀN VŨ CHIẾN THẦN (Black Tortoise War God Set)\n// Chuẩn kiến trúc 2026-09-08: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).\n// ═══════════════════════════════════════════════════════════════════════════\n\nconst M = (pal) => ({\n  plate:    { color: 0x15181e, metalness: 0.85, roughness: 0.38 },\n  plateLo:  { color: 0x0c0e12, metalness: 0.75, roughness: 0.52 },\n  plateHi:  { color: 0x2b313d, metalness: 0.90, roughness: 0.30 },\n  copper:   { color: 0xc68a4c, metalness: 0.95, roughness: 0.28 },\n  jade:     { color: 0x2ecc71, metalness: 0.15, roughness: 0.35, emissive: 0x1b7943, emissiveIntensity: 0.6 },\n  cloth:    { color: 0x4a154b, metalness: 0.05, roughness: 0.92 },\n  leather:  { color: 0x3d271d, metalness: 0.08, roughness: 0.85 },\n  glow:     { color: 0x54e8cf, metalness: 0.10, roughness: 0.20, emissive: 0x54e8cf, emissiveIntensity: 0.95 },\n});\n\n// 1. MŨ (Head)\nexport function head(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.bandStack('plate', { w: w * 1.14, h: h * 1.28, d: d * 1.26, y: h * 0.16, count: 4, taper: 0.07, trim: 'plateLo' });\n  b.cover('plateHi', w, h, d, 0.92, 0.22, 1.05, [0, h * 0.86, 0]);\n  for (let i = 0; i < 4; i++) {\n    const t = i / 3;\n    const segH = h * (0.42 - 0.15 * t);\n    const z = d * (0.35 - 0.7 * t);\n    b.slab('copper', w * 0.14, segH, d * 0.2, [0, h * 0.62 + segH / 2, z], { ch: h * 0.03 });\n  }\n  b.slab('copper', w * 1.18, h * 0.12, d * 0.2, [0, h * 0.38, d * 0.62], { ch: h * 0.03 });\n  b.slab('jade', w * 0.38, h * 0.16, d * 0.12, [0, h * 0.38, d * 0.72], { ch: h * 0.03 });\n  b.slab('glow', w * 0.14, h * 0.10, d * 0.08, [0, h * 0.38, d * 0.78], { ch: h * 0.02 });\n  b.both((sx) => {\n    b.slab('plate', w * 0.2, h * 0.84, d * 1.08, [sx * w * 0.48, -h * 0.12, d * 0.06], { ch: h * 0.06 });\n    b.slab('copper', w * 0.06, h * 0.62, d * 0.08, [sx * w * 0.48, -h * 0.22, d * 0.6], { ch: h * 0.02 });\n  });\n  b.slab('plateLo', w * 0.92, h * 0.38, d * 0.22, [0, -h * 0.42, d * 0.54], { ch: h * 0.06 });\n  return b.build();\n}\n\n// Helper cẳng tay (gộp vào Áo giáp theo chuẩn 2026-09-08)\nfunction forearmArmor(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.cover('cloth', w, h, d, 1.12, 1.05, 1.12, [0, 0, 0]);\n  b.bandStack('plate', { w: w * 1.26, h: h * 0.80, d: d * 1.26, y: -h * 0.1, count: 3, taper: 0.04, trim: 'plateLo' });\n  b.slab('copper', w * 1.28, h * 0.08, d * 1.28, [0, h * 0.28, 0], { ch: h * 0.02 });\n  b.slab('jade', w * 0.36, h * 0.32, d * 0.16, [0, -h * 0.15, d * 0.65], { ch: h * 0.03 });\n  b.slab('glow', w * 0.12, h * 0.12, d * 0.10, [0, -h * 0.15, d * 0.72], { ch: h * 0.02 });\n  return b.build();\n}\n\n// 2. ÁO GIÁP (Body) — gồm Ngực/thân + Bắp tay (upperArm) + Cẳng tay (forearm)\nexport function body(w, h, d, pal, slot) {\n  const mats = M(pal);\n  if (slot === 'upperArm') {\n    const b = piece(mats);\n    b.bandStack('plate', { w: w * 1.25, h: h * 0.84, d: d * 1.25, y: -h * 0.24, count: 3, taper: 0.04, trim: 'plateLo' });\n    b.slab('copper', w * 1.28, h * 0.08, d * 1.28, [0, -h * 0.64, 0], { ch: h * 0.02 });\n    b.slab('plate', w * 1.16, h * 0.48, d * 0.92, [0, h * 0.24, 0], { ch: h * 0.04 });\n    b.slab('jade', w * 0.32, h * 0.28, d * 0.14, [0, h * 0.46, d * 0.60], { ch: h * 0.03 });\n    return b.build();\n  }\n\n  if (slot === 'forearm') {\n    return forearmArmor(w, h, d, pal);\n  }\n\n  const b = piece(mats);\n  b.slab('cloth', w * 0.48, h * 0.44, d * 0.78, [0, h * 0.62, 0], { ch: h * 0.08 });\n  b.slab('copper', w * 0.52, h * 0.08, d * 0.82, [0, h * 0.54, 0], { ch: h * 0.02 });\n  b.cover('plate', w, h, d, 1.24, 1.06, 1.26, [0, 0, 0]);\n\n  b.both((sx) => {\n    b.slab('plateHi', w * 0.52, h * 0.38, d * 1.30, [sx * w * 0.58, h * 0.42, 0], { ch: h * 0.06 });\n    b.slab('copper', w * 0.14, h * 0.42, d * 1.32, [sx * w * 0.78, h * 0.44, 0], { ch: h * 0.03 });\n    b.slab('jade', w * 0.24, h * 0.22, d * 0.15, [sx * w * 0.58, h * 0.48, d * 0.60], { ch: h * 0.03 });\n  });\n\n  b.slab('copper', w * 0.42, h * 0.42, d * 0.18, [0, h * 0.15, d * 0.64], { ch: h * 0.04 });\n  b.slab('jade', w * 0.24, h * 0.24, d * 0.12, [0, h * 0.15, d * 0.72], { ch: h * 0.03 });\n  b.slab('glow', w * 0.10, h * 0.10, d * 0.08, [0, h * 0.15, d * 0.78], { ch: h * 0.02 });\n\n  const sy = -h * 0.82;\n  b.slab('leather', w * 1.18, h * 0.16, d * 1.22, [0, -h * 0.46, 0], { ch: h * 0.02 });\n  b.slab('copper', w * 0.32, h * 0.20, d * 0.14, [0, -h * 0.46, d * 0.63], { ch: h * 0.02 });\n\n  b.slab('cloth', w * 0.78, h * 0.54, d * 0.12, [0, sy - h * 0.05, d * 0.60], { ch: h * 0.03 });\n  b.slab('plate', w * 0.56, h * 0.40, d * 0.14, [0, sy, d * 0.62], { ch: h * 0.03 });\n  b.slab('copper', w * 0.12, h * 0.42, d * 0.15, [0, sy, d * 0.68], { ch: h * 0.02 });\n  b.slab('cloth', w * 0.96, h * 0.64, d * 0.12, [0, sy - h * 0.08, -d * 0.60], { ch: h * 0.03 });\n\n  return b.build();\n}\n\n// 3. QUẦN (Legs) — Đùi (thigh) & Cẳng chân (shin)\nexport function legs(w, h, d, pal, slot) {\n  const b = piece(M(pal));\n  if (slot === 'shin') {\n    b.cover('cloth', w, h, d, 1.08, 1.02, 1.16, [0, h * 0.10, 0]);\n    b.bandStack('plate', { w: w * 1.22, h: h * 0.80, d: d * 1.25, y: -h * 0.1, count: 3, taper: 0.03, trim: 'plateLo' });\n    b.slab('copper', w * 0.36, h * 0.36, d * 0.16, [0, h * 0.25, d * 0.62], { ch: h * 0.03 });\n    b.slab('jade', w * 0.20, h * 0.20, d * 0.12, [0, h * 0.25, d * 0.68], { ch: h * 0.02 });\n    return b.build();\n  }\n  // đùi (thigh / default)\n  b.cover('cloth', w, h, d, 1.08, 1.04, 1.18, [0, 0, 0]);\n  b.slab('copper', w * 1.20, h * 0.14, d * 1.22, [0, h * 0.36, 0], { ch: h * 0.02 });\n  b.slab('plate', w * 0.48, h * 0.34, d * 0.18, [0, -h * 0.22, d * 0.60], { ch: h * 0.04 });\n  b.slab('jade', w * 0.24, h * 0.22, d * 0.12, [0, -h * 0.22, d * 0.68], { ch: h * 0.03 });\n  return b.build();\n}\n\n// 4. GIÀY (Feet) — Bàn chân / Ủng riêng\nexport function feet(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.cover('plate', w, h, d, 1.20, 1.45, 1.50, [0, h * 0.22, d * 0.12]);\n  b.slab('copper', w * 0.48, h * 0.16, d * 0.42, [0, h * 0.18, d * 0.66], { ch: h * 0.02 });\n  b.slab('glow', w * 0.14, h * 0.12, d * 0.10, [0, h * 0.18, d * 0.78], { ch: h * 0.02 });\n  b.cover('plateLo', w, h, d, 1.22, 0.66, 1.52, [0, -h * 0.52, d * 0.10]);\n  return b.build();\n}\n\nexport const BLACK_TORTOISE = { head, body, legs, feet };\n\n```\n",
  "warrior_royal": "# Bộ Giáp Hiệp Sĩ Bạch Kim (Warrior Royal Set)\n\nBộ giáp thử nghiệm phá khung Silhouette lớn phong cách Hiệp Sĩ Hoàng Gia.\n- **Chất liệu**: Giáp nền trắng-ngà, viền vàng kim to bản, lông thú trắng phồng lớn, áo choàng sau lưng.\n- **Điểm nhấn**: Cầu vai vòm cầu b.sphere mượt mà cong 97 độ, cổ lông thú mantle liền khối, T-visor đen và khe mắt đỏ glow.\n- **Quy cách (Chuẩn 2026-09-08)**: 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).\n\n```javascript\n// Sẵn có hàm piece() từ armorKit\nfunction sigilWarrior(b, g, gd, x, y, z, s, t) {\n  b.slab(g, s * 0.86, s * 0.78, t, [x, y + s * 0.08, z], { ch: s * 0.22 });\n  b.slab(g, s * 0.46, s * 0.46, t, [x, y - s * 0.4, z], { rot: [0, 0, Math.PI / 4], ch: s * 0.06 });\n  b.slab(gd, s * 0.5, s * 0.14, t * 0.9, [x - s * 0.15, y + s * 0.12, z + t * 0.55], { rot: [0, 0, 0.62], ch: s * 0.03 });\n  b.slab(gd, s * 0.5, s * 0.14, t * 0.9, [x + s * 0.15, y + s * 0.12, z + t * 0.55], { rot: [0, 0, -0.62], ch: s * 0.03 });\n  b.slab(gd, s * 0.5, s * 0.14, t * 0.9, [x - s * 0.15, y - s * 0.14, z + t * 0.55], { rot: [0, 0, 0.62], ch: s * 0.03 });\n  b.slab(gd, s * 0.5, s * 0.14, t * 0.9, [x + s * 0.15, y - s * 0.14, z + t * 0.55], { rot: [0, 0, -0.62], ch: s * 0.03 });\n}\nfunction attachSigil(b, classKey, g, gd, x, y, z, s, t) {\n  sigilWarrior(b, g, gd, x, y, z, s, t);\n}\n\n// ═══════════════════════════════════════════════════════════════════════════\n// WARRIOR \"Hiệp Sĩ Bạch Kim\" — PROTOTYPE PHÁ KHUNG (2026-09-07).\n// Lấy mẫu từ ảnh tham chiếu lead gửi: giáp trắng-ngà + viền VÀNG KIM to bản + PAULDRON LÔNG THÚ trắng\n// phồng lớn ở vai + áo choàng sau lưng + tà giáp dài trước. CHỦ ĐÍCH: im lặng bằng SILHOUETTE LỚN,\n// KHÔNG chạm khắc chi tiết nhỏ (khác hẳn phong cách \"khắc-tấm-mảnh\" của 3 bộ base0/rarity cũ).\n// Luật vẫn giữ: KHÔNG xuyên khối (mane/cape/tà đã canh khoảng hở với khớp tay/chân khi vung/bước).\n// Luật NỚI: chấp nhận hở da nhỏ ở khe khớp — không cần LEAK=0 tuyệt đối như trước.\n// Đây là bộ THỬ NGHIỆM (setKey 'warriorRoyal', đăng ký EXTRA_ARMOR_SETS) — CHƯA phải 1 trong 39 bộ\n// chính thức theo Roadmap 2.2, chỉ để lead duyệt hướng thẩm mỹ trước khi áp dụng rộng.\n\nconst M = (pal) => ({\n  plate:   { color: 0xf2ede0, metalness: 0.5,  roughness: 0.3 },   // giáp nền trắng-ngà\n  plateHi: { color: 0xfffdf5, metalness: 0.55, roughness: 0.2 },   // khối chính bắt sáng\n  plateLo: { color: 0xc9c2ab, metalness: 0.42, roughness: 0.42 },  // khe/lót tối hơn\n  gold:    { color: 0xd9a916, metalness: 0.78, roughness: 0.26 },  // viền vàng kim (điểm nhấn chính)\n  goldDk:  { color: 0x9c7209, metalness: 0.7,  roughness: 0.32 },  // vàng tối (khoá đai)\n  mane:    { color: 0xf8f4e9, metalness: 0.04, roughness: 0.9 },   // lông thú trắng phồng (pauldron)\n  maneSh:  { color: 0xdbd4bd, metalness: 0.04, roughness: 0.92 },  // lông thú vùng khuất bóng\n  dark:    { color: 0x14171c, metalness: 0.5,  roughness: 0.35 }, // khe visor\n  glow:    { color: pal.trim ?? 0xd0392b, metalness: 0.2, roughness: 0.4, emissive: pal.trim ?? 0xd0392b, emissiveIntensity: 0.85 }, // khe mắt — giữ màu ĐỎ class-identity của Warrior\n  glyph:     { color: 0xd9a916, metalness: 0.5, roughness: 0.3 },\n  glyphDark: { color: 0x14171c, metalness: 0.3, roughness: 0.5 },\n});\n\n// MŨ — mũ trùm kín 1 khối lớn + T-visor tối + khe mắt đỏ glow + crest lưng 1 lưỡi lớn + viền vàng.\nfunction head(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.slab('plate', w * 1.3, h * 1.08, d * 1.3, [0, h * 0.06, -d * 0.04], { ch: h * 0.22 });  // chỏm mũ kín 1 khối lớn (to hơn, TRÙM HẾT tóc)\n  b.slab('plate', w * 1.1, h * 0.7, d * 0.55, [0, h * 0.02, -d * 0.42], { ch: h * 0.14 });  // gáy sau — phủ thêm tóc phía sau\n  b.slab('plate', w * 1.04, h * 0.34, d * 0.56, [0, -h * 0.34, d * 0.52], { ch: h * 0.12 }); // hàm dưới\n  b.slab('gold', w * 1.26, h * 0.09, d * 1.22, [0, h * 0.3, 0], { ch: h * 0.02 });          // đai trán vàng\n  b.slab('dark', w * 0.13, h * 0.46, d * 0.15, [0, 0, d * 0.58], { ch: h * 0.02 });         // T-visor dọc\n  b.slab('glow', w * 0.48, h * 0.065, d * 0.1, [0, h * 0.12, d * 0.6], { ch: h * 0.015 });  // khe mắt đỏ glow\n  b.slab('plate', w * 0.18, h * 0.4, d * 0.9, [0, h * 0.68, -d * 0.02], { ch: h * 0.11 });  // crest lưng 1 lưỡi lớn — ÁP SÁT đỉnh mũ, không nổi lửng lơ\n  b.slab('gold', w * 0.06, h * 0.06, d * 0.94, [0, h * 0.9, -d * 0.02], { ch: h * 0.018 }); // gờ vàng đỉnh crest\n  b.slab('gold', w * 1.0, h * 0.05, d * 0.5, [0, -h * 0.46, d * 0.5], { ch: h * 0.015 });   // viền vàng cằm\n  return b.build();\n}\n\n// ỐNG BẮP TAY (gắn vào tay -> vung theo vai). Tay áo trắng bậc thang + đai vàng giữa.\nfunction upperArm(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.bandStack('plate', { w: w * 1.28, h: h * 1.1, d: d * 1.26, y: -h * 0.36, count: 3, taper: 0.03, trim: 'plateLo' }); // kéo dài xuống che khuỷu\n  b.slab('plate', w * 1.3, h * 0.5, d * 1.28, [0, h * 0.3, 0], { ch: h * 0.05 });\n  b.slab('gold', w * 1.32, h * 0.08, d * 1.3, [0, h * 0.02, 0], { ch: h * 0.02 });          // đai vàng giữa tay\n  return b.build();\n}\n\n// ÁO GIÁP — thân trắng-ngà + sọc vàng giữa ngực + PAULDRON LÔNG THÚ phồng lớn (điểm nhấn chính, lấy\n// từ ảnh mẫu) + áo choàng sau lưng (tĩnh, ngắn vừa để không xuyên chân khi bước) + tà giáp dài trước/hông.\nfunction body(w, h, d, pal, slot) {\n  if (slot === 'upperArm') return upperArm(w, h, d, pal);\n  if (slot === 'forearm') return hands(w, h, d, pal); // cẳng tay gộp vào Áo giáp (không còn slot Găng riêng)\n  const b = piece(M(pal));\n  const fz = d * 0.58;\n\n  // ── phủ da cốt lõi ──\n  b.slab('plateLo', w * 0.5, h * 0.46, d * 0.8, [0, h * 0.64, 0], { ch: h * 0.09 });        // cổ\n  b.slab('plate', w * 1.26, h * 1.0, d * 1.14, [0, 0, 0], { ch: h * 0.08 });                 // ngực/thân chính\n  b.slab('plate', w * 1.18, h * 0.42, d * 1.16, [0, -h * 0.58, 0], { ch: h * 0.08 });         // bụng — nối liền ngực↔hông (khử hở lưng)\n  b.slab('plate', w * 1.14, h * 0.7, d * 1.18, [0, -h * 0.95, 0], { ch: h * 0.08 });          // hông/bụng dưới — kéo dài xuống nối tà giáp\n  b.both((sx) => b.slab('plate', w * 0.28, h * 0.42, d * 1.1, [sx * w * 0.5, h * 0.34, 0], { ch: h * 0.07 })); // chèn nách\n  b.belt('gold', 'goldDk', { w: w * 1.16, h: h * 0.16, d: d * 1.2, y: -h * 0.86 });          // đai vàng eo\n\n  // ── điểm nhấn vàng + huy hiệu ──\n  b.slab('gold', w * 0.15, h * 1.05, d * 0.1, [0, -h * 0.02, fz + d * 0.02], { ch: h * 0.03 }); // sọc vàng giữa ngực\n  b.slab('gold', w * 0.56, h * 0.09, d * 0.86, [0, h * 0.42, 0], { ch: h * 0.02 });          // vòng cổ vàng\n  attachSigil(b, 'warrior', 'glyph', 'glyphDark', 0, h * 0.14, fz + d * 0.06, h * 0.32, d * 0.05); // huy hiệu ngực\n\n  // ── CỔ LÔNG THÚ — 1 vòng liền quanh cổ/vai (thay cụm khối cũ), đọc thành mantle liền mạch ──\n  b.torus('mane', w * 0.42, h * 0.13, [0, h * 0.48, 0], { rot: [Math.PI / 2, 0, 0], seg: 20 });\n\n  // ── VAI — 1 VÒM CẦU DUY NHẤT cong xuống ~97° (mặt cong thật, KHÔNG xếp nhiều tấm) + 1 viền vàng\n  // đúng ĐƯỜNG RANH của vòm (không phải khối rời — chỉ là mép nơi vòm dừng). ──\n  b.both((sx) => {\n    const cx = sx * w * 0.58, cy = h * 0.34;\n    const domeR = w * 0.32, domeT = Math.PI * 0.54;\n    b.sphere('plate', domeR, [cx, cy, 0], { seg: 16, segV: 12, thetaLength: domeT });\n    const ringR = domeR * Math.sin(domeT), ringY = cy + domeR * Math.cos(domeT);\n    b.torus('gold', ringR, domeR * 0.065, [cx, ringY, 0], { rot: [Math.PI / 2, 0, 0], seg: 18 });\n  });\n\n  // ── ÁO CHOÀNG sau lưng — TĨNH, NGẮN vừa tới giữa đùi + lùi sâu -fz để KHÔNG chạm tà giáp/chân khi bước ──\n  b.both((sx) => {\n    b.slab('plate', w * 0.58, h * 1.3, d * 0.1, [sx * w * 0.42, -h * 0.1, -fz - d * 0.16], { ch: h * 0.05 });\n    b.slab('gold', w * 0.58, h * 0.06, d * 0.12, [sx * w * 0.42, -h * 0.74, -fz - d * 0.16], { ch: h * 0.015 });\n  });\n\n  // ── TÀ GIÁP dài trước + 2 bên hông + sau ngắn (tabard kiểu ảnh mẫu) ──\n  const sy = -h * 1.3;\n  b.push([0, sy, fz * 0.9]);\n  b.slab('plate', w * 0.86, h * 0.98, d * 0.15, [0, h * 0.1, 0], { ch: h * 0.06 });\n  b.slab('gold', w * 0.15, h * 0.75, d * 0.16, [0, 0, d * 0.02], { ch: h * 0.02 });          // sọc vàng giữa tà\n  b.slab('gold', w * 0.88, h * 0.06, d * 0.17, [0, -h * 0.4, 0], { ch: h * 0.02 });          // mép vàng đáy tà\n  b.pop();\n  b.both((sx) => {\n    b.push([sx * w * 0.58, sy, 0], [0, Math.PI / 2, 0]);\n    b.slab('plate', w * 0.5, h * 0.7, d * 0.14, [0, 0, 0], { ch: h * 0.05 });\n    b.slab('gold', w * 0.52, h * 0.055, d * 0.15, [0, -h * 0.36, 0], { ch: h * 0.018 });\n    b.pop();\n  });\n  b.push([0, sy, -fz * 0.9]);\n  b.slab('plate', w * 0.8, h * 0.68, d * 0.14, [0, 0, 0], { ch: h * 0.05 });\n  b.pop();\n  for (const sz of [1, -1]) b.slab('plate', w * 0.46, h * 0.4, d * 0.12, [0, -h * 1.5, sz * fz * 0.5], { ch: h * 0.06 }); // đũng giữa\n\n  return b.build();\n}\n\n// CẲNG TAY (gộp vào Áo giáp, slot 'forearm') — ống cẳng tay+bàn tay phủ 1 khối lớn + đai cổ tay vàng + gờ khớp tay.\nfunction hands(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.cover('plate', w, h, d, 1.24, 1.14, 1.24, [0, h * 0.06, 0]);\n  b.slab('gold', w * 1.28, h * 0.09, d * 1.28, [0, h * 0.58, 0], { ch: h * 0.02 });\n  b.slab('plateHi', w * 1.14, h * 0.42, d * 1.08, [0, -h * 0.48, 0], { ch: h * 0.14 });\n  b.slab('gold', w * 1.16, h * 0.06, d * 1.1, [0, -h * 0.72, 0], { ch: h * 0.015 });\n  return b.build();\n}\n\n// QUẦN — đùi/cẳng chân phủ khối trắng lớn + đai vàng khớp; gối vồng nhẹ ở đùi.\nfunction legs(w, h, d, pal, slot) {\n  const b = piece(M(pal));\n  if (slot === 'shin') {\n    b.cover('plate', w, h, d, 1.16, 1.08, 1.24, [0, 0, 0]);\n    b.slab('gold', w * 1.2, h * 0.08, d * 1.22, [0, h * 0.4, 0], { ch: h * 0.02 });\n    return b.build();\n  }\n  b.cover('plate', w, h, d, 1.2, 1.06, 1.22, [0, 0, 0]);\n  b.slab('gold', w * 1.24, h * 0.1, d * 1.26, [0, h * 0.42, 0], { ch: h * 0.025 });\n  b.slab('plateHi', w * 0.6, h * 0.4, d * 0.2, [0, -h * 0.05, d * 0.62], { ch: h * 0.08 });     // gối vồng nhẹ\n  return b.build();\n}\n\n// GIÀY — bàn chân mũi vuông + gờ vàng mu chân.\nfunction feet(w, h, d, pal) {\n  const b = piece(M(pal));\n  b.cover('plate', w, h, d, 1.2, 1.5, 1.55, [0, h * 0.26, d * 0.14]);\n  b.slab('plateHi', w * 1.14, h * 0.55, d * 0.55, [0, h * 0.02, d * 0.72], { ch: h * 0.16 }); // mũi ủng vuông\n  b.slab('gold', w * 1.16, h * 0.08, d * 0.5, [0, h * 0.24, d * 0.76], { ch: h * 0.02 });     // gờ vàng mu chân\n  b.cover('plateLo', w, h, d, 1.22, 0.7, 1.55, [0, -h * 0.52, d * 0.12]);\n  return b.build();\n}\n\nexport const WARRIOR_ROYAL = { head, body, legs, feet };\n\n```\n"
};

function loadPreset(key) {
  const md = PRESET_MD[key] || PRESET_MD.golden_turtle;
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

// Điều khiển vóc dáng & trang phục
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
loadPreset('golden_turtle');
