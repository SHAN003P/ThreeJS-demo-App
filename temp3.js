import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DragControls } from "three/addons/controls/DragControls.js";
import { GLTFLoader } from "https://unpkg.com/three@latest/examples/jsm/loaders/GLTFLoader.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";

async function load() {
  console.log("working");
  let originalState = {};
  let model;
  let cnt;
  let controls;
  let raycaster6;
  let objects = [];
  let raycaster;
  let tControls;
  let size;
  let snapDistance = 2;
  let draggedObject = null;
  const targetSize = 5;
  let scaleFactor;
  let scatterFactor

  const canvas = document.querySelector("#canvas");
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  //scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("lightgray");
  const camera = new THREE.PerspectiveCamera(
    10,
    window.innerWidth / window.innerHeight,
    0.1,
    100000
  );
  camera.position.z = 100;

  //orbitControl
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.update();

  //animation function
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
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

  // Create a Raycaster 6
  raycaster6 = new THREE.Raycaster();
  const origin6 = new THREE.Vector3(0, 0, 10); // Ray starts from (0,0,0)
  const direction6 = new THREE.Vector3(0, 0, -5).normalize(); // Ray goes in the Z direction
  raycaster6.set(origin6, direction6);

  // Create a line to represent the ray-6
  const points6 = [
    origin6,
    origin6.clone().add(direction6.multiplyScalar(10)), // Extends 10 units in the direction
  ];
  const geometry6 = new THREE.BufferGeometry().setFromPoints(points6);
  const material6 = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Red color
  const line6 = new THREE.Line(geometry6, material6);
  // Add to the scene
  scene.add(line6);

  // Raycaster and mouse vector
  raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  //start-->Load 3D model--------------------------------------------------------------------------------------------------
  const loader = new GLTFLoader();
  await loader.load("./flower.glb", function (gltf) {
    model = gltf.scene;


    //start-->unite scaling-----------------------------------------------------
    // Compute bounding box
    let box = new THREE.Box3().setFromObject(model);
    console.log("min", box.min);
    console.log("max", box.max);

    let size = box.getSize(new THREE.Vector3()); // Get model size
    console.log("box size", size);

    // Determine the scale factor (uniform scaling)
    let maxDimension = Math.max(size.x, size.y, size.z);
    scaleFactor = targetSize / maxDimension;

    // Apply uniform scaling
    model.scale.setScalar(scaleFactor);

    console.log("Scale Factor:", scaleFactor, "Snap Distance:", snapDistance);

    // Recompute bounding box after scaling
    box.setFromObject(model);
    console.log("new box min", box.min);
    console.log("new box max", box.max);

    // let newCenter = box.getCenter(new THREE.Vector3());
    // Adjust position so model is centered at (0,0,0)
    // model.position.sub(newCenter.multiplyScalar(scaleFactor));
    
    //end-->unite scaling-----------------------------------------------------------


    // Store the original state
    originalState.position = model.position.clone();
    originalState.scale = model.scale.clone();

    scene.add(model);


    //drag model
    cnt = new DragControls([model], camera, renderer.domElement);
    
    
    //Events
    cnt.addEventListener("drag", render);
    cnt.addEventListener("dragstart", function (e) {
      controls.enabled = false; // Disable OrbitControls
      draggedObject = e.object; // Set the currently dragged object
    });
    cnt.addEventListener("dragend", function () {
      draggedObject = null; // Clear the dragged object
      controls.enabled = true; // Enable OrbitControls again

      objects.map((obj) => {
        let distance = obj.position.distanceTo(new THREE.Vector3(0, 0, 0)); // Measure distance
        // console.log("distance -------->", distance);
        obj.material.color.set(1, 1, 1);

        // Object.freeze(obj.position)

        if (distance < snapDistance) {
          //Snap to (0,0,0) first
          obj.position.set(0, 0, 0);

          //Force update the object's matrix
          obj.updateMatrixWorld(true);

          //Disable further updates
          obj.matrixAutoUpdate = false;

          if (obj.name == "Plane053_2") {
            obj.material.color.set(
              0.8000000715255737,
              0.4361596405506134,
              0.22510652244091034
            );
            // obj.matrixAutoUpdate = false;
          } else {
            obj.material.color.set(1, 1, 1);
            // obj.matrixAutoUpdate = false;
          }
          obj.matrixAutoUpdate = false;
        }
      });
    });

    renderer.setAnimationLoop(animate());

    // function to change mesh position
    const changeMeshPosition = (mesh, modelScaleFactor) => {
      if(modelScaleFactor >= 10){
        scatterFactor = modelScaleFactor * 2;
      }else{ 
        scatterFactor = 10 / modelScaleFactor; // Inverse proportionality
      }
      
      console.log(scatterFactor);
      scatterFactor = Math.max(scatterFactor, 1); // Prevent excessive scattering

      mesh.position.x = (Math.random() * 2 - 1) * scatterFactor;
      mesh.position.y = (Math.random() * 2 - 1) * scatterFactor;
      mesh.position.z = 0; // Keep Z fixed or modify as needed
    };

    // const changeMeshPosition = (mesh) => {
    //   mesh.position.x = Math.random() * 20 - 5;
    //   mesh.position.y = Math.random() * 20 - 5;
    //   mesh.position.z = 0;
    // };

    model.traverse((child) => {
      if (child.isMesh) {
        objects.push(child);
        // console.log("all child---->", child);
        changeMeshPosition(child, scaleFactor);
      }
    });
  });
  //end-->Load 3D model----------------------------------------------------------------------------------------------------


  function render() {
    renderer.render(scene, camera);

    //change the object's color 'red' OR 'green'
    if (draggedObject) {
      let distance = draggedObject.position.distanceTo(
        new THREE.Vector3(0, 0, 0)
      ); // Measure distance
      // console.log("distance -------->", distance);

      if (distance > snapDistance) {
        draggedObject.material.color.set("red");
      }
      if (distance < snapDistance) {
        draggedObject.material.color.set("green");
      }
    }
  }


  //Reset model
  document.querySelector(".btn").addEventListener("click", function () {
    model.traverse((child) => {
      if (child.isMesh) {
        // child.position.copy(originalState.position);
        child.position.set(0, 0, 0);
        // console.log("child");
      }
    });
  });

  tControls = new TransformControls(camera, renderer.domElement);

  // Click event listener
  window.addEventListener("click", (event) => {
    // Convert mouse position to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections
    const intersects = raycaster.intersectObjects(scene.children);
    tControls.detach();
    if (intersects.length > 0 && intersects[0].object.isMesh) {
      console.log("Clicked on:", intersects[0].object);
      tControls.attach(intersects[0].object);
      tControls.addEventListener("dragging-changed", (event) => {
        controls.enabled = !event.value;
      });
      scene.add(tControls.getHelper());
    }
  });


  // Create a Raycaster 2
  const raycaster2 = new THREE.Raycaster();
  const origin2 = new THREE.Vector3(-10, 5, 0); // Ray starts from (0,0,0)
  const direction2 = new THREE.Vector3(1, 0, 0).normalize(); // Ray goes in the X direction
  raycaster2.set(origin2, direction2);

  // Create a line to represent the ray
  const points2 = [
    origin2,
    origin2.clone().add(direction2.multiplyScalar(20)), // Extends 10 units in the direction
  ];
  const geometry2 = new THREE.BufferGeometry().setFromPoints(points2);
  const material2 = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Red color
  const line2 = new THREE.Line(geometry2, material2);
  // Add to the scene
  scene.add(line2);

  // Create a Raycaster 3
  const raycaster3 = new THREE.Raycaster();
  const origin3 = new THREE.Vector3(10, 5, 0); // Ray starts from (0,0,0)
  const direction3 = new THREE.Vector3(0, -1, 0).normalize(); // Ray goes in the X direction
  raycaster3.set(origin3, direction3);

  // Create a line to represent the ray
  const points3 = [
    origin3,
    origin3.clone().add(direction3.multiplyScalar(10)), // Extends 10 units in the direction
  ];
  const geometry3 = new THREE.BufferGeometry().setFromPoints(points3);
  const material3 = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Red color
  const line3 = new THREE.Line(geometry3, material3);
  // Add to the scene
  scene.add(line3);

  // Create a Raycaster 4
  const raycaster4 = new THREE.Raycaster();
  const origin4 = new THREE.Vector3(-10, -5, 0); // Ray starts from (0,0,0)
  const direction4 = new THREE.Vector3(1, 0, 0).normalize(); // Ray goes in the X direction
  raycaster4.set(origin4, direction4);

  // Create a line to represent the ray
  const points4 = [
    origin4,
    origin4.clone().add(direction4.multiplyScalar(20)), // Extends 10 units in the direction
  ];
  const geometry4 = new THREE.BufferGeometry().setFromPoints(points4);
  const material4 = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Red color
  const line4 = new THREE.Line(geometry4, material4);
  // Add to the scene
  scene.add(line4);

  // Create a Raycaster 5
  const raycaster5 = new THREE.Raycaster();
  const origin5 = new THREE.Vector3(-10, 5, 0); // Ray starts from (0,0,0)
  const direction5 = new THREE.Vector3(0, -1, 0).normalize(); // Ray goes in the X direction
  raycaster5.set(origin5, direction5);

  // Create a line to represent the ray
  const points5 = [
    origin5,
    origin5.clone().add(direction5.multiplyScalar(10)), // Extends 10 units in the direction
  ];
  const geometry5 = new THREE.BufferGeometry().setFromPoints(points5);
  const material5 = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Red color
  const line5 = new THREE.Line(geometry5, material5);
  // Add to the scene
  scene.add(line5);

  //resize function
  window.addEventListener("resize", onWindowResize);
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
  }

  animate();
}

load();
