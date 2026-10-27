import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Section from '../components/Section';
import BouncyText from '../components/BouncyText';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const Policy = () => {
  const pageRef = useRef(null);

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

  const policySchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy | Macenza",
    "url": "https://www.macenza.com/privacy",
    "description": "Read Macenza's Privacy Policy to understand how we collect, use, store, and protect your data."
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-white text-black font-sans selection:bg-primary selection:text-white overflow-x-hidden">
      <SEO
        title="Privacy Policy | Macenza"
        description="Read Macenza's Privacy Policy to understand how we collect, use, store, and protect your data."
        canonicalPath="/privacy"
        schema={policySchema}
      />

      {/* Header */}
      <section className="relative min-h-[40vh] flex flex-col items-center justify-center overflow-hidden pt-44 pb-20 bg-black/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-block px-4 py-2 bg-primary/5 rounded-full text-primary font-bold text-xs uppercase tracking-widest mb-6 reveal-up">
            Legal &amp; Compliance
          </div>
          <h1 className="text-[1.65rem] md:text-[2.76rem] font-faculty font-normal tracking-normal text-black mb-6 reveal-up">
            <BouncyText text="Privacy " />
            <BouncyText text="Policy" className="text-primary italic" />
          </h1>
          <p className="text-black/60 text-sm font-bold tracking-widest uppercase reveal-up">
            Last Updated: 11 August 2026
          </p>
        </div>
      </section>

      {/* Main Content */}
      <Section id="privacy-content" className="py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-0 space-y-12">
          
          {/* Preamble */}
          <div className="reveal-up border-b border-black/10 pb-10">
            <p className="text-black/80 text-base md:text-lg leading-relaxed mb-4">
              Macenza (&quot;Macenza&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy and is committed to protecting the personal information you provide to us.
            </p>
            <p className="text-black/80 text-base md:text-lg leading-relaxed mb-4">
              This Privacy Policy explains how we collect, use, store, protect, and otherwise process personal information when you visit or use our website, <a href="https://macenza.com" className="text-primary font-bold hover:underline">macenza.com</a>, submit an inquiry, contact us, or apply for a job through our Careers page.
            </p>
            <p className="text-black/80 text-base md:text-lg leading-relaxed font-semibold">
              By using our website or submitting information through our forms, you acknowledge that you have read this Privacy Policy.
            </p>
          </div>

          {/* 1. Information We Collect */}
          <div className="reveal-up border-b border-black/10 pb-10 space-y-6">
            <h2 className="text-2xl md:text-3xl font-black text-black">1. Information We Collect</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Depending on how you interact with our website, we may collect the following information:
            </p>
            
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <h3 className="text-lg font-bold text-black">1.1 Information You Provide Directly</h3>
              <p className="text-black/80 text-sm">You may voluntarily provide information such as:</p>
              <ul className="list-disc list-inside space-y-1.5 text-black/80 text-sm">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Company or organization name</li>
                <li>Job title or professional information</li>
                <li>Address or location information</li>
                <li>Information submitted through contact or inquiry forms</li>
                <li>Information submitted through our Careers or recruitment forms</li>
                <li>Resume/CV and cover letter</li>
                <li>Educational qualifications</li>
                <li>Employment history and professional experience</li>
                <li>Skills and certifications</li>
                <li>Portfolio, GitHub, LinkedIn, or other professional profile links</li>
                <li>Information provided during interviews, assessments, or recruitment communications</li>
                <li>Any other information you voluntarily provide to us</li>
              </ul>
              <p className="text-black/60 text-xs italic pt-2">
                You should only provide information that is relevant and necessary for the purpose for which you are submitting it.
              </p>
            </div>

            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <h3 className="text-lg font-bold text-black">1.2 Automatically Collected Information</h3>
              <p className="text-black/80 text-sm">When you visit our website, certain technical information may be collected automatically, including:</p>
              <ul className="list-disc list-inside space-y-1.5 text-black/80 text-sm">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device type</li>
                <li>Operating system</li>
                <li>Pages visited</li>
                <li>Website interaction information</li>
                <li>Approximate location derived from technical information</li>
                <li>Date and time of access</li>
                <li>Referring website or source</li>
                <li>Other technical information necessary for website security, functionality, and analytics</li>
              </ul>
            </div>
          </div>

          {/* 2. How We Use Your Information */}
          <div className="reveal-up border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">2. How We Use Your Information</h2>
            <p className="text-black/80 text-base leading-relaxed">
              We may use personal information for legitimate business and operational purposes, including:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-black/80 text-sm pl-2">
              <li>Providing and improving our website and services</li>
              <li>Responding to inquiries and requests</li>
              <li>Communicating with you</li>
              <li>Providing customer or business support</li>
              <li>Understanding website usage and improving user experience</li>
              <li>Maintaining website security</li>
              <li>Preventing fraud, abuse, unauthorized access, or other harmful activity</li>
              <li>Managing business relationships</li>
              <li>Processing job applications</li>
              <li>Evaluating candidates for employment opportunities</li>
              <li>Contacting candidates regarding interviews, assessments, or recruitment processes</li>
              <li>Communicating employment-related decisions</li>
              <li>Considering candidates for other suitable employment opportunities where you have provided the applicable consent</li>
              <li>Complying with applicable laws and legal obligations</li>
              <li>Protecting our rights, property, systems, employees, users, and business</li>
              <li>Performing other purposes that are reasonably related to the purpose for which the information was provided</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              We will not use personal information for purposes that are materially incompatible with the purposes described in this Privacy Policy unless permitted or required by applicable law or you provide the required consent.
            </p>
          </div>

          {/* 3. Careers and Recruitment Information */}
          <div className="reveal-up border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">3. Careers and Recruitment Information</h2>
            <p className="text-black/80 text-base leading-relaxed">
              If you apply for a position through our Careers page, Macenza may collect and process information contained in your application and recruitment materials.
            </p>
            <p className="text-black/80 text-sm font-semibold">This may include:</p>
            <ul className="list-disc list-inside space-y-1 text-black/80 text-sm pl-2">
              <li>Name, Email address, Phone number</li>
              <li>Resume/CV, Cover letter</li>
              <li>Education, Employment history, Skills, Certifications</li>
              <li>Portfolio and professional profile links</li>
              <li>Interview information, Assessment results</li>
              <li>Other information voluntarily provided during the recruitment process</li>
            </ul>
            <p className="text-black/80 text-sm font-semibold pt-2">We use this information to:</p>
            <ul className="list-disc list-inside space-y-1 text-black/80 text-sm pl-2">
              <li>Review and evaluate your application</li>
              <li>Determine your suitability for a position</li>
              <li>Contact you regarding your application</li>
              <li>Schedule interviews</li>
              <li>Conduct recruitment assessments</li>
              <li>Communicate recruitment decisions</li>
              <li>Complete hiring and onboarding processes where applicable</li>
              <li>Consider you for other suitable positions where you have provided the applicable consent</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              Providing certain information may be necessary for us to evaluate your application. We ask applicants not to provide sensitive or unnecessary personal information unless it is specifically requested or legally required.
            </p>
          </div>

          {/* 4. Sharing of Personal Information */}
          <div className="reveal-up border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">4. Sharing of Personal Information</h2>
            <p className="text-black font-bold text-base">We do not sell your personal information.</p>
            <p className="text-black/80 text-base leading-relaxed">
              We may disclose or provide access to personal information where reasonably necessary for the purposes described in this Privacy Policy, including to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-black/80 text-sm pl-2">
              <li>Our employees, authorized personnel, and internal teams</li>
              <li>Service providers that help us operate our website or business</li>
              <li>Hosting, cloud storage, email, analytics, security, communication, recruitment, or technology providers</li>
              <li>Professional advisers, auditors, or consultants where necessary</li>
              <li>Government authorities, regulators, courts, or law-enforcement agencies where required by law</li>
              <li>Business partners or other parties where disclosure is necessary for a specific service, recruitment process, business transaction, or other purpose explained to you</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              Where third-party service providers process information on our behalf, we seek to use appropriate contractual, organizational, and technical safeguards consistent with applicable requirements.
            </p>
            <p className="text-black/80 text-sm leading-relaxed">
              We do not authorize third parties to use your personal information for their own unrelated marketing purposes merely because they provide services to Macenza.
            </p>
          </div>

          {/* 5. Recruitment Information and Third Parties */}
          <div className="reveal-up border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">5. Recruitment Information and Third Parties</h2>
            <p className="text-black/80 text-base leading-relaxed">
              If you apply for a position through Macenza, your application may be accessible to authorized personnel involved in recruitment, hiring, human resources, management, or related decision-making.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              Where a recruitment service provider, technology provider, assessment provider, or other service is used to support the hiring process, relevant information may be processed by that provider as necessary to provide the service.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              If a particular job opportunity involves another organization or client and your application information needs to be shared with that organization, we will do so only where appropriate and permitted under applicable law and, where required, with the necessary notice or consent.
            </p>
          </div>

          {/* 6. Data Retention */}
          <div className="reveal-up border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">6. Data Retention</h2>
            <p className="text-black/80 text-base leading-relaxed">
              We retain personal information only for as long as reasonably necessary for the purposes described in this Privacy Policy, including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-black/80 text-sm pl-2">
              <li>Providing and operating our services</li>
              <li>Processing and managing inquiries</li>
              <li>Completing recruitment processes</li>
              <li>Considering applicants for future employment opportunities where applicable</li>
              <li>Meeting legal, regulatory, accounting, or business requirements</li>
              <li>Resolving disputes and enforcing agreements</li>
              <li>Maintaining security and preventing fraud or abuse</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              Recruitment information may be retained for a reasonable period after a recruitment process has ended so that we can manage the recruitment process, meet applicable obligations, defend legal claims, or consider candidates for future opportunities where applicable.
            </p>
            <p className="text-black/80 text-sm leading-relaxed">
              Where you have consented to consideration for future opportunities, you may withdraw that consent where applicable or request deletion of your information.
            </p>
            <p className="text-black/80 text-sm leading-relaxed">
              When personal information is no longer reasonably required, we may delete, anonymize, or securely dispose of it in accordance with our retention practices and applicable law.
            </p>
          </div>

          {/* 7. Data Security */}
          <div className="reveal-up border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">7. Data Security</h2>
            <p className="text-black/80 text-base leading-relaxed">
              We take reasonable technical and organizational measures designed to protect personal information against unauthorized access, loss, misuse, alteration, disclosure, or destruction.
            </p>
            <p className="text-black/80 text-sm font-semibold">Depending on the nature of the information and the services involved, safeguards may include:</p>
            <ul className="list-disc list-inside space-y-1 text-black/80 text-sm pl-2">
              <li>Access controls</li>
              <li>Authentication and authorization controls</li>
              <li>Secure hosting and infrastructure</li>
              <li>Encryption or other appropriate security measures</li>
              <li>Monitoring and security practices</li>
              <li>Limited access to personal information</li>
              <li>Internal policies and procedures</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              However, no method of transmission over the Internet or method of electronic storage is completely secure. Therefore, we cannot guarantee absolute security of your information.
            </p>
          </div>

          {/* 8. Cookies and Similar Technologies */}
          <div className="reveal-up border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">8. Cookies and Similar Technologies</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Our website may use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-black/80 text-sm pl-2">
              <li>Operate essential website functions</li>
              <li>Remember preferences</li>
              <li>Understand website traffic and usage</li>
              <li>Improve website performance</li>
              <li>Maintain security</li>
              <li>Analyze user interactions</li>
              <li>Improve our services and user experience</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              Some cookies may be provided by third-party services used on our website.
            </p>
            <p className="text-black/80 text-sm leading-relaxed">
              You may be able to control or disable cookies through your browser settings. Disabling certain cookies may affect website functionality.
            </p>
            <p className="text-black/80 text-sm leading-relaxed">
              Where applicable, information about cookies and similar technologies is provided in our Cookie Policy.
            </p>
          </div>

          {/* 9. Third-Party Websites and Services */}
          <div className="reveal-up border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">9. Third-Party Websites and Services</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Our website may contain links to third-party websites, platforms, applications, or services.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              We do not control the privacy practices, security, or content of third-party websites.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              When you leave our website or interact with a third-party service, we recommend reviewing that third party&apos;s privacy policy and terms before providing personal information.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              This Privacy Policy does not apply to third-party websites or services that are not controlled by Macenza.
            </p>
          </div>

          {/* 10. International Data Processing */}
          <div className="reveal-up border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">10. International Data Processing</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Some of our service providers, technology providers, hosting providers, or business partners may process personal information from locations outside India.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              Where personal information is processed or transferred outside India, we will take steps appropriate to the circumstances and applicable law to protect the information and comply with applicable requirements.
            </p>
          </div>

          {/* 11. Your Privacy Rights */}
          <div className="reveal-up border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">11. Your Privacy Rights</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Depending on applicable law and the circumstances of the processing, you may have rights relating to your personal information, including rights to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-black/80 text-sm pl-2">
              <li>Request information about the personal information we process about you</li>
              <li>Request correction of inaccurate or incomplete information</li>
              <li>Request deletion of personal information where applicable</li>
              <li>Withdraw consent where processing is based on consent</li>
              <li>Request information regarding how your personal information is processed</li>
              <li>Raise a privacy-related concern or grievance</li>
              <li>Exercise other rights available under applicable law</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              Requests may be subject to applicable legal requirements, verification procedures, and legitimate exceptions.
            </p>
            <p className="text-black/80 text-sm leading-relaxed">
              To exercise an applicable privacy right or submit a privacy request, contact us using the details provided below.
            </p>
          </div>

          {/* 12. Withdrawal of Consent */}
          <div className="reveal-up border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">12. Withdrawal of Consent</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Where we process your personal information based on your consent, you may withdraw your consent where applicable.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              Withdrawal of consent does not affect the lawfulness of processing that occurred before the withdrawal.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              Depending on the nature of the information and the purpose of processing, withdrawing consent may affect our ability to provide certain services or process a particular request or application.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              For recruitment applications, withdrawing consent may affect our ability to continue evaluating or processing your application where consent is the applicable basis for processing.
            </p>
          </div>

          {/* 13. Children's Privacy */}
          <div className="reveal-up border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">13. Children&apos;s Privacy</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Our website and recruitment services are not intended to knowingly collect personal information from children except where permitted or required by applicable law.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              We do not knowingly seek to collect personal information from children for purposes that are not permitted under applicable law.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              If you believe that personal information relating to a child has been submitted to us improperly, please contact us so that we can review the matter and take appropriate action.
            </p>
          </div>

          {/* 14. Accuracy of Information */}
          <div className="reveal-up border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">14. Accuracy of Information</h2>
            <p className="text-black/80 text-base leading-relaxed">
              You are responsible for providing information that is accurate, complete, and up to date.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              If information you have provided to us changes or is inaccurate, you may contact us to request appropriate correction or update, subject to applicable law.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              For job applications, applicants should ensure that the information contained in their resume, CV, application, and other submitted documents is accurate and not misleading.
            </p>
          </div>

          {/* 15. Changes to This Privacy Policy */}
          <div className="reveal-up border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">15. Changes to This Privacy Policy</h2>
            <p className="text-black/80 text-base leading-relaxed">
              We may update or modify this Privacy Policy from time to time to reflect changes in our services, technology, business practices, or applicable legal requirements.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              When we make changes, we will update the &quot;Last Updated&quot; date at the top of this Privacy Policy.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              Where required by applicable law, we may provide additional notice regarding material changes.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              We encourage you to periodically review this page for the latest version.
            </p>
          </div>

          {/* 16. Contact Us */}
          <div className="reveal-up border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">16. Contact Us</h2>
            <p className="text-black/80 text-base leading-relaxed">
              If you have questions, concerns, requests, or complaints regarding this Privacy Policy or the processing of your personal information, please contact us.
            </p>
            <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl space-y-2">
              <p className="font-bold text-black">Macenza</p>
              <p className="text-sm text-black/80">Email: <a href="mailto:info@macenza.com" className="text-primary font-bold hover:underline">info@macenza.com</a></p>
              <p className="text-sm text-black/80">Website: <a href="https://macenza.com" className="text-primary font-bold hover:underline">macenza.com</a></p>
            </div>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              When contacting us regarding personal information, please provide sufficient information for us to understand and respond to your request. We may need to verify your identity before processing certain requests.
            </p>
          </div>

          {/* 17. Legal and Regulatory Compliance */}
          <div className="reveal-up pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">17. Legal and Regulatory Compliance</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Macenza aims to handle personal information in accordance with applicable data-protection and privacy laws and regulations.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              For users and applicants in India, this includes applicable requirements under India&apos;s data-protection framework, including the Digital Personal Data Protection Act, 2023, and applicable rules and regulations made under it.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              The application and timing of specific legal requirements may depend on the circumstances and applicable provisions.
            </p>
          </div>

          {/* Footer copyright note */}
          <div className="pt-8 border-t border-black/10 text-center reveal-up">
            <p className="text-black/40 text-xs font-semibold uppercase tracking-wider">
              Last Updated: 11 August 2026 &bull; &copy; 2026 Macenza. All Rights Reserved.
            </p>
          </div>

        </div>
      </Section>

      <Footer />
    </div>
  );
};

export default Policy;
