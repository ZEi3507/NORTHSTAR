import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Constellation Node interface for the 3D renderer.
 */
export interface ConstellationNode {
  id: string;
  title: string;
  category: string;
  x: number;
  y: number;
  z: number;
  collection: 'archive' | 'sacred-insights';
}

/**
 * Constellation Edge interface representing a connection between two nodes.
 */
export interface ConstellationEdge {
  source: string;
  target: string;
}

/**
 * The full constellation data set.
 */
export interface ConstellationData {
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
}

/**
 * Generates a random coordinate within the defined volume.
 */
const getRandomCoord = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * constellationEngine
 * 
 * Fetches approved archive entries and sacred insights, assigns random 3D positions,
 * and groups them into a constellation graph where nodes of the same category are connected.
 */
export const fetchConstellationData = async (): Promise<ConstellationData> => {
  const nodes: ConstellationNode[] = [];
  const edges: ConstellationEdge[] = [];

  try {
    // 1. Fetch approved Archive documents
    const archiveQuery = query(
      collection(db, 'archive'), 
      where('status', '==', 'approved')
    );
    const archiveSnap = await getDocs(archiveQuery);
    
    archiveSnap.forEach((doc) => {
      const data = doc.data();
      nodes.push({
        id: doc.id,
        title: data.title || 'Untitled Archive',
        // Fallback to 'type' if 'category' is not present in archive documents
        category: data.category || data.type || 'General',
        x: getRandomCoord(-100, 100),
        y: getRandomCoord(-100, 100),
        z: getRandomCoord(-100, 100),
        collection: 'archive',
      });
    });

    // 2. Fetch all Sacred Insights documents
    const insightsSnap = await getDocs(collection(db, 'sacred-insights'));
    
    insightsSnap.forEach((doc) => {
      const data = doc.data();
      nodes.push({
        id: doc.id,
        title: data.fileName || 'Untitled Insight',
        category: data.category || 'General',
        x: getRandomCoord(-100, 100),
        y: getRandomCoord(-100, 100),
        z: getRandomCoord(-100, 100),
        collection: 'sacred-insights',
      });
    });

    // 3. Group node IDs by category to generate connections
    const categoryGroups: Record<string, string[]> = {};
    
    nodes.forEach((node) => {
      if (!categoryGroups[node.category]) {
        categoryGroups[node.category] = [];
      }
      categoryGroups[node.category].push(node.id);
    });

    // 4. Generate edges connecting nodes within the same category
    // We connect nodes in a chain sequence for each category group.
    Object.values(categoryGroups).forEach((nodeIds) => {
      if (nodeIds.length < 2) return;
      
      for (let i = 0; i < nodeIds.length - 1; i++) {
        edges.push({
          source: nodeIds[i],
          target: nodeIds[i + 1],
        });
      }
    });

  } catch (error) {
    console.error('Error fetching constellation data:', error);
  }

  return { nodes, edges };
};
