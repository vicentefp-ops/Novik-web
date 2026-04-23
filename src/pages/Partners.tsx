import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { Users, Globe, BarChart3, Mail } from 'lucide-react';

export default function Partners() {
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
      className="max-w-6xl mx-auto px-4 py-20"
    >
      <Helmet>
        <title>Partnership – Grow with the First Specialized Dental AI Platform</title>
        <meta name="description" content="Join Novik as a partner. Reach a global community of dental professionals and align your brand with innovation in clinical oral healthcare." />
      </Helmet>
      <motion.div variants={itemVariants} className="text-left mb-16">
        <h1 className="text-5xl font-bold mb-6 text-slate-900">Partner with Novik</h1>
        <h2 className="text-primary font-bold tracking-wider uppercase text-sm mb-4">PARTNERSHIP</h2>
        <p className="text-xl text-slate-600 max-w-2xl">
          As the first AI decision-support platform tailored specifically to dentistry, Novik reaches a global community of forward-thinking clinicians. By partnering with us, you align your brand with innovation, precision and safety in oral healthcare.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
      >
        {[
          { icon: <Users />, title: "Global clinical reach", desc: "Direct access to licensed dentists and dental care professionals across Europe, LATAM and beyond — actively using Novik in their daily clinical workflow." },
          { icon: <Globe />, title: "Mission alignment", desc: "Associate your brand with clinical innovation and evidence-based care — values that resonate deeply with dental professionals worldwide." },
          { icon: <BarChart3 />, title: "Measurable exposure", desc: "Transparent reporting on impressions, click-throughs and audience demographics. Your investment is always traceable to real outcomes." }
        ].map((item, i) => (
          <motion.div variants={itemVariants} key={i} className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 hover:-translate-y-2 transition-transform duration-300">
            <div className="text-[#A3C564] mb-6">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold mb-4">{item.title}</h3>
            <p className="text-slate-400 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="mb-16"
      >
        <motion.h2 variants={itemVariants} className="text-4xl font-bold text-slate-900 mb-4">Partnership categories</motion.h2>
        <motion.p variants={itemVariants} className="text-primary font-bold tracking-wider uppercase text-sm mb-10">OPPORTUNITIES</motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Dental technology", desc: "Equipment manufacturers, CAD/CAM and imaging companies seeking clinician engagement." },
            { title: "Pharmaceuticals", desc: "Dental pharma companies looking to reach prescribing practitioners with precision." },
            { title: "Health-tech & SaaS", desc: "Digital health platforms, EHR providers and practice management software seeking integration partners." }
          ].map((cat, i) => (
            <motion.div variants={itemVariants} key={i} className="bg-slate-100 p-8 rounded-3xl border border-slate-200 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-4 text-slate-900">{cat.title}</h3>
              <p className="text-slate-600 leading-relaxed">{cat.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-slate-900 text-white p-8 rounded-3xl flex items-center gap-6 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300"
      >
        <Mail className="text-primary w-8 h-8 shrink-0" />
        <p className="text-lg">
          Interested in partnering? Reach out at <a href="mailto:info@novik.ai" className="text-primary font-bold hover:underline">info@novik.ai</a> and our team will be in touch.
        </p>
      </motion.div>
    </motion.div>
  );
}
