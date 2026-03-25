import React from 'react';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      {/* Left side: Creative Visual / Artistic side */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative flex-col justify-center items-center p-12 text-white">
        {/* Artistic background overlay patterns or shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
           <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <polygon fill="currentColor" points="0,100 100,0 100,100" />
           </svg>
        </div>

        <div className="relative z-10 space-y-6 text-center">
          <h1 className="text-6xl font-black tracking-tighter uppercase mb-4 drop-shadow-lg">
            Shoora.
          </h1>
          <p className="text-xl font-light tracking-wide max-w-md mx-auto leading-relaxed">
            Step into the future. Discover exclusive sneakers and elevate your street style.
          </p>

          {/* Abstract Shoe Graphic placeholder (could be an image later) */}
          <div className="mt-12 mx-auto w-64 h-64 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center animate-bounce duration-500">
             <span className="text-5xl">👟</span>
          </div>
        </div>
      </div>

      {/* Right side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-zinc-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-zinc-100 p-10">
          {children}
        </div>
      </div>
    </div>
  );
};
