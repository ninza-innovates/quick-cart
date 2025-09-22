"use client";

import { getAuth, deleteUser } from "firebase/auth";
import {
  collection,
  doc,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useState } from "react";
import { db } from "../firebase"; // Import Firestore instance

export const useDeleteAccount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const auth = getAuth();

  const deleteAccount = async () => {
    if (!auth.currentUser) {
      setError("No user is currently signed in.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;

      // Delete user's orders
      const ordersCollection = collection(db, "orders");
      const q = query(ordersCollection, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const deleteOrderPromises = querySnapshot.docs.map((orderDoc) =>
        deleteDoc(orderDoc.ref)
      );
      await Promise.all(deleteOrderPromises);

      // Delete user's cart
      const cartCollection = collection(db, "cart");
      const cartQuery = query(cartCollection, where("userId", "==", user.uid));
      const cartQuerySnapshot = await getDocs(cartQuery);

      const deleteCartPromises = cartQuerySnapshot.docs.map((cartDoc) =>
        deleteDoc(cartDoc.ref)
      );

      await Promise.all(deleteCartPromises);

      // Delete user document from Firestore
      const userDocRef = doc(db, "users", user.uid);
      await deleteDoc(userDocRef);

      // Delete user from Firebase Authentication
      await deleteUser(user);

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return { deleteAccount, loading, error };
};
