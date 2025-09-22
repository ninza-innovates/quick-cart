import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

// Get the user info for a specific user from the database
export const useGetUserInfo = (email) => {
  const [userInfo, setUserInfo] = useState([]); // Initialize as an empty array
  const userCollectionRef = collection(db, "users");

  useEffect(() => {
    if (!email) return; // Prevents running query when email is empty

    const userQuery = query(userCollectionRef, where("email", "==", email));
    const unsubscribe = onSnapshot(userQuery, (snapshot) => {
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserInfo(userData);
    });

    return () => unsubscribe(); // Clean up the Firestore listener properly
  }, [email]);

  return { userInfo };
};
