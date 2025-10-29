"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[#FAFAFA] px-6">
      <Image
        src={"/images/success.svg"}
        alt="success"
        width={1920}
        height={1080}
        className="bg-cover w-[214px]"
      />
      <h1 className="text-2xl font-bold mb-2">🎉 Your application was sent!</h1>
      <p className="text-[#404040] mb-6 text-center">
        Congratulations! You've taken the first step towards a rewarding career
        at Rakamin.
        <br /> We look forward to learning more about you during the application
        process.
      </p>

      <Button
        onClick={() => router.push("/user")}
        className="bg-[#01959F] hover:bg-[#027a83] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>
    </div>
  );
}
