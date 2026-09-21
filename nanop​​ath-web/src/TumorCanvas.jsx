import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function noise(x, y, z) {
  return (
    Math.sin(x * 3.1) *
    Math.cos(y * 2.7) *
    Math.sin(z * 2.4)
  );
}

export default function TumorCanvas({
  tumorSize = 2.5,
  nanoparticleCount = 80,
  showNanoparticles = true,
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b12);

    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );

    camera.position.set(0, 1.2, 5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);

    mount.appendChild(renderer.domElement);

    // Camera controls
    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lighting
    scene.add(
      new THREE.AmbientLight(0x6688aa, 1.2)
    );

    const light = new THREE.DirectionalLight(
      0xffffff,
      2
    );

    light.position.set(4, 5, 4);
    scene.add(light);

    const rimLight = new THREE.PointLight(
      0x00e5ff,
      2,
      20
    );

    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    // -------------------------
    // TUMOR
    // -------------------------

    const geometry = new THREE.IcosahedronGeometry(
      1.4,
      5
    );

    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      const n = noise(x, y, z);

      const scale = 1 + n * 0.12;

      positions.setXYZ(
        i,
        x * scale,
        y * scale,
        z * scale
      );
    }

    geometry.computeVertexNormals();

    const tumorMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xe87979,
        roughness: 0.7,
        metalness: 0.05,
        emissive: 0x351010,
      });

    const tumor = new THREE.Mesh(
      geometry,
      tumorMaterial
    );

    const scale = 0.7 + tumorSize * 0.18;

    tumor.scale.setScalar(scale);

    scene.add(tumor);

    // -------------------------
    // BLOOD VESSELS
    // -------------------------

    const vesselMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xff3344,
        emissive: 0x550000,
        emissiveIntensity: 0.5,
      });

    const vesselGroup = new THREE.Group();

    for (let i = 0; i < 35; i++) {
      const sphere =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.035 + Math.random() * 0.025,
            8,
            8
          ),
          vesselMaterial
        );

      const theta =
        Math.random() * Math.PI * 2;

      const phi =
        Math.acos(
          2 * Math.random() - 1
        );

      const radius =
        1.42 + Math.random() * 0.08;

      sphere.position.set(
        radius *
          Math.sin(phi) *
          Math.cos(theta),

        radius *
          Math.sin(phi) *
          Math.sin(theta),

        radius * Math.cos(phi)
      );

      vesselGroup.add(sphere);
    }

    vesselGroup.scale.setScalar(scale);

    scene.add(vesselGroup);

    // -------------------------
    // NANOPARTICLES
    // -------------------------

    const particleGroup =
      new THREE.Group();

    const particleMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x26f5d0,
        emissive: 0x087a68,
        emissiveIntensity: 1.5,
        metalness: 0.3,
        roughness: 0.25,
      });

    const particles = [];

    for (
      let i = 0;
      i < nanoparticleCount;
      i++
    ) {
      const particle =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.035,
            8,
            8
          ),
          particleMaterial
        );

      const theta =
        Math.random() * Math.PI * 2;

      const phi =
        Math.acos(
          2 * Math.random() - 1
        );

      const direction =
        new THREE.Vector3(
          Math.sin(phi) *
            Math.cos(theta),

          Math.sin(phi) *
            Math.sin(theta),

          Math.cos(phi)
        );

      const start =
        direction
          .clone()
          .multiplyScalar(2.6);

      const target =
        direction
          .clone()
          .multiplyScalar(
            0.3 +
              Math.random() * 0.8
          );

      particle.position.copy(start);

      particleGroup.add(particle);

      particles.push({
        mesh: particle,
        start,
        target,
        progress: Math.random(),
        speed:
          0.08 +
          Math.random() * 0.12,
      });
    }

    particleGroup.visible =
      showNanoparticles;

    scene.add(particleGroup);

    // -------------------------
    // ANIMATION
    // -------------------------

    const clock = new THREE.Clock();

    let animationFrame;

    function animate() {
      animationFrame =
        requestAnimationFrame(
          animate
        );

      const delta =
        clock.getDelta();

      controls.update();

      particles.forEach((particle) => {
        particle.progress +=
          delta * particle.speed;

        if (
          particle.progress > 1
        ) {
          particle.progress = 0;
        }

        const t =
          particle.progress;

        const eased =
          t < 0.5
            ? 2 * t * t
            : 1 -
              Math.pow(
                -2 * t + 2,
                2
              ) /
                2;

        particle.mesh.position
          .copy(
            particle.start
              .clone()
              .lerp(
                particle.target,
                eased
              )
          );

        particle.mesh.position.multiplyScalar(
          scale
        );
      });

      renderer.render(
        scene,
        camera
      );
    }

    animate();

    // -------------------------
    // RESIZE
    // -------------------------

    function handleResize() {
      const width =
        mount.clientWidth;

      const height =
        mount.clientHeight;

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

    // -------------------------
    // CLEANUP
    // -------------------------

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      controls.dispose();

      geometry.dispose();

      tumorMaterial.dispose();

      particleMaterial.dispose();

      vesselMaterial.dispose();

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
  }, [
    tumorSize,
    nanoparticleCount,
    showNanoparticles,
  ]);

  return (
    <div
      ref={mountRef}
      className="tumor-canvas"
    />
  );
}