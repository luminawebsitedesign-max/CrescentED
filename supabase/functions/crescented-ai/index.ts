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
- Generating templates, worksheets, and checklists

What you should NOT do:
- Give legal or medical advice
- Share harmful or inappropriate content
- Be discouraging or harsh
- Use overly technical jargon`;

const COURSE_GENERATION_PROMPT = `You are an AI Course Architect for CrescentEd, creating personalized entrepreneurship curricula.

Based on the user's intake form, generate a complete learning path across these 7 domains:
1. business_foundations - Ideas, planning, validation
2. running_a_business - Operations, finance, legal basics
3. customer_success - Marketing, sales, customer relationships
4. personal_development - Mindset, skills, resilience
5. daily_life_optimization - Productivity, time management, balance
6. philosophy_worldview - Purpose, values, ethics
7. other_topics - Specialized knowledge relevant to their idea

For EACH module, output a JSON object with this exact structure:
{
  "title": "Module title (clear and specific)",
  "domain": "one of: business_foundations, running_a_business, customer_success, personal_development, daily_life_optimization, philosophy_worldview, other_topics",
  "description": "2-3 sentence description of what they'll learn",
  "summary": "One sentence summary",
  "content": {
    "sections": [
      {
        "title": "Section title",
        "content": "Detailed educational content (300-500 words). Make it practical, actionable, and relevant to their specific business idea. Use clear paragraphs and examples.",
        "plug_and_plays": [
          {
            "title": "Resource name",
            "type": "worksheet",
            "content": "The actual content of the resource they can use - be specific and actionable"
          }
        ]
      }
    ],
    "action_steps": ["Specific action step 1", "Specific action step 2", "Specific action step 3"]
  }
}

IMPORTANT RULES:
- Output ONLY a valid JSON array of 7 module objects (one per domain)
- Personalize everything to their specific idea, goals, and constraints
- Make content practical and actionable, not theoretical
- Include 2-3 sections per module
- Include 1-2 plug_and_plays per section with types: worksheet, template, checklist, script, exercise
- Keep language simple, encouraging, and youth-friendly
- End each module with 3-5 clear action steps
- Do NOT include any text before or after the JSON array`;

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
