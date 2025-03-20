
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';

const Index = () => {
  useEffect(() => {
    // Animate elements when they come into view
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

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      
      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Describe Your Vision',
                description: 'Enter a detailed description of the 3D mockup you want to create.',
              },
              {
                step: '02',
                title: 'AI Generation',
                description: 'Our AI processes your prompt and generates a high-quality 3D mockup.',
              },
              {
                step: '03',
                title: 'Download & Share',
                description: 'Use your mockup in presentations, social media, or marketing materials.',
              },
            ].map((item, index) => (
              <div key={index} className="animate-on-scroll">
                <div className="text-primary font-bold text-5xl mb-4 opacity-40">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Use Cases */}
      <section className="bg-secondary/30 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Perfect For</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              'Product Designers',
              'Marketing Teams',
              'Startups',
              'UI/UX Designers',
              'Social Media Managers',
              'Content Creators',
              'Entrepreneurs',
              'App Developers',
            ].map((item, index) => (
              <div 
                key={index} 
                className="animate-on-scroll glass p-6 rounded-lg text-center hover:shadow-md transition-shadow"
              >
                <p className="font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to create stunning 3D mockups?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Sign up today and transform your ideas into beautiful visual representations.
          </p>
          <a href="/auth?mode=signup" className="inline-block">
            <button className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Get Started for Free
            </button>
          </a>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-card py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <a href="/" className="flex items-center gap-2 font-semibold text-xl">
                <span className="text-primary font-bold">3D</span>
                <span>Mockify</span>
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                Create beautiful 3D mockups with AI
              </p>
            </div>
            
            <div className="flex gap-8">
              <a href="/" className="text-sm text-muted-foreground hover:text-foreground">Home</a>
              <a href="/creator" className="text-sm text-muted-foreground hover:text-foreground">Creator</a>
              <a href="/gallery" className="text-sm text-muted-foreground hover:text-foreground">Gallery</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center md:text-left text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} 3D Mockify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
