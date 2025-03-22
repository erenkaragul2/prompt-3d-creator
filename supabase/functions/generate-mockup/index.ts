
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
    // API Key validation
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return new Response(
        JSON.stringify({ 
          error: "API key is not configured",
          imageUrl: `https://placehold.co/800x600/FF5555/FFFFFF?text=${encodeURIComponent("API key not found")}`,
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

    console.log("API Key validation passed, the key exists");

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

    enhancedPrompt += `Create a high-quality 3D render without any text. High resolution, photorealistic.`;

    console.log("Enhanced prompt:", enhancedPrompt);
    
    // Prepare the request payload for image generation
    const requestBody = {
      contents: [
        {
          parts: [
            { text: enhancedPrompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
        responseMediaType: "IMAGE",
        responseType: "IMAGE"
      }
    };
    
    // Add reference image if provided
    if (referenceImage) {
      console.log("Using reference image in the request");
      
      // Extract the image data from the base64 string
      const imageData = referenceImage.split(',')[1];
      const mimeType = referenceImage.split(';')[0].split(':')[1];
      
      // Add the image to the parts array
      requestBody.contents[0].parts.push({
        inlineData: {
          mimeType: mimeType,
          data: imageData
        }
      });
    }
    
    // Log the request structure (without sensitive data)
    console.log("Sending request to Gemini API...");
    console.log("Request payload structure:", JSON.stringify({
      ...requestBody,
      contents: [{
        parts: requestBody.contents[0].parts.map(part => 
          part.inlineData ? {...part, inlineData: {...part.inlineData, data: "[REDACTED]"}} : part
        )
      }]
    }, null, 2));

    // Show the first few characters of the API key for debugging (safely)
    console.log("API key first 4 chars:", GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 4) + "..." : "null");

    // Call Gemini API to generate content
    const apiUrl = `${GEMINI_URL}?key=${GEMINI_API_KEY}`;
    console.log("Calling Gemini API at URL (without key):", GEMINI_URL);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Response status:", response.status);
    
    // Handle error responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      
      // Try to parse the error response to get more details
      let errorDetails = "Unknown error";
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.error?.message || errorJson.error || errorText.substring(0, 200);
      } catch (e) {
        errorDetails = errorText.substring(0, 200);
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Gemini API error ${response.status}: ${errorDetails}`,
          imageUrl: `https://placehold.co/800x600/FF5555/FFFFFF?text=${encodeURIComponent(`API Error: ${response.status}`)}`,
          apiErrorDetails: errorDetails
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    // Parse the response as JSON
    const data = await response.json();
    console.log("Response structure keys:", Object.keys(data));
    
    // Extract image from response
    let imageUrl = null;
    let mimeType = "image/png"; // Default mime type
    
    // Process candidates if available
    if (data.candidates && data.candidates.length > 0) {
      console.log("Found candidates:", data.candidates.length);
      
      const candidate = data.candidates[0];
      console.log("Candidate finish reason:", candidate.finishReason);
      
      if (candidate.content && candidate.content.parts) {
        console.log("Content parts count:", candidate.content.parts.length);
        
        for (const part of candidate.content.parts) {
          console.log("Part type:", Object.keys(part).join(", "));
          
          if (part.text) {
            console.log("Text content (first 100 chars):", part.text.substring(0, 100));
          }
          
          // Check for inline data (image)
          if (part.inlineData) {
            console.log("Found inline data with mime type:", part.inlineData.mimeType);
            mimeType = part.inlineData.mimeType;
            imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
      
      // Detailed logging of the entire candidate structure (without image data)
      const candidateCopy = JSON.parse(JSON.stringify(candidate));
      if (candidateCopy.content && candidateCopy.content.parts) {
        candidateCopy.content.parts = candidateCopy.content.parts.map(part => {
          if (part.inlineData) {
            return {...part, inlineData: {...part.inlineData, data: "[REDACTED]"}};
          }
          return part;
        });
      }
      console.log("Full candidate structure:", JSON.stringify(candidateCopy, null, 2));
    } else {
      console.log("No candidates found in response");
      console.log("Full response:", JSON.stringify(data, null, 2));
    }
    
    // Handle case where no image was found
    if (!imageUrl) {
      console.error("Could not extract image from response");
      
      // Create a clearer error message
      const errorMessage = "Failed to generate image. Please try a different prompt or settings.";
      
      // Return error response with placeholder
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          imageUrl: `https://placehold.co/800x600/FF5555/FFFFFF?text=${encodeURIComponent(errorMessage)}`,
          originalPrompt: prompt,
          enhancedPrompt: enhancedPrompt,
          responseStatus: response.status,
          responseData: data // Include the full response data for debugging
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Return successful response with image
    return new Response(
      JSON.stringify({ 
        imageUrl: imageUrl,
        originalPrompt: prompt,
        enhancedPrompt: enhancedPrompt,
        responseStatus: response.status
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
    
    // Create a more descriptive error message
    const errorMessage = `Error: ${error.message || "Unknown error occurred"}`;
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        imageUrl: `https://placehold.co/800x600/FF5555/FFFFFF?text=${encodeURIComponent(error.message.substring(0, 50))}`,
        errorDetails: error.stack
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
