// Three.js 3D Scene Setup - Minimal Clean Version
let scene, camera, renderer, controls;
let desk, monitor, keyboard, mouse, decorations;
let raycaster, pointer;
let isAnimating = false;
let hoveredObject = null;

const tooltip = document.getElementById('hoverTooltip');
const loadingScreen = document.getElementById('loadingScreen');

function init() {
    console.log('Init function called');

    // Scene
    scene = new THREE.Scene();
    console.log('Scene created');
    scene.background = new THREE.Color(0x383838);
    scene.fog = new THREE.Fog(0x383838, 20, 50);

    // Camera - zoomed out view like reference image
    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 4, 8);
    camera.lookAt(0, 1.3, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Raycaster
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    // Lights - warm ambient lighting for dark anthracite theme
    const ambientLight = new THREE.AmbientLight(0x505050, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffe8d0, 0.8);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    // Warm accent lights
    const leftLight = new THREE.PointLight(0xffd4a3, 0.4, 12);
    leftLight.position.set(-3, 4, 0);
    scene.add(leftLight);

    const rightLight = new THREE.PointLight(0xffcb8e, 0.4, 12);
    rightLight.position.set(3, 4, 0);
    scene.add(rightLight);

    // Monitor glow
    const monitorLight = new THREE.PointLight(0x4dabf7, 0.5, 6);
    monitorLight.position.set(0, 2.5, 0);
    scene.add(monitorLight);

    // Create objects
    createFloor();
    createStuccoWall();
    createDesk();
    createMonitor();
    createKeyboard();
    createMouse();
    createSmallDecorations();
    createLamp();
    createTallPlant();

    // Controls - 90 degree view
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 6;
    controls.maxDistance = 12;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minAzimuthAngle = -Math.PI / 4;
    controls.maxAzimuthAngle = Math.PI / 4;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('click', onPointerClick);

    // Hide loading
    setTimeout(() => {
        console.log('Hiding loading screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            console.log('Scene fully loaded!');
        }, 500);
    }, 1000);

    animate();
}

function createFloor() {
    const floorGeometry = new THREE.PlaneGeometry(15, 15);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x252525,
        roughness: 0.8,
        metalness: 0.05
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);
}

function createStuccoWall() {
    // Dark anthracite grey rough stucco finish
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Dark anthracite grey base color
    ctx.fillStyle = '#383838';
    ctx.fillRect(0, 0, 512, 512);

    // Add rough stucco texture with random dots and variations
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 2.5 + 0.8;
        const brightness = Math.floor(Math.random() * 30 - 15);
        ctx.fillStyle = `rgba(${56 + brightness}, ${56 + brightness}, ${56 + brightness}, ${Math.random() * 0.25 + 0.12})`;
        ctx.fillRect(x, y, size, size);
    }

    // Add larger roughness patches for depth and texture
    for (let i = 0; i < 300; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 12 + 5;
        const brightness = Math.floor(Math.random() * 25 - 12);
        ctx.fillStyle = `rgba(${56 + brightness}, ${56 + brightness}, ${56 + brightness}, ${Math.random() * 0.15 + 0.05})`;
        ctx.fillRect(x, y, size, size);
    }

    const texture = new THREE.CanvasTexture(canvas);

    const wallMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.95,
        metalness: 0.0
    });

    // Back wall
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(15, 8), wallMaterial);
    backWall.position.set(0, 4, -3);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(15, 8), wallMaterial.clone());
    leftWall.material.map = texture.clone();
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-7.5, 4, 4.5);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(15, 8), wallMaterial.clone());
    rightWall.material.map = texture.clone();
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(7.5, 4, 4.5);
    rightWall.receiveShadow = true;
    scene.add(rightWall);
}

function createDesk() {
    // Modern desk with stacked drawer unit on underside
    desk = new THREE.Group();

    const desktopMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.3,
        metalness: 0.4
    });

    // Main horizontal desktop (only one desk surface now)
    const mainTop = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.08, 1.2),
        desktopMaterial
    );
    mainTop.position.set(0, 1.2, 0);
    mainTop.castShadow = true;
    mainTop.receiveShadow = true;
    desk.add(mainTop);

    // Drawer stack on underside of main desk - 3 stacked drawers
    // Desk bottom surface is at Y = 1.2 - 0.04 = 1.16
    // Each drawer: 0.3 height
    // Stack from top (Y=1.16) going down
    const drawerMaterial = new THREE.MeshStandardMaterial({
        color: 0x0f0f0f,
        roughness: 0.3,
        metalness: 0.5
    });

    const drawerGeometry = new THREE.BoxGeometry(0.7, 0.3, 0.5);
    const drawerPositions = [
        // Top drawer - just touching desk bottom
        [-0.9, 1.01, 0.15],
        // Middle drawer
        [-0.9, 0.71, 0.15],
        // Bottom drawer
        [-0.9, 0.41, 0.15]
    ];

    drawerPositions.forEach((pos, index) => {
        const drawer = new THREE.Mesh(drawerGeometry, drawerMaterial);
        drawer.position.set(...pos);
        drawer.castShadow = true;
        drawer.receiveShadow = true;
        desk.add(drawer);

        // Add handle to each drawer
        const handle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.25, 16),
            new THREE.MeshStandardMaterial({
                color: 0xb8860b,
                roughness: 0.2,
                metalness: 0.8
            })
        );
        handle.rotation.z = Math.PI / 2;
        handle.position.set(-0.9, pos[1], 0.4);
        handle.castShadow = true;
        desk.add(handle);
    });

    // Solid panel stands on left and right ends
    const panelMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.3,
        metalness: 0.4
    });

    // Left panel stand - extends from floor to desk bottom
    const leftPanel = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.16, 1.2),
        panelMaterial
    );
    leftPanel.position.set(-1.25, 0.58, 0);
    leftPanel.castShadow = true;
    leftPanel.receiveShadow = true;
    desk.add(leftPanel);

    // Right panel stand
    const rightPanel = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.16, 1.2),
        panelMaterial
    );
    rightPanel.position.set(1.25, 0.58, 0);
    rightPanel.castShadow = true;
    rightPanel.receiveShadow = true;
    desk.add(rightPanel);

    // Move desk closer to wall
    desk.position.set(0, 0, 0.5);
    scene.add(desk);
}

function createLamp() {
    // Floor lamp - properly connected hierarchy
    const lamp = new THREE.Group();

    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.4,
        metalness: 0.7
    });

    const poleMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.3,
        metalness: 0.6
    });

    // 1. LAMP BASE - sits on floor
    // CylinderGeometry(0.15, 0.18, 0.08) at Y=0.04 means it goes from Y=0 to Y=0.08
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.18, 0.08, 32),
        baseMaterial
    );
    base.position.set(0, 0.04, 0); // Will be offset when lamp group is positioned
    base.castShadow = true;
    lamp.add(base);

    // 2. LAMP POLE - vertical cylinder from base top going up
    // Height 1.5, so if bottom is at Y=0.08, center is at Y=0.83
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.5, 16),
        poleMaterial
    );
    pole.position.set(0, 0.83, 0);
    pole.castShadow = true;
    lamp.add(pole);

    // 3. LAMP HEAD - angled cylinder attached to pole top
    // Position at Y=1.58 (0.08 + 0.75 + 0.75 = top of pole)
    // Then apply rotation without moving it away from attachment point
    const head = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.3, 32),
        poleMaterial
    );
    head.position.set(0, 1.58, 0);
    head.rotation.z = Math.PI / 6; // 30 degree angle
    head.castShadow = true;
    lamp.add(head);

    // 4. GLOWING BULB - positioned at the angled forward tip of head
    // When head is rotated π/6, a point at distance 0.15 forward ends up at:
    // X offset: 0.15 * sin(π/6) ≈ 0.075
    // Y offset down: 0.15 * (1 - cos(π/6)) ≈ 0.02
    const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 32, 32),
        new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xffa500,
            emissiveIntensity: 1.0,
            roughness: 0.2,
            metalness: 0.0
        })
    );
    bulb.position.set(0.08, 1.42, 0);
    bulb.castShadow = true;
    lamp.add(bulb);

    // 5. BULB GLOW LIGHT - positioned with bulb
    const bulbLight = new THREE.PointLight(0xffa500, 1.0, 4);
    bulbLight.position.set(0.08, 1.42, 0);
    bulbLight.castShadow = true;
    lamp.add(bulbLight);

    // Position lamp at the front-facing side of desk
    lamp.position.set(1.6, 0, 0.9);

    scene.add(lamp);
}

function createRadialGlowTexture(r = 77, g = 171, b = 247) {
    // Soft radial gradient sprite texture used for the bezel aura glow.
    // Fully opaque at the center, fading smoothly to transparent at the edge.
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
    gradient.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.5)`);
    gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.15)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function createMonitor() {
    monitor = new THREE.Group();

    // Sleek modern monitor stand
    const stand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.15, 0.06, 32),
        new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            roughness: 0.3,
            metalness: 0.7
        })
    );
    stand.position.set(0, 1.27, -0.35);
    stand.castShadow = true;

    const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.4),
        new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            roughness: 0.3,
            metalness: 0.7
        })
    );
    neck.position.set(0, 1.48, -0.35);
    neck.castShadow = true;

    // Modern thin bezel monitor
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.85, 0.06),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.2,
            metalness: 0.6
        })
    );
    frame.position.set(0, 1.85, -0.37);
    frame.castShadow = true;
    frame.userData = { interactive: true, name: 'computer' };

    // Black terminal screen centered inside the monitor bezel
    const screen = new THREE.Mesh(
        new THREE.BoxGeometry(1.08, 0.66, 0.02),
        new THREE.MeshStandardMaterial({
            color: 0x000000,
            emissive: 0x000000,
            emissiveIntensity: 0.0
        })
    );
    screen.position.set(0, 1.85, -0.31);
    screen.userData = { interactive: true, name: 'computer' };

    // Terminal code lines centered on the black screen
    const codeSegments = [
        { width: 0.62, color: 0x00ff88, y: 0.25 },
        { width: 0.72, color: 0x7ae582, y: 0.15 },
        { width: 0.56, color: 0xff4d4d, y: 0.05 },
        { width: 0.50, color: 0xffd166, y: -0.05 },
        { width: 0.68, color: 0x00ff88, y: -0.15 },
        { width: 0.58, color: 0xff4d4d, y: -0.25 },
        { width: 0.42, color: 0x00ff88, y: -0.32 }
    ];

    codeSegments.forEach(segment => {
        const line = new THREE.Mesh(
            new THREE.BoxGeometry(segment.width, 0.02, 0.01),
            new THREE.MeshStandardMaterial({
                color: segment.color,
                emissive: segment.color,
                emissiveIntensity: 0.6
            })
        );
        line.position.set(0, segment.y, 0.01);
        screen.add(line);
    });

    // Bezel aura glow — a soft radial-gradient sprite sitting just behind the
    // monitor frame/bezel. This pulses in opacity/scale to hint interactivity
    // WITHOUT touching the screen content, so the code lines stay perfectly
    // static and stable.
    const bezelGlowTexture = createRadialGlowTexture(77, 171, 247); // matches monitorLight blue
    const bezelGlowMaterial = new THREE.SpriteMaterial({
        map: bezelGlowTexture,
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const bezelGlow = new THREE.Sprite(bezelGlowMaterial);
    // Sized larger than the frame (1.3 x 0.85) so it halos out around the edges,
    // positioned slightly further back than the frame so the bezel occludes the
    // sprite's center and only the aura "bleeds" around the outer edge.
    bezelGlow.scale.set(1.9, 1.5, 1);
    bezelGlow.position.set(0, 1.85, -0.42);
    bezelGlow.userData = { isBezelGlow: true };
    monitor.add(bezelGlow);

    monitor.add(stand, neck, frame, screen);
    desk.add(monitor);
}

function createKeyboard() {
    keyboard = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.03, 0.25),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.5,
            metalness: 0.3
        })
    );
    keyboard.position.set(0, 1.255, 0.25);
    keyboard.castShadow = true;
    desk.add(keyboard);

    // Keys
    const keys = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.01, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x0a0a0a })
    );
    keys.position.set(0, 1.275, 0.25);
    desk.add(keys);
}

function createMouse() {
    mouse = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.025, 0.09),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.5,
            metalness: 0.3
        })
    );
    mouse.position.set(0.65, 1.255, 0.28);
    mouse.castShadow = true;
    desk.add(mouse);
}

function createSmallDecorations() {
    // Flat paper stack aligned and slightly offset upward for thickness
    const paperTexts = ['README.md', 'TODO', 'NOTES', 'API', 'CODE'];
    const randomTexts = ['function init()', 'const data = {};', '// Fix bug', 'deploy', 'class App', 'render()', 'useEffect()'];

    decorations = new THREE.Group();

    const stackBaseY = 1.292;
    const stackX = -0.82;
    const stackZ = -0.12;
    const stackRotation = 0.04;
    const yStep = 0.015;

    for (let i = 0; i < 3; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#f2f2f2';
        ctx.fillRect(0, 0, 256, 256);

        ctx.strokeStyle = '#b0b0b0';
        ctx.lineWidth = 2;
        ctx.strokeRect(6, 6, 244, 244);

        ctx.fillStyle = '#1c1c1c';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(paperTexts[i % paperTexts.length], 20, 40);

        ctx.font = '14px monospace';
        ctx.fillStyle = '#3e3e3e';
        for (let j = 0; j < 5; j++) {
            const line = randomTexts[Math.floor(Math.random() * randomTexts.length)];
            ctx.fillText(line, 20, 75 + j * 28);
        }

        const texture = new THREE.CanvasTexture(canvas);
        const paper = new THREE.Mesh(
            new THREE.BoxGeometry(0.42, 0.01, 0.30),
            new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.9,
                metalness: 0.0
            })
        );

        paper.position.set(stackX, stackBaseY + i * yStep, stackZ);
        paper.rotation.x = 0.0;
        paper.rotation.z = stackRotation;
        paper.castShadow = true;
        decorations.add(paper);
    }

    desk.add(decorations);
}

function createTallPlant() {
    // Red balloon with attached pot on the floor
    const plantGroup = new THREE.Group();

    const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.22, 0.35, 32),
        new THREE.MeshStandardMaterial({
            color: 0x2d2d2d,
            roughness: 0.85,
            metalness: 0.0
        })
    );
    pot.position.set(0, 0.175, 0);
    pot.castShadow = true;
    pot.receiveShadow = true;
    plantGroup.add(pot);

    const balloonMaterial = new THREE.MeshStandardMaterial({
        color: 0xd94747,
        roughness: 0.8,
        metalness: 0.0,
        emissive: 0x3d1010,
        emissiveIntensity: 0.15
    });

    const balloon = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 24, 24),
        balloonMaterial
    );
    balloon.position.set(0, 1.95, 0);
    balloon.scale.set(1.0, 1.28, 1.0);
    balloon.castShadow = true;
    plantGroup.add(balloon);

    const balloonNub = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.18, 12),
        balloonMaterial
    );
    balloonNub.position.set(0, 1.60, 0);
    balloonNub.rotation.x = Math.PI;
    balloonNub.castShadow = true;
    plantGroup.add(balloonNub);

    const balloonStringStart = new THREE.Vector3(0, 1.51, 0);
    const vaseTop = new THREE.Vector3(0, 0.35, 0);
    const stringLength = balloonStringStart.distanceTo(vaseTop);

    const balloonString = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, stringLength, 10),
        new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.8,
            metalness: 0.0
        })
    );
    balloonString.position.copy(balloonStringStart.clone().add(vaseTop).multiplyScalar(0.5));
    balloonString.up.set(0, 1, 0);
    balloonString.lookAt(vaseTop);
    balloonString.rotateX(Math.PI / 2);
    balloonString.castShadow = true;
    plantGroup.add(balloonString);

    plantGroup.position.set(-1.6, 0, 0.5);
    scene.add(plantGroup);
}

function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    let foundMonitor = false;

    for (let intersect of intersects) {
        let obj = intersect.object;
        while (obj.parent && !obj.userData.interactive) {
            obj = obj.parent;
        }

        if (obj.userData.name === 'computer') {
            foundMonitor = true;

            if (hoveredObject !== obj) {
                if (hoveredObject) {
                    hoveredObject.scale.set(1, 1, 1);
                }

                hoveredObject = obj;
                obj.scale.set(1.05, 1.05, 1.05);

                tooltip.style.display = 'block';
                tooltip.style.left = event.clientX + 15 + 'px';
                tooltip.style.top = event.clientY + 15 + 'px';

                document.body.style.cursor = 'pointer';
            }
            break;
        }
    }

    if (!foundMonitor && hoveredObject) {
        hoveredObject.scale.set(1, 1, 1);
        hoveredObject = null;
        tooltip.style.display = 'none';
        document.body.style.cursor = 'default';
    }

    if (foundMonitor) {
        tooltip.style.left = event.clientX + 15 + 'px';
        tooltip.style.top = event.clientY + 15 + 'px';
    }
}

function onPointerClick() {
    if (hoveredObject && hoveredObject.userData.name === 'computer' && !isAnimating) {
        zoomToMonitor();
    }
}

function zoomToMonitor() {
    isAnimating = true;
    controls.enabled = false;
    controls.autoRotate = false;
    tooltip.style.display = 'none';

    // Zoom IN to the monitor (closer view)
    const targetPosition = { x: 0, y: 2, z: 2.5 };
    const duration = 1200;
    const startTime = Date.now();
    const startPosition = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
    };

    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);

        camera.position.x = startPosition.x + (targetPosition.x - startPosition.x) * eased;
        camera.position.y = startPosition.y + (targetPosition.y - startPosition.y) * eased;
        camera.position.z = startPosition.z + (targetPosition.z - startPosition.z) * eased;

        camera.lookAt(0, 1.8, 0);

        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        } else {
            setTimeout(() => {
                document.getElementById('portfolioModal').classList.add('active');
                document.body.style.overflow = 'hidden';
            }, 200);
        }
    }

    animateCamera();
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Pulsing aura glow around the monitor bezel (NOT the screen content).
    // Slow ~2.6s cycle: opacity breathes between a dim and bright value, with a
    // very subtle scale change for extra depth. The screen texture/material is
    // never touched here, so the code lines stay fully static and stable.
    const time = Date.now() * 0.001;
    const pulseCycle = (Math.sin(time * (Math.PI * 2 / 2.6)) + 1) / 2; // 0..1 over ~2.6s

    if (monitor) {
        const bezelGlow = monitor.children.find(child => child.userData && child.userData.isBezelGlow);
        if (bezelGlow) {
            bezelGlow.material.opacity = 0.22 + pulseCycle * 0.28; // 0.22 -> 0.50
            const scale = 1.0 + pulseCycle * 0.06; // subtle breathing scale
            bezelGlow.scale.set(1.9 * scale, 1.5 * scale, 1);
        }
    }

    renderer.render(scene, camera);
}

window.addEventListener('load', () => {
    setTimeout(() => {
        init();
    }, 100);
});
