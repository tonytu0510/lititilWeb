// ================================================
// 场景、相机、渲染器
// ================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0000);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 50, 130);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// ================================================
// 轨道控制器
// ================================================
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.6;
controls.maxDistance = 260;
controls.minDistance = 30;

// ================================================
// 中心星团（多星纠缠，绕共同中心旋转）
// ================================================
const clusterGroup = new THREE.Group();
scene.add(clusterGroup);

// 星团配色
const clusterColors = [
    0xf0d060, 0xc41e3a, 0xd4a017, 0x8b0000,
    0x4a7c59, 0x88aacc, 0xcc8899, 0x00aaaa,
    0xddaa88, 0xffe08a, 0xb03060
];

// 生成多颗星
const clusterStars = [];
const CLUSTER_COUNT = 14;      // 星的数量，越大越满
const CLUSTER_RADIUS = 34;     // 分布半径，越大越铺满屏

for (let i = 0; i < CLUSTER_COUNT; i++) {
    const color = clusterColors[i % clusterColors.length];
    const size = 2.5 + Math.random() * 3.5;

    // 星球本体
    const geo = new THREE.SphereGeometry(size, 48, 48);
    const mat = new THREE.MeshBasicMaterial({ color });
    const star = new THREE.Mesh(geo, mat);
    clusterGroup.add(star);

    // 光晕
    const glowGeo = new THREE.SphereGeometry(size * 1.7, 48, 48);
    const glowMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.14
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    clusterGroup.add(glow);

    // 每颗星自己的轨道参数
    const angle0 = Math.PI * 2 * i / CLUSTER_COUNT + Math.random() * 0.6;
    const orbitR = CLUSTER_RADIUS * (0.35 + Math.random() * 0.65);
    const tilt = (Math.random() - 0.5) * 0.6;      // 轨道倾斜
    const height = (Math.random() - 0.5) * 26;     // 上下偏移
    const speed = 0.004 + Math.random() * 0.008;   // 公转速度
    const selfRot = 0.006 + Math.random() * 0.012;

    clusterStars.push({
        star,
        glow,
        angle0,
        orbitR,
        tilt,
        height,
        speed,
        selfRot,
        size
    });
}

let clusterAngle = 0;

// ================================================
// 九大太阳系
// ================================================
const colors = [
    0xc41e3a, 0xd4a017, 0xf0d060, 0x8b0000,
    0x4a7c59, 0x88aacc, 0xcc8899, 0x00aaaa, 0xddaa88
];

const systems = colors.map((color, i) => {
    const group = new THREE.Group();

    const radius = 2 + Math.random() * 2;
    const geo = new THREE.SphereGeometry(radius, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.35,
        metalness: 0.1,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.25
    });
    const sphere = new THREE.Mesh(geo, mat);
    group.add(sphere);

    const ringGeo = new THREE.TorusGeometry(radius + 2.5, 0.35, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.5,
        metalness: 0.4,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.55
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.2;
    ring.rotation.y = Math.PI / 4;
    group.add(ring);

    const radius2 = radius + 5;
    const ring2Geo = new THREE.TorusGeometry(radius2, 0.18, 16, 64);
    const ring2Mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.6,
        metalness: 0.3,
        transparent: true,
        opacity: 0.25
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 1.8;
    ring2.rotation.z = Math.PI / 5;
    group.add(ring2);

    scene.add(group);

    return {
        group,
        sphere,
        ring,
        ring2,
        color,
        angle: Math.PI * 2 * i / 9,
        orbitRadius: 60 + Math.random() * 22,
        heightOffset: -18 + Math.random() * 36,
        speed: 0.002 + Math.random() * 0.003,
        selfRotate: 0.004 + Math.random() * 0.008,
        radius
    };
});

// ================================================
// 背景星星
// ================================================
const starsGeo = new THREE.BufferGeometry();
const starsCount = 4000;
const positions = new Float32Array(starsCount * 3);
for (let i = 0; i < starsCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 600;
}
starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const starsMat = new THREE.PointsMaterial({
    color: 0xd4a017,
    size: 0.35,
    transparent: true,
    opacity: 0.5
});
const stars = new THREE.Points(starsGeo, starsMat);
scene.add(stars);

// ================================================
// 轨道线
// ================================================
systems.forEach(sys => {
    const orbitCurve = new THREE.EllipseCurve(
        0, 0,
        sys.orbitRadius, sys.orbitRadius * 0.55,
        0, 2 * Math.PI,
        false, 0
    );
    const orbitPoints = orbitCurve.getPoints(120);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(
        orbitPoints.map(p => new THREE.Vector3(p.x, sys.heightOffset, p.y))
    );
    const orbitMat = new THREE.LineBasicMaterial({
        color: sys.color,
        transparent: true,
        opacity: 0.12
    });
    const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
    scene.add(orbitLine);
});

// ================================================
// 光照
// ================================================
const ambientLight = new THREE.AmbientLight(0x604030, 1.2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xf0d060, 2, 200);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xc41e3a, 1.2, 280);
pointLight2.position.set(0, 40, 0);
scene.add(pointLight2);

// ================================================
// 动画循环
// ================================================
function animate() {
    requestAnimationFrame(animate);

    // ---- 中心星团纠缠旋转 ----
    clusterAngle += 0.006;

    clusterStars.forEach((s, i) => {
        // 每颗星绕中心公转，相位不同
        const a = clusterAngle * (1 + i * 0.03) + s.angle0;

        const x = Math.cos(a) * s.orbitR;
        const z = Math.sin(a) * s.orbitR * 0.7;
        const y = s.height + Math.sin(a * 1.3 + i) * s.orbitR * s.tilt * 0.4;

        s.star.position.set(x, y, z);
        s.glow.position.set(x, y, z);

        // 自转
        s.star.rotation.y += s.selfRot;
        s.star.rotation.x += s.selfRot * 0.4;

        // 光晕呼吸
        const breath = 1 + Math.sin(a * 2 + i) * 0.1;
        s.glow.scale.setScalar(breath);
    });

    // 整体星团缓慢自转
    clusterGroup.rotation.y += 0.0015;

    // ---- 九大行星 ----
    systems.forEach(sys => {
        sys.angle += sys.speed;

        const x = Math.cos(sys.angle) * sys.orbitRadius;
        const z = Math.sin(sys.angle) * sys.orbitRadius * 0.55;
        const y = sys.heightOffset + Math.sin(sys.angle * 1.6) * 6;

        sys.group.position.set(x, y, z);

        sys.sphere.rotation.y += sys.selfRotate;
        sys.ring.rotation.z += sys.selfRotate * 0.8;
        sys.ring2.rotation.y += sys.selfRotate * 0.6;
    });

    stars.rotation.y += 0.0003;

    controls.update();
    renderer.render(scene, camera);
}

animate();

// ================================================
// 窗口大小自适应
// ================================================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});