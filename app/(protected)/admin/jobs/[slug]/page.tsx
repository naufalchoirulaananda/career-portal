"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2 } from "lucide-react";
import ManageApplicantNavbar from "@/components/ManageApplicantNavbar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Applicant {
  id: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  domicile: string;
  phone: string;
  email: string;
  linkedin: string;
  created_at: string;
}

interface Job {
  id: string;
  slug: string;
  title: string;
}

export default function JobApplicantsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [job, setJob] = useState<Job | null>(null);

  const perPage = 10;

  useEffect(() => {
    const fetchJob = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) console.error(error);
      else setJob(data);
    };

    fetchJob();
  }, [slug]);

  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);

      const { count } = await supabase
        .from("applicant")
        .select("*", { count: "exact", head: true })
        .eq("job_slug", slug);

      const { data, error } = await supabase
        .from("applicant")
        .select("*")
        .eq("job_slug", slug)
        .order("created_at", { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1);

      if (error) console.error(error);
      else {
        setApplicants(data || []);
        setTotalPages(Math.ceil((count || 0) / perPage));
      }

      setLoading(false);
    };

    fetchApplicants();
  }, [slug, page]);

  const toggleSelectAll = () => {
    if (selectedIds.length === applicants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applicants.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <>
      <ManageApplicantNavbar />

      <div className="flex flex-col w-full h-[calc(100vh-64px)] p-6">
        <p className="text-lg font-bold mb-5">{job ? job.title : ""}</p>
        <Card className="w-full flex-1 overflow-hidden flex flex-col px-6 rounded-md">
          <CardContent className="flex-1 p-0">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
              </div>
            ) : applicants.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500 text-sm">No applicants found.</p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <Table className="min-w-full">
                  <TableHeader className="bg-gray-50">
                    <TableRow className="h-16">
                      <TableHead className="w-[50px]">
                        <Checkbox
                          className="border-[#01959F]"
                          checked={
                            selectedIds.length === applicants.length &&
                            applicants.length > 0
                          }
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="font-bold">NAMA LENGKAP</TableHead>
                      <TableHead className="font-bold">EMAIL ADDRESS</TableHead>
                      <TableHead className="font-bold">PHONE NUMBERS</TableHead>
                      <TableHead className="font-bold">DATE OF BIRTH</TableHead>
                      <TableHead className="font-bold">DOMICILE</TableHead>
                      <TableHead className="font-bold">GENDER</TableHead>
                      <TableHead className="font-bold">LINK LINKEDIN</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {applicants.map((a, index) => (
                      <TableRow
                        key={a.id}
                        className={`${
                          selectedIds.includes(a.id)
                            ? "bg-blue-50"
                            : "hover:bg-gray-50"
                        } transition h-16`}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(a.id)}
                            onCheckedChange={() => toggleSelectOne(a.id)}
                            className="border-[#01959F]"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {a.full_name}
                        </TableCell>
                        <TableCell>{a.email}</TableCell>
                        <TableCell>
                          {a.phone.startsWith("0") ? a.phone : "0" + a.phone}
                        </TableCell>

                        <TableCell>
                          {new Date(a.date_of_birth).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </TableCell>

                        <TableCell>{a.domicile}</TableCell>
                        <TableCell className="capitalize">{a.gender}</TableCell>
                        <TableCell>
                          <a
                            href={a.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline break-all"
                          >
                            {a.linkedin}
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex justify-between items-center p-4 border-t bg-white">
                    <div className="text-sm text-gray-600">
                      Showing page {page} of {totalPages}
                    </div>

                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className={`cursor-pointer ${
                              page === 1 ? "pointer-events-none opacity-50" : ""
                            }`}
                          />
                        </PaginationItem>

                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              href="#"
                              onClick={() => setPage(i + 1)}
                              isActive={page === i + 1}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={() =>
                              setPage((p) => Math.min(totalPages, p + 1))
                            }
                            className={`cursor-pointer ${
                              page === totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }`}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
