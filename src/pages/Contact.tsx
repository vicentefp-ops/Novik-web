import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { Mail, MessageSquare, Users, Code, HelpCircle, MessageCircle } from 'lucide-react';

export default function Contact() {
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
        <title>Contact Us – Get in Touch with Novik AI Team</title>
        <meta name="description" content="Have questions or feedback about Novik AI? Contact our team for clinical support, partnerships, or API inquiries." />
      </Helmet>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Left Column */}
        <div className="space-y-8">
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl font-bold text-slate-900 mb-6">Contact us</h1>
            <h2 className="text-primary font-bold tracking-wider uppercase text-sm mb-4">GET IN TOUCH</h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              At Novik, we value meaningful connections. Whether you want to share feedback, explore collaboration or ask a question, our team is here to listen and respond with care.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-slate-900 p-8 rounded-3xl text-white hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-4">
              <Mail className="text-[#A3C564] w-6 h-6" />
              <span className="font-bold tracking-wider uppercase text-xs text-slate-400">EMAIL</span>
            </div>
            <a href="mailto:info@novik.ai" className="text-2xl font-bold hover:text-primary transition-colors">info@novik.ai</a>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-slate-900 p-8 rounded-3xl text-white hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-4">
              <MessageCircle className="text-[#A3C564] w-6 h-6" />
              <span className="font-bold tracking-wider uppercase text-xs text-slate-400">WHATSAPP</span>
            </div>
            <a href="https://wa.me/34690957910" target="_blank" rel="noopener noreferrer" className="text-2xl font-bold hover:text-primary transition-colors">+34 690 95 79 10</a>
          </motion.div>

          <motion.p variants={itemVariants} className="text-slate-500">
            We aim to respond to all enquiries within 2 business days during the beta phase.
          </motion.p>
        </div>

        {/* Right Column */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-6"
        >
          <motion.h2 variants={itemVariants} className="text-primary font-bold tracking-wider uppercase text-sm mb-6">HOW CAN WE HELP?</motion.h2>
          {[
            { icon: <MessageSquare />, title: "Feedback & suggestions", desc: "Help us improve Novik. Clinical feedback and usability suggestions are reviewed by our team during the beta." },
            { icon: <Users />, title: "Partnerships & sponsorships", desc: "Interested in sponsoring Novik or exploring a collaboration? Tell us about your organisation and objectives." },
            { icon: <Code />, title: "API & integration enquiries", desc: "For API access, EHR integration or enterprise use cases, get in touch and we will schedule a technical discussion." },
            { icon: <HelpCircle />, title: "Support", desc: "Account issues, password resets or any technical problems — we are here to help and will respond within 2 business days." }
          ].map((item, i) => (
            <motion.div variants={itemVariants} key={i} className="bg-slate-100 p-6 rounded-3xl border border-slate-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="text-primary mt-1 shrink-0">{item.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
