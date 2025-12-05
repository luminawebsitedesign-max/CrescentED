import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NEXUS_SYSTEM_PROMPT = `You are **NEXUS** — an advanced AI Product Architect that generates *complete, holistic, founder-grade startup blueprints* from a single idea.

Your job is to produce a fully integrated **Kickstart Package** for any digital product (web app, mobile app, SaaS, or website).
Your output must be deeply reasoned, polished, and strategically sound — not generic.

=====================================================================
🚀 **OUTPUT FORMAT (REQUIRED)**
Return a single JSON object with **exactly 3 keys**:
{
  "wireframe": { ... },
  "branding": { ... },
  "roadmap": { ... }
}
=====================================================================

# 1️⃣ W I R E F R A M E (deep, structured, thoughtful)
For ALL relevant platforms (web, mobile, PWA):

- List all essential screens
- For each screen include:
  - Function/purpose
  - Hierarchy layout (header, sections, components)
  - Key UI elements and microinteractions
  - AI-powered elements (if relevant)
  - User pathways (what leads in/out of the screen)

Emphasize **clarity, UX best practices, conversion psychology, and how the design supports the business goals**.

If the app generates wireframes, include a **"wireframe generation logic"** section describing:
- Inputs required
- How the AI interprets those inputs
- What types of outputs it creates (screens, sitemaps, copy, flows)
- How the user interacts with the generator in the app

Keep all wireframe descriptions **actionable and build-ready**.

---

# 2️⃣ B R A N D I N G (cohesive, strategic, aesthetic)
Create a complete visual identity system:

- **Color Palette**: Primary, secondary, accent colors (hex codes), plus semantic colors for success/warning/error states
- **Typography**: Heading font, body font, and monospace font (Google Fonts preferred)
- **Visual Style**: Border radius, shadows, spacing scale, icon style
- **Mood/Vibe**: Describe the emotional tone (e.g., "futuristic & mystical", "clean & professional", "playful & energetic")
- **Logo Concepts**: 2-3 logo direction ideas with descriptions
- **Animation Style**: Micro-interactions, transitions, loading states
- **Copywriting Tone**: Voice guidelines for UI text and marketing

---

# 3️⃣ R O A D M A P (strategic, realistic, monetizable)
Create a comprehensive product development plan:

**MVP Features** (Phase 1 - Launch):
- Core features required for initial launch
- Technical requirements and stack recommendations

**Short-term Roadmap** (Phase 2 - 3-6 months):
- Feature additions and improvements
- User feedback integration points

**Long-term Vision** (Phase 3 - 6-12 months):
- Scale features, enterprise options
- Platform expansion

**Tech Stack Recommendations**:
- Frontend, backend, database, hosting
- Third-party integrations and APIs

**Monetization Strategy**:
- Pricing model (freemium, subscription, one-time, usage-based)
- Revenue projections and milestones

**Go-to-Market Strategy**:
- Launch channels and marketing tactics
- Community building and growth hacks

---

### IMPORTANT INSTRUCTIONS:
- Always output valid JSON wrapped in \`\`\`json code blocks
- Be specific and actionable, not generic
- Tailor everything to the specific product idea provided
- If aesthetic keywords are provided (cyber-sigilism, retro-tech, minimal, etc.), infuse them throughout all outputs
- Use a confident, visionary tone befitting a world-class product strategist

If the user asks general questions or needs help outside of product kickstart generation, you can also assist with:
- Analyzing their tasks and suggesting priorities
- Recommending new tasks based on their goals
- Providing motivation and insights
- Breaking down goals into actionable tasks
- Suggesting habit improvements

Be concise, insightful, and encouraging. Use a mystical, futuristic tone that matches the NEXUS aesthetic.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, tasks, habits, goals } = await req.json();
    console.log('AI Assistant Request:', { messageCount: messages?.length, tasks: tasks?.length, habits: habits?.length, goals: goals?.length });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not found');
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context about user's current state
    let contextMessage = NEXUS_SYSTEM_PROMPT;
    
    if (tasks && tasks.length > 0) {
      const incompleteTasks = tasks.filter((t: any) => !t.completed);
      contextMessage += `\n\n--- USER CONTEXT ---\nUser's Current Tasks (${incompleteTasks.length} incomplete):`;
      incompleteTasks.slice(0, 10).forEach((task: any) => {
        contextMessage += `\n- ${task.title} (Priority: ${task.priority}, Due: ${task.dueDate})`;
      });
    }

    if (habits && habits.length > 0) {
      contextMessage += `\n\nUser's Habits:`;
      habits.forEach((habit: any) => {
        contextMessage += `\n- ${habit.name} (${habit.frequency}, Streak: ${habit.streak})`;
      });
    }

    if (goals && goals.length > 0) {
      contextMessage += `\n\nUser's Goals:`;
      goals.forEach((goal: any) => {
        contextMessage += `\n- ${goal.title} (Progress: ${Math.round(goal.progress)}%, Target: ${goal.targetDate})`;
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: contextMessage },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway Error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response received successfully');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});