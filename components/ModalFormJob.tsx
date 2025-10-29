"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

const profileFields = [
  "Full name",
  "Photo Profile",
  "Gender",
  "Domicile",
  "Email",
  "Phone number",
  "LinkedIn link",
  "Date of birth",
];

interface JobOpeningModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function ModalFormJob({ open, setOpen }: JobOpeningModalProps) {
  const [jobData, setJobData] = useState({
    title: "",
    type: "",
    description: "",
    candidateNeeded: "",
    salaryMin: "",
    salaryMax: "",
    profileConfig: Object.fromEntries(profileFields.map((f) => [f, "mandatory"])),
  });

  const handleToggle = (field: string, value: string) => {
    setJobData((prev) => ({
      ...prev,
      profileConfig: { ...prev.profileConfig, [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!jobData.title.trim()) {
      toast.error("Job Name is required");
      return;
    }
    if (!jobData.type.trim()) {
      toast.error("Job Type is required");
      return;
    }
    if (!jobData.description.trim()) {
      toast.error("Job Description is required");
      return;
    }
    if (!jobData.candidateNeeded.trim() || isNaN(Number(jobData.candidateNeeded))) {
      toast.error("Number of Candidate Needed is required and must be a number");
      return;
    }
  
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const user = userData.user;
      if (!user) throw new Error("User not authenticated");
  
      const slug = jobData.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
  
      const { data: jobDataResult, error: jobError } = await supabase
        .from("jobs")
        .insert([
          {
            slug,
            title: jobData.title,
            job_type: jobData.type,
            description: jobData.description,
            candidates_needed: parseInt(jobData.candidateNeeded),
            salary_min: jobData.salaryMin ? parseFloat(jobData.salaryMin) : null,
            salary_max: jobData.salaryMax ? parseFloat(jobData.salaryMax) : null,
            recruiter_id: user.id,
          },
        ])
        .select("id")
        .single();
  
      if (jobError) {
        console.error("Supabase job insert error:", jobError);
        throw jobError;
      }
  
      const configs = Object.entries(jobData.profileConfig).map(([field, status]) => ({
        job_id: jobDataResult.id,
        field_name: field.toLowerCase().replace(/\s+/g, "_"),
        field_label: field,
        status,
      }));
  
      const { error: configError } = await supabase.from("job_config").insert(configs);
      if (configError) {
        console.error("Supabase job_config insert error:", configError);
        throw configError;
      }
  
      toast.success("Job published successfully!");
  
      setJobData({
        title: "",
        type: "",
        description: "",
        candidateNeeded: "",
        salaryMin: "",
        salaryMax: "",
        profileConfig: Object.fromEntries(profileFields.map((f) => [f, "mandatory"])),
      });
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to publish job:", error);
  
      toast.error("Failed to publish job", {
        description:
          error?.message || error?.details || JSON.stringify(error) || "Something went wrong",
      });
    }
  };
  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0 border-b pb-4">
          <DialogTitle className="text-lg font-semibold">Job Opening</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <form id="job-form" className="space-y-4 mt-4">
            <div>
              <Label>
                Job Name<span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Ex. Front End Engineer"
                className="mt-2"
                value={jobData.title}
                onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>
                Job Type<span className="text-red-500">*</span>
              </Label>
              <Select value={jobData.type} onValueChange={(val) => setJobData({ ...jobData, type: val })}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-Time">Full-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Part-Time">Part-time</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                Job Description<span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Describe the job..."
                value={jobData.description}
                className="mt-2 min-h-[105px] resize-none"
                onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>
                Number of Candidate Needed<span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="Ex. 2"
                value={jobData.candidateNeeded}
                className="mt-2"
                onChange={(e) => setJobData({ ...jobData, candidateNeeded: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Minimum Estimated Salary</Label>
                <Input
                  type="number"
                  placeholder="Rp 7.000.000"
                  value={jobData.salaryMin}
                  className="mt-2"
                  onChange={(e) => setJobData({ ...jobData, salaryMin: e.target.value })}
                />
              </div>
              <div>
                <Label>Maximum Estimated Salary</Label>
                <Input
                  type="number"
                  placeholder="Rp 8.000.000"
                  value={jobData.salaryMax}
                  className="mt-2"
                  onChange={(e) => setJobData({ ...jobData, salaryMax: e.target.value })}
                />
              </div>
            </div>

            <div className="border rounded-md p-4 mt-4">
              <p className="font-medium mb-2">Minimum Profile Information Required</p>
              <div className="space-y-3">
                {profileFields.map((field) => (
                  <div key={field} className="flex justify-between text-sm font-normal items-center border-b py-2">
                    <span>{field}</span>
                    <div className="flex gap-2">
                      {["mandatory", "optional", "off"].map((status) => {
                        const isActive = jobData.profileConfig[field] === status;
                        return (
                          <Button
                            key={status}
                            type="button"
                            variant="outline"
                            className={`text-sm font-normal rounded-full px-3 py-1 transition-all ${
                              isActive
                                ? "text-[#01959F] border-[#01959F]"
                                : "bg-gray-100 text-gray-400 border-gray-200 cursor-pointer"
                            }`}
                            onClick={() => handleToggle(field, status)}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="shrink-0 border-t mt-4 pt-4 bg-white flex justify-end">
          <Button form="job-form" type="submit" onClick={handleSubmit} className="bg-[#01959F] hover:bg-[#027a83]">
            Publish Job
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
