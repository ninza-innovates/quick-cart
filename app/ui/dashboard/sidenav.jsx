"use client";

import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase.js";
import { useRouter } from "next/navigation";
import useAuth from "../../lib/hooks/useAuth";
import { useEffect, useState } from "react";
import QuickCartLogo from "../quickcart-logo.jsx";
import { PowerIcon } from "@heroicons/react/24/outline";
import { CardSkeleton } from "../skeletons.jsx";
import NavLinks from "./nav-links.jsx";
import Link from "next/link";

export default function SideNav() {
  const router = useRouter();
  const { user, loading } = useAuth(); // Get the authenticated user
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Track if user is logging out

  // Only redirect to login if NOT logging out and user is NOT logged in
  useEffect(() => {
    if (!loading && !user && !isLoggingOut) {
      router.push("/login");
    }
  }, [user, loading, isLoggingOut, router]);

  const logout = async () => {
    try {
      setIsLoggingOut(true); // Set flag before logging out
      await signOut(auth);
      router.push("/"); // Redirect to Landing Page after logout
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Show loading message while waiting for Firebase authentication
  if (loading) {
    return <CardSkeleton />;
  }
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
        href="/dashboard"
      >
        <div className="w-full md:w-40 flex justify-center md:justify-start">
          <QuickCartLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block dark:bg-dark"></div>
        <button
          onClick={logout}
          className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3 dark:bg-dark dark:text-white"
        >
          <PowerIcon className="w-6" />
          <div className="hidden md:block dark:text-white">Sign Out</div>
        </button>
      </div>
    </div>
  );
}
