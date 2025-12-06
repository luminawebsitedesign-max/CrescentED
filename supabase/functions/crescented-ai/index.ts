import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TUTOR_SYSTEM_PROMPT = `You are a friendly AI tutor for CrescentEd, an entrepreneurship learning platform.

Personality:
- Warm, encouraging, practical — like a supportive older sibling
- Never judgmental, never condescending
- Simple, clear language (no jargon)

Communication rules:
- NO asterisks or bold formatting
- NO markdown headers
- NO emojis unless the user uses them first
- Use numbered lists and short paragraphs
- Keep responses under 200 words unless explaining something complex
- Always end with one clear, actionable next step

Phrases to use:
- "Here's the deal..."
- "Let's break this down."
- "Try this approach..."
- "Your next move is..."

What you help with:
- Explaining business concepts simply
- Breaking down entrepreneurship topics
- Helping with their specific business idea
- Providing step-by-step guidance
- Generating templates, worksheets, checklists

Never:
- Say "As an AI..." or refer to yourself as AI
- Give legal or medical advice
- Use overly formal or academic language
- Write walls of text`;

const COURSE_GENERATION_PROMPT = `You are an AI Course Architect for CrescentEd, creating comprehensive entrepreneurship curricula.

Generate a LARGE, DETAILED curriculum with 20-40 modules across these domains:
1. business_foundations - Ideas, validation, business models, market research
2. running_a_business - Operations, finance, accounting, legal basics, contracts, invoicing
3. customer_success - Marketing, sales, customer relationships, outreach, funnels
4. personal_development - Mindset, skills, resilience, productivity, time management
5. daily_life_optimization - Routines, tools setup (Canva, Stripe, Notion), automation
6. philosophy_worldview - Purpose, values, ethics, vision
7. other_topics - Branding, website setup, social media, pricing, scaling, launch strategy

For EACH module, output a JSON object:
{
  "title": "Specific module title",
  "domain": "one of the 7 domains above",
  "description": "2-3 sentence description",
  "summary": "One sentence summary",
  "content": {
    "sections": [
      {
        "title": "Lesson title",
        "content": "Detailed educational content (400-600 words). Be specific, practical, use examples relevant to their idea. Write like a mentor, not a textbook.",
        "plug_and_plays": [
          {
            "title": "Template/Resource name",
            "type": "worksheet|template|checklist|script|exercise",
            "content": "Structured template with blank fields, checkboxes, or fillable sections. NOT a blog post."
          }
        ]
      }
    ],
    "action_steps": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]
  }
}

CRITICAL REQUIREMENTS:
- Generate 20-40 modules total (at least 3 per domain)
- Each module has 4-7 detailed sections/lessons
- Each module has 5-10 action steps
- Each section has 2-4 plug_and_plays with REAL structured templates
- Plug_and_plays must be fillable templates, NOT paragraphs of text
- Personalize everything to their specific business idea
- Cover: budgeting, pricing, invoicing, social media setup, branding, website, accounting, customer journey, automation, contracts, marketing, product dev, launch, scaling, legal basics, outreach scripts, productivity
- Write like a real course creator, not generic AI
- Output ONLY valid JSON array, no other text`;


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

Generate a complete personalized curriculum with exactly 7 modules (one for each domain).
Output ONLY the JSON array, no other text.`;

      console.log('Calling AI gateway for course generation...');

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: COURSE_GENERATION_PROMPT },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Gateway Error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
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
      const content = data.choices[0].message.content;
      console.log('AI response received, parsing modules...');
      
      // Parse the JSON response
      let modules;
      try {
        // Try to extract JSON from the response - handle code blocks
        let jsonString = content;
        
        // Remove markdown code blocks if present
        if (jsonString.includes('```json')) {
          jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonString.includes('```')) {
          jsonString = jsonString.replace(/```\n?/g, '');
        }
        
        // Try to find JSON array
        const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          modules = JSON.parse(jsonMatch[0]);
        } else {
          console.error("No JSON array found in response:", content);
          throw new Error("No JSON array found in response");
        }
        
        if (!Array.isArray(modules) || modules.length === 0) {
          throw new Error("Invalid modules array");
        }
      } catch (parseError) {
        console.error("Failed to parse modules JSON:", parseError);
        console.error("Raw content:", content);
        throw new Error("Failed to generate course structure. Please try again.");
      }

      console.log(`Parsed ${modules.length} modules, saving to database...`);

      // Save modules to database
      const insertedModules = [];
      for (const module of modules) {
        const { data: insertedModule, error } = await supabase.from('modules').insert({
          user_id: userId,
          title: module.title || 'Untitled Module',
          domain: module.domain || 'other_topics',
          description: module.description || module.summary || '',
          content: module.content || { sections: [], action_steps: [] },
          summary: module.summary || module.description || '',
          progress: { sectionsCompleted: [], plugAndPlayCompleted: [] },
        }).select().single();

        if (error) {
          console.error('Error inserting module:', error);
        } else {
          insertedModules.push(insertedModule);
        }
      }

      console.log(`Successfully saved ${insertedModules.length} modules`);

      return new Response(JSON.stringify({ 
        success: true, 
        modulesCount: insertedModules.length 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (type === "tutor") {
      // AI Tutor response
      let contextInfo = "";
      
      // Get user's intake data for context
      if (userId) {
        const { data: intakeData } = await supabase
          .from('intake_forms')
          .select('idea, goals, experience_level')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (intakeData) {
          contextInfo += `\n\nUser's Business Idea: ${intakeData.idea}`;
          contextInfo += `\nUser's Goals: ${intakeData.goals}`;
          contextInfo += `\nExperience Level: ${intakeData.experience_level}`;
        }
      }
      
      if (context?.module_id) {
        const { data: moduleData } = await supabase
          .from('modules')
          .select('title, domain, content, summary')
          .eq('id', context.module_id)
          .maybeSingle();
        
        if (moduleData) {
          contextInfo += `\n\nCurrent Module: ${moduleData.title} (${moduleData.domain})`;
          contextInfo += `\nModule Summary: ${moduleData.summary || 'No summary'}`;
          if (context.section_title) {
            contextInfo += `\nDiscussing section: ${context.section_title}`;
          }
        }
      }

      const messages = [
        { role: "system", content: TUTOR_SYSTEM_PROMPT + contextInfo },
        ...(history || []).slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ];

      console.log('Calling AI gateway for tutor response...');

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
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

      // Log the interaction
      if (userId) {
        const { error: logError } = await supabase.from('ai_logs').insert({
          user_id: userId,
          action: 'tutor_chat',
          input_data: { message, context },
          output_data: { response: tutorResponse.slice(0, 500) },
        });
        if (logError) console.error('Error logging AI interaction:', logError);
      }

      return new Response(JSON.stringify({ response: tutorResponse }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (type === "generate_tool") {
      // Generate content for tools (business plan, marketing checklist, etc.)
      const { prompt, toolType } = message;
      
      console.log('Generating tool content:', toolType);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a helpful business advisor. Provide detailed, actionable, and well-formatted content. Use clear headers, bullet points, and numbered lists for readability." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Gateway Error:', response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;

      return new Response(JSON.stringify({ response: generatedContent }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid request type");

  } catch (error) {
    console.error("CrescentEd AI Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
