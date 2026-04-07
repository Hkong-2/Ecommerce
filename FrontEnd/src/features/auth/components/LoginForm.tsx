import React from 'react';
import { GoogleLogo } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

export const LoginForm: React.FC = () => {
  const { t } = useTranslation();

  const handleGoogleLogin = () => {
    // Redirect to the backend Google Auth endpoint
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div className="flex flex-col space-y-8 w-full">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold tracking-tight text-slate-900 uppercase">
          {t('welcome_back')}
        </h2>
        <p className="text-slate-500 text-sm">
          {t('sign_in_continue')}
        </p>
      </div>

      <div className="pt-4 flex justify-center">
        <button
          onClick={handleGoogleLogin}
          className="group relative flex w-full items-center justify-center space-x-3 rounded-full border-2 border-slate-200 bg-white px-6 py-4 font-semibold text-slate-700 transition-all duration-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98]"
        >
          <GoogleLogo weight="bold" className="h-6 w-6 text-blue-500 transition-transform group-hover:scale-110" />
          <span className="text-lg">{t('continue_google')}</span>

          {/* subtle decorative element */}
          <div className="absolute inset-0 -z-10 rounded-full opacity-0 bg-blue-50 transition-opacity duration-300 group-hover:opacity-100 blur-md"></div>
        </button>
      </div>

      <div className="pt-8 text-center">
         <p className="text-xs text-slate-400">
           {t('terms_prefix')} <br/>
           <a href="#" className="underline hover:text-blue-500 transition-colors">{t('terms')}</a> {t('and')} <a href="#" className="underline hover:text-blue-500 transition-colors">{t('privacy')}</a>.
         </p>
      </div>
    </div>
  );
};
