import { auth } from "../firebase.js";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Add a loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false); // ✅ Set loading to false when Firebase updates user
    });

    return () => unsubscribe();
  }, []);

  return { user, loading }; // ✅ Return loading state
}
