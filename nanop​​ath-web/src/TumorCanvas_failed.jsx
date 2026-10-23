import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ============================================================
// NanoPath anatomical visualization
// Educational visualization — not a clinical/anatomical model.
// ============================================================

const COLORS = {
  brain: 0xc98f9e,
  brainDark: 0x8f5968,
  breast: 0xd7a09c,
  breastDeep: 0xb87879,
  skin: 0xe2a79b,
  fat: 0xe7c28f,
  muscle: 0xb96f70,
  colon: 0xc98572,
  colonInner: 0x9f625b,
  tumor: 0xe86f79,
  tumorGlow: 0x5c1e27,
};

function makeMaterial(color, roughness = 0.72) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.0,
  });
}

// ------------------------------------------------------------
// Tumor — irregular and embedded-looking, not a perfect ball.
// ------------------------------------------------------------

function createTumor(tumorSize, scale = 1) {
  const geometry = new THREE.IcosahedronGeometry(0.42, 4);
  const position = geometry.attributes.position;

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);

    const length = Math.sqrt(x * x + y * y + z * z) || 1;
    const nx = x / length;
    const ny = y / length;
    const nz = z / length;

    const variation =
      1 +
      0.10 * Math.sin(nx * 7.0 + ny * 3.0) +
      0.07 * Math.sin(ny * 9.0 - nz * 4.0) +
      0.05 * Math.cos(nz * 11.0 + nx * 2.0);

    position.setXYZ(
      i,
      x * variation,
      y * variation,
      z * variation
    );
  }

  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: COLORS.tumor,
    roughness: 0.66,
    metalness: 0.02,
    emissive: COLORS.tumorGlow,
    emissiveIntensity: 0.08,
  });

  const tumor = new THREE.Mesh(geometry, material);

  const size = (0.72 + tumorSize * 0.105) * scale;
  tumor.scale.setScalar(size);

  return tumor;
}

// ============================================================
// BRAIN
// Organic hemispheres with multi-frequency surface folds.
// ============================================================

function createBrain(tumorSize) {
  const group = new THREE.Group();

  const brainMaterial = makeMaterial(COLORS.brain, 0.86);
  const brainDarkMaterial = makeMaterial(COLORS.brainDark, 0.92);

  function createHemisphere(side) {
    const geometry = new THREE.IcosahedronGeometry(1.18, 5);
    const position = geometry.attributes.position;

    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);

      const len = Math.sqrt(x * x + y * y + z * z) || 1;
      const nx = x / len;
      const ny = y / len;
      const nz = z / len;

      // Layered irregularity creates a folded organic surface.
      const folds =
        1 +
        0.035 * Math.sin(nx * 13 + ny * 5) +
        0.025 * Math.sin(ny * 17 - nz * 7) +
        0.018 * Math.cos(nz * 21 + nx * 4);

      position.setXYZ(
        i,
        x * folds,
        y * folds,
        z * folds
      );
    }

    geometry.computeVertexNormals();

    const hemisphere = new THREE.Mesh(
      geometry,
      brainMaterial
    );

    hemisphere.scale.set(1.02, 0.94, 1.08);
    hemisphere.position.x = side * 0.53;

    return hemisphere;
  }

  group.add(createHemisphere(-1));
  group.add(createHemisphere(1));

  // Central separation / corpus-callosum hint.
  const midline = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.075, 1.45, 8, 16),
    brainDarkMaterial
  );
  midline.rotation.z = Math.PI / 2;
  midline.scale.set(0.75, 0.45, 0.55);
  midline.position.set(0, -0.02, 0.92);
  group.add(midline);

  // Brainstem.
  const brainstem = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.23, 0.62, 12, 24),
    brainDarkMaterial
  );
  brainstem.position.set(0, -1.18, -0.05);
  brainstem.scale.set(0.9, 1.0, 0.78);
  group.add(brainstem);

  // Cerebellum — flattened organic lobulated mass behind the brainstem.
  const cerebellum = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.52, 3),
    brainDarkMaterial
  );
  cerebellum.scale.set(1.35, 0.68, 0.82);
  cerebellum.position.set(0, -0.92, -0.62);
  group.add(cerebellum);

  // Subtle sulci: shallow curved ridges following the surface.
  // These are deliberately fewer and softer than the previous tube-like grooves.
  for (let side of [-1, 1]) {
    for (let row = -2; row <= 2; row++) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(
          side * (0.28 + Math.abs(row) * 0.08),
          0.82 - row * 0.28,
          0.93
        ),
        new THREE.Vector3(
          side * 0.82,
          0.48 - row * 0.25,
          1.02
        ),
        new THREE.Vector3(
          side * 0.93,
          row * 0.02,
          0.91
        ),
        new THREE.Vector3(
          side * 0.76,
          -0.48 - row * 0.18,
          0.93
        ),
      ]);

      const groove = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 28, 0.012, 5, false),
        brainDarkMaterial
      );

      groove.material.transparent = true;
      groove.material.opacity = 0.34;
      group.add(groove);
    }
  }

  // Tumor is partially embedded into the right hemisphere.
  const tumor = createTumor(tumorSize, 0.92);
  tumor.position.set(0.48, 0.10, 0.78);
  group.add(tumor);

  return group;
}

// ============================================================
// BREAST — chest wall + two natural tissue volumes.
// ============================================================

function createBreast(tumorSize) {
  const group = new THREE.Group();

  const tissueMaterial = makeMaterial(COLORS.breast, 0.82);
  const deepMaterial = makeMaterial(COLORS.breastDeep, 0.9);
  const skinMaterial = makeMaterial(0xe6b0a9, 0.9);

  // Soft chest wall behind the breast tissue.
  const chest = new THREE.Mesh(
    new THREE.SphereGeometry(1.72, 48, 32),
    deepMaterial
  );
  chest.scale.set(1.55, 1.08, 0.32);
  chest.position.z = -0.32;
  group.add(chest);

  function createBreastSide(side) {
    // Lathe profile gives a teardrop-like anatomical silhouette.
    const points = [
      new THREE.Vector2(0.00, -0.88),
      new THREE.Vector2(0.40, -0.78),
      new THREE.Vector2(0.72, -0.55),
      new THREE.Vector2(0.92, -0.20),
      new THREE.Vector2(0.98, 0.18),
      new THREE.Vector2(0.90, 0.52),
      new THREE.Vector2(0.66, 0.78),
      new THREE.Vector2(0.34, 0.92),
      new THREE.Vector2(0.00, 0.98),
    ];

    const geometry = new THREE.LatheGeometry(
      points,
      48
    );

    const breast = new THREE.Mesh(
      geometry,
      tissueMaterial
    );

    breast.scale.set(0.82, 1.0, 0.70);
    breast.rotation.z = side * 0.04;
    breast.position.set(side * 0.82, 0.0, 0.02);

    return breast;
  }

  const left = createBreastSide(-1);
  const right = createBreastSide(1);

  group.add(left, right);

  // Areola/nipple structures kept subtle and proportional.
  for (const side of [-1, 1]) {
    const areola = new THREE.Mesh(
      new THREE.CircleGeometry(0.18, 32),
      skinMaterial
    );
    areola.position.set(side * 0.82, 0.03, 0.69);
    areola.rotation.x = -Math.PI / 2;
    group.add(areola);

    const nipple = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 24, 16),
      deepMaterial
    );
    nipple.scale.set(1, 1, 0.55);
    nipple.position.set(side * 0.82, 0.03, 0.75);
    group.add(nipple);
  }

  // Tumor sits inside the left breast, partly obscured by tissue.
  const tumor = createTumor(tumorSize, 0.82);
  tumor.position.set(-0.48, 0.10, 0.42);
  group.add(tumor);

  return group;
}

// ============================================================
// COLON — recognizable large-intestine path.
// ============================================================

function createColon(tumorSize) {
  const group = new THREE.Group();

  const outerMaterial = makeMaterial(COLORS.colon, 0.76);
  const innerMaterial = makeMaterial(COLORS.colonInner, 0.9);

  // Large intestine path: cecum -> ascending -> transverse
  // -> descending -> sigmoid. More anatomical than a simple U.
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.22, -0.88, 0.0), // cecum
    new THREE.Vector3(-1.30, -0.25, 0.0),
    new THREE.Vector3(-1.28, 0.45, 0.0),
    new THREE.Vector3(-1.22, 0.92, 0.0),
    new THREE.Vector3(-0.75, 1.05, 0.0),
    new THREE.Vector3(-0.18, 1.08, 0.0),
    new THREE.Vector3(0.42, 1.08, 0.0),
    new THREE.Vector3(0.88, 0.94, 0.0),
    new THREE.Vector3(1.22, 0.72, 0.0),
    new THREE.Vector3(1.25, 0.18, 0.0),
    new THREE.Vector3(1.22, -0.42, 0.0),
    new THREE.Vector3(1.05, -0.78, 0.0),
    new THREE.Vector3(0.72, -0.94, 0.0),
    new THREE.Vector3(0.42, -1.02, 0.0),
    new THREE.Vector3(0.12, -0.88, 0.0),
  ]);

  const colon = new THREE.Mesh(
    new THREE.TubeGeometry(
      curve,
      160,
      0.25,
      24,
      false
    ),
    outerMaterial
  );

  group.add(colon);

  // Small appendix-like structure at the cecum.
  const appendixCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.22, -0.78, 0),
    new THREE.Vector3(-1.48, -1.00, 0.02),
    new THREE.Vector3(-1.56, -1.25, 0.04),
  ]);

  group.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(
        appendixCurve,
        30,
        0.075,
        12,
        false
      ),
      innerMaterial
    )
  );

  // Gentle haustra rings. They are subtle so they read as bowel anatomy,
  // not as decorative hoops.
  const haustraPositions = [
    [-1.28, 0.02, Math.PI / 2],
    [-1.28, 0.42, Math.PI / 2],
    [-0.96, 1.04, 0],
    [-0.42, 1.08, 0],
    [0.14, 1.08, 0],
    [0.70, 1.01, 0],
    [1.23, 0.42, Math.PI / 2],
    [1.22, -0.10, Math.PI / 2],
    [1.14, -0.58, Math.PI / 2],
  ];

  for (const [x, y, rotationZ] of haustraPositions) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.25, 0.018, 6, 24),
      innerMaterial
    );
    ring.position.set(x, y, 0.02);
    ring.rotation.y = Math.PI / 2;
    ring.rotation.z = rotationZ;
    ring.scale.set(1.0, 0.68, 1.0);
    ring.material.transparent = true;
    ring.material.opacity = 0.28;
    group.add(ring);
  }

  // Tumor is placed against the descending colon wall.
  const tumor = createTumor(tumorSize, 0.72);
  tumor.position.set(1.01, -0.38, 0.16);
  group.add(tumor);

  return group;
}

// ============================================================
// SKIN — rounded cross-section with distinct tissue layers.
// ============================================================

function createSkin(tumorSize) {
  const group = new THREE.Group();

  const epidermisMaterial = makeMaterial(0xe9b4aa, 0.86);
  const dermisMaterial = makeMaterial(0xd88e82, 0.9);
  const fatMaterial = makeMaterial(COLORS.fat, 0.92);
  const muscleMaterial = makeMaterial(COLORS.muscle, 0.9);

  function roundedLayer(width, height, depth, color, z) {
    const geometry = new THREE.BoxGeometry(
      width,
      height,
      depth,
      12,
      12,
      4
    );

    const position = geometry.attributes.position;

    // Round the corners by pushing vertices toward a capsule-like profile.
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);

      const nx = x / (width / 2);
      const ny = y / (height / 2);

      if (Math.abs(nx) > 0.72 && Math.abs(ny) > 0.72) {
        const factor = 0.90;
        position.setX(i, x * factor);
        position.setY(i, y * factor);
      }
    }

    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(
      geometry,
      color
    );

    mesh.position.z = z;
    return mesh;
  }

  const muscle = roundedLayer(
    3.05,
    2.35,
    0.38,
    muscleMaterial,
    -0.42
  );

  const fat = roundedLayer(
    3.08,
    2.38,
    0.32,
    fatMaterial,
    -0.15
  );

  const dermis = roundedLayer(
    3.12,
    2.42,
    0.24,
    dermisMaterial,
    0.04
  );

  const epidermis = roundedLayer(
    3.16,
    2.46,
    0.10,
    epidermisMaterial,
    0.19
  );

  group.add(
    muscle,
    fat,
    dermis,
    epidermis
  );

  // Tumor sits beneath the skin layers.
  const tumor = createTumor(tumorSize, 0.65);
  tumor.position.set(0.40, -0.10, 0.08);
  group.add(tumor);

  return group;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function TumorCanvas({
  tumorSize = 2.5,
  tumorType = "Breast",
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b12);

    const camera = new THREE.PerspectiveCamera(
      42,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
      mount.clientWidth,
      mount.clientHeight
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    mount.appendChild(renderer.domElement);

    // --------------------------------------------------------
    // Controls
    // --------------------------------------------------------

    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enableDamping = true;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.25;
    controls.minDistance = 2.3;
    controls.maxDistance = 7.5;

    // --------------------------------------------------------
    // Lighting — softer medical-visualization style.
    // --------------------------------------------------------

    scene.add(
      new THREE.HemisphereLight(
        0xb8d7ff,
        0x241820,
        2.0
      )
    );

    const keyLight = new THREE.DirectionalLight(
      0xffffff,
      2.4
    );
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(
      0xb7d7ff,
      1.0
    );
    fillLight.position.set(-4, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(
      0x35d9ff,
      0.65,
      14
    );
    rimLight.position.set(-3, 1, -4);
    scene.add(rimLight);

    // --------------------------------------------------------
    // Select model.
    // --------------------------------------------------------

    let model;

    if (tumorType === "Brain") {
      model = createBrain(tumorSize);
    } else if (tumorType === "Colon") {
      model = createColon(tumorSize);
    } else if (tumorType === "Skin") {
      model = createSkin(tumorSize);
    } else {
      model = createBreast(tumorSize);
    }

    scene.add(model);

    // --------------------------------------------------------
    // Center and fit camera to the selected anatomy.
    // --------------------------------------------------------

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(
      new THREE.Vector3()
    );

    model.position.sub(center);

    const centeredBox = new THREE.Box3().setFromObject(model);
    const size = centeredBox.getSize(
      new THREE.Vector3()
    );

    const maxDimension = Math.max(
      size.x,
      size.y,
      size.z
    );

    const distance = Math.max(
      3.4,
      maxDimension * 1.65
    );

    camera.position.set(
      0,
      maxDimension * 0.08,
      distance
    );

    controls.target.set(0, 0, 0);
    controls.update();

    // --------------------------------------------------------
    // Animation.
    // --------------------------------------------------------

    let animationFrame;

    function animate() {
      animationFrame =
        requestAnimationFrame(animate);

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // --------------------------------------------------------
    // Resize.
    // --------------------------------------------------------

    function handleResize() {
      const width = mount.clientWidth;
      const height = mount.clientHeight;

      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    }

    window.addEventListener(
      "resize",
      handleResize
    );

    // --------------------------------------------------------
    // Cleanup.
    // --------------------------------------------------------

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener(
        "resize",
        handleResize
      );

      controls.dispose();

      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) =>
              material.dispose()
            );
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [tumorSize, tumorType]);

  return (
    <div
      ref={mountRef}
      className="tumor-canvas"
    />
  );
}
