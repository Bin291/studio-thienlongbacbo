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
          t.startsWith('---') ||
          t.startsWith('***') ||
          t.startsWith('___') ||
          t.startsWith('>') ||
          t.startsWith('**') ||
          t.startsWith('*') ||
          t.startsWith('-') ||
          t.startsWith('+') ||
          t.startsWith('|') ||
          t.startsWith('$$') ||
          t.startsWith('~') ||
          /^\d+\.\s/.test(t) ||
          /^\[.*\]/.test(t)
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
  golden_turtle: `# Bộ Giáp Kim Quy Hoàng Triều (Golden Turtle Dynasty Set)

Bộ giáp hoàng kim lấy cảm hứng từ Thần Kim Quy và hoa văn Đại Việt cổ điển.
- **Phong cách**: \`armorKit\` vát cạnh 45 độ, đan xen phiến giáp vàng kim và ngọc lục bảo.
- **Quy cách (Chuẩn 2026-09-08)**: Gồm đủ 4 món: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).
- **Ghi chú**: Cẳng tay gộp vào Áo giáp (\`slot === 'forearm'\`), Giày (\`feet\`) có hàm riêng không cần đoán qua tỉ lệ.

\`\`\`javascript
const M = (pal) => ({
  gold:     { color: 0xd4af37, metalness: 0.88, roughness: 0.32 },
  goldDark: { color: 0x8a6d1a, metalness: 0.82, roughness: 0.45 },
  jade:     { color: 0x1f7a4d, metalness: 0.15, roughness: 0.35, emissive: 0x0a3820, emissiveIntensity: 0.4 },
  cloth:    { color: 0x6e1b24, metalness: 0.05, roughness: 0.92 },
  steel:    { color: 0x9ba2ad, metalness: 0.92, roughness: 0.30 },
  glow:     { color: 0x54e8cf, metalness: 0.1,  roughness: 0.2, emissive: 0x54e8cf, emissiveIntensity: 0.9 },
});

// 1. MŨ (Head)
export function head(w, h, d, pal) {
  const b = piece(M(pal));
  b.bandStack('gold', { w: w * 1.12, h: h * 1.25, d: d * 1.24, y: h * 0.18, count: 4, taper: 0.08, trim: 'goldDark' });
  b.cover('gold', w, h, d, 0.95, 0.22, 1.05, [0, h * 0.86, 0]);
  b.slab('jade', w * 0.64, h * 0.24, d * 0.14, [0, h * 0.42, d * 0.65], { ch: h * 0.04 });
  b.slab('glow', w * 0.22, h * 0.14, d * 0.08, [0, h * 0.42, d * 0.72], { ch: h * 0.02 });

  b.both((sx) => {
    b.slab('gold', w * 0.18, h * 0.82, d * 1.05, [sx * w * 0.48, -h * 0.12, d * 0.05], { ch: h * 0.06 });
  });

  b.slab('goldDark', w * 0.86, h * 0.28, d * 0.22, [0, -h * 0.45, d * 0.54], { ch: h * 0.05 });
  return b.build();
}

// Helper cẳng tay (gộp vào Áo giáp theo chuẩn 2026-09-08)
function forearmArmor(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('cloth', w, h, d, 1.12, 1.05, 1.12, [0, 0, 0]);
  b.bandStack('gold', { w: w * 1.25, h: h * 0.78, d: d * 1.25, y: -h * 0.1, count: 3, taper: 0.04, trim: 'goldDark' });
  b.slab('jade', w * 0.36, h * 0.32, d * 0.16, [0, -h * 0.15, d * 0.65], { ch: h * 0.03 });
  return b.build();
}

// 2. ÁO GIÁP (Body) — gồm Ngực/thân + Bắp tay (upperArm) + Cẳng tay (forearm)
export function body(w, h, d, pal, slot) {
  const mats = M(pal);

  if (slot === 'upperArm') {
    const b = piece(mats);
    b.bandStack('gold', { w: w * 1.24, h: h * 0.85, d: d * 1.24, y: -h * 0.22, count: 3, taper: 0.05, trim: 'goldDark' });
    b.slab('goldDark', w * 1.28, h * 0.08, d * 1.28, [0, -h * 0.62, 0], { ch: h * 0.02 });
    b.slab('gold', w * 1.15, h * 0.48, d * 0.92, [0, h * 0.24, 0], { ch: h * 0.04 });
    b.slab('jade', w * 0.32, h * 0.28, d * 0.14, [0, h * 0.46, d * 0.60], { ch: h * 0.03 });
    return b.build();
  }

  if (slot === 'forearm') {
    return forearmArmor(w, h, d, pal);
  }

  const b = piece(mats);
  b.slab('cloth', w * 0.48, h * 0.42, d * 0.75, [0, h * 0.62, 0], { ch: h * 0.08 });
  b.slab('goldDark', w * 0.52, h * 0.08, d * 0.80, [0, h * 0.52, 0], { ch: h * 0.02 });
  b.cover('gold', w, h, d, 1.22, 1.05, 1.25, [0, 0, 0]);

  b.both((sx) => {
    b.slab('gold', w * 0.48, h * 0.35, d * 1.28, [sx * w * 0.58, h * 0.42, 0], { ch: h * 0.06 });
    b.slab('jade', w * 0.24, h * 0.22, d * 0.15, [sx * w * 0.58, h * 0.48, d * 0.58], { ch: h * 0.03 });
  });

  b.slab('jade', w * 0.38, h * 0.38, d * 0.18, [0, h * 0.15, d * 0.64], { ch: h * 0.04 });
  b.slab('glow', w * 0.16, h * 0.16, d * 0.10, [0, h * 0.15, d * 0.72], { ch: h * 0.02 });

  const sy = -h * 0.82;
  b.slab('goldDark', w * 1.16, h * 0.15, d * 1.20, [0, -h * 0.48, 0], { ch: h * 0.02 });
  b.slab('cloth', w * 0.75, h * 0.52, d * 0.12, [0, sy - h * 0.05, d * 0.60], { ch: h * 0.03 });
  b.slab('gold', w * 0.55, h * 0.38, d * 0.14, [0, sy, d * 0.62], { ch: h * 0.03 });
  b.slab('cloth', w * 0.95, h * 0.62, d * 0.12, [0, sy - h * 0.08, -d * 0.60], { ch: h * 0.03 });

  return b.build();
}

// 3. QUẦN (Legs) — Đùi (thigh) & Cẳng chân (shin)
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));
  if (slot === 'shin') {
    b.cover('cloth', w, h, d, 1.08, 1.02, 1.16, [0, h * 0.10, 0]);
    b.bandStack('gold', { w: w * 1.20, h: h * 0.78, d: d * 1.24, y: -h * 0.1, count: 3, taper: 0.03, trim: 'goldDark' });
    b.slab('jade', w * 0.34, h * 0.35, d * 0.15, [0, h * 0.25, d * 0.62], { ch: h * 0.03 });
    return b.build();
  }
  // đùi (thigh / default)
  b.cover('cloth', w, h, d, 1.08, 1.04, 1.18, [0, 0, 0]);
  b.slab('gold', w * 1.18, h * 0.14, d * 1.20, [0, h * 0.35, 0], { ch: h * 0.02 });
  b.slab('jade', w * 0.35, h * 0.28, d * 0.15, [0, -h * 0.25, d * 0.62], { ch: h * 0.04 });
  return b.build();
}

// 4. GIÀY (Feet) — Bàn chân / Ủng riêng
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('gold', w, h, d, 1.18, 1.42, 1.48, [0, h * 0.22, d * 0.12]);
  b.slab('jade', w * 0.45, h * 0.15, d * 0.40, [0, h * 0.18, d * 0.65], { ch: h * 0.02 });
  b.cover('goldDark', w, h, d, 1.20, 0.65, 1.50, [0, -h * 0.52, d * 0.10]);
  return b.build();
}

export const GOLDEN_TURTLE = { head, body, legs, feet };
\`\`\`
`,

  black_tortoise: `# Bộ Giáp Huyền Vũ Chiến Thần (Black Tortoise War God)

Trọng giáp hắc kim Titan kết hợp viền đồng hun cổ điển và ngọc lục bảo phát sáng.
- **Phong cách**: \`armorKit\` vát cạnh 45 độ, phong cách Chiến Binh (Warrior) hạng nặng.
- **Quy cách (Chuẩn 2026-09-08)**: 4 món hoàn chỉnh: Mũ (head), Áo giáp (body), Quần (legs), Giày (feet).
- **Ghi chú**: Cẳng tay gộp vào Áo giáp (\`slot === 'forearm'\`), Giày (\`feet\`) có hàm riêng biệt.

\`\`\`javascript
const M = (pal) => ({
  plate:    { color: 0x15181e, metalness: 0.85, roughness: 0.38 },
  plateLo:  { color: 0x0c0e12, metalness: 0.75, roughness: 0.52 },
  plateHi:  { color: 0x2b313d, metalness: 0.90, roughness: 0.30 },
  copper:   { color: 0xc68a4c, metalness: 0.95, roughness: 0.28 },
  jade:     { color: 0x2ecc71, metalness: 0.15, roughness: 0.35, emissive: 0x1b7943, emissiveIntensity: 0.6 },
  cloth:    { color: 0x4a154b, metalness: 0.05, roughness: 0.92 },
  leather:  { color: 0x3d271d, metalness: 0.08, roughness: 0.85 },
  glow:     { color: 0x54e8cf, metalness: 0.10, roughness: 0.20, emissive: 0x54e8cf, emissiveIntensity: 0.95 },
});

// 1. MŨ (Head)
export function head(w, h, d, pal) {
  const b = piece(M(pal));
  b.bandStack('plate', { w: w * 1.14, h: h * 1.28, d: d * 1.26, y: h * 0.16, count: 4, taper: 0.07, trim: 'plateLo' });
  b.cover('plateHi', w, h, d, 0.92, 0.22, 1.05, [0, h * 0.86, 0]);
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    const segH = h * (0.42 - 0.15 * t);
    const z = d * (0.35 - 0.7 * t);
    b.slab('copper', w * 0.14, segH, d * 0.2, [0, h * 0.62 + segH / 2, z], { ch: h * 0.03 });
  }
  b.slab('copper', w * 1.18, h * 0.12, d * 0.2, [0, h * 0.38, d * 0.62], { ch: h * 0.03 });
  b.slab('jade', w * 0.38, h * 0.16, d * 0.12, [0, h * 0.38, d * 0.72], { ch: h * 0.03 });
  b.slab('glow', w * 0.14, h * 0.10, d * 0.08, [0, h * 0.38, d * 0.78], { ch: h * 0.02 });
  b.both((sx) => {
    b.slab('plate', w * 0.2, h * 0.84, d * 1.08, [sx * w * 0.48, -h * 0.12, d * 0.06], { ch: h * 0.06 });
    b.slab('copper', w * 0.06, h * 0.62, d * 0.08, [sx * w * 0.48, -h * 0.22, d * 0.6], { ch: h * 0.02 });
  });
  b.slab('plateLo', w * 0.92, h * 0.38, d * 0.22, [0, -h * 0.42, d * 0.54], { ch: h * 0.06 });
  return b.build();
}

// Helper cẳng tay (gộp vào Áo giáp theo chuẩn 2026-09-08)
function forearmArmor(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('cloth', w, h, d, 1.12, 1.05, 1.12, [0, 0, 0]);
  b.bandStack('plate', { w: w * 1.26, h: h * 0.80, d: d * 1.26, y: -h * 0.1, count: 3, taper: 0.04, trim: 'plateLo' });
  b.slab('copper', w * 1.28, h * 0.08, d * 1.28, [0, h * 0.28, 0], { ch: h * 0.02 });
  b.slab('jade', w * 0.36, h * 0.32, d * 0.16, [0, -h * 0.15, d * 0.65], { ch: h * 0.03 });
  b.slab('glow', w * 0.12, h * 0.12, d * 0.10, [0, -h * 0.15, d * 0.72], { ch: h * 0.02 });
  return b.build();
}

// 2. ÁO GIÁP (Body) — gồm Ngực/thân + Bắp tay (upperArm) + Cẳng tay (forearm)
export function body(w, h, d, pal, slot) {
  const mats = M(pal);
  if (slot === 'upperArm') {
    const b = piece(mats);
    b.bandStack('plate', { w: w * 1.25, h: h * 0.84, d: d * 1.25, y: -h * 0.24, count: 3, taper: 0.04, trim: 'plateLo' });
    b.slab('copper', w * 1.28, h * 0.08, d * 1.28, [0, -h * 0.64, 0], { ch: h * 0.02 });
    b.slab('plate', w * 1.16, h * 0.48, d * 0.92, [0, h * 0.24, 0], { ch: h * 0.04 });
    b.slab('jade', w * 0.32, h * 0.28, d * 0.14, [0, h * 0.46, d * 0.60], { ch: h * 0.03 });
    return b.build();
  }

  if (slot === 'forearm') {
    return forearmArmor(w, h, d, pal);
  }

  const b = piece(mats);
  b.slab('cloth', w * 0.48, h * 0.44, d * 0.78, [0, h * 0.62, 0], { ch: h * 0.08 });
  b.slab('copper', w * 0.52, h * 0.08, d * 0.82, [0, h * 0.54, 0], { ch: h * 0.02 });
  b.cover('plate', w, h, d, 1.24, 1.06, 1.26, [0, 0, 0]);

  b.both((sx) => {
    b.slab('plateHi', w * 0.52, h * 0.38, d * 1.30, [sx * w * 0.58, h * 0.42, 0], { ch: h * 0.06 });
    b.slab('copper', w * 0.14, h * 0.42, d * 1.32, [sx * w * 0.78, h * 0.44, 0], { ch: h * 0.03 });
    b.slab('jade', w * 0.24, h * 0.22, d * 0.15, [sx * w * 0.58, h * 0.48, d * 0.60], { ch: h * 0.03 });
  });

  b.slab('copper', w * 0.42, h * 0.42, d * 0.18, [0, h * 0.15, d * 0.64], { ch: h * 0.04 });
  b.slab('jade', w * 0.24, h * 0.24, d * 0.12, [0, h * 0.15, d * 0.72], { ch: h * 0.03 });
  b.slab('glow', w * 0.10, h * 0.10, d * 0.08, [0, h * 0.15, d * 0.78], { ch: h * 0.02 });

  const sy = -h * 0.82;
  b.slab('leather', w * 1.18, h * 0.16, d * 1.22, [0, -h * 0.46, 0], { ch: h * 0.02 });
  b.slab('copper', w * 0.32, h * 0.20, d * 0.14, [0, -h * 0.46, d * 0.63], { ch: h * 0.02 });

  b.slab('cloth', w * 0.78, h * 0.54, d * 0.12, [0, sy - h * 0.05, d * 0.60], { ch: h * 0.03 });
  b.slab('plate', w * 0.56, h * 0.40, d * 0.14, [0, sy, d * 0.62], { ch: h * 0.03 });
  b.slab('copper', w * 0.12, h * 0.42, d * 0.15, [0, sy, d * 0.68], { ch: h * 0.02 });
  b.slab('cloth', w * 0.96, h * 0.64, d * 0.12, [0, sy - h * 0.08, -d * 0.60], { ch: h * 0.03 });

  return b.build();
}

// 3. QUẦN (Legs) — Đùi (thigh) & Cẳng chân (shin)
export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));
  if (slot === 'shin') {
    b.cover('cloth', w, h, d, 1.08, 1.02, 1.16, [0, h * 0.10, 0]);
    b.bandStack('plate', { w: w * 1.22, h: h * 0.80, d: d * 1.25, y: -h * 0.1, count: 3, taper: 0.03, trim: 'plateLo' });
    b.slab('copper', w * 0.36, h * 0.36, d * 0.16, [0, h * 0.25, d * 0.62], { ch: h * 0.03 });
    b.slab('jade', w * 0.20, h * 0.20, d * 0.12, [0, h * 0.25, d * 0.68], { ch: h * 0.02 });
    return b.build();
  }
  // đùi (thigh / default)
  b.cover('cloth', w, h, d, 1.08, 1.04, 1.18, [0, 0, 0]);
  b.slab('copper', w * 1.20, h * 0.14, d * 1.22, [0, h * 0.36, 0], { ch: h * 0.02 });
  b.slab('plate', w * 0.48, h * 0.34, d * 0.18, [0, -h * 0.22, d * 0.60], { ch: h * 0.04 });
  b.slab('jade', w * 0.24, h * 0.22, d * 0.12, [0, -h * 0.22, d * 0.68], { ch: h * 0.03 });
  return b.build();
}

// 4. GIÀY (Feet) — Bàn chân / Ủng riêng
export function feet(w, h, d, pal) {
  const b = piece(M(pal));
  b.cover('plate', w, h, d, 1.20, 1.45, 1.50, [0, h * 0.22, d * 0.12]);
  b.slab('copper', w * 0.48, h * 0.16, d * 0.42, [0, h * 0.18, d * 0.66], { ch: h * 0.02 });
  b.slab('glow', w * 0.14, h * 0.12, d * 0.10, [0, h * 0.18, d * 0.78], { ch: h * 0.02 });
  b.cover('plateLo', w, h, d, 1.22, 0.66, 1.52, [0, -h * 0.52, d * 0.10]);
  return b.build();
}

export const BLACK_TORTOISE = { head, body, legs, feet };
\`\`\`
`,

  viper_shadow: `# Bóng Đêm Rắn Độc (Viper's Shadow Assassin Set)

Bộ giáp sát thủ bóng đêm với phiến giáp đen tuyền, viền ngọc độc tố và lõi huỳnh quang.
- **Phong cách**: Nhẹ nhàng, góc cạnh sắc nhọn, tăng tốc độ di chuyển và chí mạng.
- **Quy cách**: Đầy đủ 4 món Mũ, Áo, Găng, Giày.

\`\`\`javascript
const M = (pal) => ({
  plate:    { color: 0x111317, metalness: 0.90, roughness: 0.28 },
  platelo:  { color: 0x07080a, metalness: 0.80, roughness: 0.50 },
  plateLo:  { color: 0x07080a, metalness: 0.80, roughness: 0.50 },
  gold:     { color: 0x22c55e, metalness: 0.40, roughness: 0.30 }, // Viền độc ngọc
  cyanCore: { color: 0x10b981, metalness: 0.20, roughness: 0.20, emissive: 0x059669, emissiveIntensity: 0.9 },
  glow:     { color: 0x34d399, metalness: 0.10, roughness: 0.20, emissive: 0x10b981, emissiveIntensity: 0.95 },
  cloth:    { color: 0x0f172a, metalness: 0.05, roughness: 0.95 },
  leather:  { color: 0x1e293b, metalness: 0.10, roughness: 0.85 },
  copper:   { color: 0x10b981, metalness: 0.80, roughness: 0.30 },
});

export function head(w, h, d, pal) {
  const b = piece(M(pal));
  // Mặt nạ che nửa mặt dưới
  b.cover('plate', w, h, d, 1.05, 0.45, 1.12, [0, -h * 0.20, d * 0.15]);
  b.slab('gold', w * 0.85, h * 0.08, d * 0.12, [0, -h * 0.02, d * 0.65], { ch: h * 0.02 });
  // Băng trán bảo hộ
  b.bandStack('plate', { w: w * 1.08, h: h * 0.35, d: d * 1.15, y: h * 0.35, count: 2, trim: 'gold' });
  b.slab('cyanCore', w * 0.20, h * 0.20, d * 0.10, [0, h * 0.35, d * 0.62]);
  return b.build();
}

export function body(w, h, d, pal, slot) {
  const mats = M(pal);
  if (slot === 'upperArm') {
    const b = piece(mats);
    b.bandStack('plate', { w: w * 1.18, h: h * 0.70, d: d * 1.18, y: -h * 0.20, count: 2, trim: 'gold' });
    return b.build();
  }
  const b = piece(mats);
  // Giáp ngực bó sát
  b.cover('cloth', w, h, d, 1.05, 1.02, 1.12, [0, 0, 0]);
  b.slab('plate', w * 1.12, h * 0.70, d * 1.16, [0, h * 0.18, 0], { ch: h * 0.06 });
  b.slab('gold', w * 0.50, h * 0.45, d * 0.12, [0, h * 0.18, d * 0.62], { ch: h * 0.04 });
  b.slab('cyanCore', w * 0.22, h * 0.22, d * 0.08, [0, h * 0.18, d * 0.68]);
  b.belt('leather', 'gold', { w: w * 1.14, h: h * 0.18, d: d * 1.16, y: -h * 1.10 });
  return b.build();
}

export function hands(w, h, d, pal) {
  const b = piece(M(pal));
  b.bandStack('plate', { w: w * 1.20, h: h * 1.15, d: d * 1.20, y: h * 0.1 });
  b.slab('gold', w * 1.24, h * 0.06, d * 1.24, [0, h * 0.65, 0]);
  b.slab('platelo', w * 1.26, h * 0.46, d * 1.26, [0, -h * 0.56, 0]);
  b.slab('cyanCore', w * 0.58, h * 0.34, d * 0.14, [0, -h * 0.44, d * 0.55]);
  b.slab('glow', w * 0.22, h * 0.12, d * 0.08, [0, -h * 0.44, d * 0.62]);
  return b.build();
}

export function legs(w, h, d, pal, slot) {
  const b = piece(M(pal));
  const isFoot = slot ? slot === 'foot' : d > h * 1.3;
  if (isFoot) {
    b.cover('plate', w, h, d, 1.06, 1.50, 1.24, [0, h * 0.26, d * 0.05]);
    b.slab('gold', w * 0.92, h * 0.52, d * 0.28, [0, h * 0.15, d * 0.62]);
    b.slab('glow', w * 0.88, h * 0.08, d * 0.12, [0, -h * 0.14, d * 0.78]);
    b.cover('plateLo', w, h, d, 1.10, 0.72, 1.28, [0, -h * 0.50, d * 0.04]);
    return b.build();
  }
  if (slot === 'shin') {
    b.cover('cloth', w, h, d, 1.06, 1.02, 1.14, [0, h * 0.10, 0]);
    b.bandStack('plate', { w: w * 1.16, h: h * 0.74, d: d * 1.22, y: -h * 0.1 });
    b.slab('cyanCore', w * 0.50, h * 0.36, d * 0.16, [0, h * 0.28, d * 0.6]);
    b.slab('glow', w * 0.18, h * 0.16, d * 0.10, [0, h * 0.28, d * 0.68]);
    return b.build();
  }
  b.cover('cloth', w, h, d, 1.06, 1.04, 1.16, [0, 0, 0]);
  b.belt('leather', 'gold', { w: w * 1.14, h: h * 0.12, d: d * 1.14, y: h * 0.1 });
  b.pouch('leather', 'gold', w * 0.30, h * 0.24, d * 0.14, [w * 0.50, -h * 0.1, 0]);
  return b.build();
}
\`\`\`
`,
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

// Xuất file .md
const btnExport = document.getElementById('btn-export-md');
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
    const filename = `${safeName}.md`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);

    const statusEl = document.getElementById('status-text');
    if (statusEl) {
      statusEl.textContent = `✅ Đã xuất file thành công: ${filename}`;
    }
  });
}

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
