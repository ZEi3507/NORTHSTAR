import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useConductorStore } from "../stores/conductorStore";

export const initAuthListener = () => {
  const { setConductor, clearConductor } = useConductorStore.getState();

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const scholarRef = doc(db, "scholars", user.uid);
        const scholarSnap = await getDoc(scholarRef);

        if (scholarSnap.exists()) {
          const data = scholarSnap.data();
          setConductor({
            uid: user.uid,
            displayName: data.displayName || user.displayName,
            level: data.level,
            scholarGrade: data.scholarGrade,
            postCount: data.postCount,
            approvedPostIds: data.approvedPostIds,
            pendingPostId: data.pendingPostId,
            conductStats: data.conductStats,
            isLoading: false
          });
          console.log("Conductor store populated:", user.uid);
        } else {
          setConductor({ uid: user.uid, displayName: user.displayName, isLoading: false });
        }
      } catch (error) {
        console.error("Error fetching scholar document:", error);
        setConductor({ isLoading: false });
      }
    } else {
      clearConductor();
      console.log("Auth cleared");
    }
  });
};
