import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./hooks/useTheme";
import { AuthProvider } from "./hooks/authContext";
import LoadingProvider from "./components/LoadingProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CampusFlow - College Resource Management",
  description: "Streamline college resource booking for students and faculty",
  keywords: ["college", "resources", "booking", "campus", "management", "labs", "equipment"],
  openGraph: {
    title: "CampusFlow - College Resource Management",
    description: "Streamline college resource booking",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CampusFlow",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} min-h-full flex flex-col font-sans antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <LoadingProvider>{children}</LoadingProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
