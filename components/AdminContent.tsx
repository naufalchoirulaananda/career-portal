import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import ModalFormJob from "@/components/ModalFormJob";
import JobCard from "./JobCard";

function AdminContent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[3fr_300px] gap-4 p-4">
        <div className="order-1 md:order-2 flex justify-end self-start">
          <Card className="relative w-full rounded-xl shadow-lg overflow-hidden bg-cover bg-center bg-[url('/images/card-image01.jpg')]">
            <div className="absolute inset-0 bg-black/70" />
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white relative">
                Recruit the best candidates
              </CardTitle>
              <CardDescription className="text-sm font-bold text-white relative">
                Create jobs, invite, and hire with ease
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                onClick={() => setOpen(true)}
                className="bg-[#01959F] text-white text-base font-bold w-full cursor-pointer rounded-md px-4 py-1.5 relative"
              >
                Create a new job
              </Button>
            </CardContent>
          </Card>
          <ModalFormJob open={open} setOpen={setOpen} />
        </div>

        <div className="order-2 md:order-1 rounded-xl">
          <JobCard />
        </div>
      </div>
    </>
  );
}

export default AdminContent;
