"use client";

import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
} from "firebase/firestore";

export const useGetAllProducts = (itemsPerPage = 12, searchQuery = "") => {
  const [products, setProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Get total count of products
  useEffect(() => {
    const fetchTotalCount = async () => {
      const productsCollectionRef = collection(db, "products");
      const countSnapshot = await getCountFromServer(productsCollectionRef);
      setTotalProducts(countSnapshot.data().count);
    };

    fetchTotalCount();
  }, []);

  // Set up real-time listener for all products when searching
  useEffect(() => {
    if (!searchQuery) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setLoading(true);

    const productsCollectionRef = collection(db, "products");
    const productsQuery = query(
      productsCollectionRef,
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      const allProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter products based on search query client-side
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filteredResults = allProducts.filter((product) =>
        product.name.toLowerCase().includes(lowerCaseQuery)
      );

      setSearchResults(filteredResults);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [searchQuery]);

  // Initial fetch of products (for pagination when not searching)
  useEffect(() => {
    if (searchQuery) return; // Skip normal pagination fetch when searching

    setLoading(true);

    const productsCollectionRef = collection(db, "products");
    const firstPageQuery = query(
      productsCollectionRef,
      orderBy("createdAt", "desc"),
      limit(itemsPerPage)
    );

    const fetchFirstPage = async () => {
      const documentSnapshots = await getDocs(firstPageQuery);

      // Set the last visible document for next page queries
      const lastVisibleDoc =
        documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastVisibleDoc);

      // Convert documents to product objects
      const fetchedProducts = documentSnapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(fetchedProducts);
      setHasMore(fetchedProducts.length === itemsPerPage);
      setLoading(false);
    };

    // Reset to first page on initial load
    setCurrentPage(1);
    fetchFirstPage();
  }, [itemsPerPage, searchQuery]);

  // Function to load the next page (only used when not searching)
  const loadNextPage = async () => {
    if (!lastVisible || !hasMore || searchQuery) return;

    setLoading(true);

    const productsCollectionRef = collection(db, "products");
    const nextPageQuery = query(
      productsCollectionRef,
      orderBy("createdAt", "desc"),
      startAfter(lastVisible),
      limit(itemsPerPage)
    );

    const documentSnapshots = await getDocs(nextPageQuery);

    // Update the last visible document for subsequent queries
    const lastVisibleDoc =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    setLastVisible(lastVisibleDoc);

    // Convert documents to product objects
    const newProducts = documentSnapshots.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setProducts([...products, ...newProducts]);
    setCurrentPage(currentPage + 1);
    setHasMore(newProducts.length === itemsPerPage);
    setLoading(false);
  };

  // Function to load a specific page (only used when not searching)
  const loadPage = async (pageNumber) => {
    if (
      searchQuery ||
      pageNumber <= 0 ||
      pageNumber > Math.ceil(totalProducts / itemsPerPage)
    ) {
      return;
    }

    setLoading(true);

    const productsCollectionRef = collection(db, "products");

    if (pageNumber === 1) {
      // First page is easy
      const firstPageQuery = query(
        productsCollectionRef,
        orderBy("createdAt", "desc"),
        limit(itemsPerPage)
      );

      const documentSnapshots = await getDocs(firstPageQuery);

      const lastVisibleDoc =
        documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastVisibleDoc);

      const fetchedProducts = documentSnapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(fetchedProducts);
      setCurrentPage(1);
      setHasMore(
        fetchedProducts.length === itemsPerPage &&
          fetchedProducts.length < totalProducts
      );
      setLoading(false);
    } else {
      // For any other page, we need to get documents up to the beginning of the requested page
      // then take only the ones for the requested page
      const previousItemsCount = (pageNumber - 1) * itemsPerPage;
      const docsToPreviousPage = query(
        productsCollectionRef,
        orderBy("createdAt", "desc"),
        limit(previousItemsCount)
      );

      const previousDocs = await getDocs(docsToPreviousPage);

      if (previousDocs.docs.length < previousItemsCount) {
        // We don't have enough documents to reach this page
        setLoading(false);
        return;
      }

      const lastDocFromPreviousPage =
        previousDocs.docs[previousDocs.docs.length - 1];

      const currentPageQuery = query(
        productsCollectionRef,
        orderBy("createdAt", "desc"),
        startAfter(lastDocFromPreviousPage),
        limit(itemsPerPage)
      );

      const documentSnapshots = await getDocs(currentPageQuery);

      const lastVisibleDoc =
        documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastVisibleDoc);

      const fetchedProducts = documentSnapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(fetchedProducts);
      setCurrentPage(pageNumber);
      setHasMore(
        fetchedProducts.length === itemsPerPage &&
          pageNumber * itemsPerPage < totalProducts
      );
      setLoading(false);
    }
  };

  // Pagination for search results
  const [currentSearchPage, setCurrentSearchPage] = useState(1);

  // Get current page of search results
  const getCurrentSearchPageItems = () => {
    const startIndex = (currentSearchPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return searchResults.slice(startIndex, endIndex);
  };

  // Function to navigate search results
  const goToSearchPage = (pageNumber) => {
    if (
      pageNumber <= 0 ||
      pageNumber > Math.ceil(searchResults.length / itemsPerPage)
    ) {
      return;
    }
    setCurrentSearchPage(pageNumber);
  };

  // Reset search page when query changes
  useEffect(() => {
    setCurrentSearchPage(1);
  }, [searchQuery]);

  return {
    // When searching, return paginated search results
    // When not searching, return normal paginated products
    products: isSearching ? getCurrentSearchPageItems() : products,
    isSearching,
    loading,
    totalProducts: isSearching ? searchResults.length : totalProducts,
    currentPage: isSearching ? currentSearchPage : currentPage,

    // For normal pagination
    hasMore,
    loadNextPage,
    loadPage,

    // For search pagination
    goToSearchPage,

    // Total pages calculation
    totalPages: isSearching
      ? Math.ceil(searchResults.length / itemsPerPage)
      : Math.ceil(totalProducts / itemsPerPage),
  };
};
