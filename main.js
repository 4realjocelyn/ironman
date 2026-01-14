// ---------- THREE.JS SETUP ----------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// ---------- HAND TRACKING ----------
const videoElement = document.getElementById("video");

const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
});

hands.onResults(onResults);

const cameraFeed = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480,
});
cameraFeed.start();

// ---------- BLOCK CREATION ----------
function createCube(x, y, z) {
  const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(x, y, z);
  scene.add(cube);
}

let lastPinch = false;

function onResults(results) {
  if (!results.multiHandLandmarks.length) return;

  const landmarks = results.multiHandLandmarks[0];

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];

  const dx = thumbTip.x - indexTip.x;
  const dy = thumbTip.y - indexTip.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const pinch = distance < 0.03;

  if (pinch && !lastPinch) {
    const x = (indexTip.x - 0.5) * 5;
    const y = -(indexTip.y - 0.5) * 5;
    const z = -2;

    createCube(x, y, z);
  }

  lastPinch = pinch;
}

// ---------- RENDER LOOP ----------
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
