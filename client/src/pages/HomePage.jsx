import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, FileText, ArrowRight, 
  Globe, Users, Award, Sparkles,
  GraduationCap, BookOpen, CheckCircle, Download, FileCheck, Layers,
  Linkedin, Twitter, ChevronLeft, ChevronRight, ChevronUp, User
} from 'lucide-react';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4 md:gap-6 justify-center flex-wrap">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="flex flex-col min-w-[60px] md:min-w-[70px] items-center">
          <span className="text-3xl md:text-[2.5rem] font-extrabold text-white drop-shadow-lg leading-none">{value}</span>
          <span className="text-[0.65rem] md:text-[0.7rem] font-extrabold text-[#b700ff] tracking-widest uppercase mt-2">{label.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
};

const HomePage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tracks = [
    { 
      id: '01', 
      title: 'Advanced Computing', 
      desc: 'Exploring Neural Networks, Quantum supremacy, and Edge Computing architectures.',
      icon: <Sparkles className="w-12 h-12 text-indigo-600 mb-6" />
    },
    { 
      id: '02', 
      title: 'Sustainable Management', 
      desc: 'Circular economy, Green supply chains, and ESG-driven corporate strategies.',
      icon: <Globe className="w-12 h-12 text-indigo-600 mb-6" />
    },
    { 
      id: '03', 
      title: 'Digital Transformation', 
      desc: 'FinTech innovations, Blockchain governance, and the future of remote work.',
      icon: <Users className="w-12 h-12 text-indigo-600 mb-6" />
    },
    { 
      id: '04', 
      title: 'Human-Centric AI', 
      desc: 'Ethics in automation, NLP for local languages, and cognitive computing.',
      icon: <Award className="w-12 h-12 text-indigo-600 mb-6" />
    }
  ];

  const speakers = [
    {
      name: "Dr. Alexandra Vane",
      role: "Keynote Speaker",
      affiliation: "Senior Scientist, Stanford Research Lab",
      bio: "Expert in Distributed Systems and Algorithmic Fairness. Has published over 200 papers in top-tier journals.",
      img: "https://i.pravatar.cc/400?img=11"
    },
    {
      name: "Prof. Marcus Thorne",
      role: "Invited Speaker",
      affiliation: "Head of AI, MIT CSAIL",
      bio: "Pioneer in Generative AI architectures and transformer-based neural networks for climate modeling.",
      img: "https://i.pravatar.cc/400?img=12"
    },
    {
      name: "Dr. Sarah Jenkins",
      role: "Industry Expert",
      affiliation: "VP of Engineering, CloudFlare Inc.",
      bio: "Driving the future of edge computing and global secure networks. 15+ years of experience in infrastructure-as-code.",
      img: "https://i.pravatar.cc/400?img=13"
    },
    {
      name: "Prof. Li Wei",
      role: "Academic Speaker",
      affiliation: "Director of Research, Tsinghua University",
      bio: "Specializing in Sustainable Computing and Green Energy Management for Smart Cities.",
      img: "https://i.pravatar.cc/400?img=14"
    }
  ];

  // Calculate duration based on total width to maintain constant velocity (80px/s)
  const duration = (speakers.length * (window.innerWidth > 968 ? 252 : window.innerWidth > 768 ? 236 : 220)) / 80;

  return (
    <div className="relative overflow-x-hidden bg-slate-50">
      {/* Hero Section */}
      <section id="hero" className="relative min-h-[calc(100vh-80px)] flex items-center overflow-hidden py-10 z-10">
        <div className="absolute inset-0 z-[-1]">
          <img 
            src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1470&auto=format&fit=crop" 
            alt="Conference Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/45 via-slate-900/50 to-slate-50"></div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <div className="section-tag mb-6 text-xs md:text-sm">
              <Sparkles size={14} />
              <span>International Conference 2026</span>
            </div>
            <p className="text-white text-lg md:text-xl font-bold mb-2 drop-shadow-md">
              Innovating the Future of Technology & Management
            </p>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight text-white drop-shadow-lg">
              Contemporary Innovations in Engineering, Technology & Management - <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">CIETM-26</span>
            </h1>
            <div className="flex flex-col md:flex-row gap-4 mb-10 justify-center w-full max-w-md md:max-w-none">
              <Link to="/register" className="btn btn-primary px-8 py-4 text-base md:text-lg shadow-xl shadow-indigo-500/30">
                Join the Conference <ArrowRight size={20} />
              </Link>
              <a href="#conference" className="btn btn-secondary bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40 backdrop-blur-md px-8 py-4 text-base md:text-lg" onClick={(e) => {
                e.preventDefault();
                document.querySelector('#conference')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Conference Details
              </a>
            </div>
            <div className="mt-2">
                <CountdownTimer targetDate="2026-04-29T00:00:00" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Conference Section */}
      <section id="about-conference" className="py-16 md:py-24 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-3xl pointer-events-none -mr-40 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl pointer-events-none -ml-40 -mb-20"></div>

        <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
            {/* Left Column: Text Content */}
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-extrabold text-xs tracking-widest uppercase mb-5 border border-indigo-100">Introduction</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight leading-tight">
                About the <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Conference</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium mb-8 text-justify">
                The conference will focus on the contemporary cutting edge trends and advances in the field of Science, Engineering, Technology and Management domains. The conference aims to address the issues by providing a platform for the exchange of innovative ideas and information on recent advancements.
              </p>
              <p className="text-base text-slate-500 leading-relaxed mb-8 text-justify">
                This Conference provides a forum for undergraduates, post graduates, research scholars, faculty members and Personnel's from industry to come together and discuss the latest developments and innovations in Science, Engineering, Technology and Management. This helps the delegates to update their knowledge and provide a platform for future research.
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md hover:border-indigo-100 transition-all">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Global Network</h4>
                    <span className="text-xs text-slate-400 font-medium">Connect worldwide</span>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md hover:border-indigo-100 transition-all">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Publication</h4>
                    <span className="text-xs text-slate-400 font-medium">Scopus Indexed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visuals */}
            <div className="relative lg:h-[500px] flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-[4/5] md:aspect-square lg:aspect-auto lg:h-full">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[40px] rotate-3 opacity-10"></div>
                 <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" 
                  alt="Conference Discussion" 
                  className="w-full h-full object-cover rounded-[40px] shadow-2xl relative z-10 rotate-[-2deg] hover:rotate-0 transition-transform duration-500 border-4 border-white"
                 />
                 
                 {/* Floating Card */}
                 <div className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 bg-white p-6 rounded-3xl shadow-xl border border-slate-50 z-20 max-w-[200px] animate-float">
                    <div className="flex -space-x-3 mb-3">
                      {[1,2,3].map(i => (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden`}>
                          <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-600 text-white flex items-center justify-center text-[0.6rem] font-bold">+500</div>
                    </div>
                    <p className="text-xs font-bold text-slate-800 leading-tight">Join elite researchers and innovators.</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Topics of Interest - Updated from Reference */}
          <div className="bg-slate-900 rounded-[40px] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl border border-white/10">
            <div className="absolute top-0 right-0 w-[600px] h-full bg-gradient-to-l from-indigo-900/50 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 text-center max-w-5xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-8 text-orange-400 backdrop-blur-sm border border-white/10">
                  <Sparkles size={32} />
              </div>
              <h3 className="text-2xl md:text-5xl font-extrabold mb-12 uppercase tracking-wide relative inline-block text-white leading-tight">
                Themes <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Unlimited</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-left md:text-center text-lg md:text-xl font-medium text-slate-300">
                <div className="p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                   Innovations in Civil, Computer Science, Electrical, Electronics, Mechanical & Mechatronics Engineering
                </div>
                <div className="p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                   Innovative Models for Economic Sustainability & Circular Economy
                </div>
                <div className="p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                   Innovations in Information Technology, AI & Communication Engineering
                </div>
                <div className="p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                   Green Technology, Renewable Energy & Sustainable Infrastructure
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-white/10 flex justify-center">
                 <p className="text-sm text-slate-400 font-medium uppercase tracking-widest">And many more interdisciplinary topics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conference Guidelines Section */}
      <section id="conference" className="py-16 md:py-24 bg-slate-50">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-5 py-2 rounded-full bg-indigo-50 text-indigo-600 font-extrabold text-xs tracking-widest uppercase mb-5">Submission Guide</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight">Conference <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Guidelines</span></h2>
            <p className="text-lg text-slate-500 font-medium">Everything you need to know about participating in CIETM 2026.</p>
          </div>

          <div className="bg-[#020b1c] rounded-[40px] p-8 md:p-20 text-white relative overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_60%)] pointer-events-none"></div>
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-16 lg:gap-20 items-start relative z-10">
              {/* Guidelines Pane */}
              <div>
                <h3 className="text-3xl md:text-4xl font-extrabold mb-10 text-white">Author Guidelines</h3>
                <ul className="flex flex-col gap-8 md:gap-10">
                  <li className="flex gap-6 text-lg text-slate-400 leading-relaxed font-medium">
                    <CheckCircle className="text-sky-400 mt-1 shrink-0" size={26} />
                    <span>Original work not published elsewhere and must follow IEEE formatting.</span>
                  </li>
                  <li className="flex gap-6 text-lg text-slate-400 leading-relaxed font-medium">
                    <CheckCircle className="text-sky-400 mt-1 shrink-0" size={26} />
                    <span>Maximum 6 pages allowed with a strict double-blind peer review process.</span>
                  </li>
                  <li className="flex gap-6 text-lg text-slate-400 leading-relaxed font-medium">
                    <CheckCircle className="text-sky-400 mt-1 shrink-0" size={26} />
                    <span>Plagiarism must be under 15% to be considered for evaluation.</span>
                  </li>
                </ul>
                <div className="mt-12 md:mt-16 bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10">
                  <div className="text-sm font-black text-sky-400 uppercase tracking-widest mb-8 border-b border-white/10 pb-5">Registration Fee</div>
                  <div className="flex flex-col sm:flex-row gap-8 sm:gap-14">
                    <div className="flex gap-4 items-center">
                      <div className="w-11 h-11 bg-sky-400/10 rounded-2xl flex items-center justify-center text-sky-400 border border-sky-400/20 shrink-0"><Users size={20} /></div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">National</span>
                        <span className="text-xl font-extrabold text-white">₹ 500</span>
                      </div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="w-11 h-11 bg-sky-400/10 rounded-2xl flex items-center justify-center text-sky-400 border border-sky-400/20 shrink-0"><Globe size={20} /></div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">International</span>
                        <span className="text-xl font-extrabold text-white">₹ 1000</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 md:mt-12 flex justify-center lg:justify-start">
                  <Link to="/register" className="btn btn-primary px-10 py-4 text-base">
                    Register Now <ArrowRight size={20} />
                  </Link>
                </div>
              </div>

              {/* Vertical Timeline Pane */}
              <div className="relative">
                <div className="flex flex-col gap-0">
                  {[
                    { icon: <Users size={22} />, title: 'Abstract submission', date: 'March 8, 2026' },
                    { icon: <FileText size={22} />, title: 'Full paper submission', date: 'March 16, 2026' },
                    { icon: <Award size={22} />, title: 'Acceptance notification', date: 'March 24, 2026' },
                    { icon: <CheckCircle size={22} />, title: 'Camera ready', date: 'April 2, 2026' },
                    { icon: <Sparkles size={22} />, title: 'Payment confirmation deadline', date: 'April 12, 2026' },
                    { icon: <GraduationCap size={22} />, title: 'Conference date', date: 'April 29, 2026', active: true }
                  ].map((item, index, arr) => (
                    <div key={index} className={`relative pl-16 pb-12 ${index === arr.length - 1 ? 'pb-0' : ''}`}>
                       {index !== arr.length - 1 && (
                         <div className="absolute left-[20px] top-[30px] bottom-0 w-0.5 bg-white/10"></div>
                       )}
                       <div className={`absolute left-0 top-0 w-[42px] h-[42px] rounded-full border-2 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(0,0,0,0.4)] ${item.active ? 'bg-amber-500 border-amber-400 text-slate-900' : 'bg-slate-800 border-white/20 text-amber-500'}`}>
                         {item.icon}
                       </div>
                       <div className="flex flex-col gap-1">
                         <span className="text-xl font-bold text-white">{item.title}</span>
                         <span className="text-lg font-semibold text-orange-400">{item.date}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section id="tracks" className="py-16 md:py-24">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-5 py-2 rounded-full bg-indigo-50 text-indigo-600 font-extrabold text-xs tracking-widest uppercase mb-5">Academic Tracks</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight">Research Focus Areas</h2>
            <p className="text-lg text-slate-500 font-medium">We invite high-quality original research papers in the following tracks</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tracks.map((track, i) => (
              <motion.div 
                whileHover={{ y: -10 }}
                key={track.id} 
                className="bg-white p-8 md:p-12 rounded-3xl relative text-center flex flex-col items-center border border-slate-100 transition-all duration-400 hover:shadow-xl hover:border-indigo-500 group h-full justify-between"
              >
                <div className="absolute top-6 right-6 text-4xl font-black opacity-5 pointer-events-none group-hover:text-indigo-600 group-hover:opacity-10 transition-colors">{track.id}</div>
                {track.icon}
                <h3 className="text-xl font-bold mb-3 text-slate-900">{track.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{track.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Speakers Section */}
      <section id="speakers" className="py-16 md:py-24 bg-slate-50 overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-5 py-2 rounded-full bg-indigo-50 text-indigo-600 font-extrabold text-xs tracking-widest uppercase mb-5">Experts</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight">Keynote <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Speakers</span></h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">Meet the visionary leaders sharing their insights at CIETM 2026.</p>
          </div>

          <div className="relative w-full py-6 group">
            <div 
              className="flex gap-8 hover:[animation-play-state:paused]"
              style={{ 
                  animation: `scroll ${duration}s linear infinite`,
                  width: 'max-content'
              }}
            >
                {/* 3 sets for smooth infinity scroll */}
              {[...speakers, ...speakers, ...speakers].map((s, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className="w-[220px] shrink-0 bg-white rounded-[20px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-400 group/card h-full flex flex-col"
                >
                  <div className="relative h-[200px] overflow-hidden">
                    <img src={s.img} alt={s.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" />
                    <div className="absolute inset-x-0 bottom-[-60px] bg-slate-900/85 backdrop-blur-md py-4 flex justify-center gap-6 group-hover/card:bottom-0 transition-all duration-400 delay-75">
                      <a href="#" className="text-white hover:text-indigo-400 transition-colors"><Linkedin size={18} /></a>
                      <a href="#" className="text-white hover:text-indigo-400 transition-colors"><Twitter size={18} /></a>
                      <a href="#" className="text-white hover:text-indigo-400 transition-colors"><Globe size={18} /></a>
                    </div>
                  </div>
                  <div className="p-5 text-center flex flex-col flex-1">
                    <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[0.65rem] font-extrabold uppercase mb-3 self-center">{s.role}</div>
                    <h3 className="text-lg font-bold mb-1 text-slate-900">{s.name}</h3>
                    <span className="block font-bold text-slate-400 text-xs mb-3">{s.affiliation}</span>
                    <p className="text-sm text-slate-500 leading-snug mt-auto">{s.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <style>{`
            @keyframes scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(calc(-100% / 3)); }
            }
          `}</style>
        </div>
      </section>

      {/* Patrons Section */}
      <section id="patrons" className="py-16 md:py-24 relative bg-white overflow-hidden">
        {/* Mesh Backgrounds */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-500/15 rounded-full blur-[60px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-400/15 rounded-full blur-[60px] -z-10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(244,63,94,0.05)_0%,transparent_60%)] -z-10 pointer-events-none"></div>

        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-5 py-2 rounded-full bg-indigo-50 text-indigo-600 font-extrabold text-xs tracking-widest uppercase mb-5">Leadership</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight">Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Patrons</span></h2>
            <p className="text-lg text-slate-500 font-medium">Visionary leadership guiding CIETM 2026 towards excellence.</p>
          </div>

          <div className="mt-16">
            <h3 className="text-2xl font-bold text-slate-500 uppercase tracking-[0.2em] text-center mb-12 flex items-center justify-center gap-6 before:content-[''] before:h-px before:w-[60px] before:bg-slate-300 after:content-[''] after:h-px after:w-[60px] after:bg-slate-300">Chief Patron</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto justify-center">
              {[
                { name: "Dr. K. A. Chinnaraju", role: "Director", img: null },
                { name: "Thiru. M. Thangavelu", role: "Trustee", img: null },
                { name: "Dr. P. Natarajan", role: "Academic Director", img: null }
              ].map((p, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -8 }}
                  className="bg-white p-12 md:p-8 rounded-2xl text-center shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] border border-slate-200 hover:border-indigo-500 transition-all duration-300 relative overflow-hidden group h-full"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="mb-7 inline-block relative">
                    {p.img ? (
                      <img src={p.img} alt={p.name} className="w-[140px] h-[140px] rounded-[20px] object-cover bg-slate-100 shadow-sm transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="w-[140px] h-[140px] rounded-[20px] bg-slate-100 text-slate-500 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105">
                        <User size={36} strokeWidth={2} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-[1.35rem] font-bold text-slate-800 mb-2 leading-tight">{p.name}</h3>
                  <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider border-b-2 border-transparent group-hover:border-indigo-600 transition-colors pb-0.5 inline-block">{p.role}</span>
                </motion.div>
              ))}
            </div>

            <h3 className="text-2xl font-bold text-slate-500 uppercase tracking-[0.2em] text-center mb-12 mt-20 flex items-center justify-center gap-6 before:content-[''] before:h-px before:w-[60px] before:bg-slate-300 after:content-[''] after:h-px after:w-[60px] after:bg-slate-300">Patron</h3>
            <div className="max-w-sm mx-auto">
              {[
                { name: "Dr. K. Manikanda Subramanian", role: "Principal", img: null }
              ].map((p, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -8 }}
                  className="bg-white p-12 md:p-8 rounded-2xl text-center shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] border border-slate-200 hover:border-indigo-500 transition-all duration-300 relative overflow-hidden group h-full"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="mb-7 inline-block relative">
                    {p.img ? (
                      <img src={p.img} alt={p.name} className="w-[140px] h-[140px] rounded-[20px] object-cover bg-green-50 text-green-600 shadow-sm transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="w-[140px] h-[140px] rounded-[20px] bg-green-50 text-green-600 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105">
                        <User size={36} strokeWidth={2} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-[1.35rem] font-bold text-slate-800 mb-2 leading-tight">{p.name}</h3>
                  <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider border-b-2 border-transparent group-hover:border-indigo-600 transition-colors pb-0.5 inline-block">{p.role}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About College Section */}
      <section id="about" className="py-16 md:py-24">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="w-full mb-14 flex justify-center">
            <div className="relative w-full max-w-7xl min-h-[450px] md:min-h-[500px] lg:min-h-[600px] rounded-[30px] md:rounded-[40px] overflow-hidden shadow-2xl flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80" alt="College Campus" className="absolute inset-0 w-full h-full object-cover z-0" />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900/50 z-10"></div>
              
              <div className="relative z-20 p-8 md:p-16 max-w-4xl text-center text-white">
                <span className="inline-block px-5 py-2 rounded-full bg-white/10 text-white font-extrabold text-xs tracking-widest uppercase mb-6 backdrop-blur-md">Host Institution</span>
                <h2 className="text-3xl md:text-5xl font-extrabold mb-8 leading-tight tracking-tight text-white">Coimbatore Institute of <span className="text-sky-400">Engineering and Technology</span></h2>
                <p className="text-base md:text-xl font-medium leading-relaxed opacity-90 mb-0">The Coimbatore Institute of Engineering and Technology (CIET), Coimbatore, Tamilnadu (An Autonomous institute) was established in 2001 by the Kovai Kalaimagal Educational Trust (KKET) to provide quality education in Engineering, Technology and Management. CIET is affiliated to Anna University, approved by AICTE, accredited with 'A' Grade by NAAC.</p>
              </div>
              <div className="absolute bottom-6 md:bottom-8 right-6 md:right-10 bg-white py-3 px-5 rounded-xl z-20 flex items-center gap-2 font-extrabold text-sm shadow-lg text-slate-900">
                <MapPin size={16} /> CIET Coimbatore
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-7xl mx-auto">
            <div className="flex gap-6 p-8 md:p-10 items-center rounded-[32px] bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-indigo-500 group h-full">
              <div className="w-[60px] h-[60px] bg-blue-500/10 rounded-[18px] flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <GraduationCap size={28} />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2 text-slate-900">Academic Scope</h4>
                <p className="text-slate-500 text-[0.95rem] leading-relaxed">CIET offers 11 Under Graduate and a Post Graduate Engineering course including MBA-Business Administration.</p>
              </div>
            </div>
            <div className="flex gap-6 p-8 md:p-10 items-center rounded-[32px] bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-indigo-500 group h-full">
              <div className="w-[60px] h-[60px] bg-blue-500/10 rounded-[18px] flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <Globe size={28} />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2 text-slate-900">Campus & Atmosphere</h4>
                <p className="text-slate-500 text-[0.95rem] leading-relaxed">CIET is located in a green campus spreading over 25 acres with a picturesque and serene atmosphere surrounded by green hillocks.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 md:mt-24">
            {[
                { icon: MapPin, title: 'Green Campus', desc: 'Spreading over 25 acres, located 25 kms from Coimbatore city.' },
                { icon: Sparkles, title: 'Serene Vibe', desc: 'A picturesque atmosphere surrounded by beautiful green hillocks.' },
                { icon: Award, title: "NAAC 'A' Grade", desc: 'Autonomous institute affiliated to Anna University and approved by AICTE.' }
            ].map((amenity, i) => (
                <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-8 md:p-10 rounded-3xl text-center border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all duration-300">
                    <amenity.icon className="w-11 h-11 text-indigo-600 mx-auto mb-5" />
                    <h3 className="text-xl font-bold mb-2 text-slate-900">{amenity.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{amenity.desc}</p>
                </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-24 bg-gradient-to-br from-indigo-500 to-purple-600 text-white mt-16">
        <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col">
            <h2 className="text-[3.5rem] font-bold mb-2 tracking-tight leading-none">20+</h2>
            <p className="opacity-90 font-bold uppercase tracking-[0.1rem] text-sm">Speaker Countries</p>
          </div>
          <div className="flex flex-col">
            <h2 className="text-[3.5rem] font-bold mb-2 tracking-tight leading-none">150+</h2>
            <p className="opacity-90 font-bold uppercase tracking-[0.1rem] text-sm">Original Papers</p>
          </div>
          <div className="flex flex-col">
            <h2 className="text-[3.5rem] font-bold mb-2 tracking-tight leading-none">10+</h2>
            <p className="opacity-90 font-bold uppercase tracking-[0.1rem] text-sm">Industry Partners</p>
          </div>
        </div>
      </section>
      
      {showScrollTop && (
        <button 
          className="fixed bottom-10 right-10 w-[60px] h-[60px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-indigo-500/40 shadow-xl z-50 hover:-translate-y-2 hover:scale-110 transition-all duration-300 border-none cursor-pointer"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
};

export default HomePage;
