
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

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
    const { prompt, settings, referenceImage } = await req.json();
    
    console.log("Received prompt:", prompt);
    console.log("Received settings:", settings);
    console.log("Received reference image:", referenceImage ? "Yes" : "No");

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
    
    // Prepare the request body
    let requestBody = {
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
      }
    };
    
    // Add reference image if provided
    if (referenceImage) {
      console.log("Using reference image in the request");
      
      // Extract the image data from the base64 string
      const imageData = referenceImage.split(',')[1];
      const mimeType = referenceImage.split(';')[0].split(':')[1];
      
      // Add the image to the first part of the request
      requestBody.contents[0].parts.push({
        inlineData: {
          mimeType: mimeType,
          data: imageData
        }
      });
    }
    
    // Add generation config for image output
    requestBody = {
      ...requestBody,
      generationConfig: {
        ...requestBody.generationConfig,
        mediaType: "image"
      }
    };
    
    console.log("Request body structure prepared (without image data for logging)");

    // Call Gemini API to generate content
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Gemini API response received");
    
    // Extract image data from response - updated extraction logic
    let imageUrl = null;
    
    try {
      console.log("Response structure keys:", Object.keys(data));
      
      // Navigate through the response structure to find the image data
      if (data.candidates && data.candidates.length > 0) {
        console.log("Found candidates array with length:", data.candidates.length);
        
        const firstCandidate = data.candidates[0];
        if (firstCandidate.content && firstCandidate.content.parts) {
          console.log("Examining candidate parts:", firstCandidate.content.parts.length);
          
          for (const part of firstCandidate.content.parts) {
            if (part.inlineData) {
              console.log("Found inline data with mime type:", part.inlineData.mimeType);
              imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }
        }
      }
      
      if (!imageUrl) {
        console.log("Could not find image in the standard response structure.");
        console.log("Full response structure (without binary data):", JSON.stringify(data, (key, value) => {
          // Avoid logging large binary data
          if (key === 'data' && typeof value === 'string' && value.length > 100) {
            return '[BINARY DATA]';
          }
          return value;
        }, 2));
      }
      
    } catch (error) {
      console.error("Error extracting image from response:", error);
    }
    
    // If we couldn't get an image, fall back to placeholder
    if (!imageUrl) {
      console.log("No image found in response, using placeholder");
      imageUrl = "https://placehold.co/800x600/333/FFF?text=AI+Mockup+Failed";
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
      JSON.stringify({ 
        error: error.message,
        imageUrl: "https://placehold.co/800x600/333/FFF?text=Error:+"+error.message.substring(0, 30)
      }),
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
