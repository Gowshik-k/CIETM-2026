import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ChevronRight, ChevronLeft, Upload, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './RegistrationForm.css';

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

  return (
    <div className="registration-form-content">
        <div className="form-header">
          <p className="step-indicator">Step {step} of 5</p>
          <div className="progress-bar-mini">
            <div className="progress-fill" style={{ width: `${(step / 5) * 100}%` }}></div>
          </div>
        </div>

        <div className="step-content">
          {step === 1 && showAccountCreation && (
            <div className="step-fade">
              <h2>Step 1: Account Creation</h2>
              
              {!showVerification ? (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" />
                    </div>
                    <div className="form-group">
                      <label>Mobile</label>
                      <input name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile number" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Password</label>
                      <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Create password" />
                    </div>
                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="verification-section">
                  <div className="verification-icon">
                    <CheckCircle size={48} className="text-primary" />
                  </div>
                  <h3>Verify Your Email</h3>
                  <p className="text-muted mb-4">
                    We've sent a 6-digit verification code to<br />
                    <strong>{formData.email}</strong>
                  </p>
                  <div className="form-group">
                    <label>Enter Verification Code</label>
                    <input 
                      type="text" 
                      maxLength="6" 
                      value={verificationCode} 
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="verification-input"
                      style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                    />
                  </div>
                  <button 
                    onClick={handleVerifyEmail} 
                    className="btn btn-primary w-full mb-3"
                    disabled={loading || verificationCode.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>
                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-muted text-sm">
                        Resend code in {resendTimer}s
                      </p>
                    ) : (
                      <button 
                        onClick={handleResendCode} 
                        className="btn btn-text"
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
            <div className="step-fade">
              <h2>Step 2: Institutional Details</h2>
              
              <div className="form-group">
                <label>Institution Details</label>
                <div className="institution-options">
                    <div 
                        className={`option-card ${isHostInstitution ? 'selected' : ''}`}
                        onClick={() => setFormData({...formData, institution: hostColleges[0]})}
                    >
                        <div className="option-radio">
                            <div className="radio-inner"></div>
                        </div>
                        <div className="option-content">
                            <span className="option-title">Host Institution</span>
                            <span className="option-desc">Select from CIET Institutions</span>
                        </div>
                    </div>

                    <div 
                        className={`option-card ${!isHostInstitution ? 'selected' : ''}`}
                        onClick={() => setFormData({...formData, institution: ''})}
                    >
                        <div className="option-radio">
                            <div className="radio-inner"></div>
                        </div>
                        <div className="option-content">
                            <span className="option-title">External Institution</span>
                            <span className="option-desc">Other College or Organization</span>
                        </div>
                    </div>
                </div>

                {isHostInstitution ? (
                    <div className="animate-fade-in mt-2">
                        <label className="text-sm text-muted mb-1 block">Select College</label>
                        <select 
                            name="institution" 
                            value={formData.institution} 
                            onChange={handleChange}
                            className="custom-select"
                        >
                            {hostColleges.map((college, idx) => (
                                <option key={idx} value={college}>{college}</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div className="external-input-wrapper fade-in">
                        <label>Enter College Name</label>
                        <input 
                            name="institution" 
                            value={formData.institution} 
                            onChange={handleChange} 
                            placeholder="e.g. PSG College of Technology" 
                            autoFocus
                            className="external-input"
                        />
                    </div>
                )}
              </div>

               <div className="form-group animate-fade-in">
                <label>Department <span className="text-red-500">*</span></label>
                <input 
                    name="department" 
                    value={formData.department} 
                    onChange={handleChange} 
                    placeholder="e.g. Computer Science and Engineering" 
                    className={errors.department ? 'input-error' : ''}
                />
              </div>

              <div className="form-group animate-fade-in">
                <label>Register Number <span className="text-red-500">*</span></label>
                <input 
                    name="registerNumber" 
                    value={formData.registerNumber} 
                    onChange={handleChange} 
                    placeholder="e.g. 710012345678" 
                    className={errors.registerNumber ? 'input-error' : ''}
                />
              </div>





            </div>
          )}

          {step === 3 && (
            <div className="step-fade">
              <h2>Step 3: Team Details</h2>
              <p>Add co-authors if any.</p>
              {formData.teamMembers.map((m, i) => (
                <div key={i} className="team-member-row card">
                  <div className="team-member-header">
                    <h4 className="team-member-title">Co-author {i + 1}</h4>
                    <button 
                        onClick={() => {
                            const newMembers = [...formData.teamMembers];
                            newMembers.splice(i, 1);
                            setFormData({...formData, teamMembers: newMembers});
                        }}
                        className="remove-member-btn"
                    >
                        Remove
                    </button>
                  </div>
                  <div className="team-member-grid">
                      <input placeholder="Name" value={m.name} onChange={(e) => updateTeamMember(i, 'name', e.target.value)} />
                      <input placeholder="Email" value={m.email} onChange={(e) => updateTeamMember(i, 'email', e.target.value)} />
                      <input placeholder="Institution" value={m.affiliation} onChange={(e) => updateTeamMember(i, 'affiliation', e.target.value)} />
                      <input placeholder="Department" value={m.department} onChange={(e) => updateTeamMember(i, 'department', e.target.value)} />
                      <input placeholder="Register Number" value={m.registerNumber} onChange={(e) => updateTeamMember(i, 'registerNumber', e.target.value)} />
                  </div>
                </div>
              ))}
              <button onClick={addTeamMember} className="btn btn-outline">+ Add Co-author</button>
            </div>
          )}

          {step === 4 && (
            <div className="step-fade">
              <h2>Step 4: Paper Details</h2>
              <div className="form-group">
                <label>Paper Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                    name="paperTitle" 
                    value={formData.paperTitle} 
                    onChange={handleChange} 
                    className={errors.paperTitle ? 'input-error' : ''}
                />
              </div>
              <div className="form-group">
                <label>Select Track</label>
                <select name="track" value={formData.track} onChange={handleChange}>
                  <option value="CIDT">Track 1: Computing, Intelligence & Digital Technologies</option>
                  <option value="ESSI">Track 2: Engineering, Science & Sustainable Innovations</option>
                  <option value="EAHSS">Track 3: Education, Arts, Humanities & Social Sciences</option>
                  <option value="MBHSD">Track 4: Management, Business & Health Sciences</option>
                </select>
              </div>
              <div className="form-group">
                <label>Abstract <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea 
                    name="abstract" 
                    value={formData.abstract} 
                    onChange={handleChange} 
                    rows="4"
                    className={errors.abstract ? 'input-error' : ''}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Keywords (comma separated) <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                    name="keywords" 
                    value={formData.keywords} 
                    onChange={handleChange}
                    className={errors.keywords ? 'input-error' : ''}
                />
              </div>
              <div className="form-group">
                <label>Upload Paper (PDF only) <span style={{ color: '#ef4444' }}>*</span></label>
                <div className={`file-upload ${errors.paperFile ? 'upload-error' : ''}`} style={errors.paperFile ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}>
                  <Upload size={24} />
                  <input type="file" accept=".pdf" onChange={handleFileChange} />
                  <span>{formData.paperFile ? formData.paperFile.name : formData.fileUrl ? 'File already uploaded' : 'Select PDF file'}</span>
                </div>
                {formData.fileUrl && <p className="text-xs text-emerald-600 mt-1">✓ File saved in draft</p>}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="step-fade text-center">
              <h2>Step 5: Review & Confirm</h2>
              <div className="review-box card">
                <p><strong>Paper Title:</strong> {formData.paperTitle || 'Untitled'}</p>
                <p><strong>Registration Fee:</strong> {formData.category === 'Inter-college Student' ? '₹500' : '₹1000'}</p>
                <p className="hint">Note: Final submission will lock your details for review.</p>
              </div>
              <div className="terms">
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: errors.terms ? '#ef4444' : 'inherit', justifyContent: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.agreedToTerms}
                    onChange={(e) => {
                        setFormData({ ...formData, agreedToTerms: e.target.checked });
                        if (errors.terms) setErrors({ ...errors, terms: false });
                    }}
                    style={{ marginRight: '0.5rem', width: 'auto' }}
                  /> 
                  I agree to the conference terms and conditions.
                </label>
              </div>
            </div>
          )}
        </div>

        {!showVerification && (
          <div className="step-actions">
            {step > (showAccountCreation ? 1 : 2) && <button onClick={prevStep} className="btn btn-secondary"><ChevronLeft size={18} /> Back</button>}
            
            {step > 1 && step < 5 && (
                <button 
                  onClick={handleSkip} 
                  className="btn btn-ghost" 
                  style={{ marginLeft: '1rem', marginRight: 'auto', color: '#64748b' }}
                >
                    Skip for now
                </button>
            )}

            {step < 5 ? (
              <button 
                onClick={nextStep} 
                className="btn btn-primary" 
                style={{ marginLeft: step <= (showAccountCreation ? 1 : 2) ? 'auto' : '0' }} 
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Next >'}
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn btn-primary" style={{ marginLeft: 'auto' }} disabled={loading}>
                {loading ? 'Submitting...' : 'Complete Registration'}
              </button>
            )}
          </div>
        )}
    </div>
  );
};

export default RegistrationForm;
