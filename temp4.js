import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DragControls } from "three/addons/controls/DragControls.js";
import { GLTFLoader } from "https://unpkg.com/three@latest/examples/jsm/loaders/GLTFLoader.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";

console.log("working");

let group;

//dreag 3D model ------------------------------------------------

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

//scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);
const camera = new THREE.PerspectiveCamera(
  10,
  window.innerWidth / window.innerHeight,
  0.1,
  100000
);
camera.position.z = 100;
scene.background = new THREE.Color(0x808080);

//animation function
function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

group = new THREE.Group();

//directional light
scene.add(new THREE.AmbientLight(0xaaaaaa));

const light = new THREE.SpotLight(0xffffff, 10000);
light.position.set(0, 25, 50);
light.angle = Math.PI / 9;

light.castShadow = true;
light.shadow.camera.near = 10;
light.shadow.camera.far = 100;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;

scene.add(light);

//orbitControl
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

//3D model
const loader = new GLTFLoader();
loader.load("./flower.glb", function (gltf) {
  const model = gltf.scene;

  // Center the model
  model.position.set(0, 0, 0);

  // Scale model if too large/small
  model.scale.set(20, 20, 20);

  // scene.add(model);
  // console.log("model---->", model);

  group.add(model);
  console.log("group---->", group);
  renderer.setAnimationLoop(animate);
});

const raycaster = new THREE.Raycaster();
const postion = new THREE.Vector2();
document.addEventListener("click", function (e) {
  postion.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
  postion.y = -(e.clientY / renderer.domElement.clientHeight) * 2 - 1;

  raycaster.setFromCamera(postion, camera);
  const intersection = raycaster.intersectObjects(scene.children, true);
  console.log("intersection----->", intersection);
  console.log("intersection----->", intersection[0].object);
  group.add(intersection[0].object);
});

scene.add(group);
const tControls = new TransformControls(camera, renderer.domElement);
console.log("group----------->", group);
tControls.attach(group);
scene.add(tControls.getHelper());

tControls.addEventListener("dragging-changed", function (e) {
  controls.enabled = !e.value;
});

// const cnt = new DragControls(scene.children, camera, renderer.domElement);
// cnt.rotateSpeed = 2;
// cnt.addEventListener("drag", render);

function render() {
  renderer.render(scene, camera);
}

animate();
