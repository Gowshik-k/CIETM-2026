import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, CheckCircle, 
  CreditCard, ShieldCheck, Download, 
  HelpCircle, ChevronRight, BookOpen, 
  Zap, ArrowRight, UserCircle, Eye, 
  UserCheck, Shield, Mail, Phone, MapPin
} from 'lucide-react';

const UserGuide = () => {
  const guideData = [
    {
      role: "Author",
      icon: <UserCircle size={24} className="text-indigo-600" />,
      steps: [
        {
          title: "Account Registration",
          desc: "Log in with your details. All new users are automatically registered as Authors. Ensure your email and mobile are accurate for conference communications."
        },
        {
          title: "Abstract Submission",
          desc: "Submit your paper title, abstract (max 300 words), and keywords. Select the most relevant track for your research work."
        },
        {
          title: "Full Paper Upload",
          desc: "Once your abstract is preliminary accepted, upload your full manuscript in IEEE Word format. Ensure plagiarism is below 15%."
        },
        {
          title: "Fee Payment",
          desc: "Complete your registration payment after final acceptance. Choose between Internal (CIET) or External participant categories."
        },
        {
          title: "Digital ID Card",
          desc: "Download your unique Delegate ID Card from your dashboard. It is required for entry and physical verification at the venue."
        }
      ]
    },
    {
      role: "Reviewer",
      icon: <Eye size={24} className="text-amber-600" />,
      steps: [
        {
          title: "Paper Assignment",
          desc: "The conference chair will assign relevant manuscripts to you based on your expertise and track specialization."
        },
        {
          title: "Technical Review",
          desc: "Assess the manuscript's originality, technical soundness, and quality. Examine the integrated plagiarism report."
        },
        {
          title: "Submission of Feedback",
          desc: "Complete the online review form with specialized comments for authors and a confidential evaluation for the chair."
        }
      ]
    },
    {
      role: "Chair",
      icon: <UserCheck size={24} className="text-emerald-600" />,
      steps: [
        {
          title: "Track Supervision",
          desc: "Monitor all submissions within your assigned track(s). Verify the initial abstract quality before assigning reviewers."
        },
        {
          title: "Reviewer Coordination",
          desc: "Assign appropriate reviewers to each paper and ensure timely completion of the review process."
        },
        {
          title: "Final Verdict",
          desc: "Review reviewer feedback and issue the final decision (Accept/Reject/Revision) with specific remarks for the authors."
        }
      ]
    },
    {
      role: "Administrator",
      icon: <Shield size={24} className="text-slate-600" />,
      steps: [
        {
          title: "Global Configuration",
          desc: "Manage conference timelines, registration fees, and portal-wide settings for all users."
        },
        {
          title: "User Management",
          desc: "Override user roles, manage permissions, and assist authors or reviewers with account issues."
        },
        {
          title: "Data Analytics",
          desc: "Monitor global submission statistics and export detailed registration/payment data for conference logistics."
        }
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-24 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="mb-16 border-b border-slate-100 pb-12">
           <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-4">
             Conference User Guide
           </h1>
           <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
              Official operating manual for authors, reviewers, chairs, and administrators of the CIETM-2026 conference management system.
           </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-4 mb-16">
           {guideData.map((guide) => (
             <a 
               key={guide.role}
               href={`#${guide.role.toLowerCase()}`}
               className="px-6 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 transition-colors flex items-center gap-2"
             >
                {guide.icon} {guide.role} Guide
             </a>
           ))}
        </div>

        {/* Guide Content Sections */}
        <div className="space-y-24">
          {guideData.map((guide) => (
            <section key={guide.role} id={guide.role.toLowerCase()} className="scroll-mt-32">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600">
                     {guide.icon}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">{guide.role} Manual</h2>
               </div>

               <div className="ml-0 md:ml-16 border-l-2 border-slate-100 pl-8 md:pl-12 space-y-12">
                  {guide.steps.map((step, idx) => (
                    <motion.div 
                      key={step.title}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="relative"
                    >
                       <div className="absolute -left-[41px] md:-left-[57px] top-1 w-4 h-4 rounded-full bg-white border-4 border-indigo-600 shadow-sm shadow-indigo-200"></div>
                       <h3 className="text-lg font-bold text-slate-800 mb-2">{idx + 1}. {step.title}</h3>
                       <p className="text-slate-500 font-medium leading-relaxed italic text-justify">
                          {step.desc}
                       </p>
                    </motion.div>
                  ))}
               </div>
            </section>
          ))}
        </div>

        {/* Footer Support */}
        <div className="mt-24 pt-12 border-t border-slate-100 grid md:grid-cols-2 gap-12">
           <div>
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Technical Support</h4>
              <div className="space-y-4">
                 <a href="mailto:cietm@cietcbe.edu.in" className="flex items-center gap-3 text-slate-600 font-bold hover:text-indigo-600 transition-colors">
                    <Mail size={18} /> cietm@cietcbe.edu.in
                 </a>
                 <div className="flex items-center gap-3 text-slate-600 font-bold">
                    <MapPin size={18} /> Coimbatore, Tamil Nadu, India.
                 </div>
              </div>
           </div>
           <div>
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Important Resources</h4>
              <div className="space-y-4">
                 <a href="https://www.ieee.org/content/dam/ieee-org/ieee/web/org/conferences/Conference-template-A4.doc" className="flex items-center gap-2 text-indigo-600 font-bold hover:underline">
                    <Download size={18} /> Download IEEE Manuscript Template
                 </a>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default UserGuide;
