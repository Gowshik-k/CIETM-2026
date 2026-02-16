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
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    institution: '',
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
    originalName: ''
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
              category: data.personalDetails?.category || 'External Student',
              teamMembers: data.teamMembers || [],
              paperTitle: data.paperDetails?.title || '',
              abstract: data.paperDetails?.abstract || '',
              keywords: data.paperDetails?.keywords?.join(', ') || '',
              track: data.paperDetails?.track || 'CIDT',
              fileUrl: data.paperDetails?.fileUrl || '',
              publicId: data.paperDetails?.publicId || '',
              resourceType: data.paperDetails?.resourceType || ''
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

  const handleSubmit = async () => {
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
                <label>Institution</label>
                <input name="institution" value={formData.institution} onChange={handleChange} placeholder="College/Organization" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="Inter-college Student">Inter-college Student</option>
                  <option value="External Student">External Student</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-fade">
              <h2>Step 3: Team Details</h2>
              <p>Add co-authors if any.</p>
              {formData.teamMembers.map((m, i) => (
                <div key={i} className="team-member-row card">
                  <input placeholder="Name" value={m.name} onChange={(e) => updateTeamMember(i, 'name', e.target.value)} />
                  <input placeholder="Email" value={m.email} onChange={(e) => updateTeamMember(i, 'email', e.target.value)} />
                  <input placeholder="Affiliation" value={m.affiliation} onChange={(e) => updateTeamMember(i, 'affiliation', e.target.value)} />
                </div>
              ))}
              <button onClick={addTeamMember} className="btn btn-outline">+ Add Co-author</button>
            </div>
          )}

          {step === 4 && (
            <div className="step-fade">
              <h2>Step 4: Paper Details</h2>
              <div className="form-group">
                <label>Paper Title</label>
                <input name="paperTitle" value={formData.paperTitle} onChange={handleChange} />
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
                <label>Abstract</label>
                <textarea name="abstract" value={formData.abstract} onChange={handleChange} rows="4"></textarea>
              </div>
              <div className="form-group">
                <label>Keywords (comma separated)</label>
                <input name="keywords" value={formData.keywords} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Upload Paper (PDF only)</label>
                <div className="file-upload">
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
                <label>
                  <input type="checkbox" required /> I agree to the conference terms and conditions.
                </label>
              </div>
            </div>
          )}
        </div>

        {!showVerification && (
          <div className="step-actions">
            {step > (showAccountCreation ? 1 : 2) && <button onClick={prevStep} className="btn btn-secondary"><ChevronLeft size={18} /> Back</button>}
            {step < 5 ? (
              <button onClick={nextStep} className="btn btn-primary" style={{ marginLeft: 'auto' }} disabled={loading}>
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
