"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  title: string;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  slug: string;
  status: string;
  created_at: string;
}

const statusCycle = ["active", "inactive", "draft"];

export default function JobCardList() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching jobs:", error);
      else {
        setJobs(data || []);
        setFilteredJobs(data || []);
      }
    };

    fetchJobs();

    const channel = supabase
      .channel("realtime-jobs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        (payload) => {
          console.log("Realtime change:", payload);
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const filtered = jobs.filter((job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
  }, [searchTerm, jobs]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "active":
        return "bg-[#F8FBF9] text-green-700 border border-[#B8DBCA]";
      case "inactive":
        return "bg-red-100 text-red-700 border border-red-300";
      case "draft":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      default:
        return "bg-gray-100 text-gray-500 border border-gray-300";
    }
  };

  const handleStatusToggle = async (jobId: string) => {
    setJobs((prevJobs) => {
      return prevJobs.map((job) => {
        if (job.id === jobId) {
          const currentStatus = job.status || "active";
          const nextIndex =
            (statusCycle.indexOf(currentStatus) + 1) % statusCycle.length;
          const nextStatus = statusCycle[nextIndex];
          updateJobStatus(jobId, nextStatus);
          return { ...job, status: nextStatus };
        }
        return job;
      });
    });
  };

  const updateJobStatus = async (jobId: string, nextStatus: string) => {
    console.log("Updating job:", jobId, "→", nextStatus);
    const { error } = await supabase
      .from("jobs")
      .update({ status: nextStatus })
      .eq("id", jobId);

    if (error) {
      toast.error("Failed to update status");
      console.error(error);
    } else {
      toast.success(`Status changed to "${nextStatus}"`);
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      <div className="relative w-full mb-4">
        <Input
          type="search"
          placeholder="Search by job title"
          className="pr-10 w-full px-4 h-11 shadow-none border-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Image
          src="/icons/search.svg"
          alt="Search"
          width={18}
          height={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70"
        />
      </div>

      <div className="relative">
        <ScrollArea className="h-[calc(100vh-10rem)] py-3 rounded-md pr-2 relative [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-4 pb-6">
            {filteredJobs.length === 0 ? (
              <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center py-10 text-center space-y-4">
                <Image
                  src="/images/nojobsfound.svg"
                  alt="No jobs"
                  width={300}
                  height={300}
                  className="opacity-80"
                />

                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    No job openings available
                  </h2>
                  <p className="text-sm text-gray-500">
                    Create a job opening now and start the candidate process.
                  </p>
                </div>

                <Button
                  onClick={() => alert("Open create job modal")}
                  className="bg-[#FBC037] hover:bg-[#e2ad33] cursor-pointer text-black font-bold text-base px-5 py-2 rounded-md shadow"
                >
                  Create a new job
                </Button>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="p-5 rounded-xl border border-[#E0E0E0] bg-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-2">
                    <div className="flex gap-2 text-sm">
                      <button
                        onClick={() => handleStatusToggle(job.id)}
                        className={`${getStatusStyle(
                          job.status
                        )} font-medium text-sm capitalize py-1 px-3.5 rounded-md cursor-pointer transition-all duration-200`}
                      >
                        {job.status || "active"}
                      </button>
                      <div className="text-[#404040] py-1 px-3.5 rounded-sm text-sm border border-[#E0E0E0] bg-[#fafafa]">
                        started on{" "}
                        {new Date(job.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <h3 className="font-bold text-lg pt-2.5 text-gray-900">
                      {job.title}
                    </h3>

                    <div className="flex justify-between items-center">
                      {job.salary_min && job.salary_max ? (
                        <p className="text-gray-600 text-sm">
                          Rp{job.salary_min.toLocaleString("id-ID")} - Rp
                          {job.salary_max.toLocaleString("id-ID")}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-sm italic">
                          Salary not specified
                        </p>
                      )}
                      <Button
                        onClick={() => router.push(`/admin/jobs/${job.slug}`)}
                        className="bg-[#01959F] hover:bg-[#027a83] text-xs py-1 px-3.5 text-white font-medium rounded-md cursor-pointer"
                      >
                        Manage Job
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="pointer-events-none absolute top-0 left-0 w-full h-6 bg-linear-to-b from-white to-transparent z-10" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-6 bg-linear-to-t from-white to-transparent z-10" />
      </div>
    </div>
  );
}
