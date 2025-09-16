'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Code, Sparkles, Zap, Users, Github, Twitter } from 'lucide-react';

export default function Home(): React.ReactNode {
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section with Parallax */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              transform: `translateY(${scrollY * 0.5}px)`,
              background: 'radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%), radial-gradient(circle at 40% 40%, #06b6d4 0%, transparent 50%)'
            }}
          />
          
          {/* Floating DNA Helixes */}
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  transform: `translateY(${scrollY * (0.1 + i * 0.05)}px)`
                }}
              >
                <svg width="40" height="80" viewBox="0 0 60 120" className="opacity-20">
                  <defs>
                    <linearGradient id={`helixGrad${i}1`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#8b5cf6', stopOpacity: 1}} />
                    </linearGradient>
                    <linearGradient id={`helixGrad${i}2`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#06b6d4', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#10b981', stopOpacity: 1}} />
                    </linearGradient>
                  </defs>
                  <path d="M15 10 Q5 30 15 50 Q25 70 15 90 Q5 110 15 120" 
                        stroke={`url(#helixGrad${i}1)`} 
                        strokeWidth="2" 
                        fill="none" 
                        strokeLinecap="round"/>
                  <path d="M45 10 Q55 30 45 50 Q35 70 45 90 Q55 110 45 120" 
                        stroke={`url(#helixGrad${i}2)`} 
                        strokeWidth="2" 
                        fill="none" 
                        strokeLinecap="round"/>
                  {[...Array(10)].map((_, j) => (
                    <line key={j} x1="15" y1={10 + j * 10} x2="45" y2={10 + j * 10} 
                          stroke="#ffffff" strokeWidth="1" opacity="0.4"/>
                  ))}
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <div 
            className="mb-8 transform"
            style={{ transform: `translateY(${scrollY * -0.2}px)` }}
          >
            <svg width="120" height="120" viewBox="0 0 60 120" className="mx-auto mb-6">
              <defs>
                <linearGradient id="heroHelix1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#8b5cf6', stopOpacity: 1}} />
                </linearGradient>
                <linearGradient id="heroHelix2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#06b6d4', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#10b981', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              <path d="M15 10 Q5 30 15 50 Q25 70 15 90 Q5 110 15 120" 
                    stroke="url(#heroHelix1)" 
                    strokeWidth="4" 
                    fill="none" 
                    strokeLinecap="round"
                    className="animate-pulse"/>
              <path d="M45 10 Q55 30 45 50 Q35 70 45 90 Q55 110 45 120" 
                    stroke="url(#heroHelix2)" 
                    strokeWidth="4" 
                    fill="none" 
                    strokeLinecap="round"
                    className="animate-pulse"/>
              {[...Array(10)].map((_, i) => (
                <line key={i} x1="15" y1={10 + i * 10} x2="45" y2={10 + i * 10} 
                      stroke="#ffffff" strokeWidth="2" opacity="0.8"/>
              ))}
            </svg>
          </div>
          
          <h1 
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient"
            style={{ transform: `translateY(${scrollY * -0.1}px)` }}
          >
            Helix IDE
          </h1>
          
          <p 
            className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
            style={{ transform: `translateY(${scrollY * -0.15}px)` }}
          >
            Code at the speed of thought with AI-powered development
          </p>
          
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            style={{ transform: `translateY(${scrollY * -0.1}px)` }}
          >
            <Button 
              onClick={() => router.push('/auth')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Building
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-gray-600 text-gray-300 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300"
            >
              <Github className="w-5 h-5 mr-2" />
              View on GitHub
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 
            className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            style={{ transform: `translateY(${scrollY * -0.05}px)` }}
          >
            Revolutionary Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Code className="w-8 h-8" />,
                title: "AI-Powered Coding",
                description: "Let AI write, debug, and optimize your code with natural language commands."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Lightning Fast",
                description: "Experience blazing fast performance with our optimized development environment."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Collaborative",
                description: "Work together with your team in real-time with built-in collaboration tools."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10"
                style={{ transform: `translateY(${scrollY * (-0.02 - index * 0.01)}px)` }}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to revolutionize your development?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers already using Helix IDE
          </p>
          <Button 
            onClick={() => router.push('/auth')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-12 py-4 text-xl rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <svg width="32" height="32" viewBox="0 0 60 120">
              <defs>
                <linearGradient id="footerHelix1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#8b5cf6', stopOpacity: 1}} />
                </linearGradient>
                <linearGradient id="footerHelix2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#06b6d4', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#10b981', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              <path d="M15 10 Q5 30 15 50 Q25 70 15 90 Q5 110 15 120" 
                    stroke="url(#footerHelix1)" 
                    strokeWidth="3" 
                    fill="none" 
                    strokeLinecap="round"/>
              <path d="M45 10 Q55 30 45 50 Q35 70 45 90 Q55 110 45 120" 
                    stroke="url(#footerHelix2)" 
                    strokeWidth="3" 
                    fill="none" 
                    strokeLinecap="round"/>
            </svg>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Helix IDE
            </span>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
              <Github className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
              <Twitter className="w-6 h-6" />
            </a>
          </div>
        </div>
        
        <div className="text-center mt-8 text-gray-500">
          <p>&copy; 2024 Helix IDE. Built with AI for the future of development.</p>
        </div>
      </footer>
    </div>
  );
}