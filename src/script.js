import * as THREE from "three";
import * as dat from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.querySelector("canvas.webgl");
const gltfLoader = new GLTFLoader();
let diskModel;

// gltfLoader.load(
//   "/models/Disk.glb",
//   (gltf) => {
//     diskModel = gltf.scene;
//     diskModel.scale.set(1, 1, 1); // Adjust scale if needed
//     diskModel.rotation.x = -0.5;
//     diskModel.rotation.y = 0.5;
//     scene.add(diskModel);
//     console.log("Model loaded successfully");
//   },
//   (progress) => {
//     console.log(
//       "Loading progress:",
//       (progress.loaded / progress.total) * 100 + "%"
//     );
//   },
//   (error) => {
//     console.error("Error loading model:", error);
//   }
// );

const scene = new THREE.Scene();
const gui = new dat.GUI();

/**
 * Object
 */
const metalPath = "/textures/metal";
const particlePath = "/textures/particles";
const textureLoader = new THREE.TextureLoader();
// const metalAo = textureLoader.load(`${metalPath}/ao.jpg`);
// const metalColor = textureLoader.load(`${metalPath}/color.jpg`);
// const metalGlassiness = textureLoader.load(`${metalPath}/glassiness.jpg`);
// const metalHeight = textureLoader.load(`${metalPath}/height.jpg`);
// const metalNormal = textureLoader.load(`${metalPath}/normal.jpg`);
// const metalRoughness = textureLoader.load(`${metalPath}roughness.jpg`);
// const matcap = textureLoader.load(`${metalPath}/texture.png`);
const art = textureLoader.load(`${metalPath}/art.jpg`);
const starTexture = textureLoader.load(`${particlePath}/8.png`);

const axes = new THREE.AxesHelper();
// scene.add(axes);
const CD = new THREE.Group();
scene.add(CD);
const baseGeometry = new THREE.RingGeometry(0.2, 1.3, 50);
// const baseMaterial = new THREE.MeshMatcapMaterial({
//   matcap: matcap,
// });
const baseMaterial = new THREE.MeshStandardMaterial({
  map: art,
  metalness: 0.3,
  roughness: 0.4,
});
const base = new THREE.Mesh(baseGeometry, baseMaterial);
CD.add(base);
const bandGeometry = new THREE.RingGeometry(0.2, 0.4, 30);
const bandMaterial = new THREE.MeshStandardMaterial({
  color: "#E5DFDF",
});
const band = new THREE.Mesh(bandGeometry, bandMaterial);
band.position.z = 0.01;
CD.add(band);
CD.rotation.x = -0.5;
CD.rotation.y = 0.5;

/**
 * Particles
 */
const count = 500;
const positions = new Float32Array(count * 3);
for (let i = 0; i < count; i++) {
  const i3 = i * 3;
  positions[i3 + 0] = (Math.random() - 0.5) * 5;
  positions[i3 + 1] = (Math.random() - 0.5) * 5;
  positions[i3 + 2] = (Math.random() - 0.5) * 5;
}
const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
const particleMaterial = new THREE.PointsMaterial({
  alphaMap: starTexture,
  color: 0xffeded,
  sizeAttenuation: true,
  size: 0.02,
  transparent: true,
});
particleMaterial.depthWrite = false;
particleMaterial.blending = THREE.AdditiveBlending;
const particles = new THREE.Points(particlesGeometry, particleMaterial);
particles.visible = false;
scene.add(particles);

/**
 * lights
 */
const pointLight = new THREE.PointLight("#f000ff", 0);
pointLight.position.set(2, 2, 2);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight("#ffffff", 1);
// scene.add(ambientLight);

// Optional: Add GUI controls for the light
gui.add(pointLight.position, "x").min(-5).max(5).step(0.1);
gui.add(pointLight.position, "y").min(-5).max(5).step(0.1);
gui.add(pointLight.position, "z").min(-5).max(5).step(0.1);
gui.add(pointLight, "intensity").min(0).max(10).step(0.1);

// Optional: Add light helper
// const pointLightHelper = new THREE.PointLightHelper(pointLight, 2);
// scene.add(pointLightHelper);
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
const isMobile = sizes.width <= 768;
camera.position.z = isMobile ? 5 : 3;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
window.addEventListener("load", () => {
  alert("Click the screen to start the music!");
});
let musicStart = false;
let lastPos = 0;
document.addEventListener("click", function () {
  var music = document.getElementById("backgroundMusic");
  if (musicStart) {
    musicStart = false;
    music.pause();
    return;
  }
  console.log("works");
  musicStart = true;
  music.play();
});

const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  controls.update();
  lastPos = elapsedTime;
  if (musicStart) {
    particles.visible = true;
    setTimeout(() => {
      if (pointLight.intensity < 4) {
        pointLight.intensity += 0.001;
      }
    }, 4000);
    CD.rotation.z = lastPos * 0.8;
    CD.position.y = Math.sin(elapsedTime) * 0.2;
    particles.rotation.z = elapsedTime * 0.2;
  }
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
