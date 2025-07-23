"use client";

import { Navbar } from "@/components/navbar";
import Image from "next/image";

export default function page() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Image
          src="/logo.png"
          alt="Centered Logo"
          width={200}
          height={200}
          className="mb-6"
        />

        <h1>WELCOME TO MES SYSTEM</h1>
      </main>
    </>
  );
};
