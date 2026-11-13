import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { initLang } from './i18n.js';

initLang();

// Label rasa: klik untuk membalik ke sisi Snack Journey.
for (const card of document.querySelectorAll('.flip')) {
  card.addEventListener('click', () => {
    card.setAttribute('aria-pressed', String(card.getAttribute('aria-pressed') !== 'true'));
  });
}

const stage = document.querySelector('#stage');
if (stage) startViewer(stage);

function startViewer(stage) {
  const canvas = stage.querySelector('canvas');
  const loadEl = stage.querySelector('#stage-load');
  const bar = loadEl.querySelector('i');
  const errorEl = stage.querySelector('#stage-error');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.minDistance = 2.4;
  controls.maxDistance = 9;
  controls.minPolarAngle = 0.55;
  controls.maxPolarAngle = 2.25;
  controls.autoRotate = !reduced;
  controls.autoRotateSpeed = 0.5;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
  });

  scene.add(new THREE.HemisphereLight(0x8f8471, 0x453b3a, 1.5));

  // Key dari belakang-kiri: bayangan jatuh ke depan, ke arah kamera.
  const key = new THREE.DirectionalLight(0xfff2d8, 2.9);
  key.position.set(-2.8, 4.8, -2.4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 7;
  key.shadow.blurSamples = 12;
  key.shadow.camera.left = -3.2;
  key.shadow.camera.right = 3.2;
  key.shadow.camera.top = 3.2;
  key.shadow.camera.bottom = -3.2;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 16;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  scene.add(key);

  const rim = new THREE.PointLight(0xc9a24a, 30, 18, 2);
  rim.position.set(3.4, 1.5, -2.4);
  scene.add(rim);

  // Fill dari sisi kamera supaya muka depan kotak tidak hilang.
  const fill = new THREE.DirectionalLight(0xcfc9bb, 1.35);
  fill.position.set(4.2, 2.2, 1.6);
  scene.add(fill);

  // Pantulan dari bawah: tanpa ini sisi bawah kotak jadi hitam total.
  const bounce = new THREE.DirectionalLight(0xbfae8e, 1.6);
  bounce.position.set(0.4, -3.4, 2.2);
  scene.add(bounce);

  const dir = new THREE.Vector3(0.62, 0.46, 0.72).normalize();
  let model = null;
  let catcher = null;

  function fit() {
    const { clientWidth: w, clientHeight: h } = stage;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const halfFov = (camera.fov * Math.PI) / 360;
    const radius = 2.0;
    const distance = (radius / Math.tan(halfFov) / Math.min(1, camera.aspect)) * 1.02;
    camera.position.copy(dir).multiplyScalar(distance);
    camera.updateProjectionMatrix();
    controls.update();
  }

  new ResizeObserver(fit).observe(stage);
  fit();

  let visible = false;
  let running = false;

  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !running) {
        running = true;
        tick();
      }
    },
    { rootMargin: '120px' },
  ).observe(stage);

  function tick() {
    if (!visible) {
      running = false;
      return;
    }
    requestAnimationFrame(tick);
    controls.update();
    // Saat kamera turun ke bawah model, bidang bayangan akan menghalangi
    // pandangan, jadi sembunyikan selama kamera ada di bawahnya.
    if (catcher) catcher.visible = camera.position.y > catcher.position.y;
    renderer.render(scene, camera);
  }

  // Muat model hanya saat bagian ini mendekati layar.
  const loadObserver = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      loadObserver.disconnect();
      load();
    },
    { rootMargin: '300px' },
  );
  loadObserver.observe(stage);

  function load() {
    new GLTFLoader().load(
      new URL('models/kizuna.glb', document.baseURI).href,
      (gltf) => {
        const root = gltf.scene;
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        root.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        model = new THREE.Group();
        model.add(root);
        model.scale.setScalar(2.5 / maxDim);
        scene.add(model);

        root.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }
        });

        scene.updateMatrixWorld(true);
        const world = new THREE.Box3().setFromObject(model);
        catcher = new THREE.Mesh(
          new THREE.PlaneGeometry(9, 9),
          new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.36 }),
        );
        catcher.rotation.x = -Math.PI / 2;
        catcher.position.y = world.min.y - 0.32;
        catcher.receiveShadow = true;
        scene.add(catcher);

        loadEl.hidden = true;
        stage.classList.add('is-ready');
        controls.autoRotate = !reduced;
        if (visible && !running) {
          running = true;
          tick();
        }
      },
      (ev) => {
        if (ev.total) bar.style.width = `${Math.round((ev.loaded / ev.total) * 100)}%`;
      },
      () => {
        loadEl.hidden = true;
        errorEl.hidden = false;
      },
    );
  }
}
