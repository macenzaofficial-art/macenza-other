import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Search, Loader2, CheckCircle2, AlertCircle, FileCheck, Download, User, Briefcase, Award } from 'lucide-react';
import Section from '../components/Section';
import BouncyText from '../components/BouncyText';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';

const CertificateVerification = () => {
  const pageRef = useRef(null);
  const [certNumber, setCertNumber] = useState('');
  const [searchedCertNumber, setSearchedCertNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.utils.toArray(".reveal-up").forEach((elem) => {
        gsap.from(elem, {
          y: 20,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: elem,
            start: "top 96%",
            toggleActions: "play none none none"
          }
        });
      });
    }, pageRef);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1500);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, []);

  const handleVerify = async (e) => {
    e?.preventDefault();
    const cleanCertNum = certNumber.trim().toUpperCase();
    if (!cleanCertNum) {
      toast.error('Please enter a certification number.');
      return;
    }

    setLoading(true);
    setCertificate(null);
    setSearched(true);
    setSearchedCertNumber(cleanCertNum);

    try {
      // Query certificates table and join employees table
      const { data, error } = await supabase
        .from('certificates')
        .select('*, employee:employees(id, name, role, department)')
        .eq('certification_number', cleanCertNum)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        let signedUrl = data.url;
        if (data.url && data.url.includes('/employee-certs/')) {
          try {
            const parts = data.url.split('/employee-certs/');
            if (parts.length > 1) {
              const filePath = decodeURIComponent(parts[parts.length - 1].split('?')[0]);
              const { data: signData, error: signError } = await supabase.storage
                .from('employee-certs')
                .createSignedUrl(filePath, 300); // 5 mins validity
              if (signError) throw signError;
              if (signData && signData.signedUrl) {
                signedUrl = signData.signedUrl;
              }
            }
          } catch (signErr) {
            console.error('Error signing certificate URL:', signErr);
          }
        }
        setCertificate({ ...data, signedUrl });
        toast.success('Credential verified successfully!');
      } else {
        toast.error('No record found for this credential number.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Verification failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'certificate.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, '_blank');
    }
  };

  const certSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Certificate Verification | Macenza",
    "url": "https://www.macenza.com/certificateverification",
    "description": "Verify official certificates issued by Macenza."
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-white text-black font-sans selection:bg-primary selection:text-white overflow-x-hidden flex flex-col">
      <SEO
        title="Certificate Verification | Macenza"
        description="Verify official certificates issued by Macenza."
        canonicalPath="/certificateverification"
        schema={certSchema}
      />

      {/* Header */}
      <section className="relative min-h-[40vh] flex flex-col items-center justify-center overflow-hidden pt-44 pb-20 bg-black/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-block px-4 py-2 bg-primary/5 rounded-full text-primary font-bold text-xs uppercase tracking-widest mb-6 reveal-up">
            Secure Registry Verification
          </div>
          <h1 className="text-[1.65rem] md:text-[2.76rem] font-faculty font-normal tracking-normal text-black mb-6 reveal-up">
            <BouncyText text="Certificate " />
            <BouncyText text="Verification" className="text-primary italic" />
          </h1>
          <p className="max-w-2xl mx-auto text-black/50 text-base md:text-lg font-light reveal-up leading-relaxed">
            Verify official Macenza company credentials, employee certifications, and training records from our secure public ledger.
          </p>
        </div>
      </section>

      {/* Main Verification Interface */}
      <Section id="verification-content" className="py-20 flex-1">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">
          {/* Search Form */}
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-8 md:p-10 rounded-[3rem] reveal-up shadow-sm">
            <h2 className="text-xl md:text-2xl font-black text-black mb-4">Search Certificate Database</h2>
            <p className="text-sm text-black/60 font-light mb-8">
              Enter the unique certification number below to check its status, validity, and ownership.
            </p>

            <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-4 items-stretch">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value)}
                  placeholder="e.g. MAC-xxx-xxx"
                  className="w-full bg-white border border-[#BFDBFE] pl-12 pr-4 py-4 rounded-2xl text-black font-semibold text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all uppercase"
                />
                <Award className="w-5 h-5 text-black/40 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm tracking-wider uppercase shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all duration-300 flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" /> Verify Credential
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Area */}
          {searched && !loading && (
            <div className="reveal-up">
              {certificate ? (
                /* Valid Certificate Card */
                <div className="bg-white border border-[#BFDBFE] rounded-[3rem] p-8 md:p-12 shadow-xl relative overflow-hidden group">
                  {/* Decorative corner tag */}
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest px-8 py-2.5 rotate-45 translate-x-6 translate-y-3 shadow-md">
                    Valid
                  </div>

                  <div className="flex flex-col gap-8">
                    {/* Header Details */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-9 h-9" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-black/40 tracking-wider">Credential Status</span>
                        <h3 className="text-2xl font-black text-emerald-600 tracking-tight mt-0.5">Verified Credential</h3>
                        <p className="text-xs text-black/50 font-bold uppercase mt-1">ID: {certificate.certification_number}</p>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#EFF6FF] border border-[#BFDBFE] p-6 rounded-[2rem]">
                      <div>
                        <span className="text-[10px] font-black uppercase text-black/50 tracking-wider block mb-2">Recipient Name</span>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          <span className="font-bold text-black text-base">{certificate.employee?.name || 'Macenza Associate'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-black uppercase text-black/50 tracking-wider block mb-2">Department / Designation</span>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-primary" />
                          <span className="font-bold text-black/70 text-sm">
                            {certificate.employee ? `${certificate.employee.role} (${certificate.employee.department})` : '-'}
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-2 border-t border-[#BFDBFE]/50 pt-4 mt-2">
                        <span className="text-[10px] font-black uppercase text-black/50 tracking-wider block mb-2">Certificate Document Name</span>
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-black text-sm truncate">{certificate.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-black/5 pt-6 mt-2">
                      <span className="text-xs text-black/40 font-bold uppercase">Issued via Macenza HR Secure Directory</span>
                      <button
                        onClick={() => handleDownload(certificate.signedUrl || certificate.url, certificate.name)}
                        className="w-full sm:w-auto px-6 py-3 bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] rounded-xl text-black font-bold text-xs tracking-wider uppercase inline-flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <Download className="w-4 h-4" /> Download Certificate Copy
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Not Found Card */
                <div className="bg-rose-50 border border-rose-200 rounded-[3rem] p-10 text-center flex flex-col items-center gap-4 shadow-sm">
                  <div className="w-16 h-16 bg-rose-100 border border-rose-300 text-rose-600 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-rose-950 tracking-tight">Credential Not Found</h3>
                  <p className="text-rose-900/60 max-w-md text-sm font-light leading-relaxed">
                    The certification number <strong className="font-bold text-rose-950 uppercase">"{searchedCertNumber}"</strong> could not be verified in our registry. <br />Please check for spelling mistakes and try again.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Section>

      <Footer />
    </div>
  );
};

export default CertificateVerification;
