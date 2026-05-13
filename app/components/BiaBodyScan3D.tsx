"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const MODEL = "/models/clinical-digital-human.glb";
const MODEL_TARGET_HEIGHT = 0.8;
const TORSO_ANCHOR_T = 0.52;
const SCENE_BG = "#071412";

/** Min Y del bbox in locale: suoli appena sopra il disco glow (mondo ≈ -1.4 con gruppo a -0.15). */
const SOLE_TARGET_MIN_Y = -1.25;

const HOLOGRAM_RIM_CHUNK = /* glsl */ `
	vec3 holoN = normalize( normal );
	vec3 holoV = normalize( vViewPosition );
	float holoRim = pow( 1.0 - abs( dot( holoN, holoV ) ), 2.35 );
	outgoingLight += vec3( 0.22, 1.0, 0.62 ) * holoRim * 1.12;
	vec2 guv = vUv;
	float gx = fract( guv.x * 150.0 );
	float gy = fract( guv.y * 220.0 );
	float gline = max(
		smoothstep( 0.0, 0.045, gx ) * smoothstep( 0.955, 1.0, gx ),
		smoothstep( 0.0, 0.045, gy ) * smoothstep( 0.955, 1.0, gy )
	);
	outgoingLight += vec3( 0.18, 0.92, 0.58 ) * gline * 0.085;
`;

function refineAnatomyRig(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  root.traverse((obj) => {
    const bone = obj as THREE.Bone;
    if (!bone.isBone) return;
    const n = bone.name;
    if (n === "shoulder.L" || n === "shoulder.R") bone.scale.multiplyScalar(1.02);
    if (n === "hand.L" || n === "hand.R") bone.scale.multiplyScalar(1.015);
    if (n === "foot.L" || n === "foot.R") bone.scale.multiplyScalar(1.012);
    if (n === "spine.005") bone.scale.multiplyScalar(1.018);
    if (n === "spine.003") {
      bone.scale.x *= 1.02;
      bone.scale.z *= 1.015;
    }
    if (n === "head" || n === "Head" || /(^|:)Head$/i.test(n)) {
      bone.scale.x *= 0.94;
      bone.scale.z *= 0.94;
      bone.scale.y *= 1.02;
    }
    if (/neck$/i.test(n) || /:Neck$/i.test(n)) bone.scale.multiplyScalar(1.03);
    if (/clavicle/i.test(n) || /Collar/i.test(n)) bone.scale.multiplyScalar(1.015);
  });
  root.updateMatrixWorld(true);
}

function applyBodyMaterial(root: THREE.Object3D, mat: THREE.MeshPhysicalMaterial) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const m = mesh.material;
    const names = [mesh.name];
    if (m && !Array.isArray(m)) names.push((m as THREE.Material).name);
    const joined = names.join(" ");
    if (/joint/i.test(joined)) {
      mesh.visible = false;
      return;
    }
    mesh.material = mat;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
  });
}

function prepareAnatomyModel(scene: THREE.Object3D, mat: THREE.MeshPhysicalMaterial) {
  const clone = scene.clone(true);
  applyBodyMaterial(clone, mat);
  refineAnatomyRig(clone);

  clone.position.set(0, 0, 0);
  clone.rotation.set(0, 0, 0);
  clone.scale.set(1, 1, 1);
  clone.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(clone);
  const center = new THREE.Vector3();
  box.getCenter(center);
  clone.position.sub(center);
  clone.updateMatrixWorld(true);

  box.setFromObject(clone);
  const size = new THREE.Vector3();
  box.getSize(size);
  if (size.y <= 0) return clone;

  clone.scale.setScalar(MODEL_TARGET_HEIGHT / size.y);
  clone.scale.multiply(new THREE.Vector3(0.96, 1, 0.96));
  clone.updateMatrixWorld(true);

  box.setFromObject(clone);
  const h = box.max.y - box.min.y;
  if (h <= 0) return clone;

  const torsoY = box.min.y + h * TORSO_ANCHOR_T;
  clone.position.y -= torsoY;
  clone.updateMatrixWorld(true);

  box.setFromObject(clone);
  clone.position.y += SOLE_TARGET_MIN_Y - box.min.y;
  clone.position.set(0, clone.position.y, 0);
  clone.rotation.set(0, 0, 0);
  clone.updateMatrixWorld(true);

  return clone;
}

function useHologramBodyMaterial() {
  const mat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: "#7dffd9",
      emissive: "#49ffd0",
      emissiveIntensity: 0.7,
      roughness: 0.12,
      metalness: 0.02,
      transparent: true,
      opacity: 0.55,
      transmission: 0.45,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    m.customProgramCacheKey = () => "bia_hologram_v2";
    m.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace("#include <opaque_fragment>", `${HOLOGRAM_RIM_CHUNK}\n\t#include <opaque_fragment>`);
    };
    return m;
  }, []);
  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

function useRadialGreenHaloTexture() {
  const tex = useMemo(() => {
    const s = 320;
    const c = document.createElement("canvas");
    c.width = s;
    c.height = s;
    const ctx = c.getContext("2d");
    if (!ctx) return new THREE.Texture();
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s * 0.52);
    g.addColorStop(0, "rgba(40, 255, 160, 0.35)");
    g.addColorStop(0.25, "rgba(30, 200, 130, 0.12)");
    g.addColorStop(0.55, "rgba(10, 80, 55, 0.04)");
    g.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

function useLaserBandTexture() {
  const tex = useMemo(() => {
    const w = 512;
    const h = 36;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return new THREE.Texture();
    const g = ctx.createLinearGradient(0, h / 2, w, h / 2);
    g.addColorStop(0, "rgba(20, 120, 80, 0)");
    g.addColorStop(0.42, "rgba(60, 255, 180, 0.08)");
    g.addColorStop(0.5, "rgba(210, 255, 230, 0.72)");
    g.addColorStop(0.58, "rgba(60, 255, 180, 0.08)");
    g.addColorStop(1, "rgba(20, 120, 80, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

/** Alone verde dietro il corpo: fisso nel mondo, non ruota. */
function StaticBodyHalo({ map }: { map: THREE.Texture }) {
  return (
    <group position={[0, -0.15, -0.34]} renderOrder={-3}>
      <mesh renderOrder={-3}>
        <planeGeometry args={[1.15, 2.05]} />
        <meshBasicMaterial
          map={map}
          transparent
          opacity={0.42}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, -0.02]} renderOrder={-4}>
        <planeGeometry args={[1.35, 2.25]} />
        <meshBasicMaterial
          color="#052818"
          transparent
          opacity={0.22}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Disco glow sotto i piedi (fisso, non ruota). */
function FootGlowDisc() {
  const geom = useMemo(() => new THREE.CircleGeometry(0.38, 32), []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#3dff9a"),
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        toneMapped: false
      }),
    []
  );
  useEffect(() => {
    return () => {
      geom.dispose();
      mat.dispose();
    };
  }, [geom, mat]);
  return (
    <mesh geometry={geom} material={mat} position={[0, -1.45, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2} />
  );
}

function FlatBackdropGrid() {
  const geom = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const z = -0.38;
    const y0 = -1.45;
    const y1 = 1.45;
    const x0 = -1.15;
    const x1 = 1.15;
    for (let i = 0; i <= 36; i++) {
      const y = y0 + (i / 36) * (y1 - y0);
      pts.push(new THREE.Vector3(x0, y, z), new THREE.Vector3(x1, y, z));
    }
    for (let j = -28; j <= 28; j++) {
      const x = j * 0.04;
      pts.push(new THREE.Vector3(x, y0, z), new THREE.Vector3(x, y1, z));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  return (
    <lineSegments geometry={geom} renderOrder={-4}>
      <lineBasicMaterial color="#4ade9a" transparent opacity={0.07} depthWrite={false} toneMapped={false} />
    </lineSegments>
  );
}

function HudTicks() {
  const geom = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const z = -0.22;
    for (let i = -12; i <= 12; i++) {
      const y = i * 0.09;
      const len = i % 4 === 0 ? 0.075 : 0.038;
      pts.push(new THREE.Vector3(-0.62, y, z), new THREE.Vector3(-0.62 + len, y, z));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  return (
    <lineSegments geometry={geom} renderOrder={0}>
      <lineBasicMaterial color="#7dffd9" transparent opacity={0.11} depthWrite={false} toneMapped={false} />
    </lineSegments>
  );
}

function LaserScanner({ reduced, bandMap }: { reduced: boolean; bandMap: THREE.Texture }) {
  const scannerRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!scannerRef.current) return;
    if (reduced) {
      scannerRef.current.position.y = 0;
      return;
    }
    scannerRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.62) * 1.14;
  });

  return (
    <group ref={scannerRef} position={[0, 0, 0.18]} renderOrder={8}>
      <mesh position={[0, 0, 0.02]} scale={[1.18, 1, 1]} renderOrder={8}>
        <planeGeometry args={[1, 0.042]} />
        <meshBasicMaterial
          map={bandMap}
          color="#5ef5b8"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, 0.04]} scale={[1.04, 1, 1]} renderOrder={9}>
        <planeGeometry args={[1, 0.007]} />
        <meshBasicMaterial
          map={bandMap}
          color="#d8fff0"
          transparent
          opacity={0.36}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function HumanModel({ material }: { material: THREE.MeshPhysicalMaterial }) {
  const { scene } = useGLTF(MODEL);
  const model = useMemo(() => prepareAnatomyModel(scene, material), [scene, material]);
  return <primitive object={model} />;
}

function SceneBackground() {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    if (!gl || !scene) return;
    scene.background = new THREE.Color(SCENE_BG);
    gl.setClearColor(0x071412, 1);
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.67;
    return () => {
      scene.background = null;
    };
  }, [gl, scene]);
  return null;
}

function CameraLock() {
  const { camera } = useThree();
  useLayoutEffect(() => {
    if (!camera || !("position" in camera)) return;
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(0, 0, 4.2);
    c.near = 0.08;
    c.far = 80;
    c.fov = 36;
    c.lookAt(0, -0.15, 0);
    c.updateProjectionMatrix();
  }, [camera]);
  return null;
}

function ScanStage({ reduced }: { reduced: boolean }) {
  const bodyRef = useRef<THREE.Group>(null);
  const bodyMaterial = useHologramBodyMaterial();
  const laserMap = useLaserBandTexture();
  const haloMap = useRadialGreenHaloTexture();

  useFrame((_state, delta) => {
    if (!bodyRef.current) return;
    bodyRef.current.rotation.x = 0;
    bodyRef.current.rotation.z = 0;
    if (reduced) return;
    bodyRef.current.rotation.y += delta * 0.35;
  });

  return (
    <group>
      <CameraLock />
      <FlatBackdropGrid />
      <StaticBodyHalo map={haloMap} />
      <HudTicks />
      <FootGlowDisc />
      <group ref={bodyRef} position={[0, -0.15, 0]} scale={1}>
        <Suspense fallback={null}>
          <HumanModel material={bodyMaterial} />
        </Suspense>
      </group>
      <LaserScanner reduced={reduced} bandMap={laserMap} />
    </group>
  );
}

function Scene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <SceneBackground />
      <ambientLight intensity={0.42} color="#1a3d30" />
      <directionalLight position={[2.8, 3.8, 4.5]} intensity={0.75} color="#9fffd8" />
      <directionalLight position={[-2, 1.5, 2]} intensity={0.18} color="#206050" />
      <pointLight position={[0, 0.15, 2.4]} intensity={0.55} color="#5dffae" />
      <ScanStage reduced={reduced} />
    </>
  );
}

useGLTF.preload(MODEL);

export function BiaBodyScan3D({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const reduced = Boolean(prefersReducedMotion);
  return (
    <div className="bia-bodyscan-viewport relative isolate h-full min-h-[min(520px,62vh)] w-full flex-1">
      <div className="absolute inset-0 isolate overflow-hidden rounded-[inherit]">
        <div className="bia-bodyscan-stage-bg" aria-hidden />
        <div className="bia-bodyscan-stage-vignette" aria-hidden />
        <div className="bia-bodyscan-stage-grid" aria-hidden />
        {!reduced ? <div className="bia-bodyscan-stage-ambient" aria-hidden /> : null}
        <Canvas
          className="relative z-[5] h-full w-full touch-none"
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false }}
          camera={{ position: [0, 0, 4.2], fov: 36 }}
          frameloop="always"
        >
          <Scene reduced={reduced} />
        </Canvas>
      </div>
    </div>
  );
}
