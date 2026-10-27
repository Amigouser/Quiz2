import * as THREE from "three";

// 3D-сцена спирали ДНК для DNAHero. Вынесена в отдельный модуль,
// чтобы three.js грузился отдельным файлом и не тормозил первую отрисовку.

const lerp = (a, b, t) => a + (b - a) * t;

function buildHelix(mobile) {
  const group = new THREE.Group();
  const disposables = [];
  const keep = (x) => { disposables.push(x); return x; };

  const PAIRS = mobile ? 34 : 46;
  const RISE = 0.42, RADIUS = 1.9, TWIST = 0.36;
  const seg = mobile ? 16 : 28;

  const sphereG = keep(new THREE.SphereGeometry(0.26, seg, seg));
  const matA = keep(new THREE.MeshStandardMaterial({ color: 0x74c69d, roughness: 0.3, metalness: 0.15, emissive: 0x1b3d2a }));
  const matB = keep(new THREE.MeshStandardMaterial({ color: 0xf4a261, roughness: 0.3, metalness: 0.15, emissive: 0x3a1e0a }));
  // четыре «азотистых основания»
  const baseMats = [0x52b788, 0xe07a5f, 0xb7e4c7, 0xf0dfb3].map((c) =>
    keep(new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, transparent: true, opacity: 0.9 }))
  );
  const up = new THREE.Vector3(0, 1, 0);

  const pts1 = [], pts2 = [];
  for (let i = 0; i < PAIRS; i++) {
    const a = i * TWIST, y = (i - PAIRS / 2) * RISE;
    const p1 = new THREE.Vector3(Math.cos(a) * RADIUS, y, Math.sin(a) * RADIUS);
    const p2 = new THREE.Vector3(Math.cos(a + Math.PI) * RADIUS, y, Math.sin(a + Math.PI) * RADIUS);
    pts1.push(p1); pts2.push(p2);

    const s1 = new THREE.Mesh(sphereG, matA); s1.position.copy(p1); group.add(s1);
    const s2 = new THREE.Mesh(sphereG, matB); s2.position.copy(p2); group.add(s2);

    // перекладина = две половинки разных оснований
    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    [[p1, baseMats[i % 4]], [p2, baseMats[(i + 1) % 4]]].forEach(([p, mat]) => {
      const cylG = keep(new THREE.CylinderGeometry(0.07, 0.07, p.distanceTo(mid), 10));
      const cyl = new THREE.Mesh(cylG, mat);
      cyl.position.copy(p.clone().add(mid).multiplyScalar(0.5));
      cyl.quaternion.setFromUnitVectors(up, mid.clone().sub(p).normalize());
      group.add(cyl);
    });
  }

  // сахарофосфатные цепи
  [[pts1, 0x74c69d], [pts2, 0xf4a261]].forEach(([pts, color]) => {
    const tubeG = keep(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), mobile ? 220 : 400, 0.09, 10, false));
    const tubeM = keep(new THREE.MeshStandardMaterial({ color, roughness: 0.35, transparent: true, opacity: 0.75 }));
    group.add(new THREE.Mesh(tubeG, tubeM));
  });

  return { group, disposables };
}

export function createDnaScene(canvas, mobile) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0f2a1e, 14, 34);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);

  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const key = new THREE.DirectionalLight(0xfff3e0, 1.1); key.position.set(5, 8, 10); scene.add(key);
  const rim = new THREE.PointLight(0x74c69d, 1.6, 40, 0); rim.position.set(-6, -2, 6); scene.add(rim);

  const { group: helix, disposables } = buildHelix(mobile);
  scene.add(helix);

  // частицы
  const N = mobile ? 200 : 420;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 36;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 26;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 4;
  }
  const dustG = new THREE.BufferGeometry();
  dustG.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dustM = new THREE.PointsMaterial({ color: 0xb7e4c7, size: 0.06, transparent: true, opacity: 0.6 });
  const dust = new THREE.Points(dustG, dustM);
  scene.add(dust);
  disposables.push(dustG, dustM);

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  return {
    // p — прогресс скролла 0→1, t1 — сглаженная фаза «отъезда» спирали
    render(p, t1, spin, narrow) {
      helix.rotation.y = spin + p * Math.PI * 3;
      helix.rotation.z = lerp(0.42, narrow ? 0.3 : 0.18, t1);
      helix.position.x = narrow ? 0 : lerp(0, 4.6, t1);
      helix.position.y = lerp(1.4, narrow ? 2.4 : 0, t1) - p * 2;
      // на вертикальных экранах отодвигаем камеру, чтобы спираль влезала по ширине
      const fit = Math.sqrt(Math.max(1, 0.9 / camera.aspect));
      camera.position.set(0, 0, lerp(15, 17, t1) * fit);
      camera.lookAt(0, 0, 0);
      dust.rotation.y = spin * 0.12 + p * 0.6;
      renderer.render(scene, camera);
    },
    dispose() {
      ro.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
