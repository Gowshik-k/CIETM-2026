import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, CheckCircle, 
  CreditCard, ShieldCheck, Download, 
  BookOpen, Globe, UserCircle, Eye, 
  UserCheck, Shield, Mail, MapPin,
  Monitor, PlusCircle, Edit2, Search, Zap, Trash2, List
} from 'lucide-react';

const UserGuide = () => {
  const portalAccessData = [
    {
      role: "Universal Portal Entrance",
      icon: <Globe size={24} className="text-indigo-600" />,
      content: "All conference participants, regardless of role, log in through the same secure gateway at cietm.org/login. Your registered email serves as your permanent identity. Role-specific dashboards are unlocked upon your committee appointment."
    },
    {
      role: "Role Switching Architecture",
      icon: <Monitor size={24} className="text-slate-600" />,
      content: "The system uses a unified account model. If you are appointed as a Reviewer or Chair, look for the 'Switch Dashboard' buttons in your primary sidebar or user profile menu to access management tools."
    }
  ];

  const guideData = [
    {
      role: "Author",
      icon: <UserCircle size={24} className="text-indigo-600" />,
      steps: [
        {
          title: "Registration & Profile",
          desc: "Register at /register. Ensure your Institution and Designation are accurate, as these details are embedded in your official credentials."
        },
        {
          title: "Multi-Paper Submission",
          desc: "In the 'Submission' tab, you can manage multiple manuscripts. Click the '+' (Submit New Paper) button in the top paper selector bar to add a new research entry."
        },
        {
          title: "Manuscript Status Tracking",
          desc: "Papers progress from 'Draft' -> 'Submitted' -> 'Under Review' -> 'Accepted/Rejected'. Once 'Accepted', the document upload feature for your full paper (.doc) becomes available."
        },
        {
          title: "Paper Selection & Certificates",
          desc: "In the 'E-Certificate' tab, use the paper switcher to select the desired Manuscript. The gallery will update to show download links for all authors listed under that specific paper."
        },
        {
          title: "Delegate ID Download",
          desc: "Access the 'ID Card' tab to download your QR-coded entry pass, required for physical verification at the conference venue."
        }
      ]
    },
    {
      role: "Reviewer",
      icon: <Eye size={24} className="text-amber-600" />,
      steps: [
        {
          title: "Activation & Entrance",
          desc: "Upon committee appointment, log in and select 'Reviewer Dashboard' from your sidebar. You will see an 'Overview' of your assigned workload."
        },
        {
          title: "Evaluation Workspace",
          desc: "Navigate to 'My Reviews'. This table lists all manuscripts assigned to you. Verify Paper IDs (DEG: Delegate ID, PAP: Paper ID) and Author details."
        },
        {
          title: "Submitting Feedback",
          desc: "Click the 'Edit' icon on any paper to open the Review Form. You must download the manuscript, select a status (Under Review/Accepted/Rejected), and provide mandatory technical remarks."
        },
        {
          title: "Inbox Notifications",
          desc: "The 'Inbox' tab alerts you immediately upon a new paper assignment from a Track Chair, providing deep-links to the review workspace."
        }
      ]
    },
    {
      role: "Track Chair",
      icon: <UserCheck size={24} className="text-emerald-600" />,
      steps: [
        {
          title: "Track Supervision",
          desc: "The Chair Dashboard provides a 'Monitor Board' showing the submission velocity and track distribution across all domains."
        },
        {
          title: "Reviewer Assignment",
          desc: "In 'Paper Submissions', select 'Assign Reviewer' for new entries. Use 'Auto Assign' to automatically distribute papers based on reviewer availability and track expertise."
        },
        {
          title: "Editorial Verdicts",
          desc: "Chairs can manually override reviewer statuses or issuing final rulings. You also manage 'Reupload Requests' from authors who need to correct submitted manuscripts."
        },
        {
          title: "On-site Entry Management",
          desc: "Use the integrated 'QR Scanner' to verify participant credentials at the venue. You also possess the 'Manual Payment' tool to record spot-cash registrations."
        }
      ]
    },
    {
      role: "Administrator",
      icon: <Shield size={24} className="text-slate-600" />,
      steps: [
        {
          title: "Nexus System Control",
          desc: "Admins manage global conference variables including Maintenance Mode, Online Payment availability, and Broadcast Announcements."
        },
        {
          title: "Privilege Delegation",
          desc: "The 'User Directory' allows Admins to promote any registered user to Reviewer, Chair, or Admin roles. You can also manually create accounts for invited keynote speakers."
        },
        {
          title: "Data Operations",
          desc: "Admins perform bulk manuscript ZIP downloads, Excel exports of all registration data, and critical database maintenance/purging operations."
        }
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-24 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="mb-12 border-b border-slate-100 pb-10">
           <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-4 uppercase">
             Conference Portal User Guide
           </h1>
           <p className="text-lg text-slate-500 font-bold leading-relaxed max-w-2xl italic">
              Formal operating manual based on the CIETM-2026 technical infrastructure.
           </p>
        </div>

        {/* Portal Access Fundamentals */}
        <div className="mb-20 space-y-8">
           <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-6">Portal Access Framework</h2>
           <div className="grid md:grid-cols-2 gap-8">
             {portalAccessData.map((item, idx) => (
               <div key={idx} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                        {item.icon}
                     </div>
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{item.role}</h3>
                  </div>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-widest leading-[1.6]">
                    {item.content}
                  </p>
               </div>
             ))}
           </div>
        </div>

        {/* Quick Jump Links */}
        <div className="flex flex-wrap gap-3 mb-16 border-y border-slate-50 py-6">
           {guideData.map((guide) => (
             <a 
               key={guide.role}
               href={`#${guide.role.toLowerCase()}`}
               className="px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 transition-all flex items-center gap-2 uppercase tracking-widest shadow-sm"
             >
                {guide.icon} {guide.role} Guide
             </a>
           ))}
        </div>

        {/* Detailed Role Protocols */}
        <div className="space-y-24">
          {guideData.map((guide) => (
            <section key={guide.role} id={guide.role.toLowerCase()} className="scroll-mt-32">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                     {guide.icon}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{guide.role} Interface Protocol</h2>
               </div>

               <div className="ml-0 md:ml-12 border-l-2 border-slate-100 pl-8 md:pl-16 space-y-12">
                  {guide.steps.map((step, idx) => (
                    <motion.div 
                      key={step.title}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="relative"
                    >
                       <div className="absolute -left-[41px] md:-left-[73px] top-1 w-4 h-4 rounded-full bg-white border-4 border-slate-900 shadow-sm"></div>
                       <h3 className="text-sm font-black text-slate-800 mb-2 uppercase tracking-widest">{idx + 1}. {step.title}</h3>
                       <p className="text-slate-500 font-bold text-xs leading-relaxed uppercase tracking-widest leading-[1.6] text-justify">
                          {step.desc}
                       </p>
                    </motion.div>
                  ))}
               </div>
            </section>
          ))}
        </div>

        {/* Technical Support Footer */}
        <div className="mt-32 pt-16 border-t border-slate-100 grid md:grid-cols-2 gap-16">
           <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Registry Assistance</h4>
              <div className="space-y-6">
                 <div className="flex items-center gap-4 text-slate-600 font-black text-[10px] uppercase tracking-widest">
                    <Mail size={18} className="text-indigo-600" /> cietm@cietcbe.edu.in
                 </div>
                 <div className="flex items-center gap-4 text-slate-600 font-black text-[10px] uppercase tracking-widest">
                    <MapPin size={18} className="text-indigo-600" /> CIET Coimbatore, TN, India.
                 </div>
              </div>
           </div>
           <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Scholarly Assets</h4>
              <div className="space-y-6">
                 <a href="https://www.ieee.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">
                    <Download size={18} /> IEEE A4 Manuscript Manual (.doc)
                 </a>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default UserGuide;
