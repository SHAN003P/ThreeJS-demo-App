import * as THREE from "three";
import { DragControls } from "three/addons/controls/DragControls.js";
import { GLTFLoader } from "https://unpkg.com/three@latest/examples/jsm/loaders/GLTFLoader.js";
import { TransformControls } from 'three/addons/controls/TransformControls.js';

console.log("working");

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

//animation function
function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

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

//3D model
const loader = new GLTFLoader();
loader.load("./m4.glb", function (gltf) {
  const model = gltf.scene;

  // Center the model
  model.position.set(-5, 0, 0);

  // Scale model if too large/small
  model.scale.set(20, 20, 20);

  console.log("model---->", model);

  scene.add(model);
  renderer.setAnimationLoop(animate);
});

console.log("--------------->", scene.children);

// const tControls = new TransformControls(camera, renderer.domElement);
// tControls.attach(group.children[0]);
// scene.add(tControls.getHelper());

const cnt = new DragControls(scene.children, camera, renderer.domElement);
cnt.rotateSpeed = 2;
cnt.addEventListener("drag", render);

function render() {
  renderer.render(scene, camera);
}

animate();
