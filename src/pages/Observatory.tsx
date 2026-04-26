import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Float, MeshDistortMaterial, Line } from '@react-three/drei';
import { useConductorStore } from '../stores/conductorStore';
import { fetchConstellationData } from '../lib/constellationEngine';
import type { ConstellationData, ConstellationNode } from '../lib/constellationEngine';
import Nav from '../components/Nav';
import { Link } from 'react-router-dom';
import { usePulse } from '../context/PulseProvider';

const NODE_COLORS = {
  archive: '#4D9FFF', // Blue
  insight: '#2BDEAC', // Mint
};

const EDGE_COLOR = '#39FF14'; // Toxic Neon Green

const Node = ({ node, onClick, intensity }: { node: ConstellationNode; onClick: (node: ConstellationNode) => void; intensity: number }) => {
  const color = node.collection === 'archive' ? NODE_COLORS.archive : NODE_COLORS.insight;
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[node.x, node.y, node.z]}>
      <mesh 
        onClick={() => onClick(node)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[2 * (1 + intensity * 0.05), 32, 32]} />
        <MeshDistortMaterial
          color={color}
          speed={2 * intensity}
          distort={0.3 * intensity}
          radius={1}
          transmission={0.8}
          thickness={1}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
          opacity={0.8}
          transparent
        />
      </mesh>
      {hovered && (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Text
            position={[0, 4, 0]}
            fontSize={2}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/ebgaramond/v26/Sl9X17G7YxXzUAt5Gv4Y0Y67L5V5M_p6.woff"
          >
            {node.title}
          </Text>
        </Float>
      )}
      <pointLight intensity={(hovered ? 200 : 50) * intensity} color={color} distance={20} />
    </group>
  );
};

const Connection = ({ start, end, intensity }: { start: [number, number, number]; end: [number, number, number]; intensity: number }) => {
  const lineRef = useRef<any>(null);
  
  useFrame(() => {
    if (lineRef.current) {
      lineRef.current.dashOffset -= 0.01 * intensity;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[start, end]}
      color={EDGE_COLOR}
      lineWidth={1}
      dashed
      dashSize={2}
      dashScale={1}
      transparent
      opacity={0.4 + intensity * 0.2}
    />
  );
};

const ConstellationScene = ({ data, onSelect }: { data: ConstellationData; onSelect: (node: ConstellationNode) => void }) => {
  const { focusScore } = useConductorStore((state) => state.conductStats);
  const { focusScoreIntensity } = usePulse();
  const normalizedFocus = focusScore ? Math.min(Math.max(focusScore / 100, 0.5), 2) : 1;
  const finalIntensity = normalizedFocus * focusScoreIntensity;

  return (
    <>
      <color attach="background" args={['#05040A']} />
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1 * finalIntensity} />

      <ambientLight intensity={0.5 * finalIntensity} />
      <pointLight position={[0, 0, 0]} intensity={3 * finalIntensity} color="#7C3AED" />
      {data.nodes.map((node) => (
        <Node key={node.id} node={node} onClick={onSelect} intensity={finalIntensity} />
      ))}

      {data.edges.map((edge, i) => {
        const start = data.nodes.find((n) => n.id === edge.source);
        const end = data.nodes.find((n) => n.id === edge.target);
        if (!start || !end) return null;
        return (
          <Connection 
            key={`${edge.source}-${edge.target}-${i}`} 
            start={[start.x, start.y, start.z]} 
            end={[end.x, end.y, end.z]} 
            intensity={finalIntensity}
          />
        );
      })}

      <OrbitControls 
        enableDamping 
        dampingFactor={0.05} 
        rotateSpeed={0.5} 
        minDistance={10} 
        maxDistance={500} 
      />
    </>
  );
};

const Observatory: React.FC = () => {
  const [data, setData] = useState<ConstellationData | null>(null);
  const [selectedNode, setSelectedNode] = useState<ConstellationNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await fetchConstellationData();
      setData(result);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="w-full h-screen bg-void relative overflow-hidden">
      <Nav />
      
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 200], fov: 60 }}>
          <Suspense fallback={null}>
            {data && <ConstellationScene data={data} onSelect={setSelectedNode} />}
          </Suspense>
        </Canvas>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-void z-20">
          <div className="text-mint font-mono tracking-[0.3em] animate-pulse uppercase">
            Initializing Space-Time Fold...
          </div>
        </div>
      )}

      {selectedNode && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-6">
          <div className="skew-glass-card h-48 w-full">
            <div className="glass-content flex flex-col justify-between">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-mint">
                  {selectedNode.collection === 'archive' ? '[ARCHIVE ENTRY]' : '[SACRED INSIGHT]'}
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-2 line-clamp-2">
                  {selectedNode.title}
                </h3>
                <p className="text-slate-400 text-xs font-mono">
                  Coordinates: {selectedNode.x.toFixed(1)}, {selectedNode.y.toFixed(1)}, {selectedNode.z.toFixed(1)}
                </p>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <Link
                  to={selectedNode.collection === 'archive' ? `/archive/${selectedNode.id}` : '/sacred-insights'}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all border border-white/10"
                >
                  View Details
                </Link>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-32 left-10 z-10 pointer-events-none">
        <h1 className="text-4xl font-heading font-bold text-white tracking-tight">OBSERVATORY</h1>
        <p className="text-slate-400 font-mono text-[10px] tracking-[0.2em] mt-2">
          SPATIAL DATA VISUALIZATION ENGINE v2.0
        </p>
      </div>
    </div>
  );
};

export default Observatory;
