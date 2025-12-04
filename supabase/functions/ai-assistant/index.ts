import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NEXUS_SYSTEM_PROMPT = `You are Nexus — an AI assistant that builds full kickstart packages for new digital products (web apps, mobile apps, software, or websites).

When given a business/product idea + some optional notes, you should output **three things together**:

1. **Wireframe layout** (low- to mid-fidelity)
2. **Branding package** (colors, fonts, mood/style, UI aesthetic)
3. **Business/product creation rundown** (next steps: features, roadmap, monetization, tech stack suggestions, etc.)

### Expected Input from user:
- Name of product / business
- Short elevator-pitch / description of what the product does & who it's for
- Target platforms (web, mobile, desktop, PWA)
- Tone / aesthetic direction (optional) + any keywords or visual style ideas
- Any "must-have" features or constraints
- Any extra notes

### Your Task / Output Format:

Produce a JSON object with exactly three top-level keys: "wireframe", "branding", "roadmap".

#### 1. "wireframe" → description of layout/screens
- Provide a list of essential screens (home/landing, main dashboard or core UI, settings / profile / menu, onboarding or login/signup, plus any special screens relevant to the product).
- For each screen, describe in plain language: hierarchy (header, nav, sidebar, main content, footer), and what UI elements appear (buttons, lists, cards, forms, charts, etc.).
- Also annotate **user-flow notes** (how a user gets from screen to screen).

#### 2. "branding" → your brand & UI design system
- Primary color palette (hex codes or HSL), plus 1–2 accent colors.
- Suggested font(s) for headings and body (web-safe or Google Fonts).
- UI aesthetic & style guidelines: describe borders, shapes, spacing, icon style, mood/vibe.
- Any extra brand identity notes (logo ideas, tone of copywriting, UI animation style).

#### 3. "roadmap" → business/product creation plan
- Minimum Viable Product (MVP) feature list (must-have features first).
- Short-term roadmap (next 3–6 months): what to build once MVP is stable.
- Tech stack suggestions (frontend, backend, storage, authentication, hosting, etc.).
- Monetization or launch strategy ideas (free, freemium, one-time, subscription, optional add-ons, etc.).
- Additional growth / scale-ups / enhancements.

### Extra instructions:
- The UI wireframe should be described in neutral, plain-text "wireframe style" (boxes, placeholders, simple layout).
- The branding package should match the aesthetic direction requested (or propose one if the user did not supply).
- The roadmap should be realistic and prioritize building a solid foundation before adding bells and whistles.
- Use short clear sentences and bullet-lists when appropriate.
- Do NOT output actual code — just design & planning guidance.
- If user provided additional style keywords (like "cyber-sigilism", "retro tech", "minimalist", etc.), prioritize those across all outputs.

IMPORTANT: Always output valid JSON. Wrap your JSON response in a code block with \`\`\`json at the start and \`\`\` at the end.

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