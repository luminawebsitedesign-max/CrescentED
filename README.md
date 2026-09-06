# Crescent ED

Here's a cleaner, more structured prompt for Lovable:

NEXUS Task Manager
AI-Powered Productivity Suite
Branding Direction:
Choose one aesthetic:

Retro Tech: Nostalgic 80s/90s computer vibes with pixel fonts, CRT scan lines, neon accents, terminal-style elements, and vintage UI sounds
Cyber Sigillism: Futuristic mystical tech with glowing symbols, sacred geometry patterns, holographic effects, sleek gradients (purple/cyan/black), and ethereal animations


What to Build:
A desktop to-do list and habit tracker app with GPT integration. Users can download and use it on their PC. Everything must be fully functional.

Required Features (All Must Work):
1. To-Do Lists

Add, edit, delete, and check off tasks
Each task has: title, description, due date, priority level
Organize tasks into custom projects/categories
Filter view by: today, week, project, priority
Drag and drop to reorder tasks

2. Habit Tracker

Create daily/weekly habits
Simple checkbox to mark habits complete each day
Show current streak count for each habit
Calendar view showing completion history
Statistics: total completions, longest streak, success rate

3. Long-Term Goals

Create goals with title, description, target date
Break goals into smaller milestone tasks
Progress bar showing completion percentage
Link related to-do items to goals

4. Projects/Sections

Create custom project folders
Assign tasks to specific projects
Color-code different projects
View all tasks within a project

5. GPT Integration (Critical!)

Connect to OpenAI API (user provides their API key in settings)
AI can read user's current tasks, habits, and goals
Chat interface where AI suggests new tasks based on goals
AI can add tasks directly to the list when user agrees
Daily planning mode: AI reviews schedule and suggests priorities


UI/UX Requirements:
Must Have:

Clean, modern interface matching chosen brand aesthetic
Smooth animations: task completion checkmarks, page transitions, button hovers
Dark mode and light mode toggle
Responsive layout for desktop screens
Satisfying completion animations (confetti, glow effects, or retro beeps)

Interactions:

Hover effects on all clickable elements
Smooth slide/fade transitions between views
Animated progress bars and streak counters
Drag-and-drop visual feedback


Technical Must-Haves:

Desktop App: Build as downloadable application (Electron or similar)
Data Storage: Save all data locally (localStorage or local database)
API Integration: OpenAI API connection that actually works
Export Data: Button to export all tasks/habits as JSON or CSV
Settings Page: User can input OpenAI API key, choose theme, set preferences


Critical Rules:

Every feature listed must be fully functional, not placeholder
All buttons must do something
All animations must actually animate
The AI integration must actually connect and work
Users must be able to actually download and run this


Priority: Build a working MVP first, then add polish and animations. Function over form, but make it beautiful once it works.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cyber-plan-assist.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8e1b3575-afc1-48a8-b99c-286107f9b9bb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
