import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from "https://unpkg.com/three@latest/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "https://unpkg.com/three@latest/examples/jsm/loaders/GLTFLoader.js";

console.log("working");




//load 3D model--------------------------------------------------


document.querySelector("#fileinput").addEventListener('change', (e)=>{

	const file = e.target.files[0];

	console.log(file);
	
	if (file) {
        const objectUrl = URL.createObjectURL(file); // Create an Object URL
        console.log(objectUrl); // Log the temporary URL
    
		
		const scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xbfe3dd );
		const camera = new THREE.PerspectiveCamera( 10, window.innerWidth / window.innerHeight, 0.1, 100000 );
		// camera.position.set(0, 0, 8);

		const canvas = document.querySelector("#canvas");
		const renderer = new THREE.WebGLRenderer({canvas:canvas, antialias: true});
		renderer.setSize( window.innerWidth, window.innerHeight );
		
		// document.body.appendChild( renderer.domElement );

		// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
		// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, } );
		// const cube = new THREE.Mesh( geometry, material );
		// scene.add( cube );

		// HDRI Lighting
		// const rgbeLoader = new RGBELoader();
		// rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/neuer_zollhof_1k.hdr', function(texture){
		// 	// texture.mapping = THREE.EquirectangularReflectionMapping;
		// 	// scene.environment = texture;
		// 	// scene.background = texture;
		// });


		//directional light
		const directionalLight = new THREE.DirectionalLight( 0xffffff, 10);
		scene.add( directionalLight );
		directionalLight.position.set(3, 3, 3);
		//light helper
		// const helper = new THREE.DirectionalLightHelper( directionalLight, 0.1 );
		// scene.add( helper );



		//3D model 
		const loader = new GLTFLoader();
		loader.load(objectUrl, function (gltf) {
			const model = gltf.scene;
		
			// Center the model
			// model.position.set(0, 0, 0);
		
			// Scale model if too large/small
			// model.scale.set(2, 2, 2);
		
			scene.add(model);
			renderer.setAnimationLoop( animate );
		});
		



		//orbitControl
		const controls = new OrbitControls( camera, renderer.domElement );
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;

		camera.position.z = 50;

		function animate() {

			// cube.rotation.x += 0.01;
			// cube.rotation.y += 0.01;
			// scene.rotation.x += 0.01;
			// scene.rotation.y += 0.01;
			controls.update();

			renderer.render( scene, camera );

		}
	}
})
