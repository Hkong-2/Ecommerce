import React from 'react';
import { GoogleLogo } from '@phosphor-icons/react';

export const LoginForm: React.FC = () => {
  const handleGoogleLogin = () => {
    // Redirect to the backend Google Auth endpoint
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div className="flex flex-col space-y-8 w-full">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold tracking-tight text-zinc-900 uppercase">
          Welcome <span className="text-indigo-600">Back</span>
        </h2>
        <p className="text-zinc-500 text-sm">
          Sign in to your account to continue
        </p>
      </div>

      <div className="pt-4 flex justify-center">
        <button
          onClick={handleGoogleLogin}
          className="group relative flex w-full items-center justify-center space-x-3 rounded-full border-2 border-zinc-200 bg-white px-6 py-4 font-semibold text-zinc-700 transition-all duration-300 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 active:scale-[0.98]"
        >
          <GoogleLogo weight="bold" className="h-6 w-6 text-indigo-500 transition-transform group-hover:scale-110" />
          <span className="text-lg">Continue with Google</span>

          {/* subtle decorative element */}
          <div className="absolute inset-0 -z-10 rounded-full opacity-0 bg-indigo-50 transition-opacity duration-300 group-hover:opacity-100 blur-md"></div>
        </button>
      </div>

      <div className="pt-8 text-center">
         <p className="text-xs text-zinc-400">
           By continuing, you agree to SHOORA's <br/>
           <a href="#" className="underline hover:text-indigo-500 transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-indigo-500 transition-colors">Privacy Policy</a>.
         </p>
      </div>
    </div>
  );
};
