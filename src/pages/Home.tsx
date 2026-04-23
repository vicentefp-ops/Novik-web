import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Zap, BookOpen, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import LogoCarousel from '../components/LogoCarousel';

const heroBg = '/pexels-pavel-danilyuk-6812482.jpg';
const pubmed = '/PubMed Logo 2.png';
const drugbank = '/Drugbank Logo New.png';
const gacetaLogo = '/PremiosGacetaDental.png';
const barcelonaLogo = '/BarcelonaDentalShow.png';
const harvardLogo = '/Harvard2.png';
const aiAnalysis = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop';

console.log("DEBUG IMAGE IMPORTS:", { heroBg, pubmed, drugbank, gacetaLogo, barcelonaLogo, harvardLogo });

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="overflow-hidden"
    >
      <Helmet>
        <title>Novik AI – Clinical Excellence in Dentistry Powered by Artificial Intelligence</title>
        <meta name="description" content="Novik AI is the leading clinical decision assistant for dentists. Use AI to analyze complex cases, drug interactions, and treatment plans with medical evidence." />
      </Helmet>
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center pt-20 pb-24 overflow-hidden">
        {/* Modern Background with Overlay - Optimized for LCP */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="" 
            className="w-full h-full object-cover"
            fetchPriority="high"
            width="1920"
            height="1080"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/40"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(136,169,78,0.2),transparent_50%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            <motion.div 
              variants={itemVariants} 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary border border-primary/30 text-slate-900 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AI-Powered Clinical Support
            </motion.div>
            
            <motion.h1 
              variants={itemVariants} 
              className="text-5xl md:text-8xl font-bold text-white mb-8 leading-[1.05] tracking-tight"
            >
              Novik AI: Clinical Excellence in Dentistry <br />
              <span className="text-[#A3C564]">Powered by Artificial Intelligence</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants} 
              className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-2xl"
            >
              Novik AI is your intelligent assistant that analyzes complex cases, supports clinical decision-making, and helps optimize treatment planning in seconds.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 pb-10">
              <a href="https://app.novik.ai" className="btn-primary text-lg px-10 py-5 flex items-center justify-center gap-3 group shadow-2xl shadow-primary/20">
                Start for Free <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </div>
        </div>
        <p className="absolute bottom-4 right-4 text-slate-200 text-base italic z-10 px-4">Supporting clinical decisions, never replacing professional judgment.</p>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-16 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900">Solving Complex Dental Treatment Planning</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Complex medical histories and limited time make treatment planning risky. Novik is the dental AI assistant that simplifies this process.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Zap className="text-primary" size={32} />,
                title: "Polypharmacy Prevalence",
                desc: "Over 70% of dental patients take multiple medications, increasing the risk of dangerous interactions."
              },
              {
                icon: <Clock className="text-primary" size={32} />,
                title: "Time Constraints",
                desc: "Dentists rarely have the time needed to review every drug interaction before each procedure."
              },
              {
                icon: <AlertCircle className="text-primary" size={32} />,
                title: "Risk of Clinical Errors",
                desc: "Human oversights can lead to ethical, legal, and health complications, especially in high-risk patients."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="mb-8 bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 tracking-tight">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Clinical Guidelines Section */}
      <section className="py-20 bg-white">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-slate-900">AI-Powered Dental Guidelines from Scientific Societies</h2>
            <p className="text-slate-600 text-sm italic">Novik is an independent AI assistant and is not affiliated with these organizations.</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="overflow-x-auto pb-8">
            <LogoCarousel />
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900">How It Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">Novik optimizes decision-making in three simple steps.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-slate-100 -z-10"></div>
            {[
              { step: "1", title: "Input Clinical Data", desc: "Provide patient history, current medications, and the planned procedure." },
              { step: "2", title: "AI Analysis", desc: "Our engine detects contraindications and alerts you to potential risks." },
              { step: "3", title: "Get Clinical Support", desc: "Receive personalized suggestions, safe alternatives, and adjusted dosages." }
            ].map((item, i) => (
              <motion.div key={i} variants={itemVariants} className="text-center group">
                <div className="w-20 h-20 bg-primary text-white rounded-[2rem] flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-2xl shadow-primary/30 group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 tracking-tight">{item.title}</h3>
                <p className="text-slate-600 text-lg leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Powered by Trusted Medical Data */}
      <section className="py-16 bg-slate-50">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900">Powered by <span className="text-primary">Trusted Medical Data</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { 
                name: "PubMed", 
                logo: pubmed,
                desc: "Access to indexed biomedical literature, ensuring clinical recommendations are grounded in validated evidence and relevant publications from the global medical community." 
              },
              { 
                name: "Drugbank", 
                logo: drugbank,
                desc: "Structured pharmacological data on drugs, indications, interactions, and dosages, supporting safer and more precise therapeutic decisions in clinical practice." 
              }
            ].map((item, i) => (
              <motion.div key={i} variants={itemVariants} className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col items-center text-center">
                <div className="h-24 mb-6 flex items-center justify-center">
                  <img src={item.logo} alt={`${item.name} Medical Database - Evidence-Based Dentistry for Clinical Support`} className="h-20 w-auto object-contain" loading="lazy" width="200" height="80" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 tracking-tight">{item.name}</h3>
                <p className="text-slate-600 text-lg leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Featured & Recognised By */}
      <section className="py-16 bg-white">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900">Featured & <span className="text-primary">Recognised By</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                name: "Gaceta", 
                logo: gacetaLogo,
                desc: "Winner for Best Technological Advancement, highlighting Novik’s contribution to innovation and digital transformation in the dental sector." 
              },
              { 
                name: "Barcelona", 
                logo: barcelonaLogo,
                desc: "Finalist for Best Innovation, recognising Novik’s impact in advancing AI-driven clinical decision support within modern dentistry." 
              },
              { 
                name: "Harvard2", 
                logo: harvardLogo,
                desc: "Presented at the 2nd AI in Dentistry Symposium, showcasing Novik’s approach to integrating artificial intelligence into clinical dental practice." 
              }
            ].map((item, i) => (
              <motion.div key={i} variants={itemVariants} className="flex flex-col items-center text-center">
                <div className="h-24 mb-6 flex items-center justify-center">
                  <img src={item.logo} alt={`Recognised by ${item.name} - Excellence in Dental AI Technology`} className="h-20 w-auto object-contain" loading="lazy" width="200" height="80" />
                </div>
                <p className="text-slate-600 text-lg leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(136,169,78,0.1),transparent_50%)]"></div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl md:text-6xl font-bold mb-10 tracking-tight leading-tight">Evidence at Your <span className="text-primary">Fingertips</span></h2>
              <div className="space-y-10">
                {[
                  { title: "Methodology", desc: "We filter PubMed by condition, drug, and dental procedure, prioritizing systematic reviews." },
                  { title: "Scope", desc: "Covers antibiotics, NSAIDs, local anesthetics, anticoagulants, and more." },
                  { title: "Formatting", desc: "References are delivered in Vancouver format with direct links to abstracts." },
                  { title: "Transparency", desc: "Each data source and update timestamp is clearly shown." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="mt-1 bg-primary/20 p-2 rounded-xl group-hover:bg-primary/30 transition-colors">
                      <CheckCircle2 className="text-primary" size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3 tracking-tight text-white">{item.title}</h3>
                      <p className="text-slate-400 text-lg leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="relative"
            >
              <div className="glass p-4 rounded-[3rem] border-white/10 shadow-2xl">
                <img 
                  src={aiAnalysis} 
                  alt="Novik Dental AI Analysis Interface - Clinical Decision Support" 
                  className="rounded-[2.5rem] w-full shadow-inner"
                  loading="lazy"
                  width="1000"
                  height="800"
                  decoding="async"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-white">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={itemVariants} className="bg-primary rounded-[4rem] p-12 md:p-24 text-center text-slate-900 relative overflow-hidden shadow-[0_35px_60px_-15px_rgba(136,169,78,0.3)]">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-black/5 rounded-full blur-3xl"></div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-10 relative z-10 tracking-tight text-slate-900">Ready to Elevate Your Clinical Practice?</h2>
            <p className="text-xl md:text-2xl text-slate-800 mb-14 max-w-2xl mx-auto relative z-10 leading-relaxed font-medium">
              Join thousands of dental professionals using Novik to make safer, faster, and smarter decisions.
            </p>
            <a href="https://app.novik.ai" className="bg-slate-900 text-white hover:bg-slate-800 px-12 py-6 rounded-2xl font-bold text-xl inline-flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-2xl relative z-10 group">
              Get Started Now <ArrowRight size={26} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </motion.div>
      </section>
    </motion.div>
  );
}
