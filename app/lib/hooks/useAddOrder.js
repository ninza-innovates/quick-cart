import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

export const useAddOrder = () => {
  const ordersCollectionRef = collection(db, "orders");

  const addOrder = async ({
    userId,
    productName,
    totalPrice,
    imageURL,
    description,
    quantity,
    arrivalDate,
  }) => {
    try {
      await addDoc(ordersCollectionRef, {
        userId,
        productName,
        imageURL,
        description,
        totalPrice,
        quantity,
        orderedAt: new Date().toLocaleDateString(),
        arrivalDate: arrivalDate,
        returnStatus: false,
      });
    } catch (error) {
      console.error("Error adding order: ", error);
    }
  };
  return { addOrder };
};
