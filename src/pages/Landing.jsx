import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] overflow-x-hidden selection:bg-blue-200 selection:text-blue-900 scroll-smooth">
      
      {/* Background gradients for premium feel */}
      <div className="absolute top-0 left-0 right-0 h-[800px] overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px]" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/20 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/50 z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>translate</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">TransMind</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">How it Works</a>
          <a href="#features" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Pricing</a>
          <a href="#faq" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <Link to="/app/dashboard" className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Sign In</Link>
              <Link to="/login" className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all cursor-pointer">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 lg:px-12 relative z-10 text-center">
        <div className="max-w-5xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs font-bold text-blue-600 mb-8 border border-blue-100 shadow-sm animate-fade-in-up">
             <span className="material-symbols-outlined text-sm">auto_awesome</span>
             The #1 AI Translation Tool for Professionals
          </div>

          <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Translate documents. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Keep exact formatting.</span>
          </h1>
          
          <p className="text-lg lg:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Upload a Word document (DOCX), automatically translate every paragraph using AI, and download the finished file with all fonts, tables, and layouts flawlessly preserved.
          </p>
          
          {/* Central Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            {!currentUser ? (
              <>
                <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-black rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-indigo-600/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 cursor-pointer">
                  Get Started For Free
                  <span className="material-symbols-outlined font-bold">arrow_forward</span>
                </Link>
                <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-700 text-lg font-black rounded-2xl border-2 border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 cursor-pointer">
                  Sign In
                   <span className="material-symbols-outlined">login</span>
                </Link>
              </>
            ) : (
              <Link to="/app/dashboard" className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-black rounded-2xl shadow-xl shadow-blue-600/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 cursor-pointer">
                Return to Workspace
                <span className="material-symbols-outlined font-bold">space_dashboard</span>
              </Link>
            )}
          </div>
          <p className="mt-6 text-sm font-medium text-slate-400">No credit card required. Free tier available.</p>

        </div>
      </section>

      {/* Trusted By / Social Proof Segment */}
      <section className="py-10 border-y border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 text-center">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Trusted by leading translation and law firms</p>
           <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-24 opacity-40 grayscale">
              {/* Fake SVG Logos purely css text for demo */}
              <div className="text-2xl font-black font-sans tracking-tighter">AcmeCorp</div>
              <div className="text-2xl font-bold font-serif italic">LegalDocs+</div>
              <div className="text-xl font-black uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined">medical_services</span> MedTranslate</div>
              <div className="text-2xl font-bold font-mono tracking-tight">/GlobalLinguist</div>
              <div className="text-2xl font-extrabold text-slate-800">OmniLingual</div>
           </div>
        </div>
      </section>

      {/* Visual Showcase - Before & After */}
      <section className="py-24 px-6 lg:px-12 relative z-10">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">See how it actually works.</h2>
               <p className="text-lg text-slate-500 font-medium">No more broken tables. No more missing bullet points.</p>
            </div>
            
            <div className="bg-white rounded-3xl p-4 lg:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
               <div className="absolute inset-0 pattern-grid-lg text-slate-100 opacity-50 z-0"></div>
               
               <div className="flex flex-col md:flex-row gap-8 relative z-10">
                  {/* Before (English) */}
                  <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-inner">
                     <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">description</span>
                        <span className="font-bold text-sm text-slate-600">medical_report_EN.docx</span>
                     </div>
                     <div className="p-8 space-y-6 bg-white min-h-[300px]">
                        <div className="h-6 w-1/3 bg-slate-200 rounded font-serif text-slate-400 font-bold flex items-center pl-2">Patient History</div>
                        <ul className="list-disc pl-5 space-y-2 text-slate-400 font-serif italic">
                           <li>Heart rate elevated.</li>
                           <li>Blood pressure 140/90.</li>
                        </ul>
                        <div className="bg-slate-50 p-4 border-l-4 border-slate-300 italic text-slate-400 font-serif">
                           "The patient exhibits signs of acute myocardial infarction."
                        </div>
                     </div>
                  </div>

                  {/* AI Translation Arrow */}
                  <div className="flex items-center justify-center -my-6 md:my-0 md:-mx-6 z-20">
                     <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/40 border-4 border-white text-white rotate-90 md:rotate-0">
                        <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                     </div>
                  </div>

                  {/* After (Spanish) */}
                  <div className="flex-1 bg-blue-50 rounded-2xl border border-blue-200 overflow-hidden shadow-inner">
                     <div className="bg-white px-4 py-3 border-b border-blue-100 flex items-center gap-3">
                        <span className="material-symbols-outlined text-blue-500">description</span>
                        <span className="font-bold text-sm text-blue-700">medical_report_ES.docx</span>
                     </div>
                     <div className="p-8 space-y-6 bg-white min-h-[300px]">
                        <div className="h-6 w-1/3 bg-blue-100 text-blue-800 rounded font-serif font-bold flex items-center px-2">Historia Clínica</div>
                        <ul className="list-disc pl-5 space-y-2 text-blue-800 font-serif italic">
                           <li>Frecuencia cardíaca elevada.</li>
                           <li>Presión arterial 140/90.</li>
                        </ul>
                        <div className="bg-blue-50/50 p-4 border-l-4 border-blue-300 italic text-blue-800 font-serif border border-blue-100">
                           "El paciente presenta signos de infarto agudo de miocardio."
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 3 Step Process - How It Works */}
      <section id="how-it-works" className="py-24 px-6 lg:px-12 bg-slate-900 text-white">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
               <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">How it Works</h2>
               <p className="text-lg text-slate-400 font-medium">Three simple steps to perfect document translation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
               {/* Connecting line for desktop */}
               <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-slate-800 via-blue-500 to-slate-800 z-0"></div>

               {/* Step 1 */}
               <div className="relative z-10 text-center flex flex-col items-center">
                  <div className="w-24 h-24 bg-slate-800 border-[8px] border-slate-900 rounded-full flex items-center justify-center mb-6 shadow-xl text-3xl font-black text-blue-400">1</div>
                  <h3 className="text-2xl font-bold mb-4">Upload</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">Drop your `.docx` file into TransMind. We instantly extract all text without destroying the underlying formatting XML.</p>
               </div>
               {/* Step 2 */}
               <div className="relative z-10 text-center flex flex-col items-center">
                  <div className="w-24 h-24 bg-slate-800 border-[8px] border-slate-900 rounded-full flex items-center justify-center mb-6 shadow-xl text-3xl font-black text-indigo-400">2</div>
                  <h3 className="text-2xl font-bold mb-4">AI Magic</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">Our system applies your custom glossaries, checks past translations (Memory), and uses LLMs to translate the text precisely.</p>
               </div>
               {/* Step 3 */}
               <div className="relative z-10 text-center flex flex-col items-center">
                  <div className="w-24 h-24 bg-slate-800 border-[8px] border-slate-900 rounded-full flex items-center justify-center mb-6 shadow-xl text-3xl font-black text-emerald-400">3</div>
                  <h3 className="text-2xl font-bold mb-4">Download</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">Simply click download. The AI rebuilds your document, placing the newly translated text perfectly into the original layout.</p>
               </div>
            </div>
         </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Enterprise-grade feature set.</h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Everything you need to run a professional translation agency.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-slate-50 rounded-3xl p-10 border border-slate-200 transition-all hover:shadow-lg hover:border-blue-200">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 text-blue-600 shadow-sm border border-blue-200">
                <span className="material-symbols-outlined text-2xl">download</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Native DOCX Export</h3>
              <p className="text-lg text-slate-500 leading-relaxed font-medium">When the AI finishes translating, simply hit "Download". TransMind gives you back a perfectly formatted `.docx` file. We preserve your fonts, bolding, italics, headers, and bullet points automatically.</p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-10 border border-slate-200 transition-all hover:shadow-lg hover:border-indigo-200">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6 text-indigo-600 shadow-sm border border-indigo-200">
                <span className="material-symbols-outlined text-2xl">menu_book</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Custom Glossaries</h3>
              <p className="text-[17px] text-slate-500 leading-relaxed font-medium">Add your own medical or legal terms. The AI will strictly follow your rules for consistent branding.</p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-10 border border-slate-200 transition-all hover:shadow-lg hover:border-emerald-200">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6 text-emerald-600 shadow-sm border border-emerald-200">
                <span className="material-symbols-outlined text-2xl">memory</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Translation RAG Memory</h3>
              <p className="text-[17px] text-slate-500 leading-relaxed font-medium">The system remembers your edits. If you translate something once, our vector database ensures the AI learns it forever.</p>
            </div>

            <div className="md:col-span-2 bg-slate-50 rounded-3xl p-10 border border-slate-200 transition-all hover:shadow-lg hover:border-amber-200">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-6 text-amber-600 shadow-sm border border-amber-200">
                <span className="material-symbols-outlined text-2xl">edit_note</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Human-in-the-Loop Editor</h3>
              <p className="text-lg text-slate-500 leading-relaxed font-medium">You are always in control. Review the AI's translation side-by-side with the original text in an ultra-fast editor. Approve or modify segments before downloading the final file.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 lg:px-12 bg-slate-50 border-t border-slate-200">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Loved by translation professionals.</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative">
                  <div className="flex gap-1 mb-4 text-amber-400">
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  </div>
                  <p className="text-slate-600 italic mb-6">"I used to spend 3 hours just fixing table alignments after translating technical guides. TransMind does it perfectly instantly."</p>
                  <div className="flex justify-between items-center">
                     <div>
                        <div className="font-bold text-slate-900 text-sm">Sarah Jenkins</div>
                        <div className="text-xs text-slate-500 font-medium">Freelance Translator</div>
                     </div>
                  </div>
               </div>
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative">
                  <div className="flex gap-1 mb-4 text-amber-400">
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  </div>
                  <p className="text-slate-600 italic mb-6">"The Custom Glossary feature ensures our legal documents never use the wrong terminology. It's a lifesaver for compliance."</p>
                  <div className="flex justify-between items-center">
                     <div>
                        <div className="font-bold text-slate-900 text-sm">David Chen</div>
                        <div className="text-xs text-slate-500 font-medium">Legal Operations</div>
                     </div>
                  </div>
               </div>
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative">
                  <div className="flex gap-1 mb-4 text-amber-400">
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  </div>
                  <p className="text-slate-600 italic mb-6">"We translated 50 manuals last month. The Translation Memory learned our style so well that by manual #5, we barely edited anything."</p>
                  <div className="flex justify-between items-center">
                     <div>
                        <div className="font-bold text-slate-900 text-sm">Elena Rodriguez</div>
                        <div className="text-xs text-slate-500 font-medium">Product Manager</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Pricing Details */}
      <section id="pricing" className="py-24 px-6 lg:px-12 bg-white border-t border-slate-200">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Straightforward Pricing.</h2>
               <p className="text-lg text-slate-500 font-medium mt-3">Start for free. Upgrade when you need more power.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {/* Free Tier */}
               <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col">
                  <h3 className="text-2xl font-bold text-slate-900">Starter</h3>
                  <div className="mt-4 mb-6">
                     <span className="text-5xl font-black text-slate-900">$0</span>
                     <span className="text-slate-500 font-medium">/month</span>
                  </div>
                  <ul className="space-y-4 text-slate-600 font-medium flex-1 mb-8">
                     <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-500 text-sm">check_circle</span> 3 documents per month</li>
                     <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-500 text-sm">check_circle</span> Max 10 pages per doc</li>
                     <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-500 text-sm">check_circle</span> Basic AI Model</li>
                  </ul>
                  <Link to="/login" className="w-full py-4 bg-slate-100 text-slate-800 font-bold rounded-xl text-center hover:bg-slate-200 transition-colors">Get Started Free</Link>
               </div>

               {/* Pro Tier */}
               <div className="bg-gradient-to-b from-blue-900 to-indigo-950 border-2 border-blue-500 rounded-3xl p-8 shadow-2xl shadow-blue-900/40 flex flex-col relative transform lg:-translate-y-4">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">Most Popular</div>
                  <h3 className="text-2xl font-bold text-white">Professional</h3>
                  <div className="mt-4 mb-6">
                     <span className="text-5xl font-black text-white">$29</span>
                     <span className="text-blue-200 font-medium">/month</span>
                  </div>
                  <ul className="space-y-4 text-blue-100 font-medium flex-1 mb-8">
                     <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-400 text-sm">check_circle</span> 100 documents per month</li>
                     <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-400 text-sm">check_circle</span> Unlimited pages</li>
                     <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-400 text-sm">check_circle</span> Custom Glossaries</li>
                     <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-400 text-sm">check_circle</span> Advanced RAG Memory</li>
                     <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-400 text-sm">check_circle</span> Priority GPT-4o Access</li>
                  </ul>
                  <Link to="/login" className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl text-center hover:bg-blue-400 transition-colors">Start 14-Day Free Trial</Link>
               </div>

               {/* Enterprise Tier */}
               <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col">
                  <h3 className="text-2xl font-bold text-slate-900">Enterprise</h3>
                  <div className="mt-4 mb-6">
                     <span className="text-5xl font-black text-slate-900">Custom</span>
                  </div>
                  <ul className="space-y-4 text-slate-600 font-medium flex-1 mb-8">
                     <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-500 text-sm">check_circle</span> Unlimited everything</li>
                     <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-500 text-sm">check_circle</span> Dedicated Vector DB isolating data</li>
                     <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-500 text-sm">check_circle</span> SSO & SAML</li>
                     <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-500 text-sm">check_circle</span> Custom AI Model fine-tuning</li>
                  </ul>
                  <a href="#" className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl text-center hover:bg-slate-50 transition-colors">Contact Sales</a>
               </div>
            </div>
         </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 lg:px-12 bg-slate-50 border-t border-slate-200">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Wait, does it really keep my formatting?</h4>
                  <p className="text-slate-600 font-medium">Yes! Our internal engine does not just parse text. It unzips the `docx` file, reads the raw XML, identifies specific text nodes, generates translation, and replaces *only* the text while leaving styling tags untouched.</p>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-900 mb-2">What languages are supported?</h4>
                  <p className="text-slate-600 font-medium">Currently, we support accurate AI translation between English, Spanish, French, German, Japanese, Chinese, and Hindi. We are adding more every week.</p>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-900 mb-2">How does the Custom Glossary work?</h4>
                  <p className="text-slate-600 font-medium">If your company mandates that "Heart Attack" must always be translated as "Infarto Agudo", you simply add it to the glossary table in your dashboard. The LLM is explicitly barred from using any other word.</p>
               </div>
            </div>
         </div>
      </section>

      {/* Massive Footer CTA */}
      <section className="py-32 px-6 lg:px-12 bg-slate-950">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8">Ready to save hours of manual translation work?</h2>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
             <Link to="/login" className="px-12 py-5 bg-blue-600 text-white text-xl font-black rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 cursor-pointer">
               Create Your Free Account Now
             </Link>
             <Link to="/login" className="px-12 py-5 bg-slate-800 text-white text-xl font-black rounded-2xl border border-slate-700 hover:bg-slate-700 transition-all flex items-center justify-center gap-3 cursor-pointer">
               Sign In Instead
             </Link>
          </div>
          <p className="mt-8 text-slate-500 font-medium">Join 5,000+ professionals translating smarter, not harder.</p>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 px-6 lg:px-12 bg-slate-950 text-center border-t border-slate-900">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[16px]">translate</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white/90">TransMind AI</span>
          </div>
          <div className="flex justify-center gap-6 mb-8 text-sm font-medium text-slate-500">
             <a href="#" className="hover:text-white transition">Privacy Policy</a>
             <a href="#" className="hover:text-white transition">Terms of Service</a>
             <a href="#" className="hover:text-white transition">Contact Us</a>
          </div>
          <p className="text-slate-600 font-medium text-sm">© {new Date().getFullYear()} TransMind Studio. All rights reserved.</p>
      </footer>
    </div>
  );
}
