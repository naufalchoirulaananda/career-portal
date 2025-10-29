
# Career Portal

## Project Overview

Career Portal adalah aplikasi web berbasis Next.js yang berfungsi sebagai sistem **Hiring Management** untuk mengelola lowongan pekerjaan dan pelamar.  

Aplikasi ini memiliki dua peran pengguna:
- **Admin (Recruiter):** dapat membuat daftar lowongan pekerjaan dan melihat data pelamar.  
- **Job Seeker (Applicant):** dapat melihat daftar lowongan aktif dan melamar pekerjaan dengan formulir yang disesuaikan secara dinamis berdasarkan konfigurasi dari Admin.  

Selain itu, sistem mendukung proses pengambilan foto profil menggunakan **gesture tangan melalui webcam** serta menampilkan **notifikasi umpan balik (feedback)** ketika pelamar berhasil mengirim lamaran.


## Tech Stack Used

**Framework:** Next.js

**Styling:** TailwindCSS, Shadcn UI

**State:** React useState & useEffect (built-in Next.js)

**API:** Supabase

**Webcam:** react-webcam

**Testing:** -

**Deployment:** Vercel


## How to Run Locally

Clone the project

```bash
  git clone https://github.com/naufalchoirulaananda/career-portal.git
```

Go to the project directory

```bash
  cd career-portal
```

Install dependencies

```bash
  npm install
```

Start the server, running on localhost:3000

```bash
  npm run dev
```
