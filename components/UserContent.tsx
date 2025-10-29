"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  slug: string;
  salary_min: number;
  salary_max: number;
  job_type: string;
  created_at: string;
}

export default function UserContent() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching jobs:", error);
        setJobs([]);
      } else {
        setJobs(data || []);
      }

      setLoading(false);
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    if (!selectedJob && jobs.length > 0) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, selectedJob]);

  const isEmpty = !loading && jobs.length === 0;

  return (
    <div className="flex flex-col md:flex-row gap-4 py-4 px-[104px] h-[calc(100vh-4rem)]">
      {loading ? (
        <div className="flex w-full justify-center items-center">
          <p className="text-gray-500">Loading jobs...</p>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center w-full text-center bg-white">
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
              Please wait for the next batch of openings.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="w-full md:w-1/3 space-y-4 overflow-y-auto rounded-lg">
            {jobs.map((job) => (
              <Card
                key={job.id}
                className={`p-4 gap-4 cursor-pointer hover:shadow-lg transition ${
                  selectedJob?.id === job.id
                    ? "border-[#01959F] border-2 bg-[#F7FEFF]"
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedJob(job)}
              >
                <CardHeader className="rounded-md grid grid-cols-[auto_1fr] p-0 gap-0">
                  <div>
                    <Image
                      src="/images/profile-company.png"
                      alt="No jobs"
                      width={1920}
                      height={1080}
                      className="bg-cover h-12 w-12 border border-[#E0E0E0] rounded-md"
                    />
                  </div>
                  <div className="space-y-1 ml-2">
                    <CardTitle className="text-base font-semibold">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="m-0 text-[#616161]">
                      Job Company
                    </CardDescription>
                  </div>
                </CardHeader>

                <div className="border-t-[1.5px] border-dashed border-gray-300"></div>

                <CardContent className="p-0 flex gap-2 items-center">
                  <Image
                    src="/icons/location.svg"
                    alt="No jobs"
                    width={1920}
                    height={1080}
                    className="bg-cover h-4 w-4"
                  />
                  <p className="font-normal text-xs text-[#616161]">
                    Jakarta Selatan
                  </p>
                </CardContent>
                <CardContent className="p-0 flex gap-2">
                  <Image
                    src="/icons/salary.svg"
                    alt="No jobs"
                    width={1920}
                    height={1080}
                    className="bg-cover h-4 w-4"
                  />
                  <p className="font-normal text-xs text-[#616161]">
                    Rp{job.salary_min.toLocaleString("id-ID")} - Rp
                    {job.salary_max.toLocaleString("id-ID")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="w-full md:w-2/2 border rounded-lg p-4 overflow-y-auto">
            {selectedJob && (
              <Card className="border-none shadow-none p-4">
                <CardHeader className="p-0 rounded-md grid grid-cols-[auto_auto_1fr] gap-4">
                  <div className="flex items-start justify-start rounded-md">
                    <Image
                      src="/images/profile-company.png"
                      alt="No jobs"
                      width={1920}
                      height={1080}
                      className="bg-cover h-12 w-12 border border-[#E0E0E0] rounded-md"
                    />
                  </div>

                  <div className="text-xs font-medium space-y-1.5">
                    <Badge className="text-xs rounded-sm bg-[#43936C] py-1.5">
                      {selectedJob.job_type}
                    </Badge>
                    <p className="text-lg font-bold">{selectedJob.title}</p>
                    <p className="text-sm font-normal text-[#757575]">
                      Job Company
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      className="bg-[#FBC037] hover:bg-[#e2ad33] text-sm py-1 px-3.5 text-black font-bold rounded-md cursor-pointer"
                      onClick={() => router.push(`/apply/${selectedJob.slug}`)}
                    >
                      Apply
                    </Button>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="p-0">
                  <p className="whitespace-pre-wrap text-justify text-[#404040] text-sm leading-relaxed">
                    {selectedJob.description || "No description available."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
