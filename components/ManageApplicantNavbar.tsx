"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";

function ManageApplicantNavbar() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/sign-in");
  };

  const initial = email ? email.charAt(0).toUpperCase() : "U";

  return (
    <div className="h-16 px-[18px] border-[#E0E0E0] border-b flex justify-between items-center bg-white">
      <div className="flex items-center gap-2">
        <Button
          onClick={() => router.push("/admin")}
          variant={"outline"}
          className="text-sm font-bold cursor-pointer"
        >
          Job list
        </Button>
        <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
        <Button
          variant={"outline"}
          className="text-sm font-bold bg-[#EDEDED] border-2 border-[#C2C2C2]"
        >
          Manage Candidate
        </Button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${initial}`}
              alt="User"
            />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="mt-2.5">
          <DropdownMenuLabel className="text-center">
            {email || "Loading..."}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 cursor-pointer text-center"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default ManageApplicantNavbar;
