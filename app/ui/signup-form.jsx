"use client";

import { lusitana } from "@/app/ui/fonts";
import { AtSymbolIcon, KeyIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { auth } from "../lib/firebase.js";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAddUserInfo } from "../lib/hooks/useAddUserInfo.js";
import { NotificationBanner } from "./notification-banner.jsx";
import TermsAndConditions from "./terms-and-conditions.jsx";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showBanner, setShowBanner] = useState(false); // ✅ State to control banner visibility
  const [showTC, setShowTC] = useState(false); // ✅ State to control terms and conditions visibility
  const [isCheckingUser, setIsCheckingUser] = useState(false); // Track user check status
  const router = useRouter(); // Initialize the router
  const { addUserInfo } = useAddUserInfo();

  const signUp = async () => {
    setIsCheckingUser(true);

    try {
      // Directly attempt to create the user and catch the error
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // If we get here, user was created successfully
      const user = userCredential.user;
      const uid = user.uid;

      // Extract username from email (before '@')
      const username = email.split("@")[0];

      // Set display name
      await updateProfile(user, { displayName: username });

      addUserInfo({ userID: uid, email: email });
      router.push("/dashboard");
    } catch (error) {
      // Check if the error is because the email is already in use
      if (error.code === "auth/email-already-in-use") {
        setShowBanner(true);
        setTimeout(() => {
          setShowBanner(false);
        }, 3000);
      }
      // Handle other errors appropriately
    } finally {
      setIsCheckingUser(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    signUp();
  };

  return (
    <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
      <h1 className={`${lusitana.className} mb-3 text-2xl`}>
        Please create an account to continue.
      </h1>
      <form onSubmit={handleSubmit} className="w-full">
        <div>
          <label
            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
            htmlFor="email"
          >
            Email
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
        </div>
        <div className="mt-4">
          <label
            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
              id="password"
              type="password"
              name="password"
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
        </div>
        <button
          className="mt-4 w-full flex h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
          type="submit"
        >
          Sign up <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </button>
      </form>
      <div className="mt-3 text-xs text-gray-500 text-center">
        By signing up, you agree to our{" "}
        <button
          className="underline text-blue-400 hover:text-blue-700"
          onClick={() => setShowTC(true)}
        >
          terms and conditions
        </button>
        {showTC && (
          <TermsAndConditions handleCloseBtn={() => setShowTC(false)} />
        )}
      </div>
      {showBanner && (
        <NotificationBanner text="User already exists. Please log in." />
      )}
    </div>
  );
}
