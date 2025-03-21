
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-2:generateContent";

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

    enhancedPrompt += `Don't include any text, just generate the image. Output as detailed, photorealistic render.`;

    console.log("Enhanced prompt:", enhancedPrompt);

    // Call Gemini API to generate content
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
          maxOutputTokens: 4096,
          responseMediaType: "image/png",
          responseFormat: {
            format: "media"
          }
        }
      }),
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Gemini API response received");
    
    // Extract image data from response
    let imageUrl = null;
    
    try {
      // Look for media content in the response
      if (data.candidates && 
          data.candidates[0] && 
          data.candidates[0].content && 
          data.candidates[0].content.parts) {
        
        const parts = data.candidates[0].content.parts;
        
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error extracting image from response:", error);
    }
    
    // If we couldn't get an image, fall back to placeholder
    if (!imageUrl) {
      console.log("No image found in response, using placeholder");
      imageUrl = "https://placehold.co/800x600/333/FFF?text=AI+Mockup";
    }

    return new Response(
      JSON.stringify({ 
        imageUrl: imageUrl,
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
