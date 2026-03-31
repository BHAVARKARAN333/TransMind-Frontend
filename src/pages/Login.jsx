import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/app/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message.replace('Firebase: ', ''));
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message.replace('Firebase: ', ''));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-['Inter'] selection:bg-blue-200 selection:text-blue-900 bg-white">
      
      {/* Left Panel: Form (Full Height) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-white relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-600/50 transition-all duration-300">
               <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>translate</span>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">TransMind</span>
          </Link>
        </div>

        {/* Main Form Content */}
        <div className="flex-grow flex flex-col justify-center mt-8 mb-8 max-w-sm mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full text-xs font-bold text-blue-600 mb-6 border border-blue-100 w-fit">
             <span className="material-symbols-outlined text-sm">auto_awesome</span>
             Advanced AI Translation
          </div>

          <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 mb-3">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-slate-500 text-sm font-medium mb-10">
            {isLogin ? 'Enter your details to sign in to your workspace.' : 'Sign up and start translating with precision.'}
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-200 flex items-start gap-3 shadow-sm">
              <span className="material-symbols-outlined text-red-500 text-xl">error</span>
              <p className="text-sm font-medium text-red-600 mt-0.5">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider" htmlFor="name">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-3.5 text-slate-900 shadow-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:text-sm font-medium transition-all duration-300 placeholder:text-slate-400"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-3.5 text-slate-900 shadow-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:text-sm font-medium transition-all duration-300 placeholder:text-slate-400"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-3.5 text-slate-900 shadow-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:text-sm font-medium transition-all duration-300 placeholder:text-slate-400"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {isLogin && (
                 <div className="flex justify-start mt-3">
                   <a href="#" className="text-xs font-bold text-blue-600 hover:text-indigo-600 transition-colors">
                     Forgot your password?
                   </a>
                 </div>
               )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 px-4 text-[15px] font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 transition-all duration-300"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                isLogin ? 'Sign In to Workspace' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              Or continue with
            </span>
          </div>

          <div className="mt-8">
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 py-3.5 px-4 text-[14px] font-bold text-slate-700 shadow-sm transition-all duration-300"
            >
              <svg className="h-[20px] w-[20px]" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign In with Google
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs font-medium text-slate-500 max-w-sm mx-auto w-full px-2">
          <div>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }} 
              className="text-blue-600 font-bold hover:text-indigo-600 transition-colors"
              type="button"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel: Showcase Image & Floating Elements (Full Height) */}
      <div className="hidden lg:block w-[55%] relative bg-slate-900 border-l border-slate-200/20 shadow-[-20px_0_40px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Background Image / Pattern */}
        <img 
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80" 
          alt="Professionals analyzing data" 
          className="absolute inset-0 w-full h-full object-cover transform scale-105 hover:scale-100 transition-transform duration-[15s]"
          style={{ objectPosition: 'center 40%' }}
        />
        {/* Deep blue/indigo overlay to match theme */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/80 via-blue-900/60 to-transparent mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>

        {/* Glassmorphic UI overlays that match the Landing page theme */}
        
        {/* Top Floating Feature: Document Processing */}
        <div className="absolute top-[20%] left-[12%] animate-[bounce_6s_ease-in-out_infinite]">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex flex-col gap-2 relative z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30">
                <span className="material-symbols-outlined text-[18px]">description</span>
              </div>
              <div>
                <span className="block text-[13px] font-bold text-white">medical_report.docx</span>
                <span className="block text-[11px] font-medium text-blue-200">Processing Translation...</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 w-3/4 rounded-full relative">
                 <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_1s_infinite]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Floating Feature: Translation Memory */}
        <div className="absolute top-[45%] right-[10%] w-[300px] bg-indigo-900/40 backdrop-blur-md border border-indigo-400/30 rounded-3xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden scale-100 hover:scale-105 transition-transform duration-500">
           {/* Glow effect */}
           <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-blue-500/30 blur-[40px] rounded-full pointer-events-none"></div>
           
           <div className="relative z-10 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h4 className="text-white text-sm font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400 text-[18px]">memory</span>
                  Translation Memory
                </h4>
                <span className="bg-indigo-500/30 text-indigo-200 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">Active</span>
              </div>
              
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                 <p className="text-[12px] text-slate-400 mb-1 font-serif italic">"Patient exhibits cardiac stress."</p>
                 <div className="flex items-center gap-2 mx-auto w-fit text-blue-400 my-1">
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                 </div>
                 <p className="text-[12px] text-white font-serif font-medium">"El paciente presenta estrés cardíaco."</p>
              </div>
           </div>
        </div>

        {/* Bottom Floating Feature: Trusted by Professionals */}
        <div className="absolute bottom-[15%] left-[12%] animate-[bounce_8s_ease-in-out_infinite_reverse]">
          <div className="bg-white px-5 py-4 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex flex-col gap-3 min-w-[240px] hover:scale-105 transition-transform border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-[3px] border-white object-cover shadow-sm bg-slate-100" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&q=80" alt="Avatar" />
                <img className="w-10 h-10 rounded-full border-[3px] border-white object-cover shadow-sm bg-slate-100 relative z-10" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=128&q=80" alt="Avatar" />
                <div className="w-10 h-10 rounded-full border-[3px] border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm relative z-20">
                  +2k
                </div>
              </div>
              <div className="flex flex-col">
                 <div className="flex items-center gap-1 text-amber-400 mb-0.5">
                    <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                 </div>
                 <span className="text-[11px] font-bold text-slate-800 tracking-tight">Trusted by Translators</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Massive Brand typography in the background */}
        <div className="absolute bottom-12 right-12 text-right">
           <h2 className="text-6xl font-black text-white/10 tracking-tighter leading-none">Enterprise<br/>Translation.</h2>
        </div>

      </div>
    </div>
  );
}
