import { lusitana } from "@/app/ui/fonts";
import Settings from "../../ui/account/settings";
import DarkMode from "@/app/ui/dark-mode";

export const metadata = {
  title: "Account",
};

export default function AccountPage() {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <h1
          className={`${lusitana.className} mb-4 text-xl md:text-2xl dark:text-white`}
        >
          Account
        </h1>
        <DarkMode />
      </div>
      <Settings />
    </div>
  );
}
