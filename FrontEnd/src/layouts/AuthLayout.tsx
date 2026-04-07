import React from 'react';
import { useTranslation } from 'react-i18next';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans overflow-hidden">
      {/* Left side: Creative Visual / Tech side */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 relative flex-col justify-center items-center p-12 text-white">
        {/* Artistic background overlay patterns or shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
           <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <polygon fill="currentColor" points="0,0 100,0 100,100" />
             <circle cx="20" cy="80" r="15" fill="currentColor" />
             <rect x="70" y="20" width="20" height="20" fill="currentColor" />
           </svg>
        </div>

        <div className="relative z-10 space-y-6 text-center">
          <h1 className="text-6xl font-black tracking-tighter uppercase mb-4 drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            {t('auth_hero_title')}
          </h1>
          <p className="text-xl font-light tracking-wide max-w-md mx-auto leading-relaxed text-slate-300">
            {t('auth_hero_subtitle')}
          </p>

          {/* Abstract Phone Graphic placeholder */}
          <div className="mt-12 mx-auto w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl animate-pulse duration-1000">
             <span className="text-6xl">📱</span>
          </div>
        </div>
      </div>

      {/* Right side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-10 relative overflow-hidden">
          {/* Subtle glow effect behind form */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
