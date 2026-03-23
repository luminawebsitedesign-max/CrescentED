import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TUTOR_SYSTEM_PROMPT = `You are a friendly, conversational AI tutor for CrescentEd, an entrepreneurship learning platform for young entrepreneurs.

PERSONALITY:
- Warm, encouraging, practical - like a supportive older sibling or mentor
- Speak naturally and conversationally, like you're chatting with a friend
- Never judgmental, never condescending
- Get excited about their progress and ideas

COMMUNICATION STYLE:
- NO asterisks or markdown formatting ever
- NO emojis unless the user uses them first
- Write in short paragraphs (2-3 sentences max)
- Use numbered lists for steps, but keep them brief
- Conversational tone - use contractions

RESPONSE STRUCTURE:
1. Brief, friendly acknowledgment (one sentence)
2. Clear, actionable guidance in 2-4 short paragraphs
3. ALWAYS end with:

Action Steps:
1. [First specific thing they can do right now]
2. [Second specific action]
3. [Third action if needed]

WHAT YOU HELP WITH:
- Explaining business concepts in plain English
- Breaking down complex topics into simple steps
- Helping with their specific business idea
- Creating templates, worksheets, and action plans
- Providing encouragement and motivation

NEVER DO:
- Say "As an AI..." or mention being artificial
- Use asterisks, markdown headers, or code blocks
- Give legal, medical, or financial advice
- Use formal, academic, or corporate language
- Write long walls of text
- Be vague - always be specific and actionable
- End without action steps`;

const COURSE_GENERATION_PROMPT = `You are an AI Course Architect for CrescentEd. Generate exactly 5 focused entrepreneurship modules.

Pick the 5 most relevant domains from these 7 based on the user's business idea:
1. business_foundations - Ideas, validation, business models
2. running_a_business - Operations, finance, legal basics
3. customer_success - Marketing, sales, customer relationships
4. personal_development - Mindset, productivity, time management
5. daily_life_optimization - Tools setup, automation, workflows
6. philosophy_worldview - Purpose, values, long-term thinking
7. other_topics - Branding, website, social media, pricing

For EACH module, output a JSON object:
{
  "title": "Specific module title",
  "domain": "one of the 7 domains above",
  "description": "2 sentence description",
  "summary": "One sentence summary",
  "content": {
    "sections": [
      {
        "title": "Lesson title",
        "content": "Educational content (200-300 words). Be practical, use examples relevant to their business idea.",
        "plug_and_plays": [
          {
            "title": "Template name",
            "type": "worksheet",
            "content": "A fillable template with blanks and structure."
          }
        ]
      }
    ],
    "action_steps": ["Step 1", "Step 2", "Step 3"]
  }
}

REQUIREMENTS:
- Output EXACTLY 5 modules as a JSON array
- Each module has 3 sections/lessons
- Each section has 1 plug_and_play template
- Each module has 3 action steps
- Personalize to their business idea
- Keep content concise and actionable
- Output ONLY valid JSON array, no other text or markdown`;


function parseModulesJson(content: string): any[] | null {
  try {
    let jsonString = content;
    if (jsonString.includes('```json')) {
      jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonString.includes('```')) {
      jsonString = jsonString.replace(/```\n?/g, '');
    }

    const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("No JSON array found in response");
      return null;
    }

    // Sanitize common JSON issues: control chars inside strings
    let cleaned = jsonMatch[0];
    cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, (ch) => {
      if (ch === '\n' || ch === '\r' || ch === '\t') return ch;
      return '';
    });
    // Fix unescaped backslashes that aren't valid escape sequences
    cleaned = cleaned.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');

    const modules = JSON.parse(cleaned);
    if (!Array.isArray(modules) || modules.length === 0) {
      console.error("Invalid modules array");
      return null;
    }

    if (modules.length > 5) {
      console.log(`AI returned ${modules.length} modules, truncating to 5`);
      return modules.slice(0, 5);
    }
    if (modules.length < 5) {
      console.warn(`AI returned only ${modules.length} modules instead of 5`);
    }
    return modules;
  } catch (parseError) {
    console.error("Failed to parse modules JSON:", parseError);
    return null;
  }
}

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
      const userPrompt = `
User Profile:
- Business Idea: ${intake.idea}
- Goals: ${intake.goals}
- Experience Level: ${intake.experience_level}

Generate exactly 5 personalized modules for their business idea: "${intake.idea}".
Output ONLY the JSON array.`;

      const MAX_ATTEMPTS = 2;
      let modules = null;

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        console.log(`Calling AI gateway for course generation (attempt ${attempt})...`);

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
              JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          if (attempt < MAX_ATTEMPTS) {
            console.log('Gateway error, retrying...');
            continue;
          }
          throw new Error(`AI gateway error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        console.log('AI response received, parsing modules...');
        
        modules = parseModulesJson(content);
        if (modules) break;

        if (attempt < MAX_ATTEMPTS) {
          console.log('JSON parse failed, retrying automatically...');
        }
      }

      if (!modules) {
        throw new Error("Failed to generate course after retries. Please try again.");
      }

      console.log(`Parsed ${modules.length} modules, saving to database...`);

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
      let contextInfo = "";
      
      if (userId) {
        const { data: intakeData } = await supabase
          .from('intake_forms')
          .select('idea, goals, experience_level')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (intakeData) {
          contextInfo += `\n\nStudent's Business Idea: ${intakeData.idea}`;
          contextInfo += `\nStudent's Goals: ${intakeData.goals}`;
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

      if (context?.master_notes) {
        contextInfo += `\n\nStudent's Notes for You: ${context.master_notes}`;
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
            JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const tutorResponse = data.choices[0].message.content;

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
            { role: "system", content: "You are a helpful business advisor. Provide detailed, actionable, well-formatted content. Write like a mentor helping a young entrepreneur." },
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
