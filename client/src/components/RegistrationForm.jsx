import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ChevronRight, ChevronLeft, Upload, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const RegistrationForm = ({ startStep = 1, showAccountCreation = true, onSuccess }) => {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(startStep);
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [errors, setErrors] = useState({});
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    institution: 'Coimbatore Institute of Engineering and Technology',
    department: '',
    registerNumber: '',
    category: 'External Student',
    teamMembers: [],
    paperTitle: '',
    abstract: '',
    keywords: '',
    track: 'CIDT',
    paperFile: null,
    password: '',
    confirmPassword: '',
    fileUrl: '',
    publicId: '',
    resourceType: '',
    originalName: '',
    agreedToTerms: false
  });

  // Fetch draft on mount
  useEffect(() => {
    if (user) {
      const fetchDraft = async () => {
        try {
          const { data } = await axios.get('/api/registrations/my', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          if (data) {
            setFormData(prev => ({
              ...prev,
              name: data.personalDetails?.name || user.name,
              email: data.personalDetails?.email || user.email,
              mobile: data.personalDetails?.mobile || user.phone || '',
              institution: data.personalDetails?.institution || '',
              department: data.personalDetails?.department || '',
              registerNumber: data.personalDetails?.registerNumber || '',
              category: data.personalDetails?.category || 'External Student',
              teamMembers: data.teamMembers || [],
              paperTitle: data.paperDetails?.title || '',
              abstract: data.paperDetails?.abstract || '',
              keywords: data.paperDetails?.keywords?.join(', ') || '',
              track: data.paperDetails?.track || 'CIDT',
              fileUrl: data.paperDetails?.fileUrl || '',
              publicId: data.paperDetails?.publicId || '',
              resourceType: data.paperDetails?.resourceType || '',
              originalName: data.paperDetails?.originalName || ''
            }));
            
            // If starting from step 1 but user logged in and has draft/data
            if (step === 1) setStep(2);
          } else {
             // user logged in but no draft
             setFormData(prev => ({
              ...prev,
              name: user.name,
              email: user.email,
              mobile: user.phone || ''
            }));
            if (step === 1) setStep(2);
          }
        } catch (error) {
          console.error("Failed to fetch draft", error);
        }
      };
      fetchDraft();
    }
  }, [user]);

  // Timer for resend code
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: false });
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    let isValid = true;

    switch (currentStep) {
      case 1:
        if (showAccountCreation) {
          if (!formData.name) newErrors.name = true;
          if (!formData.email) newErrors.email = true;
          if (!formData.mobile) newErrors.mobile = true;
          if (!formData.password) newErrors.password = true;
          
          if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill in all required fields");
            return false;
          }
        }
        return true;
      case 2:
        if (!formData.institution) {
            setErrors({ institution: true });
            toast.error("Institution is required");
            return false;
        }
        if (!formData.department) {
            setErrors({ department: true });
            toast.error("Department is required");
            return false;
        }
        if (!formData.registerNumber) {
            setErrors({ registerNumber: true });
            toast.error("Register Number is required");
            return false;
        }
        return true;
      case 4:
        if (!formData.paperTitle) newErrors.paperTitle = true;
        if (!formData.abstract) newErrors.abstract = true;
        if (!formData.keywords) newErrors.keywords = true;
        if (!formData.fileUrl && !formData.paperFile) newErrors.paperFile = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill in all required paper details");
            return false;
        }
        return true;
      default:
        return true;
    }
  };


  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const uploadData = new FormData();
    uploadData.append('paper', file);

    try {
      const { data: uploadRes } = await axios.post('/api/registrations/upload', uploadData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`
        }
      });
      setFormData({ 
        ...formData, 
        paperFile: file, 
        fileUrl: uploadRes.url, 
        publicId: uploadRes.publicId,
        resourceType: uploadRes.resourceType,
        originalName: uploadRes.originalName
      });
      toast.success("File uploaded and saved to draft");
    } catch (error) {
      toast.error("File upload failed");
    } finally {
      setLoading(false);
    }
  };

  const addTeamMember = () => {
    setFormData({
      ...formData,
      teamMembers: [...formData.teamMembers, { name: '', email: '', affiliation: '' }]
    });
  };

  const updateTeamMember = (index, field, value) => {
    const updated = [...formData.teamMembers];
    updated[index][field] = value;
    setFormData({ ...formData, teamMembers: updated });
  };

  const handleSaveDraft = async () => {
    if (!user) return; 
    
    try {
      await axios.post('/api/registrations/draft', {
        personalDetails: {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          institution: formData.institution,
          department: formData.department,
          registerNumber: formData.registerNumber,
          category: formData.category
        },
        teamMembers: formData.teamMembers,
        paperDetails: {
          title: formData.paperTitle,
          abstract: formData.abstract,
          keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
          track: formData.track,
          fileUrl: formData.fileUrl,
          publicId: formData.publicId,
          resourceType: formData.resourceType,
          originalName: formData.originalName
        }
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
    } catch (error) {
      console.error("Draft save failed", error);
    }
  };

  const nextStep = async () => {
    // Validate current step before proceeding
    if (!validateStep(step)) return;

    if (step === 1 && !user && showAccountCreation) {
      // Account Creation
      if (formData.password !== formData.confirmPassword) {
        return toast.error("Passwords don't match");
      }
      setLoading(true);
      try {
        const response = await axios.post('/api/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.mobile,
          role: 'author'
        });
        
        setShowVerification(true);
        setResendTimer(60); 
        toast.success(response.data.message || "Verification code sent to your email!");
      } catch (error) {
        toast.error(error.response?.data?.message || "Account creation failed");
      } finally {
        setLoading(false);
      }
    } else {
      // Save draft and move to next step
      await handleSaveDraft();
      setStep(step + 1);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      return toast.error("Please enter the 6-digit code");
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/verify-email', {
        email: formData.email,
        code: verificationCode
      });

      updateUser(response.data);
      toast.success("Email verified successfully!");
      
      setShowVerification(false);
      setStep(2);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await axios.post('/api/auth/resend-verification', {
        email: formData.email
      });
      setResendTimer(60);
      toast.success("New verification code sent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => setStep(step - 1);

  const handleSkip = async () => {
    // Skip does NOT validate, just saves draft and moves next
    setLoading(true);
    try {
      await handleSaveDraft();
      setStep(step + 1);
    } catch (error) {
      console.error("Skip failed", error);
      // Even if save fails, move next? Maybe better to stay or warn. 
      // For now, let's just move next to not block user.
      setStep(step + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.agreedToTerms) {
        return toast.error("You must agree to the terms and conditions");
    }

    setLoading(true);
    try {
      await handleSaveDraft();
      
      await axios.post('/api/registrations/submit', {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      toast.success('Registration submitted successfully!');
      if (onSuccess) {
          onSuccess();
      } else {
          navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Final submission failed');
    } finally {
      setLoading(false);
    }
  };

  const hostColleges = [
    "Coimbatore Institute of Engineering and Technology",
    "Coimbatore Institute of Management and Technology",
    "Kovai Kalaimagal Arts and Science College"
  ];

  const isHostInstitution = hostColleges.includes(formData.institution);

  // Helper classes
  const labelClass = "block mb-2 font-bold text-slate-800 text-sm";
  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 text-sm";
  const errorInputClass = "border-red-500 focus:border-red-500 focus:ring-red-500/10";
  const groupClass = "mb-4";

  return (
    <div className="flex flex-col h-full overflow-hidden">
        <div className="mb-8 pt-4 shrink-0">
          <p className="flex justify-between text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
            <span>Step {step} of 5</span>
            <span className="text-indigo-600">{Math.round((step / 5) * 100)}% Completed</span>
          </p>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${(step / 5) * 100}%` }}></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 mb-4 flex flex-col custom-scrollbar">
          {step === 1 && showAccountCreation && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 shrink-0">Step 1: Account Creation</h2>
              
              {!showVerification ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div className={groupClass}>
                      <label className={labelClass}>Full Name</label>
                      <input name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" className={`${inputClass} ${errors.name ? errorInputClass : ''}`} />
                    </div>
                    <div className={groupClass}>
                      <label className={labelClass}>Mobile</label>
                      <input name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile number" className={`${inputClass} ${errors.mobile ? errorInputClass : ''}`} />
                    </div>
                  </div>

                  <div className={groupClass}>
                    <label className={labelClass}>Email</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" className={`${inputClass} ${errors.email ? errorInputClass : ''}`} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div className={groupClass}>
                      <label className={labelClass}>Password</label>
                      <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Create password" className={`${inputClass} ${errors.password ? errorInputClass : ''}`} />
                    </div>
                    <div className={groupClass}>
                      <label className={labelClass}>Confirm Password</label>
                      <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" className={inputClass} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center max-w-md mx-auto my-4 animate-in zoom-in duration-300 flex flex-col justify-center h-full">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 shrink-0">
                    <CheckCircle size={48} className="text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Verify Your Email</h3>
                  <p className="text-slate-500 mb-6">
                    We've sent a 6-digit verification code to<br />
                    <strong>{formData.email}</strong>
                  </p>
                  <div className={groupClass}>
                    <label className={labelClass}>Enter Verification Code</label>
                    <input 
                      type="text" 
                      maxLength="6" 
                      value={verificationCode} 
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className={`${inputClass} font-mono font-bold text-indigo-600 border-slate-300 text-center text-2xl tracking-[0.5em] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15`}
                    />
                  </div>
                  <button 
                    onClick={handleVerifyEmail} 
                    className="btn btn-primary w-full mb-4 py-3"
                    disabled={loading || verificationCode.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>
                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-slate-400 text-sm">
                        Resend code in {resendTimer}s
                      </p>
                    ) : (
                      <button 
                        onClick={handleResendCode} 
                        className="text-indigo-600 font-semibold text-sm hover:text-indigo-700 hover:underline bg-transparent border-none cursor-pointer"
                        disabled={loading}
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}


          {step === 2 && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 shrink-0">Step 2: Institutional Details</h2>
              
              <div className={groupClass}>
                <label className={labelClass}>Institution Details</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div 
                        className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 flex items-center gap-4 bg-white hover:border-slate-300 hover:bg-slate-50 relative overflow-hidden group ${isHostInstitution ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-500/10' : 'border-slate-200'}`}
                        onClick={() => setFormData({...formData, institution: hostColleges[0], category: 'Inter-college Student'})}
                    >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isHostInstitution ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                            <div className={`w-2 h-2 bg-white rounded-full transition-all ${isHostInstitution ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-bold text-sm mb-0.5 ${isHostInstitution ? 'text-indigo-700' : 'text-slate-800'}`}>Host Institution</span>
                            <span className="text-xs text-slate-500">Select from CIET Institutions</span>
                        </div>
                    </div>

                    <div 
                        className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 flex items-center gap-4 bg-white hover:border-slate-300 hover:bg-slate-50 relative overflow-hidden group ${!isHostInstitution ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-500/10' : 'border-slate-200'}`}
                        onClick={() => setFormData({...formData, institution: '', category: 'External Student'})}
                    >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${!isHostInstitution ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                            <div className={`w-2 h-2 bg-white rounded-full transition-all ${!isHostInstitution ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-bold text-sm mb-0.5 ${!isHostInstitution ? 'text-indigo-700' : 'text-slate-800'}`}>External Institution</span>
                            <span className="text-xs text-slate-500">Other College or Organization</span>
                        </div>
                    </div>
                </div>

                {isHostInstitution ? (
                    <div className="animate-in slide-in-from-top-2 duration-300 mt-2">
                        <label className="text-sm text-slate-500 mb-1 block">Select College</label>
                        <select 
                            name="institution" 
                            value={formData.institution} 
                            onChange={handleChange}
                            className={`${inputClass} cursor-pointer`}
                        >
                            {hostColleges.map((college, idx) => (
                                <option key={idx} value={college}>{college}</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                        <label className={labelClass}>Enter College Name</label>
                        <input 
                            name="institution" 
                            value={formData.institution} 
                            onChange={handleChange} 
                            placeholder="e.g. PSG College of Technology" 
                            autoFocus
                            className={`${inputClass} border-indigo-500 bg-white ring-4 ring-indigo-500/10`}
                        />
                    </div>
                )}
              </div>

               <div className={`${groupClass} animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100`}>
                <label className={labelClass}>Department <span className="text-red-500">*</span></label>
                <input 
                    name="department" 
                    value={formData.department} 
                    onChange={handleChange} 
                    placeholder="e.g. Computer Science and Engineering" 
                    className={`${inputClass} ${errors.department ? errorInputClass : ''}`}
                />
              </div>

              <div className={`${groupClass} animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200`}>
                <label className={labelClass}>Register Number <span className="text-red-500">*</span></label>
                <input 
                    name="registerNumber" 
                    value={formData.registerNumber} 
                    onChange={handleChange} 
                    placeholder="e.g. 710012345678" 
                    className={`${inputClass} ${errors.registerNumber ? errorInputClass : ''}`}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <h2 className="text-2xl font-bold text-slate-900 mb-2 shrink-0">Step 3: Team Details</h2>
              <p className="text-slate-500 mb-6">Add co-authors if any.</p>
              {formData.teamMembers.map((m, i) => (
                <div key={i} className="mb-6 p-6 bg-slate-50 rounded-xl border border-slate-200 relative transition-all duration-300 hover:border-slate-300 hover:shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Co-author {i + 1}</h4>
                    <button 
                        onClick={() => {
                            const newMembers = [...formData.teamMembers];
                            newMembers.splice(i, 1);
                            setFormData({...formData, teamMembers: newMembers});
                        }}
                        className="text-red-500 text-xs font-semibold hover:text-red-700 hover:underline transition-colors bg-transparent border-none cursor-pointer"
                    >
                        Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Name" value={m.name} onChange={(e) => updateTeamMember(i, 'name', e.target.value)} className={inputClass} />
                      <input placeholder="Email" value={m.email} onChange={(e) => updateTeamMember(i, 'email', e.target.value)} className={inputClass} />
                      <input placeholder="Institution" value={m.affiliation} onChange={(e) => updateTeamMember(i, 'affiliation', e.target.value)} className={inputClass} />
                      <input placeholder="Department" value={m.department} onChange={(e) => updateTeamMember(i, 'department', e.target.value)} className={inputClass} />
                      <input placeholder="Register Number" value={m.registerNumber} onChange={(e) => updateTeamMember(i, 'registerNumber', e.target.value)} className={inputClass} />
                  </div>
                </div>
              ))}
              <button onClick={addTeamMember} className="btn btn-outline w-full md:w-auto">+ Add Co-author</button>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 shrink-0">Step 4: Paper Details</h2>
              <div className={groupClass}>
                <label className={labelClass}>Paper Title <span className="text-red-500">*</span></label>
                <input 
                    name="paperTitle" 
                    value={formData.paperTitle} 
                    onChange={handleChange} 
                    className={`${inputClass} ${errors.paperTitle ? errorInputClass : ''}`}
                />
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Select Track</label>
                <select name="track" value={formData.track} onChange={handleChange} className={inputClass}>
                  <option value="CIDT">Track 1: Computing, Intelligence & Digital Technologies</option>
                  <option value="ESSI">Track 2: Engineering, Science & Sustainable Innovations</option>
                  <option value="EAHSS">Track 3: Education, Arts, Humanities & Social Sciences</option>
                  <option value="MBHSD">Track 4: Management, Business & Health Sciences</option>
                </select>
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Abstract <span className="text-red-500">*</span></label>
                <textarea 
                    name="abstract" 
                    value={formData.abstract} 
                    onChange={handleChange} 
                    rows="4"
                    className={`${inputClass} ${errors.abstract ? errorInputClass : ''}`}
                ></textarea>
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Keywords (comma separated) <span className="text-red-500">*</span></label>
                <input 
                    name="keywords" 
                    value={formData.keywords} 
                    onChange={handleChange}
                    className={`${inputClass} ${errors.keywords ? errorInputClass : ''}`}
                />
              </div>
              <div className={groupClass}>
                <label className={labelClass}>Upload Paper (PDF only) <span className="text-red-500">*</span></label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer relative transition-all duration-300 flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-indigo-500 hover:bg-indigo-50/30 hover:text-indigo-600 ${errors.paperFile ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-300'}`}
                >
                  <Upload size={24} />
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <span>{formData.paperFile ? formData.paperFile.name : formData.fileUrl ? 'File already uploaded' : 'Select PDF file'}</span>
                </div>
                {formData.fileUrl && <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1"><CheckCircle size={12} /> File saved in draft</p>}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center animate-in fade-in zoom-in-95 duration-300">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 shrink-0">Step 5: Review & Confirm</h2>
              <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 text-left">
                <p className="flex justify-between mb-2 pb-2 border-b border-slate-100">
                  <strong className="text-slate-700">Paper Title:</strong> 
                  <span className="text-slate-900 font-medium truncate ml-4 max-w-[200px]">{formData.paperTitle || 'Untitled'}</span>
                </p>
                <p className="flex justify-between mb-4">
                  <strong className="text-slate-700">Registration Fee:</strong> 
                  <span className="text-slate-900 font-black">{formData.category === 'Inter-college Student' ? '₹500' : '₹1000'}</span>
                </p>
                <p className="text-xs text-slate-500 italic mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  Note: Final submission will lock your details for review. Please make sure all information is correct.
                </p>
              </div>
              <div className="mt-8 flex justify-center">
                <label className={`flex items-center cursor-pointer justify-center text-sm font-semibold select-none ${errors.terms ? 'text-red-500' : 'text-slate-600'}`}>
                  <input 
                    type="checkbox" 
                    checked={formData.agreedToTerms}
                    onChange={(e) => {
                        setFormData({ ...formData, agreedToTerms: e.target.checked });
                        if (errors.terms) setErrors({ ...errors, terms: false });
                    }}
                    className="mr-2 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  /> 
                  I agree to the conference terms and conditions.
                </label>
              </div>
            </div>
          )}
        </div>

        {!showVerification && (
          <div className="flex justify-between mt-auto pt-6 pb-4 border-t border-slate-100 bg-white shrink-0 z-20">
            {step > (showAccountCreation ? 1 : 2) && (
              <button 
                onClick={prevStep} 
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-2 border-none cursor-pointer"
              >
                <ChevronLeft size={18} /> Back
              </button>
            )}
            
            {step > 1 && step < 5 && (
                <button 
                  onClick={handleSkip} 
                  className="px-4 py-2 text-slate-400 font-semibold hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors ml-4 mr-auto text-sm border-none cursor-pointer"
                >
                    Skip for now
                </button>
            )}

            {step < 5 ? (
              <button 
                onClick={nextStep} 
                className="btn btn-primary ml-auto"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Next >'}
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn btn-primary ml-auto" disabled={loading}>
                {loading ? 'Submitting...' : 'Complete Registration'}
              </button>
            )}
          </div>
        )}
    </div>
  );
};

export default RegistrationForm;
