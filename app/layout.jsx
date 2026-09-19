import "./globals.css";

export const metadata = {
  title: "Dallian Luxe Hair",
  description: "Dallian Luxe Hair e-commerce store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}