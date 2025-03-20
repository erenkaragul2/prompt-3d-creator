
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    elementsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      elementsRef.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/30 -z-10" />
      
      {/* Abstract shapes */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      
      {/* Content */}
      <div className="max-w-4xl mx-auto text-center">
        <div 
          ref={(el) => elementsRef.current[0] = el}
          className="animate-on-scroll mb-4"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-semibold bg-primary/10 text-primary rounded-full">
            Transform your ideas into 3D
          </span>
        </div>
        
        <h1 
          ref={(el) => elementsRef.current[1] = el}
          className="animate-on-scroll text-4xl md:text-6xl font-bold tracking-tight mb-6"
        >
          Create stunning 3D mockups <br />
          <span className="text-primary">with just a prompt</span>
        </h1>
        
        <p 
          ref={(el) => elementsRef.current[2] = el}
          className="animate-on-scroll text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10"
        >
          Harness the power of AI to transform your concepts into beautiful, 
          professional 3D mockups in seconds. No design skills required.
        </p>
        
        <div 
          ref={(el) => elementsRef.current[3] = el}
          className="animate-on-scroll flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/creator">
            <Button size="lg" className="group">
              Start Creating
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/gallery">
            <Button size="lg" variant="outline">
              View Gallery
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Preview Image */}
      <div 
        ref={(el) => elementsRef.current[4] = el}
        className="animate-on-scroll mt-16 w-full max-w-5xl mx-auto glass p-2 rounded-lg shadow-lg"
      >
        <div className="relative bg-card rounded overflow-hidden aspect-video">
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">3D mockup preview</p>
          </div>
        </div>
      </div>
      
      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
        {[
          {
            title: 'AI-Powered',
            description: 'Powered by Google Gemini API for high-quality, creative results',
          },
          {
            title: 'No Design Skills Needed',
            description: 'Describe what you want in plain text and let AI do the work',
          },
          {
            title: 'Fully Customizable',
            description: 'Adjust and refine your mockups until they\'re perfect',
          },
        ].map((feature, index) => (
          <div 
            key={index}
            ref={(el) => elementsRef.current[5 + index] = el}
            className="animate-on-scroll glass p-6 rounded-lg"
          >
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
