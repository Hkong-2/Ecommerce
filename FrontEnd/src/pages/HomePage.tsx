import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';
import { useTranslation } from 'react-i18next';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated, setUser, isLoading } = useAuthStore();
  const { t } = useTranslation();

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
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><span className="text-xl animate-pulse text-blue-500 font-bold tracking-widest">{t('loading')}</span></div>;
  }

  const dummyPhones = [
    { id: 1, name: "iPhone 15 Pro Max", price: "$1199", color: "from-slate-700 to-slate-900" },
    { id: 2, name: "Samsung Galaxy S24 Ultra", price: "$1299", color: "from-blue-700 to-indigo-900" },
    { id: 3, name: "Google Pixel 8 Pro", price: "$999", color: "from-teal-600 to-cyan-800" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <main className="py-12 space-y-16">
           <section className="text-center space-y-6">
             <h2 className="text-6xl font-black tracking-tight text-slate-800">
               {t('hero_title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{t('hero_title_highlight')}</span>
             </h2>
             <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light">
               {t('hero_subtitle')}
             </p>
           </section>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
              {/* Dummy content boxes */}
              {dummyPhones.map(phone => (
                 <div key={phone.id} className="aspect-[3/4] bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col justify-end relative overflow-hidden group cursor-pointer transition-shadow hover:shadow-xl">
                    <div className={`absolute inset-0 bg-gradient-to-br ${phone.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>

                    {/* Placeholder Phone Image/Icon */}
                    <div className="absolute inset-0 flex items-center justify-center -translate-y-8 group-hover:-translate-y-12 transition-transform duration-500">
                        <div className="w-32 h-64 border-4 border-slate-800 rounded-3xl relative bg-slate-50 shadow-inner">
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-slate-800 rounded-full"></div>
                        </div>
                    </div>

                    <div className="relative z-10 bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-50 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                       <h3 className="font-bold text-lg text-slate-800">{phone.name}</h3>
                       <p className="text-blue-600 font-black mt-1 text-xl">{phone.price}</p>
                    </div>
                 </div>
              ))}
           </div>
        </main>
      </div>
    </div>
  );
};
