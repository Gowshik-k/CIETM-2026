import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, FileText, ArrowRight, 
  Globe, Users, Award, Sparkles,
  GraduationCap, BookOpen, CheckCircle, Download, FileCheck, Layers,
  Linkedin, Twitter, ChevronLeft, ChevronRight, ChevronUp, User
} from 'lucide-react';
import './HomePage.css';

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
    <div className="countdown-premium">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="time-unit">
          <span className="value">{value}</span>
          <span className="label">{label.toUpperCase()}</span>
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
      icon: <Sparkles className="track-icon" />
    },
    { 
      id: '02', 
      title: 'Sustainable Management', 
      desc: 'Circular economy, Green supply chains, and ESG-driven corporate strategies.',
      icon: <Globe className="track-icon" />
    },
    { 
      id: '03', 
      title: 'Digital Transformation', 
      desc: 'FinTech innovations, Blockchain governance, and the future of remote work.',
      icon: <Users className="track-icon" />
    },
    { 
      id: '04', 
      title: 'Human-Centric AI', 
      desc: 'Ethics in automation, NLP for local languages, and cognitive computing.',
      icon: <Award className="track-icon" />
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
    <div className="home-root">
      {/* Hero Section */}
      <section id="hero" className="hero-premium central-hero">
        <div className="hero-bg-overlay">
          <img 
            src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1470&auto=format&fit=crop" 
            alt="Conference Background" 
            className="hero-bg-image"
          />
          <div className="hero-overlay-gradient"></div>
        </div>

        <div className="container hero-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-content"
          >
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>International Conference 2026</span>
            </div>
            <h1 className="hero-title white-text">
              Innovating the <span className="text-gradient">Future</span> of Technology & Management
            </h1>
            <p className="hero-subtitle white-text">
              Contemporary Innovations in Engineering ,Technology & Management - cietm-26
            </p>
            <div className="hero-actions center-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Join the Conference <ArrowRight size={20} />
              </Link>
              <a href="#conference" className="btn btn-outline btn-lg" onClick={(e) => {
                e.preventDefault();
                document.querySelector('#conference')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Conference Details
              </a>
            </div>
            <CountdownTimer targetDate="2026-04-29T00:00:00" />
          </motion.div>
        </div>
      </section>

      {/* About Conference Section */}
      <section id="about-conference" className="about-conference-section section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Introduction</span>
            <h2 className="section-title">About the <span className="text-gradient">Conference</span></h2>
            <p className="section-desc" style={{ maxWidth: '1000px', margin: '0 auto' }}>
              The conference will focus on the contemporary cutting edge trends and advances in the field of 
              Science, Engineering, Technology and Management domains. The conference aims to address the issues 
              by providing a platform for the exchange of innovative ideas and information on recent advancements.
            </p>
          </div>

          {/* Topics of Interest Grid */}
          <div className="themes-premium-container mt-6">
            <h3 className="themes-sub-title">Topics of Interest</h3>
            <div className="topics-interest-grid">
              <div className="topic-item">
                <CheckCircle className="topic-check" size={20} />
                <span>Civil engineering</span>
              </div>
              <div className="topic-item">
                <CheckCircle className="topic-check" size={20} />
                <span>Computer science and engineering</span>
              </div>
              <div className="topic-item">
                <CheckCircle className="topic-check" size={20} />
                <span>Electronics and Communication engineering</span>
              </div>
              <div className="topic-item">
                <CheckCircle className="topic-check" size={20} />
                <span>Electrical and Electronics engineering</span>
              </div>
              <div className="topic-item">
                <CheckCircle className="topic-check" size={20} />
                <span>Mechanical engineering</span>
              </div>
              <div className="topic-item">
                <CheckCircle className="topic-check" size={20} />
                <span>Mechatronics engineering</span>
              </div>
              <div className="topic-item">
                <CheckCircle className="topic-check" size={20} />
                <span>Information Technology</span>
              </div>
              <div className="topic-item">
                <CheckCircle className="topic-check" size={20} />
                <span>Artificial Intelligence and Data Science</span>
              </div>
              <div className="topic-item">
                <CheckCircle className="topic-check" size={20} />
                <span>Master of Business Administration</span>
              </div>
            </div>
          </div>

          {/* Broad Themes (Optional but kept for continuity as 'Additional Themes') */}
          <div className="mt-6 text-center">
            <p className="themes-not-limited">Themes but not limited to: Innovations in Green Technology, Economic Sustainability, Renewable Energy, and Digital Dimensions.</p>
          </div>
        </div>
      </section>

      {/* Conference Guidelines Section */}
      <section id="conference" className="conference-section section-padding bg-light">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Submission Guide</span>
            <h2 className="section-title">Conference <span className="text-gradient">Guidelines</span></h2>
            <p className="section-desc">Everything you need to know about participating in CIETM 2026.</p>
          </div>

          <div className="integrated-guidelines-box">
            <div className="integrated-flow-grid">
              {/* Guidelines Pane */}
              <div className="guidelines-flat-pane">
                <h3>Author Guidelines</h3>
                <ul className="flat-guideline-list">
                  <li>
                    <CheckCircle className="icon-highlight" size={26} />
                    <span>Original work not published elsewhere and must follow IEEE formatting.</span>
                  </li>
                  <li>
                    <CheckCircle className="icon-highlight" size={26} />
                    <span>Maximum 6 pages allowed with a strict double-blind peer review process.</span>
                  </li>
                  <li>
                    <CheckCircle className="icon-highlight" size={26} />
                    <span>Plagiarism must be under 15% to be considered for evaluation.</span>
                  </li>
                </ul>
                <div className="registration-fee-box mt-10">
                  <div className="fee-header-mini">Registration Fee</div>
                  <div className="fee-grid-mini">
                    <div className="fee-item-mini">
                      <div className="fee-icon-box-mini"><Users size={20} /></div>
                      <div className="fee-info-mini">
                        <span className="fee-label-mini">National</span>
                        <span className="fee-label-mini">₹ 500</span>
                      </div>
                    </div>
                    <div className="fee-item-mini">
                      <div className="fee-icon-box-mini"><Globe size={20} /></div>
                      <div className="fee-info-mini">
                        <span className="fee-label-mini">International</span>
                        <span className="fee-label-mini">₹ 1000</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-14 action-row-premium justify-center lg:justify-start">
                  <button className="btn btn-amber-pill btn-pill">
                    <Download size={20} /> Conference Template (DOCX)
                  </button>
                  <Link to="/register" className="btn btn-primary btn-pill shadow-lg">
                    Register Now <ArrowRight size={20} />
                  </Link>
                </div>
              </div>

              {/* Vertical Timeline Pane */}
              <div className="vertical-timeline-connector">
                <div className="timeline-milestones">
                  <div className="milestone-item">
                    <div className="milestone-node"><Users size={22} /></div>
                    <div className="milestone-content">
                      <span className="ms-title">Abstract submission</span>
                      <span className="ms-date">March 8, 2026</span>
                    </div>
                  </div>
                  <div className="milestone-item">
                    <div className="milestone-node"><FileText size={22} /></div>
                    <div className="milestone-content">
                      <span className="ms-title">Full paper submission</span>
                      <span className="ms-date">March 16, 2026</span>
                    </div>
                  </div>
                  <div className="milestone-item">
                    <div className="milestone-node"><Award size={22} /></div>
                    <div className="milestone-content">
                      <span className="ms-title">Acceptance notification</span>
                      <span className="ms-date">March 24, 2026</span>
                    </div>
                  </div>
                  <div className="milestone-item">
                    <div className="milestone-node"><CheckCircle size={22} /></div>
                    <div className="milestone-content">
                      <span className="ms-title">Camera ready</span>
                      <span className="ms-date">April 2, 2026</span>
                    </div>
                  </div>
                  <div className="milestone-item">
                    <div className="milestone-node"><Sparkles size={22} /></div>
                    <div className="milestone-content">
                      <span className="ms-title">Payment confirmation deadline</span>
                      <span className="ms-date">April 12, 2026</span>
                    </div>
                  </div>
                  <div className="milestone-item active">
                    <div className="milestone-node"><GraduationCap size={22} /></div>
                    <div className="milestone-content">
                      <span className="ms-title">Conference date</span>
                      <span className="ms-date">April 29, 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section id="tracks" className="tracks-premium section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Academic Tracks</span>
            <h2 className="section-title">Research Focus Areas</h2>
            <p className="section-desc">We invite high-quality original research papers in the following tracks</p>
          </div>

          <div className="track-cards">
            {tracks.map((track, i) => (
              <motion.div 
                whileHover={{ y: -10 }}
                key={track.id} 
                className="track-card-premium glass"
              >
                <div className="track-number">{track.id}</div>
                {track.icon}
                <h3>{track.title}</h3>
                <p>{track.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Speakers Section */}
      <section id="speakers" className="speakers-section section-padding bg-light">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Experts</span>
            <h2 className="section-title">Keynote <span className="text-gradient">Speakers</span></h2>
            <p className="section-desc">Meet the visionary leaders sharing their insights at CIETM 2026.</p>
          </div>

          <div className="slider-container mt-5">
            <div 
              className="speakers-slider-track"
              style={{ '--scroll-duration': `${duration}s` }}
            >
              {[...speakers, ...speakers, ...speakers].map((s, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className="speaker-full-card glass"
                >
                  <div className="speaker-image-box">
                    <img src={s.img} alt={s.name} />
                    <div className="social-overlay">
                      <a href="#"><Linkedin size={18} /></a>
                      <a href="#"><Twitter size={18} /></a>
                      <a href="#"><Globe size={18} /></a>
                    </div>
                  </div>
                  <div className="speaker-info">
                    <div className="role-tag">{s.role}</div>
                    <h3>{s.name}</h3>
                    <span className="affiliation">{s.affiliation}</span>
                    <p>{s.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About College Section */}
      <section id="about" className="about-college-section section-padding">
        <div className="container">
          <div className="info-main-visual">
            <div className="info-img-full">
              <img src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80" alt="College Campus" />
              <div className="img-overlay-content">
                <span className="section-tag white-tag">Host Institution</span>
                <h2 className="section-title white-text">Coimbatore Institute of <span className="text-secondary">Engineering and Technology</span></h2>
                <p className="host-desc-overlay">The Coimbatore Institute of Engineering and Technology (CIET), Coimbatore, Tamilnadu (An Autonomous institute) was established in 2001 by the Kovai Kalaimagal Educational Trust (KKET) to provide quality education in Engineering, Technology and Management. CIET is affiliated to Anna University, approved by AICTE, accredited with 'A' Grade by NAAC.</p>
              </div>
              <div className="img-badge"><MapPin size={16} /> CIET Coimbatore</div>
            </div>
          </div>

          <div className="host-details-row mt-6">
            <div className="host-detail-item card cursor-default">
              <div className="feat-icon"><GraduationCap /></div>
              <div className="detail-text">
                <h4>Academic Scope</h4>
                <p>CIET offers 11 Under Graduate and a Post Graduate Engineering course including MBA-Business Administration.</p>
              </div>
            </div>
            <div className="host-detail-item card cursor-default">
              <div className="feat-icon"><Globe /></div>
              <div className="detail-text">
                <h4>Campus & Atmosphere</h4>
                <p>CIET is located in a green campus spreading over 25 acres with a picturesque and serene atmosphere surrounded by green hillocks.</p>
              </div>
            </div>
          </div>

          <div className="amenities-grid mt-6">
            <motion.div whileHover={{ y: -5 }} className="amenity-card shadow-sm">
              <MapPin className="amenity-icon" />
              <h3>Green Campus</h3>
              <p>Spreading over 25 acres, located 25 kms from Coimbatore city.</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="amenity-card shadow-sm">
              <Sparkles className="amenity-icon" />
              <h3>Serene Vibe</h3>
              <p>A picturesque atmosphere surrounded by beautiful green hillocks.</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="amenity-card shadow-sm">
              <Award className="amenity-icon" />
              <h3>NAAC 'A' Grade</h3>
              <p>Autonomous institute affiliated to Anna University and approved by AICTE.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="stats-premium">
        <div className="container stats-row">
          <div className="stat-unit">
            <h2>20+</h2>
            <p>Speaker Countries</p>
          </div>
          <div className="stat-unit">
            <h2>150+</h2>
            <p>Original Papers</p>
          </div>
          <div className="stat-unit">
            <h2>10+</h2>
            <p>Industry Partners</p>
          </div>
        </div>
      </section>
      
      {showScrollTop && (
        <button 
          className="scroll-top-btn"
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
