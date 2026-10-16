import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import { fallbackJobs } from '../data/fallbackJobs';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import {
  MapPin, Clock, Briefcase, Calendar, Users, DollarSign,
  ArrowLeft, Upload, Check, ChevronRight, Share2, Award, ShieldCheck
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const buildJobPostingSchema = (job, currentId) => {
  if (!job || job.id === 'general') return null;

  const jobSlug = currentId || generateSlug(job.title) || job.id;
  const canonicalUrl = `https://www.macenza.com/careers/${jobSlug}`;

  // Build clean HTML description from visible job information
  let descriptionHtml = `<p>${job.description || ''}</p>`;
  if (job.skills) {
    const skillsList = job.skills.split(',').map(s => `<li>${s.trim()}</li>`).join('');
    descriptionHtml += `<h3>Core Skills &amp; Technologies</h3><ul>${skillsList}</ul>`;
  }
  if (job.requirements) {
    const reqsList = job.requirements.split(',').map(r => `<li>${r.trim()}</li>`).join('');
    descriptionHtml += `<h3>Responsibilities &amp; Requirements</h3><ul>${reqsList}</ul>`;
  }
  if (job.benefits) {
    const benefitsList = job.benefits.split(',').map(b => `<li>${b.trim()}</li>`).join('');
    descriptionHtml += `<h3>Skills &amp; Benefits</h3><ul>${benefitsList}</ul>`;
  }

  // Employment Type Mapping
  const typeStr = (job.employmentType || job.type || '').toUpperCase();
  let employmentType = 'FULL_TIME';
  if (typeStr.includes('INTERN')) employmentType = 'INTERN';
  else if (typeStr.includes('PART')) employmentType = 'PART_TIME';
  else if (typeStr.includes('CONTRACT')) employmentType = 'CONTRACTOR';
  else if (typeStr.includes('TEMP')) employmentType = 'TEMPORARY';

  // Date Posted & Expiry
  const datePosted = job.datePosted || (job.created_at ? new Date(job.created_at).toISOString().split('T')[0] : '2026-08-01');
  let validThrough = job.validThrough;
  if (!validThrough && job.deadline && job.deadline !== 'Flexible' && job.deadline !== 'Always Open') {
    validThrough = `${job.deadline}T23:59:59+05:30`;
  }

  // Parse visible salary if numeric
  let baseSalary = null;
  if (job.salary && typeof job.salary === 'string') {
    const salaryStr = job.salary.replace(/,/g, '');
    const matches = salaryStr.match(/\d+/g);
    if (matches && matches.length > 0) {
      const currency = salaryStr.includes('₹') || salaryStr.toLowerCase().includes('inr') ? 'INR' : 'USD';
      let unitText = 'MONTH';
      if (salaryStr.toLowerCase().includes('year') || salaryStr.toLowerCase().includes('yr') || salaryStr.toLowerCase().includes('annual')) {
        unitText = 'YEAR';
      }
      const numbers = matches.map(n => parseInt(n, 10));
      if (numbers.length >= 2) {
        baseSalary = {
          '@type': 'MonetaryAmount',
          currency,
          value: {
            '@type': 'QuantitativeValue',
            minValue: Math.min(...numbers),
            maxValue: Math.max(...numbers),
            unitText
          }
        };
      } else if (numbers.length === 1) {
        baseSalary = {
          '@type': 'MonetaryAmount',
          currency,
          value: {
            '@type': 'QuantitativeValue',
            value: numbers[0],
            unitText
          }
        };
      }
    }
  }

  // Remote vs physical location
  const isRemote = !job.location || job.location.toLowerCase().includes('remote') || job.location.toLowerCase().includes('telecommute');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': job.title,
    'description': descriptionHtml,
    'datePosted': datePosted,
    ...(validThrough ? { 'validThrough': validThrough } : {}),
    'employmentType': employmentType,
    'hiringOrganization': {
      '@type': 'Organization',
      'name': 'Macenza',
      'sameAs': 'https://www.macenza.com/',
      'logo': 'https://www.macenza.com/logo.svg'
    },
    'identifier': {
      '@type': 'PropertyValue',
      'name': 'Macenza',
      'value': String(job.id || job._id || jobSlug)
    },
    'directApply': true,
    'mainEntityOfPage': canonicalUrl
  };

  if (isRemote) {
    schema.jobLocationType = 'TELECOMMUTE';
    schema.applicantLocationRequirements = {
      '@type': 'Country',
      'name': 'India'
    };
    schema.jobLocation = {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressCountry': 'IN'
      }
    };
  } else {
    schema.jobLocation = {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': job.location,
        'addressCountry': 'IN'
      }
    };
  }

  if (baseSalary) {
    schema.baseSalary = baseSalary;
  }

  return schema;
};

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const hcaptchaRef = useRef(null);
  const [hcaptchaToken, setHcaptchaToken] = useState('');

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  // Form State
  const initialFormState = {
    candidateName: '',
    email: '',
    phone: '',
    location: '',
    experience: '',
    linkedInUrl: '',
    portfolioUrl: '',
    coverLetter: '',
    agreeToTerms: false,
    agreeToFutureRecruitment: false,
    honeypot: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // Fetch job details
  useEffect(() => {
    window.scrollTo(0, 0);

    const getJobDetails = async () => {
      setLoading(true);
      try {
        if (id === 'general' || id === 'general-application') {
          setJob({
            id: 'general',
            title: 'General Application',
            department: 'All Departments',
            location: 'Remote',
            type: 'Full Time / Part Time / Internship',
            experience: 'Any Experience Level',
            salary: 'Competitive / Project-based',
            openings: 'Multiple',
            deadline: 'Always Open',
            skills: 'Problem Solving, Adaptability, Collaboration, Communication',
            description: "Don't see a specific role that matches your skills but still want to join Macenza? Submit a general application here. Tell us what you are good at, what projects you've worked on, and how you see yourself contributing to our mission.",
            requirements: "A passion for innovation and building intelligent applications, excellent communication skills, ability to work independently in a remote layout, and strong problem-solving mindset.",
            benefits: "Flexible hours, work from anywhere, access to premium learning resources, state-of-the-art tooling, and opportunities to build founding features."
          });
          setLoading(false);
          return;
        }

        // Fetch active jobs from Supabase and match on sluggified title
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'Active');

        if (error) throw error;

        let matchedJob = null;
        if (data && data.length > 0) {
          matchedJob = data.find(
            j => generateSlug(j.title) === id || String(j.id) === id || String(j._id) === id
          );
        }

        if (matchedJob) {
          setJob(matchedJob);
        } else {
          // Check fallback list
          const matchedFallback = fallbackJobs.find(
            j => j.id === id || generateSlug(j.title) === id
          );
          if (matchedFallback) {
            setJob(matchedFallback);
          } else {
            setJob(null);
          }
        }
      } catch (err) {
        console.warn("Supabase lookup failed or not set up. Falling back to mock jobs.", err);
        const matchedFallback = fallbackJobs.find(
          j => j.id === id || generateSlug(j.title) === id
        );
        if (matchedFallback) {
          setJob(matchedFallback);
        } else {
          setJob(null);
        }
      } finally {
        setLoading(false);
      }
    };

    getJobDetails();
  }, [id]);

  // GSAP animation
  useEffect(() => {
    if (!loading && job) {
      const ctx = gsap.context(() => {
        gsap.from(".animate-fade-in", {
          opacity: 0,
          y: 30,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out"
        });

        gsap.from(".animate-sidebar", {
          opacity: 0,
          x: 40,
          duration: 1,
          ease: "power3.out",
          delay: 0.3
        });
      }, pageRef);

      return () => ctx.revert();
    }
  }, [loading, job]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        const errorMsg = 'File is too large. Resumes must be smaller than 5MB.';
        setSubmitError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Validate extension and strict MIME types
      const ext = file.name.split('.').pop().toLowerCase();
      const validExtensions = ['pdf', 'doc', 'docx'];
      const validMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      const isValidMime = validMimeTypes.includes(file.type);
      const isValidExt = validExtensions.includes(ext);

      if (isValidExt && isValidMime) {
        setResumeFile(file);
        setSubmitError('');
      } else {
        const errorMsg = 'Invalid file format. Please upload a valid PDF, DOC, or DOCX resume.';
        setSubmitError(errorMsg);
        toast.error(errorMsg);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      const err = 'Please agree to the Privacy Policy and Terms & Conditions to submit your application.';
      setSubmitError(err);
      toast.error(err);
      return;
    }

    if (!resumeFile) {
      const err = 'Please upload your resume to submit your application.';
      setSubmitError(err);
      toast.error(err);
      return;
    }

    // Honeypot spam prevention check
    if (formData.honeypot) {
      console.warn("Spam submission blocked via honeypot.");
      setSubmitSuccess(true);
      return;
    }

    // hCaptcha verification check
    const token = hcaptchaToken || (hcaptchaRef.current ? hcaptchaRef.current.getResponse() : '');
    if (!token) {
      const err = 'Please verify that you are not a robot.';
      setSubmitError(err);
      toast.error(err);
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      // 1. Upload resume to Supabase Storage Bucket 'resumes'
      const fileExt = resumeFile.name.split('.').pop().toLowerCase();
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile);

      if (uploadError) {
        throw new Error(`Resume upload failed: ${uploadError.message}`);
      }

      // 2. Get the public URL of the uploaded resume
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      // 3. Save application entry via secure serverless endpoint
      const res = await fetch('/api/submit-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateName: formData.candidateName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          experience: formData.experience,
          linkedInUrl: formData.linkedInUrl,
          portfolioUrl: formData.portfolioUrl,
          coverLetter: formData.coverLetter,
          resumeUrl: publicUrl,
          jobId: (job && (job.id || job._id)) !== 'general' ? (job.id || job._id) : null,
          captchaToken: token
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Server error occurred during submission.');
      }

      setSubmitSuccess(true);
      toast.success('Application submitted successfully!');
      setFormData(initialFormState);
      setResumeFile(null);
      hcaptchaRef.current?.resetCaptcha();
      setHcaptchaToken('');
    } catch (err) {
      console.error(err);
      const errorMsg = err.message || 'Submission failed. Please check entries.';
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Job details link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-6">
        <h2 className="text-3xl font-black mb-4">Job Posting Not Found</h2>
        <p className="text-black/60 mb-8 max-w-md text-center">
          The job application page you are looking for may have been closed or removed.
        </p>
        <Link
          to="/careers"
          className="px-8 py-4 bg-primary text-white rounded-full font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all duration-300 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Careers
        </Link>
      </div>
    );
  }

  const jobSchema = buildJobPostingSchema(job, id);

  return (
    <div ref={pageRef} className="bg-white text-black min-h-screen relative pt-32">
      <SEO
        title={job?.title ? `${job.title} | Macenza Careers` : 'Job Details | Macenza Careers'}
        description={job?.description ? job.description.slice(0, 160) : 'View job description and apply for positions at Macenza.'}
        canonicalPath={`/careers/${id || ''}`}
        schema={jobSchema}
      />
      {/* Decorative Blur Background Elements */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-6 pb-24 relative z-10">
        {/* Back Link */}
        <Link
          to="/careers"
          className="inline-flex items-center gap-2 text-black/60 hover:text-primary font-bold text-sm mb-10 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Careers
        </Link>

        {/* Job Header Card */}
        <div className="p-10 md:p-12 rounded-[3rem] glass-morphism border border-black/5 mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                {job.department || 'Engineering'}
              </span>
              <span className="flex items-center gap-1.5 text-black/50 text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5" /> Deadline: {job.deadline || 'Flexible'}
              </span>
            </div>
            <h1 className="text-[1.65rem] md:text-[2.2rem] font-faculty font-normal tracking-normal text-black mb-4 leading-tight">
              {job.title}
            </h1>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <span className="flex items-center gap-2 text-black/60 text-sm font-semibold">
                <MapPin className="w-4 h-4 text-primary" /> {job.location || 'Remote'}
              </span>
              <span className="flex items-center gap-2 text-black/60 text-sm font-semibold">
                <Clock className="w-4 h-4 text-primary" /> {job.employmentType || job.type || 'Full Time'}
              </span>
              <span className="flex items-center gap-2 text-black/60 text-sm font-semibold">
                <DollarSign className="w-4 h-4 text-primary" /> {job.salary || 'Competitive'}
              </span>
            </div>
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <button
              onClick={() => document.getElementById('application-form-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-1 lg:flex-none px-8 py-4 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-dark transition-all duration-300 shadow-xl shadow-primary/20 text-center"
            >
              Apply Now
            </button>
            <button
              onClick={handleShare}
              className="p-4 border border-black/10 rounded-full hover:bg-black/5 hover:border-black/20 text-black transition-all duration-300"
              title="Share job opening"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Layout details and application */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Job Specifications */}
          <div className="lg:col-span-7 flex flex-col gap-10 animate-fade-in">
            {/* About the Position */}
            <div>
              <h3 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-primary" /> About the Position
              </h3>
              <p className="text-black/75 text-base md:text-lg font-light leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Core Skills Required */}
            {job.skills && (
              <div>
                <h3 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                  <Award className="w-6 h-6 text-primary" /> Core Skills & Technologies
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {job.skills.split(',').map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-black/5 border border-black/5 text-black font-semibold text-xs rounded-full hover:bg-primary hover:text-white transition-all duration-300"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div>
                <h3 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-primary" /> Responsibilities
                </h3>
                <ul className="flex flex-col gap-3">
                  {job.requirements.split(',').map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-black/70 font-light leading-relaxed">
                      <ChevronRight className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{req.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Perks and Benefits */}
            {job.benefits && (
              <div>
                <h3 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" /> Skills and Requirements
                </h3>
                <ul className="flex flex-col gap-3">
                  {job.benefits.split(',').map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-black/70 font-light leading-relaxed">
                      <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{benefit.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Application Form Container */}
          <div id="application-form-section" className="lg:col-span-5 animate-sidebar lg:sticky lg:top-28">
            <div className="p-8 md:p-10 rounded-[3rem] border border-black/5 glass-morphism bg-white relative">
              <div className="mb-8">
                <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Registration Portal
                </span>
                <h3 className="text-2xl font-black text-black mt-3">
                  Submit Application
                </h3>
                <p className="text-xs text-black/60 mt-1">
                  We usually review application folders and reply back within 48 business hours.
                </p>
              </div>

              {submitSuccess ? (
                <div className="text-center py-12 flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-black text-black">Application Received!</h4>
                  <p className="text-black/60 max-w-sm text-sm leading-relaxed">
                    Thank you for applying. Our talent acquisition specialists have saved your details and resume. We will contact you soon.
                  </p>
                  <Link
                    to="/careers"
                    className="mt-6 inline-block px-8 py-3.5 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-dark transition-all duration-300 shadow-xl shadow-primary/20"
                  >
                    Return to Careers Page
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-4.5">
                  {submitError && (
                    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-950 font-bold rounded-2xl text-xs">
                      {submitError}
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-black/70">Full Name *</label>
                    <input
                      type="text"
                      name="candidateName"
                      value={formData.candidateName}
                      onChange={handleInputChange}
                      className="bg-black/5 border border-black/5 p-3 rounded-2xl text-black font-semibold text-sm outline-none focus:border-primary focus:bg-white transition-all"
                      required
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-black/70">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-black/5 border border-black/5 p-3 rounded-2xl text-black font-semibold text-sm outline-none focus:border-primary focus:bg-white transition-all"
                      required
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-black/70">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="bg-black/5 border border-black/5 p-3 rounded-2xl text-black font-semibold text-sm outline-none focus:border-primary focus:bg-white transition-all"
                        required
                        placeholder="+1 (234) 567-890"
                      />
                    </div>
                    {/* Location */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-black/70">Current Location *</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="bg-black/5 border border-black/5 p-3 rounded-2xl text-black font-semibold text-sm outline-none focus:border-primary focus:bg-white transition-all"
                        required
                        placeholder="e.g. San Francisco, CA"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Experience */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-black/70">Years of Experience *</label>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="bg-black/5 border border-black/5 p-3 rounded-2xl text-black font-semibold text-sm outline-none focus:border-primary focus:bg-white transition-all"
                        required
                        placeholder="e.g. 4 Years"
                      />
                    </div>
                    {/* Job selection indicator */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-black/70">Applying Position</label>
                      <input
                        type="text"
                        value={job.title}
                        disabled
                        className="bg-black/5 border border-black/5 p-3 rounded-2xl text-black/50 font-semibold text-sm cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>

                  {/* LinkedIn & Portfolio */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-black/70">LinkedIn URL</label>
                      <input
                        type="url"
                        name="linkedInUrl"
                        value={formData.linkedInUrl}
                        onChange={handleInputChange}
                        className="bg-black/5 border border-black/5 p-3 rounded-2xl text-black font-semibold text-sm outline-none focus:border-primary focus:bg-white transition-all"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-black/70">Portfolio URL</label>
                      <input
                        type="url"
                        name="portfolioUrl"
                        value={formData.portfolioUrl}
                        onChange={handleInputChange}
                        className="bg-black/5 border border-black/5 p-3 rounded-2xl text-black font-semibold text-sm outline-none focus:border-primary focus:bg-white transition-all"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  {/* Honeypot field (hidden from screen readers and visual layout) */}
                  <div className="absolute opacity-0 -z-50 pointer-events-none h-0 w-0 overflow-hidden">
                    <label>Do not fill this field if you are a human</label>
                    <input
                      type="text"
                      name="honeypot"
                      value={formData.honeypot}
                      onChange={handleInputChange}
                      tabIndex="-1"
                      autoComplete="off"
                    />
                  </div>

                  {/* Cover Letter */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-black/70">Cover Letter / Pitch</label>
                    <textarea
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleInputChange}
                      rows="3"
                      className="bg-black/5 border border-black/5 p-4 rounded-2xl text-black font-semibold text-sm outline-none focus:border-primary focus:bg-white transition-all resize-none"
                      placeholder="Tell us why you'd be a great fit for this position..."
                    />
                  </div>

                  {/* Resume Upload File Card */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-black/70">Upload Resume (PDF, DOC, DOCX) *</label>
                    <div className="relative border border-dashed border-black/15 rounded-2xl p-5 text-center hover:border-primary/40 transition-colors bg-black/5 flex flex-col items-center justify-center gap-1.5 cursor-pointer">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        accept=".pdf,.doc,.docx"
                      />
                      {resumeFile ? (
                        <>
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                            <Check className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-xs text-black truncate max-w-xs">{resumeFile.name}</span>
                          <span className="text-[9px] text-black/40">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB &bull; Click to change</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-black/40 animate-pulse" />
                          <span className="font-bold text-xs text-black">Choose file or drag & drop</span>
                          <span className="text-[9px] text-black/40">PDF, DOC, DOCX up to 10MB</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Consent Checkboxes */}
                  <div className="flex flex-col gap-3 py-3 border-t border-black/10 mt-2 bg-black/[0.02] p-4 rounded-2xl">
                    {/* 1. Mandatory Checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        required
                        className="mt-0.5 w-4 h-4 rounded border-black/20 text-primary focus:ring-primary cursor-pointer accent-primary shrink-0"
                      />
                      <span className="text-xs text-black/80 font-medium leading-relaxed group-hover:text-black transition-colors">
                        <span className="font-bold text-rose-600 mr-1">*</span>
                        I have read and agree to the{' '}
                        <a href="https://www.macenza.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">
                          Privacy Policy
                        </a>{' '}
                        and{' '}
                        <Link to="/terms" target="_blank" className="text-primary font-bold hover:underline">
                          Terms &amp; Conditions
                        </Link>
                        , and I consent to Macenza collecting and processing the information I provide for recruitment and employment-related purposes.
                      </span>
                    </label>

                    {/* 2. Optional Checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer group pt-1 border-t border-black/5">
                      <input
                        type="checkbox"
                        name="agreeToFutureRecruitment"
                        checked={formData.agreeToFutureRecruitment}
                        onChange={handleInputChange}
                        className="mt-0.5 w-4 h-4 rounded border-black/20 text-primary focus:ring-primary cursor-pointer accent-primary shrink-0"
                      />
                      <span className="text-xs text-black/70 font-medium leading-relaxed group-hover:text-black transition-colors">
                        <span className="text-black/40 font-bold mr-1">(Optional)</span>
                        I consent to Macenza retaining my application information and contacting me about future employment opportunities.
                      </span>
                    </label>
                  </div>

                  {/* hCaptcha Checkbox */}
                  <div className="flex justify-center py-2">
                    <HCaptcha
                      ref={hcaptchaRef}
                      sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
                      onVerify={(token) => setHcaptchaToken(token)}
                      onExpire={() => setHcaptchaToken('')}
                      theme="dark"
                    />
                  </div>

                  {/* Submit Trigger */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-2 py-4 bg-primary text-white rounded-full font-bold text-base hover:bg-primary-dark transition-all duration-300 shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Uploading Application...' : 'Submit Application'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JobDetails;
