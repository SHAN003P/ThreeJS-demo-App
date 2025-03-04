import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a few objects
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const objects = [];

for (let i = 0; i < 5; i++) {
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
    scene.add(sphere);
    objects.push(sphere);
}

// Raycaster setup
const raycaster = new THREE.Raycaster();
const rayOrigin = new THREE.Vector3(0, 0, 0); // Central point of the raycast
const rayCount = 36; // Number of rays in the circle
const radius = 5; // Radius of the circular raycast

function castCircularRay() {
    const visibleObjects = new Set();

    for (let i = 0; i < rayCount; i++) {
        // Generate an angle for the circular spread
        let angle = (i / rayCount) * Math.PI * 2;

        // Compute direction based on the angle
        let direction = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0); // 2D plane
        direction.normalize();

        // Cast the ray
        raycaster.set(rayOrigin, direction);
        let intersects = raycaster.intersectObjects(objects, true);

        // Store the first visible object
        if (intersects.length > 0) {
            visibleObjects.add(intersects[0].object);
            intersects[0].object.material.color.set(0x00ff00); // Change color to indicate visibility
        }
    }

    console.log("Visible Objects:", visibleObjects.size);
}

// Camera setup
camera.position.z = 10;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    castCircularRay();
    renderer.render(scene, camera);
}
animate();
