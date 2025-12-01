import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    let contextMessage = "You are NEXUS, an AI-powered productivity assistant with a mystical, futuristic personality. ";
    
    if (tasks && tasks.length > 0) {
      const incompleteTasks = tasks.filter((t: any) => !t.completed);
      contextMessage += `\n\nUser's Current Tasks (${incompleteTasks.length} incomplete):`;
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

    contextMessage += `\n\nYou can:
    - Analyze their tasks and suggest priorities
    - Recommend new tasks based on their goals
    - Provide motivation and insights
    - Help break down goals into actionable tasks
    - Suggest habit improvements
    
    Be concise, insightful, and encouraging. Use a mystical, futuristic tone that matches the NEXUS aesthetic.`;

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
