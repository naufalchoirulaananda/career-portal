"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  ChevronDownIcon,
  CalendarIcon,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Command,
  CommandInput,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { HandCapture } from "@/components/HandCapture";
import { useRouter } from "next/navigation";

const countries = [
  { name: "Indonesia", code: "+62", flag: "id" },
  { name: "United States", code: "+1", flag: "us" },
  { name: "United Kingdom", code: "+44", flag: "gb" },
  { name: "Japan", code: "+81", flag: "jp" },
  { name: "South Korea", code: "+82", flag: "kr" },
  { name: "Germany", code: "+49", flag: "de" },
  { name: "France", code: "+33", flag: "fr" },
  { name: "Australia", code: "+61", flag: "au" },
  { name: "Singapore", code: "+65", flag: "sg" },
  { name: "India", code: "+91", flag: "in" },
];

function capitalizeWords(str: string) {
  const words = str.toLowerCase().split(" ");

  return words
    .map((word, index) => {
      const exceptions = ["dki", "di", "diy", "kep", "nad"];

      if (exceptions.includes(word)) return word.toUpperCase();

      const lowercaseWords = ["dan", "ke", "yang", "of", "the"];
      if (lowercaseWords.includes(word)) return word;

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ")
    .replace(/\bDi Yogyakarta\b/gi, "DI Yogyakarta")
    .replace(/\bDki Jakarta\b/gi, "DKI Jakarta");
}

export default function Page() {
  const params = useParams();
  const slug = params.slug as string;

  const [job, setJob] = useState<{ id: string; title: string } | null>(null);
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  const [domiciles, setDomiciles] = React.useState<string[]>([]);
  const [filtered, setFiltered] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState("");
  const [showDropdown, setShowDropdown] = React.useState(false);

  const [openFlag, setOpenFlag] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState(countries[0]);
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const router = useRouter();
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [errors, setErrors] = useState({
    photo: "",
    fullName: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    linkedin: "",
    domicile: "",
  });

  React.useEffect(() => {
    const fetchJob = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        console.error("Error fetching job:", error);
      }

      setJob(data);
    };

    fetchJob();
  }, [slug]);

  React.useEffect(() => {
    const fetchDomiciles = async () => {
      try {
        const provRes = await fetch(
          "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json"
        );
        const provinces = await provRes.json();

        let all: string[] = [];
        for (const prov of provinces) {
          const regRes = await fetch(
            `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${prov.id}.json`
          );
          const regencies = await regRes.json();

          all = [
            ...all,
            ...regencies.map(
              (r: any) =>
                `${capitalizeWords(r.name)} - ${capitalizeWords(prov.name)}`
            ),
          ];
        }

        all.sort((a, b) => a.localeCompare(b, "id"));
        setDomiciles(all);
        setFiltered(all);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDomiciles();
  }, []);

  React.useEffect(() => {
    const results = domiciles.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );
    setFiltered(results);
  }, [query, domiciles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors = {
      photo: "",
      fullName: "",
      dob: "",
      gender: "",
      phone: "",
      email: "",
      linkedin: "",
      domicile: "",
    };
    let hasError = false;

    const fullName = (
      document.getElementById("fullname") as HTMLInputElement
    ).value.trim();
    const genderInput = document.querySelector<HTMLInputElement>(
      'input[name="gender"]:checked'
    );
    const gender = genderInput?.value || "";
    const email = (
      document.getElementById("email") as HTMLInputElement
    ).value.trim();
    const linkedin = (
      document.getElementById("linkedin") as HTMLInputElement
    ).value.trim();
    const phoneInput =
      document.querySelector<HTMLInputElement>('input[type="tel"]');
    const phone = phoneInput?.value.trim() || "";
    const domicileValue = selected || query;
    const dob = date ? date.toISOString().split("T")[0] : null;

    if (!photo) {
      newErrors.photo = "Required";
      hasError = true;
    }
    if (!fullName) {
      newErrors.fullName = "Required";
      hasError = true;
    }
    if (!dob) {
      newErrors.dob = "Required";
      hasError = true;
    }
    if (!domicileValue) {
      newErrors.domicile = "Required";
      hasError = true;
    }
    if (!gender) {
      newErrors.gender = "Required";
      hasError = true;
    }
    if (!phone) {
      newErrors.phone = "Required";
      hasError = true;
    }
    if (!email) {
      newErrors.email =
        "Please enter your email in the format: name@example.com";
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email =
        "Please enter your email in the format: name@example.com";
      hasError = true;
    }
    if (!linkedin) {
      newErrors.linkedin =
        "Please copy paste your Linkedin URL, example: https://www.linkedin.com/in/username";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    setLoadingSubmit(true);

    try {
      const fileName = `${Date.now()}-${fullName.replace(/\s+/g, "_")}.jpg`;
      const base64Data = photo!.split(",")[1];
      const blob = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

      const { error: uploadError } = await supabase.storage
        .from("applicant_photos")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw new Error("Upload photo failed!");

      const photoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/applicant_photos/${fileName}`;

      const { error: insertError } = await supabase.from("applicant").insert([
        {
          job_id: job?.id,
          job_slug: slug,
          full_name: fullName,
          date_of_birth: dob,
          gender,
          domicile: domicileValue,
          phone,
          email,
          linkedin,
          photo_url: photoUrl,
        },
      ]);

      if (insertError) throw new Error("Failed to submit application.");

      router.push("/apply/success");
    } catch (err) {
      console.error("Submit failed:", err);
      alert(
        (err as Error).message || "Something went wrong. Please try again."
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-[#FAFAFA]">
      <div className="w-full max-w-[700px]">
        <Card className="rounded-none shadow-none px-4">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={"/user"}>
                <Button variant={"outline"} className="cursor-pointer">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <CardTitle className="text-lg font-bold">
                Apply {job?.title} at Job Company
              </CardTitle>
            </div>
            <div>
              <CardDescription className="text-sm text-[#404040] font-normal">
                ℹ️ This field required to fill
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form>
              <FieldGroup>
                <Field>
                  <span className="text-red-500 text-xs font-bold">
                    * Required
                  </span>
                  <FieldLabel htmlFor="fullname">Photo Profile</FieldLabel>
                  <div className="flex justify-start">
                    <Image
                      src={photo || "/images/person.png"}
                      alt="profile"
                      width={1920}
                      height={1080}
                      className="bg-cover w-32 rounded-md"
                    />
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant={"outline"}
                      className="text-sm font-bold cursor-pointer"
                      onClick={() => setShowCamera(true)}
                    >
                      <span>
                        <Image
                          src="/icons/download.svg"
                          alt="No jobs"
                          width={1920}
                          height={1080}
                          className="bg-cover w-4 rounded-md"
                        />
                      </span>
                      Take a Picture
                    </Button>
                    {errors.photo && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.photo}
                      </p>
                    )}
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="fullname">
                    Full name<span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="fullname"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    onChange={() =>
                      setErrors((prev) => ({ ...prev, fullName: "" }))
                    }
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </Field>

                <Field className="flex flex-col gap-3">
                  <Label htmlFor="date" className="px-1">
                    Date of birth<span className="text-red-500">*</span>
                  </Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className={
                          errors.dob
                            ? "border-red-500 justify-between items-center"
                            : "w-full font-normal justify-between items-center"
                        }
                        onChange={() =>
                          setErrors((prev) => ({ ...prev, dob: "" }))
                        }
                      >
                        <span className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {date ? (
                            <span>
                              {new Intl.DateTimeFormat("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }).format(date)}
                            </span>
                          ) : (
                            <span className="text-[#9E9E9E]">
                              Select your date of birth
                            </span>
                          )}
                        </span>
                        <ChevronDownIcon className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          setDate(date);
                          setOpen(false);
                          setErrors((prev) => ({ ...prev, dob: "" }));
                        }}
                        className="w-80"
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.dob && (
                    <p className="text-xs text-red-500 mt-1">{errors.dob}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>
                    Gender<span className="text-red-500">*</span>
                  </FieldLabel>
                  <RadioGroup
                    className="flex items-center gap-4"
                    name="gender"
                    onValueChange={() =>
                      setErrors((prev) => ({ ...prev, gender: "" }))
                    }
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="text-sm font-normal">
                        She/her (Female)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="text-sm font-normal">
                        He/him (Male)
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors.gender && (
                    <p className="text-xs text-red-500 mt-1">{errors.gender}</p>
                  )}
                </Field>

                <Field className="relative">
                  <FieldLabel>
                    Domicile<span className="text-red-500">*</span>
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      placeholder="Choose your domicile"
                      value={query || selected}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() =>
                        setTimeout(() => setShowDropdown(false), 150)
                      }
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setSelected("");
                        setShowDropdown(true);
                        setErrors((prev) => ({ ...prev, domicile: "" }));
                      }}
                      className={
                        errors.domicile ? "border-red-500" : "capitalize"
                      }
                    />

                    <ChevronDownIcon
                      className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${
                        showDropdown ? "rotate-180" : "rotate-0"
                      }`}
                    />
                    {showDropdown && (
                      <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-md max-h-56 overflow-y-auto">
                        {loading ? (
                          <div className="flex items-center justify-center p-3 text-gray-400 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Loading...
                          </div>
                        ) : filtered.length > 0 ? (
                          filtered.slice(0, 10).map((item) => (
                            <div
                              key={item}
                              onMouseDown={() => {
                                setSelected(item);
                                setQuery("");
                                setShowDropdown(false);
                                setErrors((prev) => ({
                                  ...prev,
                                  domicile: "",
                                }));
                              }}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-[#F5F5F5]"
                            >
                              {item}
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-gray-400 text-sm">
                            No results found.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Field>

                <Field>
                  <FieldLabel>
                    Phone number<span className="text-red-500">*</span>
                  </FieldLabel>
                  <FieldGroup>
                    <div
                      className={`flex items-center rounded-md overflow-hidden transition ${
                        errors.phone
                          ? "border border-red-500"
                          : "border focus-within:ring-2 focus-within:ring-primary/50"
                      }`}
                    >
                      <Popover open={openFlag} onOpenChange={setOpenFlag}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="flex items-center gap-2 px-3 py-2 border-r bg-muted hover:bg-muted/70 transition"
                          >
                            <img
                              src={`https://flagcdn.com/w20/${selectedCountry.flag}.png`}
                              alt={selectedCountry.name}
                              className="w-5 h-5 rounded-full object-cover border"
                            />
                            <ChevronDownIcon className="h-4 w-4 opacity-70" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 flex">
                          <Command>
                            <CommandInput placeholder="Search..." />
                            <CommandGroup>
                              {countries.map((country) => (
                                <CommandItem
                                  key={country.code}
                                  onSelect={() => {
                                    setSelectedCountry(country);
                                    setOpen(false);
                                  }}
                                >
                                  <div className="flex items-center justify-between w-80">
                                    <div className="flex items-center gap-2">
                                      <img
                                        src={`https://flagcdn.com/w20/${country.flag}.png`}
                                        alt={country.name}
                                        className="w-5 h-5 rounded-full object-cover border"
                                      />
                                      <span>{country.name}</span>
                                    </div>

                                    <div className="ml-auto mr-3 text-sm text-muted-foreground">
                                      {country.code}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      <span className="px-2 text-sm text-muted-foreground select-none">
                        {selectedCountry.code}
                      </span>

                      <Input
                        type="tel"
                        placeholder="812-3456-7890"
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                        onChange={() =>
                          setErrors((prev) => ({ ...prev, phone: "" }))
                        }
                      />
                    </div>
                  </FieldGroup>
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">
                    Email<span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    required
                    onChange={() =>
                      setErrors((prev) => ({ ...prev, email: "" }))
                    }
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="linkedin">
                    Link LinkedIn<span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="linkedin"
                    type="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    required
                    onChange={() =>
                      setErrors((prev) => ({ ...prev, linkedin: "" }))
                    }
                    className={errors.linkedin ? "border-red-500" : ""}
                  />
                  {errors.linkedin && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.linkedin}
                    </p>
                  )}
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
        <div className="h-[88px] px-6 flex justify-center items-center bg-white">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loadingSubmit}
            className="bg-[#01959F] hover:bg-[#027a83] cursor-pointer w-full"
          >
            {loadingSubmit ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>

        {showCamera && (
          <HandCapture
            onCapture={(img) => {
              setPhoto(img);
              setErrors((prev) => ({ ...prev, photo: "" }));
              setShowCamera(false);
            }}
            onClose={() => setShowCamera(false)}
          />
        )}
      </div>
    </div>
  );
}
