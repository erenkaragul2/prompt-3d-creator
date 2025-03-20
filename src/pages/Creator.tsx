
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

const Creator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const { profile, decrementCredits } = useAuth();

  const handleGenerateImage = async (prompt: string, settings: PromptSettings) => {
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

      // This is a placeholder for the actual API call to Google Gemini
      // In a real implementation, this would call your backend which integrates with Gemini
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate a response - in a real app, this would be the response from Gemini
      // For now, we're using a placeholder image
      setGeneratedImage('https://picsum.photos/800/600');
      toast.success('3D mockup generated successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate mockup. Please try again.');
    } finally {
      setIsLoading(false);
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
                      <h4 className="text-sm font-medium mb-1">Describe the Context</h4>
                      <p className="text-sm text-muted-foreground">
                        Add details about where the product is being used or displayed.
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
