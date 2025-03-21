
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, 
  Send, 
  Loader2, 
  HelpCircle,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface PromptInputProps {
  onSubmit: (prompt: string, settings: PromptSettings, image?: File) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export interface PromptSettings {
  detailLevel: number;
  stylePreference: 'realistic' | 'stylized' | 'abstract';
  colorScheme: 'vibrant' | 'muted' | 'monochrome';
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading, disabled = false }) => {
  const [prompt, setPrompt] = useState('');
  const [settings, setSettings] = useState<PromptSettings>({
    detailLevel: 50,
    stylePreference: 'realistic',
    colorScheme: 'vibrant',
  });
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim() && !uploadedImage) {
      toast.error('Please enter a prompt or upload a reference image');
      return;
    }
    
    onSubmit(prompt, settings, uploadedImage || undefined);
  };

  const handleClear = () => {
    setPrompt('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast.error('Image size should be less than 4MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      setUploadedImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Suggest a prompt based on the image
      if (!prompt) {
        setPrompt(`Create a 3D mockup similar to this reference image`);
      }
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const examplePrompts = [
    'A modern iPhone mockup with a sleek UI design on the screen',
    'A MacBook Pro on a wooden desk with a website design visible',
    'A smart home device in a minimalist living room',
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  const styleOptions = [
    { value: 'realistic', label: 'Realistic' },
    { value: 'stylized', label: 'Stylized' },
    { value: 'abstract', label: 'Abstract' },
  ];

  const colorOptions = [
    { value: 'vibrant', label: 'Vibrant' },
    { value: 'muted', label: 'Muted' },
    { value: 'monochrome', label: 'Monochrome' },
  ];

  const isButtonDisabled = isLoading || (!prompt.trim() && !uploadedImage) || disabled;

  return (
    <div className="w-full glass rounded-lg p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            Describe your 3D mockup
          </label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A modern smartphone displaying a fitness app interface on a wooden desk"
            className="min-h-[100px] resize-none"
            disabled={isLoading || disabled}
          />
        </div>

        {/* Image upload section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">
              Upload reference image (optional)
            </label>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading || disabled}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              disabled={isLoading || disabled}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>
          
          {previewUrl && (
            <div className="relative mt-2 border rounded-md p-2 bg-background/30">
              <div className="flex items-start gap-3">
                <div className="relative w-24 h-24 overflow-hidden rounded-md bg-muted">
                  <img 
                    src={previewUrl} 
                    alt="Reference image" 
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">
                    Reference image will be used to guide the AI in creating a similar 3D mockup
                  </p>
                  <p className="text-xs font-medium truncate">
                    {uploadedImage?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {uploadedImage ? `${(uploadedImage.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRemoveImage}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {disabled && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm">
            You have no credits left. Please purchase more credits to continue generating mockups.
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          <p className="text-xs text-muted-foreground w-full mb-1">Try an example:</p>
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleExampleClick(example)}
              className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full hover:bg-secondary/80 transition-colors"
              disabled={isLoading || disabled}
            >
              {example.length > 30 ? example.substring(0, 30) + '...' : example}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading || disabled}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Generation Settings</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Detail Level</label>
                      <span className="text-xs text-muted-foreground">{settings.detailLevel}%</span>
                    </div>
                    <Slider
                      value={[settings.detailLevel]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => setSettings({...settings, detailLevel: value[0]})}
                      disabled={disabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm">Style Preference</label>
                    <div className="flex gap-2">
                      {styleOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={settings.stylePreference === option.value ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => setSettings({...settings, stylePreference: option.value as any})}
                          disabled={disabled}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm">Color Scheme</label>
                    <div className="flex gap-2">
                      {colorOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={settings.colorScheme === option.value ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => setSettings({...settings, colorScheme: option.value as any})}
                          disabled={disabled}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm" disabled={isLoading || disabled}>
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Tips for better results</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                    <li>Be specific about the device or product</li>
                    <li>Describe the environment or background</li>
                    <li>Mention lighting conditions for realism</li>
                    <li>Specify angle (e.g., front view, 45° angle)</li>
                    <li>Include screen content details if applicable</li>
                    <li>Upload a reference image for more accurate results</li>
                  </ul>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleClear}
              disabled={isLoading || !prompt || disabled}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            type="submit" 
            disabled={isButtonDisabled}
            className="min-w-24"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PromptInput;
