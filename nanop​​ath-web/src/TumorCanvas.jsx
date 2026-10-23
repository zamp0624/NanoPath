import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function createTumor(tumorSize) {
  const geometry = new THREE.IcosahedronGeometry(0.45, 4);

  const positions = geometry.attributes.position;

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    const variation =
      1 +
      Math.sin(x * 5) *
        Math.cos(y * 4) *
        Math.sin(z * 5) *
        0.12;

    positions.setXYZ(
      i,
      x * variation,
      y * variation,
      z * variation
    );
  }

  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0xe87979,
    roughness: 0.72,
    metalness: 0.03,
    emissive: 0x351010,
  });

  const tumor = new THREE.Mesh(
    geometry,
    material
  );

  const size = 0.75 + tumorSize * 0.12;

  tumor.scale.setScalar(size);

  return tumor;
}

// -----------------------------------------
// BREAST
// -----------------------------------------

function createBreast(tumorSize) {
  const group = new THREE.Group();

  const tissueGeometry =
    new THREE.SphereGeometry(
      1.55,
      48,
      32
    );

  const tissueMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xd99a9a,
      roughness: 0.8,
      metalness: 0,
    });

  const tissue = new THREE.Mesh(
    tissueGeometry,
    tissueMaterial
  );

  tissue.scale.set(
    1.15,
    0.85,
    0.95
  );

  group.add(tissue);

  const tumor = createTumor(tumorSize);

  tumor.position.set(
    0.35,
    0.05,
    0.75
  );

  group.add(tumor);

  return group;
}

// -----------------------------------------
// BRAIN
// -----------------------------------------

function createBrain(tumorSize) {
  const group = new THREE.Group();

  // -----------------------------------------
  // BRAIN MATERIAL
  // -----------------------------------------

  const brainMaterial = new THREE.MeshStandardMaterial({
    color: 0xc98b9d,
    roughness: 0.9,
    metalness: 0,
  });

  const grooveMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b5367,
    roughness: 1,
    metalness: 0,
  });

  // -----------------------------------------
  // LEFT HEMISPHERE
  // -----------------------------------------

  const leftGeometry = new THREE.SphereGeometry(
    1.15,
    48,
    36
  );

  const left = new THREE.Mesh(
    leftGeometry,
    brainMaterial
  );

  left.scale.set(1.0, 0.95, 1.12);
  left.position.x = -0.52;

  group.add(left);

  // -----------------------------------------
  // RIGHT HEMISPHERE
  // -----------------------------------------

  const rightGeometry = new THREE.SphereGeometry(
    1.15,
    48,
    36
  );

  const right = new THREE.Mesh(
    rightGeometry,
    brainMaterial
  );

  right.scale.set(1.0, 0.95, 1.12);
  right.position.x = 0.52;

  group.add(right);

  // -----------------------------------------
  // CENTRAL GROOVE
  // -----------------------------------------

  const centralGrooveGeometry =
    new THREE.BoxGeometry(
      0.035,
      1.65,
      0.18
    );

  const centralGroove = new THREE.Mesh(
    centralGrooveGeometry,
    grooveMaterial
  );

  centralGroove.position.set(
    0,
    0,
    1.02
  );

  group.add(centralGroove);

  // -----------------------------------------
  // BRAIN FOLDS
  // -----------------------------------------

  const foldPositions = [
    [-1.05, 0.55, 0.72, 0.18],
    [-1.05, 0.15, 0.92, -0.12],
    [-1.02, -0.25, 0.88, 0.15],
    [-0.95, -0.62, 0.68, -0.1],

    [-0.65, 0.78, 0.88, -0.15],
    [-0.55, 0.35, 1.02, 0.12],
    [-0.58, -0.12, 1.02, -0.15],
    [-0.62, -0.55, 0.9, 0.12],

    [1.05, 0.55, 0.72, -0.18],
    [1.05, 0.15, 0.92, 0.12],
    [1.02, -0.25, 0.88, -0.15],
    [0.95, -0.62, 0.68, 0.1],

    [0.65, 0.78, 0.88, 0.15],
    [0.55, 0.35, 1.02, -0.12],
    [0.58, -0.12, 1.02, 0.15],
    [0.62, -0.55, 0.9, -0.12],
  ];

  foldPositions.forEach(
    ([x, y, z, rotation]) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(
          x - 0.22,
          y - 0.08,
          z
        ),
        new THREE.Vector3(
          x,
          y + 0.08,
          z + 0.035
        ),
        new THREE.Vector3(
          x + 0.22,
          y - 0.03,
          z
        ),
      ]);

      const geometry = new THREE.TubeGeometry(
        curve,
        16,
        0.035,
        6,
        false
      );

      const fold = new THREE.Mesh(
        geometry,
        grooveMaterial
      );

      fold.rotation.z = rotation;

      group.add(fold);
    }
  );

  // -----------------------------------------
  // TUMOR
  // -----------------------------------------

  const tumor = createTumor(tumorSize);

  tumor.scale.multiplyScalar(0.9);

  tumor.position.set(
    0.48,
    0.12,
    0.85
  );

  group.add(tumor);

  return group;
}

// -----------------------------------------
// COLON
// -----------------------------------------

function createColon(tumorSize) {
  const group = new THREE.Group();

  const colonMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xc98572,
      roughness: 0.75,
      metalness: 0,
    });

  const curve =
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.1, 1.0, 0),
      new THREE.Vector3(-1.35, 0.2, 0),
      new THREE.Vector3(-1.2, -0.9, 0),
      new THREE.Vector3(0, -1.15, 0),
      new THREE.Vector3(1.2, -0.9, 0),
      new THREE.Vector3(1.35, 0.2, 0),
      new THREE.Vector3(1.1, 1.0, 0),
    ]);

  const colonGeometry =
    new THREE.TubeGeometry(
      curve,
      80,
      0.28,
      16,
      false
    );

  const colon = new THREE.Mesh(
    colonGeometry,
    colonMaterial
  );

  group.add(colon);

  const tumor = createTumor(tumorSize);

  tumor.scale.multiplyScalar(0.75);

  tumor.position.set(
    0.95,
    -0.85,
    0.25
  );

  group.add(tumor);

  return group;
}

// -----------------------------------------
// SKIN
// -----------------------------------------

function createSkin(tumorSize) {
  const group = new THREE.Group();

  // Outer skin layer
  const skinGeometry =
    new THREE.BoxGeometry(
      3.0,
      2.3,
      0.45
    );

  const skinMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xd99a9a,
      roughness: 0.8,
      metalness: 0,
      transparent: true,
      opacity: 0.82,
    });

  const skin = new THREE.Mesh(
    skinGeometry,
    skinMaterial
  );

  group.add(skin);

  // Underlying tissue layer
  const tissueGeometry =
    new THREE.BoxGeometry(
      2.8,
      2.1,
      0.35
    );

  const tissueMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xe5b4a5,
      roughness: 0.9,
    });

  const tissue = new THREE.Mesh(
    tissueGeometry,
    tissueMaterial
  );

  tissue.position.z = -0.35;

  group.add(tissue);

  const tumor = createTumor(tumorSize);

  tumor.scale.multiplyScalar(0.65);

  tumor.position.set(
    0.35,
    0.05,
    0.15
  );

  group.add(tumor);

  return group;
}

// -----------------------------------------
// MAIN COMPONENT
// -----------------------------------------

export default function TumorCanvas({
  tumorSize = 2.5,
  tumorType = "Breast",
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) return;

    const scene = new THREE.Scene();

    scene.background =
      new THREE.Color(0x070b12);

    const camera =
      new THREE.PerspectiveCamera(
        50,
        mount.clientWidth /
          mount.clientHeight,
        0.1,
        100
      );

    camera.position.set(
      0,
      0.4,
      5
    );

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
      });

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );

    renderer.setSize(
      mount.clientWidth,
      mount.clientHeight
    );

    mount.appendChild(
      renderer.domElement
    );

    // -----------------------------------------
    // CAMERA
    // -----------------------------------------

    const controls =
      new OrbitControls(
        camera,
        renderer.domElement
      );

    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;

    // -----------------------------------------
    // LIGHTING
    // -----------------------------------------

    const ambientLight =
      new THREE.AmbientLight(
        0x6688aa,
        1.4
      );

    scene.add(ambientLight);

    const mainLight =
      new THREE.DirectionalLight(
        0xffffff,
        2.2
      );

    mainLight.position.set(
      4,
      5,
      5
    );

    scene.add(mainLight);

    const rimLight =
      new THREE.PointLight(
        0x00e5ff,
        2,
        20
      );

    rimLight.position.set(
      -4,
      2,
      -3
    );

    scene.add(rimLight);

    // -----------------------------------------
    // SELECT MODEL
    // -----------------------------------------

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

    // -----------------------------------------
    // CENTER MODEL
    // -----------------------------------------

    const box =
      new THREE.Box3().setFromObject(
        model
      );

    const center =
      box.getCenter(
        new THREE.Vector3()
      );

    model.position.sub(center);

    // -----------------------------------------
    // ANIMATION
    // -----------------------------------------

    let animationFrame;

    function animate() {
      animationFrame =
        requestAnimationFrame(
          animate
        );

      controls.update();

      renderer.render(
        scene,
        camera
      );
    }

    animate();

    // -----------------------------------------
    // RESIZE
    // -----------------------------------------

    function handleResize() {
      const width =
        mount.clientWidth;

      const height =
        mount.clientHeight;

      if (!width || !height) return;

      camera.aspect =
        width / height;

      camera.updateProjectionMatrix();

      renderer.setSize(
        width,
        height
      );
    }

    window.addEventListener(
      "resize",
      handleResize
    );

    // -----------------------------------------
    // CLEANUP
    // -----------------------------------------

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

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
            object.material.forEach(
              (material) =>
                material.dispose()
            );
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();

      if (
        mount.contains(
          renderer.domElement
        )
      ) {
        mount.removeChild(
          renderer.domElement
        );
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