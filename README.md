<div align="center">

# CrescentEd

### AI-built entrepreneurship curriculum for young and underserved founders. Answer an intake form, get a course that fits your idea.

<p>
  <img alt="React" src="https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3FCF8E?logo=supabase&logoColor=white">
  <img alt="Status" src="https://img.shields.io/badge/status-MVP-orange">
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-brightgreen">
</p>

</div>

## What it is

**CrescentEd** turns a short intake form into a personalised entrepreneurship course.
You describe your idea, your goals, your experience level and how much time you have.
The app generates a five-module curriculum around that specific idea, tracks your
progress through it, and gives you an AI tutor that already knows your context so you
are not re-explaining your business every time you ask a question.

It was built as a senior capstone project, aimed at founders who do not have a network,
an accelerator, or someone to ask.

## Features

**Intake to curriculum**
- One form captures idea, goals, background, experience level, interests, constraints,
  learning style and commitment level.
- The AI generates a course from those answers rather than serving a fixed syllabus.

**Five modules, in order**
- Idea Discovery, Market Validation, Business Model, Launch Preparation, Growth Foundations.
- Each module carries readable sections plus plug-and-play exercises you actually fill in.
- Section and exercise completion is tracked per module.

**AI tutor**
- A sidebar tutor available inside any module, scoped to what you are working on.
- Rate limited per user per hour, so a public deploy cannot be drained.

**Templates and PDF export**
- Worksheets and templates generated as downloadable PDFs (jsPDF), saved to your account
  when you are signed in.

**Demo mode**
- `VITE_DEMO_MODE=true` runs the whole app with **zero** backend and **zero** AI requests.
- Sample course content is bundled, state lives in browser local storage, and sign-up is
  removed, so the hosted demo costs nothing to run and needs no account.

## How it works

```
intake form  ->  AI course generation  ->  five modules stored per user
                                              |
                                              v
                        progress tracking . AI tutor . PDF export
```

Signed in, everything is scoped to your user through Postgres row-level security.
In demo mode the same interface reads from bundled sample content instead.

## Tech stack

| Area | Tooling |
| --- | --- |
| Framework | React 18 + Vite 5 + TypeScript |
| UI | Tailwind CSS 3 + shadcn/ui (Radix) |
| State / data | Zustand + TanStack Query |
| Routing | React Router 6 |
| Backend | Supabase (Postgres, Auth, Storage) |
| AI | Supabase edge function `crescented-ai`, rate limited per user |
| Charts | Recharts |
| PDF | jsPDF |
| Icons | lucide-react |

## Getting started

```bash
# clone
git clone https://github.com/luminawebsitedesign-max/CrescentED.git
cd CrescentED

# install
npm install

# configure
cp .env.example .env
# leave VITE_DEMO_MODE=true to run with no backend at all

# run
npm run dev          # http://localhost:5173
```

Demo mode needs no Supabase project and no keys. To run the real backend path, set
`VITE_DEMO_MODE=false` and fill in your own Supabase URL, publishable key and project ID
in `.env`. The SQL for every table and policy is in `supabase/migrations/`, and the AI
edge function expects a `LOVABLE_API_KEY` secret on your own Supabase project.

Build for production with `npm run build`, preview it with `npm run preview`.

## Project structure

```
src/
  pages/          Landing, Auth, Intake, Dashboard, Modules,
                  ModuleView, Tools, PDFs, Settings
  components/     Dashboard, Layout, Sidebar, Tutor, ui (shadcn),
                  DemoBanner, SampleNotice, SEO
  lib/            api (real + demo paths), demo, demoStorage,
                  sampleCourse, pdf
supabase/
  migrations/     schema and row-level security policies
  functions/      crescented-ai (course generation + tutor, rate limited)
```

## Status

MVP. It works end to end and the hosted version runs in demo mode. Course generation
quality is the active area of work.

## Credits

Designed and built by **[Lumina](https://luminaweb.co/)**.
Built as a senior capstone project, with mentorship from Brad Aronson.

---

<div align="center">
<sub>(c) 2026 Lumina . Released under the <a href="LICENSE">MIT License</a>.</sub>
</div>
