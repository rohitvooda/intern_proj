import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI ScienceVerse - Interactive 3D Learning Platform",
  description: "Explore Biology, Physics, and Data Structures in 3D with our advanced AI tutor, interactive physics simulations, and live coding animations.",
  keywords: "science learning, 3D cell explorer, physics simulator, data structure visualizer, AI tutor, educational game, gamified learning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-transparent text-black">
        {children}
      </body>
    </html>
  );
}
