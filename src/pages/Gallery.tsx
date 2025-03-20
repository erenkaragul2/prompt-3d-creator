
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Share2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for the gallery
const mockImages = [
  {
    id: 1,
    url: 'https://picsum.photos/seed/1/800/600',
    prompt: 'iPhone 14 Pro Max displaying a fitness app on a wooden desk with soft lighting',
    createdAt: new Date(2023, 11, 5),
  },
  {
    id: 2,
    url: 'https://picsum.photos/seed/2/800/600',
    prompt: 'MacBook Air with a minimalist website design on the screen, placed on a white desk',
    createdAt: new Date(2023, 11, 10),
  },
  {
    id: 3,
    url: 'https://picsum.photos/seed/3/800/600',
    prompt: 'Smart home speaker in a modern living room with ambient lighting',
    createdAt: new Date(2023, 11, 15),
  },
  {
    id: 4,
    url: 'https://picsum.photos/seed/4/800/600',
    prompt: 'Tablet showing a design portfolio, on a wooden table with a cup of coffee',
    createdAt: new Date(2023, 11, 20),
  },
  {
    id: 5,
    url: 'https://picsum.photos/seed/5/800/600',
    prompt: 'VR headset on a sleek glass table with blue ambient lighting',
    createdAt: new Date(2023, 11, 25),
  },
  {
    id: 6,
    url: 'https://picsum.photos/seed/6/800/600',
    prompt: 'Smartphone displaying a social media app with vibrant UI',
    createdAt: new Date(2023, 12, 1),
  },
];

interface GalleryImage {
  id: number;
  url: string;
  prompt: string;
  createdAt: Date;
}

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching images
    const fetchImages = async () => {
      setIsLoading(true);
      try {
        // This would be replaced with actual API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setImages(mockImages);
      } catch (error) {
        console.error('Error fetching images:', error);
        toast.error('Failed to load gallery images');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter images based on search query
    // In a real app, this would likely be a server-side search
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `3d-mockup-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Image downloaded successfully');
  };

  const handleShare = (imageUrl: string, prompt: string) => {
    if (navigator.share) {
      navigator.share({
        title: '3D Mockup',
        text: prompt,
        url: imageUrl,
      })
      .then(() => toast.success('Shared successfully'))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(imageUrl)
        .then(() => toast.success('Image URL copied to clipboard'))
        .catch(() => toast.error('Failed to copy URL'));
    }
  };

  const sortedImages = [...images].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.createdAt.getTime() - a.createdAt.getTime();
    } else {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }
  });

  const filteredImages = sortedImages.filter(image => 
    image.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12">
            <h1 className="text-3xl font-bold mb-2">Gallery</h1>
            <p className="text-muted-foreground">
              Browse through a collection of AI-generated 3D mockups
            </p>
          </header>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-end">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by prompt or description"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            
            <div className="w-full sm:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
              <p className="text-muted-foreground mt-4">Loading gallery...</p>
            </div>
          ) : filteredImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map((image) => (
                <div 
                  key={image.id} 
                  className="glass rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md group"
                >
                  <div className="relative aspect-square">
                    <img 
                      src={image.url} 
                      alt={image.prompt}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                      <p className="text-sm text-center line-clamp-6">{image.prompt}</p>
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {image.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleShare(image.url, image.prompt)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDownload(image.url)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No mockups found matching your search.</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </div>
          )}
          
          {!isLoading && filteredImages.length > 0 && (
            <div className="mt-12 text-center">
              <Button variant="outline" className="gap-2">
                Load More
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {!isLoading && (
            <div className="mt-16 glass rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Create Your Own 3D Mockups</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Have an idea for a 3D mockup? Use our AI-powered creator to bring your vision to life.
              </p>
              <Button asChild>
                <a href="/creator">Start Creating</a>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Gallery;
