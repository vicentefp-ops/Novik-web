import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, Heart, Users, Shield } from 'lucide-react';

export default function WhyFree() {
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
      className="max-w-4xl mx-auto px-4 py-20"
    >
      <Helmet>
        <title>Why Novik is Free – Our Commitment to Open Clinical AI</title>
        <meta name="description" content="Learn why Novik AI offers free access to our clinical decision support tools. Our mission is to democratize clinical intelligence in dentistry." />
      </Helmet>
      <motion.div variants={itemVariants} className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Why Novik is Free</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          We believe that every dental professional deserves access to accurate, evidence-based decision support.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <h2 className="text-3xl font-bold mb-10 text-center text-slate-900">Democratizing Clinical Intelligence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[
            { icon: <Users className="text-primary" />, title: "Open Beta", desc: "Novik is in a public beta phase. We offer free access to validate our models with clinicians." },
            { icon: <Heart className="text-primary" />, title: "Partnership & Grants", desc: "Our work is funded by partners and grants. We do not sell personal data." },
            { icon: <Shield className="text-primary" />, title: "Anonymous Metrics", desc: "We collect aggregated usage data to improve the system; patient data remains private." },
            { icon: <CheckCircle2 className="text-primary" />, title: "Transparent Future", desc: "When we introduce paid plans, the free tier will remain for core functionality." }
          ].map((item, i) => (
            <motion.div variants={itemVariants} key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-slate-50 p-10 rounded-[2.5rem] text-center hover:bg-slate-100 transition-colors duration-300"
      >
        <h2 className="text-2xl font-bold mb-4">Our Commitment</h2>
        <p className="text-slate-600 leading-relaxed italic">
          "Our mission is to democratize clinical intelligence in dentistry. By keeping core tools free, we ensure that safety and precision are accessible to every clinic, regardless of size or location."
        </p>
      </motion.div>
    </motion.div>
  );
}
