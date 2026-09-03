import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bounds, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/* A real glTF MacBook Pro 14" (M5), rotatable, with the actual on-screen
   preview painted onto the model's own display panel rather than drawn as
   a flat mock.

   The panel's placement is not guessed: the source glb was inspected once
   offline (its POSITION accessor for the screen mesh is a perfectly flat
   96-vertex quad — max deviation from a fitted plane was ~2e-6 units) to
   recover the exact local-space centroid, in-plane basis and width/height
   of the display glass. Baked in below as SCREEN_*.

   The preview itself is a plain 2D HTML layer, not a 3D object — every
   frame, the four corners of the glass are projected from world space to
   screen pixels and fitted with a CSS affine `matrix()`. drei's own
   <Html transform> (a 3D CSS matrix nested inside a perspective/preserve-3d
   ancestor) rendered completely blank here — correct position, correct
   size, still invisible — which pointed at a compositor interaction
   between that 3D CSS context and the WebGL canvas rather than anything
   fixable in the transform math. A flat 2D layer sidesteps that class of
   bug entirely, at the cost of true keystoning on extreme angles — a cost
   this scene never pays, since the model only ever rotates a few degrees
   either side. */
const MODEL_URL = '/models/macbook-pro-14-m5.glb';
const SCREEN_MESH_NAME = 'tfTbkkzhxqpKRgC';

const SCREEN_CENTROID = new THREE.Vector3(0.00004, -18.17, -18.63);
const SCREEN_RIGHT = new THREE.Vector3(1, 0, 0);
const SCREEN_NORMAL = new THREE.Vector3(0, 0.9396, -0.3422);
const SCREEN_UP = new THREE.Vector3().crossVectors(SCREEN_NORMAL, SCREEN_RIGHT);
const SCREEN_WIDTH = 29.6;
const SCREEN_HEIGHT = 19.2;
const HALF_W = SCREEN_WIDTH / 2;
const HALF_H = SCREEN_HEIGHT / 2;

const PANEL_PX = { width: 1240, height: 806 };

function projectToPx(v: THREE.Vector3, camera: THREE.Camera, w: number, h: number) {
  const p = v.clone().project(camera);
  return { x: (p.x * 0.5 + 0.5) * w, y: (1 - (p.y * 0.5 + 0.5)) * h };
}

/** Lives inside the Canvas: hides the model's baked wallpaper mesh and
 *  reports the glass's projected screen-space affine transform every
 *  frame, via a plain callback rather than React state (state would
 *  re-render the whole tree at 60fps). */
function ScreenTracker({ onTransform }: { onTransform: (css: string | null) => void }) {
  const { scene } = useGLTF(MODEL_URL);
  const screenMesh = useMemo(() => scene.getObjectByName(SCREEN_MESH_NAME) as THREE.Mesh | undefined, [scene]);
  const { camera, size } = useThree();

  useEffect(() => {
    if (!screenMesh) return;
    screenMesh.visible = false;
    return () => {
      onTransform(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenMesh]);

  useFrame(() => {
    if (!screenMesh) return;
    screenMesh.updateWorldMatrix(true, false);

    const tl = screenMesh.localToWorld(SCREEN_CENTROID.clone().addScaledVector(SCREEN_RIGHT, -HALF_W).addScaledVector(SCREEN_UP, HALF_H));
    const tr = screenMesh.localToWorld(SCREEN_CENTROID.clone().addScaledVector(SCREEN_RIGHT, HALF_W).addScaledVector(SCREEN_UP, HALF_H));
    const bl = screenMesh.localToWorld(SCREEN_CENTROID.clone().addScaledVector(SCREEN_RIGHT, -HALF_W).addScaledVector(SCREEN_UP, -HALF_H));

    const pTl = projectToPx(tl, camera, size.width, size.height);
    const pTr = projectToPx(tr, camera, size.width, size.height);
    const pBl = projectToPx(bl, camera, size.width, size.height);

    const a = (pTr.x - pTl.x) / PANEL_PX.width;
    const b = (pTr.y - pTl.y) / PANEL_PX.width;
    const c = (pBl.x - pTl.x) / PANEL_PX.height;
    const d = (pBl.y - pTl.y) / PANEL_PX.height;

    onTransform(`matrix(${a},${b},${c},${d},${pTl.x},${pTl.y})`);
  });

  return null;
}

function Model() {
  const { scene } = useGLTF(MODEL_URL);
  return <primitive object={scene} />;
}

export default function MacBookScreen3D({ children }: { children: React.ReactNode }) {
  const [held, setHeld] = useState(false);
  const controlsRef = useRef<any>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-[1080px]">
      <Canvas
        /* Pointed straight down the screen's own surface normal (from the
           same offline plane fit as SCREEN_NORMAL) rather than a level
           product-shot angle — a laptop lid tilts back, and viewing the
           display level-on foreshortens it toward a sliver. Bounds below
           keeps this direction and only adjusts distance to frame the
           model. */
        camera={{ position: [0, 0.342, 0.94], fov: 32 }}
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[6, 10, 8]} intensity={1.2} />
        <directionalLight position={[-8, 4, -6]} intensity={0.4} />
        <Suspense fallback={null}>
          <Environment preset="city" />
          {/* Bounds only moves the camera to frame the content — it never
              repositions the model itself, so the screen-plane coordinates
              baked in above stay exact. */}
          <Bounds fit clip observe margin={1.2}>
            <Model />
          </Bounds>
          <ScreenTracker
            onTransform={(css) => {
              const el = panelRef.current;
              if (!el) return;
              if (css) {
                el.style.transform = css;
                el.style.display = 'block';
              } else {
                el.style.display = 'none';
              }
            }}
          />
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

      {/* The live preview, laid over the canvas as a plain 2D layer and
          affine-fitted to the glass's projected corners every frame. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          ref={panelRef}
          className="pointer-events-auto absolute left-0 top-0 origin-top-left overflow-hidden"
          style={{ width: PANEL_PX.width, height: PANEL_PX.height, display: 'none' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
