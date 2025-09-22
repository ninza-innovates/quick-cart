import "./globals.css";
import { inter } from "/app/ui/fonts";

export const metadata = {
  title: {
    template: "%s | Quick Cart",
    default: "Quick Cart",
  },
  description: "A simple shopping cart web app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
