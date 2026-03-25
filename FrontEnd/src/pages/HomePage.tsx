import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated, logout, setUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
     // If authenticated but user profile is missing, try fetching it.
     const fetchProfile = async () => {
        if (isAuthenticated && !user) {
           try {
              const fetchedUser = await authApi.getProfile();
              setUser(fetchedUser);
           } catch (e) {
              console.error(e);
           }
        }
     }
     fetchProfile();
  }, [isAuthenticated, user, setUser])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><span className="text-xl animate-pulse text-indigo-500 font-bold tracking-widest">LOADING...</span></div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center py-6 border-b border-zinc-200">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-indigo-600">Shoora.</h1>
          {isAuthenticated ? (
             <div className="flex items-center space-x-6">
               <div className="flex flex-col items-end">
                  <span className="font-semibold text-lg">{user?.fullName || 'Sneakerhead'}</span>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">{user?.role || 'USER'}</span>
               </div>
               <button
                 onClick={() => { logout(); navigate('/login'); }}
                 className="px-6 py-2 rounded-full border border-zinc-300 hover:border-red-500 hover:text-red-500 transition-colors font-medium"
               >
                 Logout
               </button>
             </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
            >
              Sign In
            </button>
          )}
        </header>

        <main className="py-12 space-y-12">
           <section className="text-center space-y-6">
             <h2 className="text-6xl font-bold tracking-tight">Step into the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500">Future.</span></h2>
             <p className="text-xl text-zinc-500 max-w-2xl mx-auto">Explore the most exclusive, limited-edition sneakers curated just for you.</p>
           </section>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
              {/* Dummy content boxes */}
              {[1,2,3].map(i => (
                 <div key={i} className="aspect-[4/5] bg-white rounded-3xl shadow-sm border border-zinc-100 p-6 flex flex-col justify-end relative overflow-hidden group cursor-pointer">
                    <div className="absolute inset-0 bg-zinc-100 transition-transform duration-500 group-hover:scale-105"></div>
                    <div className="relative z-10 bg-white/80 backdrop-blur-md p-4 rounded-2xl">
                       <h3 className="font-bold text-lg">Air Max Future {i}</h3>
                       <p className="text-indigo-600 font-black mt-1">$299</p>
                    </div>
                 </div>
              ))}
           </div>
        </main>
      </div>
    </div>
  );
};
