
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, settings } = await req.json();
    
    console.log("Received prompt:", prompt);
    console.log("Received settings:", settings);

    // Build the prompt with settings incorporated
    let enhancedPrompt = `Create a photorealistic 3D mockup of the following: ${prompt}. `;
    
    // Add detail level
    if (settings.detailLevel) {
      const detailDescription = settings.detailLevel > 75 ? "highly detailed" : 
                               settings.detailLevel > 50 ? "moderately detailed" : 
                               settings.detailLevel > 25 ? "somewhat detailed" : "minimally detailed";
      enhancedPrompt += `Make it ${detailDescription}. `;
    }
    
    // Add style preference
    if (settings.stylePreference) {
      enhancedPrompt += `Use a ${settings.stylePreference} style. `;
    }
    
    // Add color scheme
    if (settings.colorScheme) {
      enhancedPrompt += `Use a ${settings.colorScheme} color scheme. `;
    }

    console.log("Enhanced prompt:", enhancedPrompt);

    // Call Gemini API to generate an image
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: enhancedPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      }),
    });

    const data = await response.json();
    console.log("Gemini API response:", JSON.stringify(data));

    // Extract image URL from the response
    // Note: This is a placeholder. In the actual implementation, we might need to:
    // 1. Process the text to find an image URL in the response
    // 2. Or use a different API endpoint that directly returns images
    
    // For demonstration, returning a placeholder image
    // In production, you'd parse the actual image URL from the Gemini response
    const placeholderImageUrl = "https://picsum.photos/800/600";

    return new Response(
      JSON.stringify({ 
        imageUrl: placeholderImageUrl,
        originalPrompt: prompt,
        enhancedPrompt: enhancedPrompt 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
