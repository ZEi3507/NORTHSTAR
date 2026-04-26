import { create } from 'zustand';

interface ConductorState {
  uid: string | null;
  displayName: string | null;
  level: number;
  scholarGrade: 'Initiate' | 'Archivist';
  postCount: number;
  approvedPostIds: string[];
  pendingPostId: string | null;
  conductStats: { focusScore: null; experimentsRun: null };
  isLoading: boolean;
  setConductor: (data: Partial<ConductorState>) => void;
  clearConductor: () => void;
}

export const useConductorStore = create<ConductorState>((set) => ({
  uid: null,
  displayName: null,
  level: 1,
  scholarGrade: 'Initiate',
  postCount: 0,
  approvedPostIds: [],
  pendingPostId: null,
  conductStats: { focusScore: null, experimentsRun: null },
  isLoading: true,
  setConductor: (data) => set((state) => ({ ...state, ...data })),
  clearConductor: () => set({
    uid: null,
    displayName: null,
    level: 1,
    scholarGrade: 'Initiate',
    postCount: 0,
    approvedPostIds: [],
    pendingPostId: null,
    conductStats: { focusScore: null, experimentsRun: null },
    isLoading: false,
  }),
}));
