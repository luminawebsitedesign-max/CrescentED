import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TUTOR_SYSTEM_PROMPT = `You are a supportive AI tutor for CrescentEd, an entrepreneurship learning platform for young entrepreneurs.

Your personality:
- Big sibling energy: warm, encouraging, practical
- Never judge or talk down to the user
- Use simple, clear explanations without academic jargon
- Be enthusiastic but genuine

Your communication style:
- Say things like "Let's break this down.", "Try approaching it like this.", "You're doing great — here's your next move."
- Keep responses concise but helpful
- Use bullet points and numbered lists for clarity
- End with an actionable next step when appropriate

What you can help with:
- Explaining business concepts simply
- Breaking down entrepreneurship topics
- Helping with their specific business idea
- Providing encouragement and motivation
- Suggesting practical next steps

What you should NOT do:
- Give legal or medical advice
- Share harmful or inappropriate content
- Be discouraging or harsh
- Use overly technical jargon`;

const COURSE_GENERATION_PROMPT = `You are NEXUS, an AI Course Architect for CrescentEd, creating personalized entrepreneurship curricula.

Based on the user's intake form, generate a complete learning path across the 7 domains:
1. Business Foundations - Ideas, planning, validation
2. Running a Business - Operations, finance, legal basics
3. Customer Success - Marketing, sales, customer relationships
4. Personal Development - Mindset, skills, resilience
5. Daily Life Optimization - Productivity, time management, balance
6. Philosophy & Worldview - Purpose, values, ethics
7. Other Topics - Specialized knowledge relevant to their idea

For EACH module, output a JSON object with this exact structure:
{
  "title": "Module title",
  "domain": "domain_key (e.g., business_foundations)",
  "description": "2-3 sentence description",
  "content": {
    "sections": [
      {
        "title": "Section title",
        "content": "Detailed educational content (300-500 words). Make it practical, actionable, and relevant to their specific business idea.",
        "plug_and_plays": [
          {
            "title": "Resource name",
            "type": "worksheet|template|checklist|decision_tree|script|exercise",
            "content": "The actual content of the resource they can use"
          }
        ]
      }
    ],
    "action_steps": ["Step 1", "Step 2", "Step 3"]
  },
  "summary": "One sentence summary"
}

IMPORTANT:
- Personalize everything to their specific idea, goals, and constraints
- Make content practical and actionable, not theoretical
- Include 2-4 sections per module
- Include 1-3 plug_and_plays per section
- Keep language simple and encouraging
- End each module with clear action steps`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, intake, userId, message, context, history } = await req.json();
    console.log('CrescentEd AI Request:', { type, userId });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (type === "generate_course") {
      // Generate personalized course based on intake
      const userPrompt = `
User Profile:
- Business Idea: ${intake.idea}
- Goals: ${intake.goals}
- Background: ${intake.background || 'Not specified'}
- Experience Level: ${intake.experience_level}
- Interests: ${intake.interests || 'Not specified'}
- Constraints: ${intake.constraints || 'None specified'}
- Learning Style: ${intake.learning_style}
- Commitment Level: ${intake.commitment_level}

Generate a complete personalized curriculum with modules for each of the 7 entrepreneurship domains.
Output as a JSON array of module objects. Make sure it's valid JSON!`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-5",
          messages: [
            { role: "system", content: COURSE_GENERATION_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 8000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Gateway Error:', response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse the JSON response
      let modules;
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          modules = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON array found in response");
        }
      } catch (parseError) {
        console.error("Failed to parse modules JSON:", parseError);
        throw new Error("Failed to generate course structure");
      }

      // Save modules to database
      for (const module of modules) {
        await supabase.from('modules').insert({
          user_id: userId,
          title: module.title,
          domain: module.domain,
          description: module.description,
          content: module.content,
          summary: module.summary,
          progress: { sectionsCompleted: [], plugAndPlayCompleted: [] },
        });
      }

      return new Response(JSON.stringify({ success: true, modulesCount: modules.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (type === "tutor") {
      // AI Tutor response
      let contextInfo = "";
      if (context?.module_id) {
        const { data: moduleData } = await supabase
          .from('modules')
          .select('title, domain, content')
          .eq('id', context.module_id)
          .single();
        
        if (moduleData) {
          contextInfo = `\n\nCurrent module: ${moduleData.title} (${moduleData.domain})`;
          if (context.section_title) {
            contextInfo += `\nDiscussing section: ${context.section_title}`;
          }
        }
      }

      const messages = [
        { role: "system", content: TUTOR_SYSTEM_PROMPT + contextInfo },
        ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-5",
          messages,
          temperature: 0.7,
          max_tokens: 1000,
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
      const tutorResponse = data.choices[0].message.content;

      return new Response(JSON.stringify({ response: tutorResponse }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid request type");

  } catch (error) {
    console.error("CrescentEd AI Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
