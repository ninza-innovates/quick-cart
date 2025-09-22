import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
} from "firebase/firestore";

export const useGetUserOrders = (
  userId,
  itemsPerPage = 9,
  timeFilter = "all time"
) => {
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Function to get time filter timestamp
  const getTimeFilterTimestamp = () => {
    const now = new Date();

    switch (timeFilter) {
      case "last 30 days":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "past 3 months":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case "past year":
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return null; // "all time"
    }
  };

  // Get total count of orders for pagination
  useEffect(() => {
    const fetchTotalCount = async () => {
      if (!userId) return;

      const userOrdersCollectionRef = collection(db, "orders");
      let countQuery = query(
        userOrdersCollectionRef,
        where("userId", "==", userId)
      );

      // Apply time filter if needed
      const timeFilterDate = getTimeFilterTimestamp();
      if (timeFilterDate) {
        countQuery = query(
          countQuery,
          where("orderedAt", ">=", timeFilterDate.toISOString())
        );
      }

      const snapshot = await getCountFromServer(countQuery);
      setTotalOrders(snapshot.data().count);
    };

    fetchTotalCount();
  }, [userId, timeFilter]);

  // Fetch orders for the current page
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const userOrdersCollectionRef = collection(db, "orders");

    // Build the base query
    let baseQuery = query(
      userOrdersCollectionRef,
      where("userId", "==", userId),
      orderBy("orderedAt", "desc")
    );

    // Apply time filter if needed
    const timeFilterDate = getTimeFilterTimestamp();
    if (timeFilterDate) {
      baseQuery = query(
        baseQuery,
        where("orderedAt", ">=", timeFilterDate.toISOString())
      );
    }

    const fetchFirstPage = async () => {
      const firstPageQuery = query(baseQuery, limit(itemsPerPage));

      const documentSnapshots = await getDocs(firstPageQuery);

      // Set the last visible document for next page queries
      const lastVisibleDoc =
        documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastVisibleDoc);

      // Convert documents to order objects
      const orders = documentSnapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUserOrders(orders);
      setHasMore(orders.length === itemsPerPage);
      setLoading(false);
    };

    // Reset to first page when userId or timeFilter changes
    setCurrentPage(1);
    fetchFirstPage();

    // No need for onSnapshot for pagination, we'll use specific queries
  }, [userId, itemsPerPage, timeFilter]);

  // Function to load the next page
  const loadNextPage = async () => {
    if (!lastVisible || !hasMore) return;

    setLoading(true);

    const userOrdersCollectionRef = collection(db, "orders");

    // Build the base query
    let nextPageQuery = query(
      userOrdersCollectionRef,
      where("userId", "==", userId),
      orderBy("orderedAt", "desc")
    );

    // Apply time filter if needed
    const timeFilterDate = getTimeFilterTimestamp();
    if (timeFilterDate) {
      nextPageQuery = query(
        nextPageQuery,
        where("orderedAt", ">=", timeFilterDate.toISOString())
      );
    }

    // Add pagination constraints
    nextPageQuery = query(
      nextPageQuery,
      startAfter(lastVisible),
      limit(itemsPerPage)
    );

    const documentSnapshots = await getDocs(nextPageQuery);

    // Update the last visible document for subsequent queries
    const lastVisibleDoc =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    setLastVisible(lastVisibleDoc);

    // Convert documents to order objects
    const newOrders = documentSnapshots.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setUserOrders([...userOrders, ...newOrders]);
    setCurrentPage(currentPage + 1);
    setHasMore(newOrders.length === itemsPerPage);
    setLoading(false);
  };

  // Function to load a specific page
  const loadPage = async (pageNumber) => {
    if (pageNumber <= 0 || pageNumber > Math.ceil(totalOrders / itemsPerPage)) {
      return;
    }

    setLoading(true);

    const userOrdersCollectionRef = collection(db, "orders");

    // Build the base query
    let baseQuery = query(
      userOrdersCollectionRef,
      where("userId", "==", userId),
      orderBy("orderedAt", "desc")
    );

    // Apply time filter if needed
    const timeFilterDate = getTimeFilterTimestamp();
    if (timeFilterDate) {
      baseQuery = query(
        baseQuery,
        where("orderedAt", ">=", timeFilterDate.toISOString())
      );
    }

    if (pageNumber === 1) {
      // First page is easy
      const firstPageQuery = query(baseQuery, limit(itemsPerPage));
      const documentSnapshots = await getDocs(firstPageQuery);

      const lastVisibleDoc =
        documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastVisibleDoc);

      const orders = documentSnapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUserOrders(orders);
      setCurrentPage(1);
      setHasMore(orders.length === itemsPerPage && orders.length < totalOrders);
      setLoading(false);
    } else {
      // For any other page, we need to get documents up to the beginning of the requested page
      // then take only the ones for the requested page
      const previousItemsCount = (pageNumber - 1) * itemsPerPage;
      const docsToPreviousPage = query(baseQuery, limit(previousItemsCount));
      const previousDocs = await getDocs(docsToPreviousPage);

      if (previousDocs.docs.length < previousItemsCount) {
        // We don't have enough documents to reach this page
        setLoading(false);
        return;
      }

      const lastDocFromPreviousPage =
        previousDocs.docs[previousDocs.docs.length - 1];

      const currentPageQuery = query(
        baseQuery,
        startAfter(lastDocFromPreviousPage),
        limit(itemsPerPage)
      );

      const documentSnapshots = await getDocs(currentPageQuery);

      const lastVisibleDoc =
        documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastVisibleDoc);

      const orders = documentSnapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUserOrders(orders);
      setCurrentPage(pageNumber);
      setHasMore(
        orders.length === itemsPerPage &&
          pageNumber * itemsPerPage < totalOrders
      );
      setLoading(false);
    }
  };

  return {
    userOrders,
    loading,
    totalOrders,
    currentPage,
    hasMore,
    loadNextPage,
    loadPage,
    totalPages: Math.ceil(totalOrders / itemsPerPage),
  };
};
