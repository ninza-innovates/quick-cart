"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Suspense } from "react";

function SearchBarComponent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 600);

  return (
    <div className="w-full border flex border-gray-300 bg-white p-6 rounded-lg shadow-lg">
      <input
        type="text"
        placeholder="Search for products..."
        className="w-full mt-2 mr-2 p-2 border border-gray-300 rounded-lg"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("query") ?? ""}
      />
    </div>
  );
}

export default function SearchBar() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchBarComponent />
    </Suspense>
  );
}
