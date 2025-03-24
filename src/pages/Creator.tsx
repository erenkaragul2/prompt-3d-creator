
import React, { useState } from 'react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import PromptInput, { PromptSettings } from '@/components/PromptInput';
import MockupDisplay from '@/components/MockupDisplay';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';

const Creator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const { profile, decrementCredits } = useAuth();

  const handleGenerateImage = async (prompt: string, settings: PromptSettings, image?: File) => {
    // Check if user has enough credits
    if (profile && profile.credits <= 0) {
      toast.error('You have no credits left. Please purchase more to continue.');
      return;
    }

    setIsLoading(true);
    setCurrentPrompt(prompt);
    
    try {
      // Check if we can decrement credits
      const decremented = await decrementCredits();
      
      if (!decremented) {
        throw new Error('Failed to use credits');
      }

      // Prepare form data if image is provided
      let imageBase64 = null;
      
      if (image) {
        const reader = new FileReader();
        imageBase64 = await new Promise<string | null>((resolve) => {
          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve(result);
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(image);
        });
        
        if (!imageBase64) {
          throw new Error('Failed to read image file');
        }
      }

      // Call our Supabase Edge Function to generate the mockup
      const { data, error } = await supabase.functions.invoke('generate-mockup', {
        body: { 
          prompt, 
          settings,
          referenceImage: imageBase64
        }
      });

      if (error) {
        console.error("Error from Edge Function:", error);
        throw new Error(`Error calling generate-mockup: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from the API');
      }
      
      if (data.error) {
        console.error("API Error:", data.error);
        throw new Error(data.error);
      }

      if (!data.imageUrl) {
        throw new Error('No image URL returned from the API');
      }

      setGeneratedImage(data.imageUrl);
      toast.success('3D mockup generated successfully!');
      
      // Log the enhanced prompt used for generation
      console.log('Enhanced prompt used:', data.enhancedPrompt);
      
    } catch (error) {
      console.error('Error generating image:', error);
      
      // Show a more helpful error message and suggestion to try again
      let errorMessage = 'Failed to generate mockup.';
      
      if (error instanceof Error) {
        if (error.message.includes('400')) {
          errorMessage = 'The AI service could not process your request. Try a different prompt or simplify your description.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Too many requests to the AI service. Please try again in a moment.';
        } else if (error.message.includes('500')) {
          errorMessage = 'The AI service encountered an error. Please try again later.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
      
      // Try to restore the credit if generation failed
      if (profile) {
        try {
          await supabase
            .from('profiles')
            .update({ credits: profile.credits + 1 })
            .eq('id', profile.id);
            
          // Refresh profile to update credits display
          if (profile.id) {
            const { data } = await supabase
              .from('profiles')
              .select('id, username, credits')
              .eq('id', profile.id)
              .single();
              
            if (data) {
              toast.success('Credit has been refunded due to generation error.');
            }
          }
        } catch (refundError) {
          console.error('Error refunding credit:', refundError);
        }
      }
    } finally {
      setIsLoading(false);
      setRetryCount(prev => prev + 1);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16 px-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-12 text-center">
              <h1 className="text-3xl font-bold mb-2">3D Mockup Creator</h1>
              <p className="text-muted-foreground mb-4">
                Describe what you want to create and let AI do the rest
              </p>
              
              <div className="flex justify-center items-center gap-2">
                <div className="flex items-center bg-secondary/50 px-3 py-1.5 rounded-full">
                  <CreditCard className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">{profile?.credits || 0}</span>
                  <span className="ml-1 text-sm text-muted-foreground">credits</span>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="ml-1">
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Each mockup generation uses 1 credit</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {profile && profile.credits <= 3 && (
                  <Badge variant="destructive" className="text-xs">
                    Low credits
                  </Badge>
                )}
              </div>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="order-2 lg:order-1">
                <PromptInput 
                  onSubmit={handleGenerateImage} 
                  isLoading={isLoading}
                  disabled={profile?.credits === 0}
                  key={`prompt-input-${retryCount}`}
                />
                
                <div className="mt-8 glass rounded-lg p-6">
                  <h3 className="font-medium mb-4">Tips for Great Results</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Be Specific</h4>
                      <p className="text-sm text-muted-foreground">
                        Include details about the device, environment, lighting, and perspective.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Specify Materials</h4>
                      <p className="text-sm text-muted-foreground">
                        Mention if you want glass, metal, plastic, wood, or other materials.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Reference Images Help</h4>
                      <p className="text-sm text-muted-foreground">
                        Upload a reference image to guide the AI in creating a similar mockup style.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <MockupDisplay 
                  imageUrl={generatedImage}
                  prompt={currentPrompt}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Creator;
