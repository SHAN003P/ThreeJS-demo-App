import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DragControls } from "three/addons/controls/DragControls.js";

console.log("working");


//drag objects ----------------------------------------------------



let objects = [];

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

//orbitControl
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;
// controls.update();

//Geometry, material
const geometry = new THREE.BoxGeometry();

for (let i = 0; i < 100; i++) {
  const object = new THREE.Mesh(
    geometry,
    new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
  );

  object.position.x = Math.random() * 30 - 15;
  object.position.y = Math.random() * 15 - 7.5;
  object.position.z = Math.random() * 20 - 10;

  object.rotation.x = Math.random() * 2 * Math.PI;
  object.rotation.y = Math.random() * 2 * Math.PI;
  object.rotation.z = Math.random() * 2 * Math.PI;

  object.scale.x = Math.random() * 2 + 1;
  object.scale.y = Math.random() * 2 + 1;
  object.scale.z = Math.random() * 2 + 1;

  object.castShadow = true;
  object.receiveShadow = true;

  scene.add(object);
  objects.push(object);
}

const cnt = new DragControls([...objects], camera, renderer.domElement);
cnt.rotateSpeed = 2;
cnt.addEventListener("drag", render);

function render() {
  renderer.render(scene, camera);
}

animate();
