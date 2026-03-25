"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WelcomeSection } from '@/components/auth/WelcomeSection';
import { LoginCard } from '@/components/auth/LoginCard';

const LoginPage = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-[#1e40af]" />;
  }

  return (
    <div className="h-screen w-full bg-gradient-animate flex flex-col font-sans selection:bg-white/20 selection:text-white relative overflow-hidden" suppressHydrationWarning>
      {/* Background Decorative Elements */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[40%] bg-white/5 blur-[120px] rounded-full animate-pulse z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-accent/10 blur-[120px] rounded-full animate-pulse delay-700 z-0" />

      {/* Navbar Container */}
      <header className="shrink-0 relative z-20">
        <Navbar />
      </header>

      {/* Main Container */}
      <main className="flex-1 min-h-0 w-full flex items-center justify-center relative z-10 p-2 lg:p-4">
        <div className="container max-w-6xl mx-auto flex items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-6 items-center w-full">
            {/* Illustration Section */}
            <div className="hidden lg:flex items-center justify-center lg:justify-start transform scale-90 xl:scale-100 origin-left">
              <WelcomeSection />
            </div>
            
            {/* Card Section */}
            <div className="flex items-center justify-center lg:justify-end py-1">
              <LoginCard />
            </div>
          </div>
        </div>
      </main>

      {/* Footer Container */}
      <footer className="shrink-0 relative z-20">
        <Footer />
      </footer>
    </div>
  );
};

export default LoginPage;