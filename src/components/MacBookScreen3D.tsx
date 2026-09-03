import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, createPortal } from '@react-three/fiber';
import { Html, OrbitControls, Stage, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/* A real glTF MacBook Pro 14" (M5), rotatable, with the actual on-screen
   preview running as HTML content painted onto the model's own display
   panel rather than drawn as a flat mock.

   The panel's placement is not guessed: the source glb was inspected once
   offline (its POSITION accessor for the screen mesh is a perfectly flat
   96-vertex quad — max deviation from a fitted plane was ~2e-6 units) to
   recover the exact local-space centroid, in-plane basis and width/height
   of the display glass. Baked in below as SCREEN_* so no runtime geometry
   probing is needed. The Html is portalled directly onto that mesh, so it
   inherits the same transform chain as the model and stays pinned to the
   lid as the whole thing is dragged around. */
const MODEL_URL = '/models/macbook-pro-14-m5.glb';
const SCREEN_MESH_NAME = 'tfTbkkzhxqpKRgC';

const SCREEN_CENTROID = new THREE.Vector3(0.00004, -18.17, -18.63);
const SCREEN_RIGHT = new THREE.Vector3(1, 0, 0);
const SCREEN_UP = new THREE.Vector3(0, 0.3422, 0.9396);
const SCREEN_NORMAL = new THREE.Vector3(0, 0.9396, -0.3422);
const SCREEN_WIDTH = 29.6;
const SCREEN_HEIGHT = 19.2;

const PANEL_PX = { width: 1240, height: 806 };

function ScreenOverlay({ children }: { children: React.ReactNode }) {
  const { scene } = useGLTF(MODEL_URL);
  const screenMesh = useMemo(() => scene.getObjectByName(SCREEN_MESH_NAME) as THREE.Mesh | undefined, [scene]);

  useEffect(() => {
    if (!screenMesh) return;
    // The model ships with a baked wallpaper on this mesh's emissive map —
    // hide it so the live preview is the only thing on the glass.
    screenMesh.visible = false;
  }, [screenMesh]);

  const quaternion = useMemo(() => {
    const m = new THREE.Matrix4().makeBasis(SCREEN_RIGHT, SCREEN_UP, SCREEN_NORMAL);
    return new THREE.Quaternion().setFromRotationMatrix(m);
  }, []);

  if (!screenMesh) return null;

  return createPortal(
    <group position={SCREEN_CENTROID} quaternion={quaternion}>
      <group scale={[SCREEN_WIDTH / PANEL_PX.width, SCREEN_HEIGHT / PANEL_PX.height, 1]}>
        <Html
          transform
          occlude
          distanceFactor={1}
          style={{ width: PANEL_PX.width, height: PANEL_PX.height, overflow: 'hidden' }}
        >
          {children}
        </Html>
      </group>
    </group>,
    screenMesh,
  );
}

function Model({ children }: { children: React.ReactNode }) {
  const { scene } = useGLTF(MODEL_URL);
  return (
    <group rotation={[0, Math.PI * 0.08, 0]}>
      <primitive object={scene} />
      <Suspense fallback={null}>
        <ScreenOverlay>{children}</ScreenOverlay>
      </Suspense>
    </group>
  );
}

export default function MacBookScreen3D({ children }: { children: React.ReactNode }) {
  const [held, setHeld] = useState(false);
  const controlsRef = useRef<any>(null);

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-[640px]">
      <Canvas
        camera={{ position: [0, 4.4, 15.5], fov: 32 }}
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[6, 10, 8]} intensity={1.1} />
        <directionalLight position={[-8, 4, -6]} intensity={0.35} />
        <Suspense fallback={null}>
          <Stage adjustCamera={false} intensity={0.4} shadows={false} environment="city">
            <Model>{children}</Model>
          </Stage>
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI * 0.32}
          maxPolarAngle={Math.PI * 0.5}
          minAzimuthAngle={-Math.PI * 0.28}
          maxAzimuthAngle={Math.PI * 0.28}
          autoRotate={!held}
          autoRotateSpeed={0.9}
          onStart={() => setHeld(true)}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
