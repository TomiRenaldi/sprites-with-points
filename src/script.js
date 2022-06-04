import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
const mouseX = 0
const mouseY = 0

const materials = []

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Debug
const gui = new GUI()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 100
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Sprites
 */
const sprites = {}
sprites.count = 10000

sprites.geometry = new THREE.BufferGeometry()
sprites.geometry.vertices = []

sprites.textureLoader = new THREE.TextureLoader()

const sprites1 = sprites.textureLoader.load('./textures/snowflake1.png')
const sprites2 = sprites.textureLoader.load('./textures/snowflake2.png')
const sprites3 = sprites.textureLoader.load('./textures/snowflake3.png')
const sprites4 = sprites.textureLoader.load('./textures/snowflake4.png')
const sprites5 = sprites.textureLoader.load('./textures/snowflake5.png')

for ( let i = 0; i < sprites.count; i ++ ) 
{
    const x = Math.random() * 2000 - 1000
    const y = Math.random() * 2000 - 1000
    const z = Math.random() * 2000 - 1000

    sprites.geometry.vertices.push(x, y, z)
}
sprites.geometry.setAttribute('position', new THREE.Float32BufferAttribute(sprites.geometry.vertices, 3))

const parameters = [
    [[1.0, 0.2, 0.5], sprites2, 20],
	[[0.95, 0.1, 0.5], sprites3, 15],
	[[0.90, 0.05, 0.5], sprites1, 10],
	[[0.85, 0, 0.5], sprites5, 8],
	[[0.80, 0, 0.5], sprites4, 5]
]

for (let i = 0; i < parameters.length; i++) 
{
    const color = parameters[i][0]
    const sprite = parameters[i][1]
    const size = parameters[i][2]

    materials[i] = new THREE.PointsMaterial({ size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true })
    materials[i].color.setHSL(color[0], color[1] , color[2] )

    const particles = new THREE.Points(sprites.geometry, materials[i])

    particles.rotation.x = Math.random() * 6
    particles.rotation.y = Math.random() * 6
    particles.rotation.z = Math.random() * 6

    scene.add(particles)
}

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const params = {
	texture: true
}

gui.add( params, 'texture' ).onChange((value) => 
{
	for ( let i = 0; i < materials.length; i++ ) 
    {
		materials[i].map = (value === true) ? parameters[i][1] : null
		materials[i].needsUpdate = true
	}
})

gui.open()

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    // Update controls
    controls.update()

    // Render
    camera.position.x += (mouseX - camera.position.x) * 0.5
    camera.position.y += (- mouseX - camera.position.y) * 0.5

    camera.lookAt(scene.position)

    for ( let i = 0; i < scene.children.length; i++) 
    {
	    const object = scene.children[i]

	    if ( object instanceof THREE.Points) 
        {
		    object.rotation.y = elapsedTime * (i < 4 ? i + 1 : - ( i + 1 )) * 0.05
		}
	}

    for ( let i = 0; i < materials.length; i ++ ) 
    {
	    const color = parameters[i][0]

	    const h = (360 * (color[0] + elapsedTime * 0.05) % 360) / 360
	    materials[i].color.setHSL(h, color[1], color[2])
	}
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()