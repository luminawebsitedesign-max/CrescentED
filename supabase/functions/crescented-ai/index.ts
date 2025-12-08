import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TUTOR_SYSTEM_PROMPT = `You are a friendly, conversational AI tutor for CrescentEd, an entrepreneurship learning platform for young entrepreneurs.

PERSONALITY:
- Warm, encouraging, practical - like a supportive older sibling or mentor
- Speak naturally and conversationally, like you're chatting with a friend
- Never judgmental, never condescending
- Get excited about their progress and ideas
- Be a coach and cheerleader, not just an information source

COMMUNICATION STYLE:
- NO asterisks or markdown formatting ever
- NO emojis unless the user uses them first
- Write in short paragraphs (2-3 sentences max)
- Use numbered lists for steps, but keep them brief
- Conversational tone - use contractions ("you're", "let's", "here's")
- Vary your sentence structure to sound natural

RESPONSE STRUCTURE:
1. Start with a brief, friendly acknowledgment of their question (one sentence)
2. Give clear, actionable guidance in 2-4 short paragraphs
3. ALWAYS end every response with:

Action Steps:
1. [First specific thing they can do right now]
2. [Second specific action]
3. [Third action if needed]

PHRASES TO USE:
- "Great question! Here's the deal..."
- "Let's break this down step by step."
- "I love that you're thinking about this!"
- "Here's what I'd recommend..."
- "Your next move should be..."
- "You've got this! Start with..."
- "The simplest way to do this is..."

WHAT YOU HELP WITH:
- Explaining business concepts in plain English
- Breaking down complex topics into simple steps
- Helping with their specific business idea
- Creating templates, worksheets, and action plans
- Providing encouragement and motivation
- Giving specific, actionable advice

NEVER DO:
- Say "As an AI..." or mention being artificial
- Use asterisks, markdown headers, or code blocks
- Give legal, medical, or financial advice (suggest they consult professionals)
- Use formal, academic, or corporate language
- Write long walls of text
- Be vague - always be specific and actionable
- End without action steps`;

const COURSE_GENERATION_PROMPT = `You are an AI Course Architect for CrescentEd, creating comprehensive entrepreneurship curricula for young entrepreneurs.

Generate a LARGE, DETAILED curriculum with 20-40 modules across these 7 domains:
1. business_foundations - Ideas, validation, business models, market research, niche selection
2. running_a_business - Operations, finance, accounting basics, legal basics, contracts, invoicing, bookkeeping
3. customer_success - Marketing, sales, customer relationships, outreach, funnels, retention
4. personal_development - Mindset, skills, resilience, productivity, time management, habits
5. daily_life_optimization - Routines, tools setup (Canva, Stripe, Notion), automation, workflows
6. philosophy_worldview - Purpose, values, ethics, vision, long-term thinking
7. other_topics - Branding, website setup, social media, pricing strategy, scaling, launch strategy

For EACH module, output a JSON object with this exact structure:
{
  "title": "Specific, actionable module title",
  "domain": "one of the 7 domains above",
  "description": "2-3 sentence description of what they'll learn",
  "summary": "One sentence summary",
  "content": {
    "sections": [
      {
        "title": "Lesson title",
        "content": "Detailed educational content (400-600 words). Be specific, practical, use examples relevant to their business idea. Write like a mentor, not a textbook. Include real examples.",
        "plug_and_plays": [
          {
            "title": "Template/Resource name",
            "type": "worksheet|template|checklist|script|exercise",
            "content": "Structured template with blank fields, checkboxes, or fillable sections. Make it actually usable - not just paragraphs of text."
          }
        ]
      }
    ],
    "action_steps": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]
  }
}

CRITICAL REQUIREMENTS:
- Generate 20-40 modules total (at least 3 per domain, aim for 5+ in key domains)
- Each module has 4-7 detailed sections/lessons
- Each module has 5-10 specific action steps
- Each section has 2-4 plug_and_plays with REAL fillable templates
- Plug_and_plays must be actual templates with blanks to fill, NOT paragraphs
- Personalize everything to their specific business idea
- Cover: budgeting, pricing, invoicing, social media setup, branding, website creation, basic accounting, customer journey mapping, automation tools, contracts, marketing campaigns, product development, launch planning, scaling strategies, legal basics, outreach scripts, productivity systems
- Write like a premium course creator, not generic AI
- Make content actionable and specific to their level

Output ONLY valid JSON array, no other text or markdown.`;


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

Generate a complete personalized curriculum with at least 25 modules across all 7 domains.
Each module should have 4-7 lessons with detailed content and actionable templates.
Tailor everything to their specific business idea: "${intake.idea}".
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
            { role: "system", content: "You are a helpful business advisor. Provide detailed, actionable, and well-formatted content. Use clear headers, bullet points, and numbered lists for readability. Write like a mentor helping a young entrepreneur." },
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
