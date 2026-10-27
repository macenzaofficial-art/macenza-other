import React, { useEffect } from 'react';
import Section from '../components/Section';
import BouncyText from '../components/BouncyText';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const termsSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms & Conditions | Macenza",
    "url": "https://www.macenza.com/terms",
    "description": "Read Macenza's Terms & Conditions governing access to and use of our website, software, and services."
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-primary selection:text-white overflow-x-hidden">
      <SEO
        title="Terms & Conditions | Macenza"
        description="Read Macenza's Terms & Conditions governing access to and use of our website, software, and services."
        canonicalPath="/terms"
        schema={termsSchema}
      />

      {/* Header */}
      <section className="relative min-h-[40vh] flex flex-col items-center justify-center overflow-hidden pt-44 pb-20 bg-black/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-block px-4 py-2 bg-primary/5 rounded-full text-primary font-bold text-xs uppercase tracking-widest mb-6">
            Legal &amp; Compliance
          </div>
          <h1 className="text-[1.65rem] md:text-[2.76rem] font-faculty font-normal tracking-normal text-black mb-6">
            <BouncyText text="Terms &amp; " />
            <BouncyText text="Conditions" className="text-primary italic" />
          </h1>
          <p className="text-black/60 text-sm font-bold tracking-widest uppercase">
            Last Updated: 11 August 2026
          </p>
        </div>
      </section>

      {/* Main Content */}
      <Section id="terms-content" className="py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-0 space-y-12">
          
          {/* Preamble */}
          <div className="border-b border-black/10 pb-10">
            <p className="text-black/80 text-base md:text-lg leading-relaxed mb-4">
              Welcome to Macenza. These Terms &amp; Conditions (&quot;Terms&quot;, &quot;Terms and Conditions&quot;) govern your access to and use of the Macenza website, including <a href="https://macenza.com" className="text-primary font-bold hover:underline">macenza.com</a>, and any content, information, services, products, forms, and features made available through the website.
            </p>
            <p className="text-black/80 text-base md:text-lg leading-relaxed mb-4">
              By accessing or using our website, submitting an inquiry, using our services, or submitting a job application through our Careers section, you acknowledge that you have read, understood, and agree to be bound by these Terms.
            </p>
            <p className="text-black/80 text-base md:text-lg leading-relaxed font-semibold">
              If you do not agree with these Terms, please do not use the website or submit information through it.
            </p>
          </div>

          {/* 1. About Macenza */}
          <div id="section-1" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">1. About Macenza</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Macenza is a technology and software company providing services and solutions that may include software development, artificial intelligence, AI/ML solutions, SaaS products, automation, website and application development, consulting, and other technology-related services.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              Information about our services and products provided on this website is for general informational purposes and may be changed or updated from time to time.
            </p>
          </div>

          {/* 2. Eligibility and Acceptance */}
          <div id="section-2" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">2. Eligibility and Acceptance</h2>
            <p className="text-black/80 text-base leading-relaxed">By using this website, you represent that:</p>
            <ul className="list-disc list-inside space-y-1.5 text-black/80 text-sm pl-2">
              <li>You have the legal capacity to enter into these Terms under applicable law.</li>
              <li>The information you provide to us is accurate and not misleading.</li>
              <li>You will use the website only for lawful purposes.</li>
              <li>You will comply with applicable laws and regulations.</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              If you are using the website on behalf of a company or organization, you represent that you have appropriate authority to act on behalf of that organization.
            </p>
          </div>

          {/* 3. Permitted Use of the Website */}
          <div id="section-3" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">3. Permitted Use of the Website</h2>
            <p className="text-black/80 text-base leading-relaxed">You may access and use the website for legitimate purposes, including:</p>
            <ul className="list-disc list-inside space-y-1.5 text-black/80 text-sm pl-2">
              <li>Learning about Macenza and its services</li>
              <li>Contacting Macenza</li>
              <li>Requesting information or services</li>
              <li>Exploring products and solutions</li>
              <li>Applying for employment opportunities</li>
              <li>Communicating with Macenza regarding business or recruitment matters</li>
            </ul>
            <p className="text-black/80 text-sm font-semibold pt-2">You must not use the website to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-black/80 text-sm pl-2">
              <li>Violate any applicable law or regulation</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Introduce viruses, malware, or other harmful code</li>
              <li>Interfere with the operation or security of the website</li>
              <li>Scrape, copy, reproduce, or commercially exploit website content without permission</li>
              <li>Impersonate another person or organization</li>
              <li>Submit false, fraudulent, misleading, or deceptive information</li>
              <li>Upload unlawful, harmful, abusive, defamatory, or infringing content</li>
              <li>Attempt to access another user&apos;s information or account without authorization</li>
              <li>Use the website for activities that could damage Macenza, its users, systems, or reputation</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              We reserve the right to restrict or terminate access where we reasonably believe that these Terms have been violated.
            </p>
          </div>

          {/* 4. Intellectual Property */}
          <div id="section-4" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">4. Intellectual Property</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Unless otherwise stated, the website and its content are owned by or licensed to Macenza.
            </p>
            <p className="text-black/80 text-sm font-semibold">This may include:</p>
            <ul className="list-disc list-inside space-y-1 text-black/80 text-sm pl-2">
              <li>Text, Logos, Branding, Graphics, Images, Videos, Designs</li>
              <li>Software, Source code, Website layouts, User interfaces</li>
              <li>Product names, Trademarks, Service marks, Other intellectual property</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              These materials are protected by applicable intellectual-property laws.
            </p>
            <p className="text-black/80 text-sm leading-relaxed">
              You may view and use the website for legitimate personal or business evaluation purposes, but you may not reproduce, distribute, modify, publish, sell, license, reverse engineer, or commercially exploit Macenza&apos;s intellectual property without prior written permission, except where permitted by applicable law.
            </p>
            <p className="text-black/80 text-sm leading-relaxed">
              Nothing in these Terms transfers ownership of Macenza&apos;s intellectual property to you.
            </p>
          </div>

          {/* 5. Information Submitted by Users */}
          <div id="section-5" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">5. Information Submitted by Users</h2>
            <p className="text-black/80 text-base leading-relaxed">
              When you submit information through our website, including contact forms, inquiry forms, service requests, or Careers forms, you are responsible for ensuring that the information you provide is accurate and lawful.
            </p>
            <p className="text-black/80 text-sm font-semibold">You must not knowingly submit:</p>
            <ul className="list-disc list-inside space-y-1 text-black/80 text-sm pl-2">
              <li>False or misleading information</li>
              <li>Information belonging to another person without authorization</li>
              <li>Unlawful or fraudulent material</li>
              <li>Material that infringes another person&apos;s intellectual-property rights</li>
              <li>Malicious software or harmful content</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              Our collection and processing of personal information is described in our Privacy Policy.
            </p>
          </div>

          {/* 6. Careers and Job Applications */}
          <div id="section-6" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">6. Careers and Job Applications</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Macenza may provide employment opportunities through its Careers page.
            </p>
            <p className="text-black/80 text-sm font-semibold">By submitting a job application, resume, CV, portfolio, or other recruitment information, you acknowledge that:</p>
            <ul className="list-disc list-inside space-y-1.5 text-black/80 text-sm pl-2">
              <li>You are responsible for ensuring that the information you provide is accurate and complete.</li>
              <li>You should not knowingly provide false, misleading, or fraudulent information.</li>
              <li>You should only submit information that is relevant to your application.</li>
              <li>Macenza may review and evaluate your application for recruitment purposes.</li>
              <li>Macenza may contact you regarding your application, interviews, assessments, or employment opportunities.</li>
              <li>Submission of an application does not guarantee an interview.</li>
              <li>Submission of an application does not guarantee an offer of employment.</li>
              <li>An offer of employment, if any, will be subject to applicable requirements and separate employment documentation.</li>
              <li>Macenza may change, suspend, or close a job vacancy at any time, subject to applicable law.</li>
              <li>Macenza may evaluate candidates based on qualifications, experience, skills, business requirements, and other legitimate recruitment considerations.</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              Where applicable, information about how recruitment information is collected, used, retained, and protected is provided in our Privacy Policy.
            </p>
          </div>

          {/* 7. No Guarantee of Employment */}
          <div id="section-7" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">7. No Guarantee of Employment</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Submitting an application through the Macenza Careers page does not create an employment relationship between you and Macenza.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              Only an authorized employment offer or agreement from Macenza can establish an employment relationship, subject to applicable law and the terms of the applicable employment documentation.
            </p>
          </div>

          {/* 8. Third-Party Services and Links */}
          <div id="section-8" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">8. Third-Party Services and Links</h2>
            <p className="text-black/80 text-base leading-relaxed">
              The website may contain links to third-party websites, platforms, tools, or services.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              These third-party services may have their own terms, conditions, and privacy policies.
            </p>
            <p className="text-black/80 text-sm font-semibold">Macenza does not control and is not responsible for:</p>
            <ul className="list-disc list-inside space-y-1 text-black/80 text-sm pl-2">
              <li>The availability of third-party services</li>
              <li>Their content, security, privacy practices, terms and conditions</li>
              <li>Any loss or damage resulting from your use of third-party services</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              You should review the applicable third-party terms and policies before using such services.
            </p>
          </div>

          {/* 9. Service Availability */}
          <div id="section-9" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">9. Service Availability</h2>
            <p className="text-black/80 text-base leading-relaxed">
              We make reasonable efforts to keep our website and services available and functioning properly.
            </p>
            <p className="text-black/80 text-sm font-semibold">However, we do not guarantee that:</p>
            <ul className="list-disc list-inside space-y-1 text-black/80 text-sm pl-2">
              <li>The website will always be available</li>
              <li>The website will operate without interruption</li>
              <li>The website will be completely free from errors</li>
              <li>All information will always be current or complete</li>
              <li>The website will be free from viruses or other harmful components</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              We may temporarily suspend, modify, update, or discontinue any part of the website or its features for maintenance, security, technical, operational, or business reasons.
            </p>
          </div>

          {/* 10. Information and Content Disclaimer */}
          <div id="section-10" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">10. Information and Content Disclaimer</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Information published on the website is provided for general informational purposes.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              Although we make reasonable efforts to provide accurate and useful information, we do not guarantee that all information is complete, accurate, current, or suitable for every purpose.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              Service descriptions, product information, features, pricing, availability, timelines, and other information may change without prior notice.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              Any specific project, service, pricing, delivery commitment, or business arrangement will be governed by the applicable proposal, statement of work, order, agreement, or other written contract between the relevant parties.
            </p>
          </div>

          {/* 11. Artificial Intelligence and Technology Services */}
          <div id="section-11" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">11. Artificial Intelligence and Technology Services</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Macenza may provide or use artificial-intelligence and machine-learning technologies as part of its products and services.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              AI-generated or AI-assisted outputs may contain inaccuracies, errors, omissions, or unexpected results.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              Users should independently review and verify important outputs before relying on them for business, legal, financial, medical, employment, or other consequential decisions.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              Where a specific AI product or service has additional terms, those terms may apply in addition to these Terms.
            </p>
          </div>

          {/* 12. Confidentiality */}
          <div id="section-12" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">12. Confidentiality</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Information submitted through a general website form should not be assumed to create a confidential or contractual relationship unless Macenza expressly agrees otherwise in writing.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              If you need to share confidential business, technical, financial, or proprietary information, you should use an appropriate confidentiality agreement or other agreed contractual mechanism where applicable.
            </p>
          </div>

          {/* 13. User Accounts */}
          <div id="section-13" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">13. User Accounts</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Certain Macenza products or services may require an account.
            </p>
            <p className="text-black/80 text-sm font-semibold">Where an account is provided, you are responsible for:</p>
            <ul className="list-disc list-inside space-y-1 text-black/80 text-sm pl-2">
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>Using appropriate security practices</li>
              <li>Providing accurate account information</li>
              <li>Not sharing your credentials with unauthorized persons</li>
              <li>Promptly informing us of suspected unauthorized access</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              You are responsible for activity carried out through your account to the extent permitted by applicable law.
            </p>
          </div>

          {/* 14. Limitation of Liability */}
          <div id="section-14" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">14. Limitation of Liability</h2>
            <p className="text-black/80 text-base leading-relaxed">
              To the maximum extent permitted by applicable law, Macenza and its directors, officers, employees, contractors, affiliates, partners, licensors, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages arising from or related to your use of the website or services.
            </p>
            <p className="text-black/80 text-sm font-semibold">This may include, where permitted by law, loss of:</p>
            <ul className="list-disc list-inside space-y-1 text-black/80 text-sm pl-2">
              <li>Profits, Revenue, Business opportunities</li>
              <li>Data, Goodwill, Business interruption</li>
              <li>Expected savings, Other intangible losses</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              Nothing in these Terms excludes or limits liability that cannot legally be excluded or limited under applicable law.
            </p>
          </div>

          {/* 15. Indemnification */}
          <div id="section-15" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">15. Indemnification</h2>
            <p className="text-black/80 text-base leading-relaxed">
              To the extent permitted by applicable law, you agree to indemnify and hold harmless Macenza, its directors, officers, employees, affiliates, contractors, partners, and service providers from claims, liabilities, damages, losses, costs, and expenses arising from:
            </p>
            <ul className="list-disc list-inside space-y-1 text-black/80 text-sm pl-2">
              <li>Your violation of these Terms</li>
              <li>Your unlawful use of the website</li>
              <li>Information or content you submit that violates the rights of another person</li>
              <li>Your infringement of intellectual-property rights</li>
              <li>Your fraudulent or unauthorized activities</li>
              <li>Your violation of applicable laws or regulations</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              This provision applies only to the extent permitted by applicable law.
            </p>
          </div>

          {/* 16. Suspension and Termination */}
          <div id="section-16" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">16. Suspension and Termination</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Macenza may restrict, suspend, or terminate access to the website or applicable services where reasonably necessary, including if:
            </p>
            <ul className="list-disc list-inside space-y-1 text-black/80 text-sm pl-2">
              <li>You violate these Terms</li>
              <li>You engage in unlawful or fraudulent activity</li>
              <li>Your activity creates a security risk</li>
              <li>Your activity harms the website or other users</li>
              <li>We are required to do so by law</li>
              <li>The relevant service is discontinued</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              Where appropriate and legally required, we may provide notice before taking such action.
            </p>
            <p className="text-black/80 text-sm leading-relaxed">
              Termination or suspension does not affect rights or obligations that accrued before termination.
            </p>
          </div>

          {/* 17. Privacy */}
          <div id="section-17" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">17. Privacy</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Your privacy is important to us.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              Our collection, use, storage, protection, and processing of personal information are described in our Privacy Policy.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              By using the website, you acknowledge that you have reviewed the Privacy Policy.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              For Careers applicants, the Privacy Policy also explains how recruitment and application information may be processed.
            </p>
          </div>

          {/* 18. Cookies */}
          <div id="section-18" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">18. Cookies</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Macenza may use cookies and similar technologies to operate, secure, analyze, and improve the website.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              Your use of cookies and related technologies may be subject to our Cookie Policy, where applicable.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              You may also be able to manage certain cookies through your browser settings.
            </p>
          </div>

          {/* 19. Changes to These Terms */}
          <div id="section-19" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">19. Changes to These Terms</h2>
            <p className="text-black/80 text-base leading-relaxed">
              We may update these Terms from time to time to reflect changes to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-black/80 text-sm pl-2">
              <li>Our services</li>
              <li>Our website</li>
              <li>Technology</li>
              <li>Business practices</li>
              <li>Applicable laws or regulations</li>
              <li>Security requirements</li>
            </ul>
            <p className="text-black/80 text-sm leading-relaxed pt-2">
              When we update these Terms, we will change the &quot;Last Updated&quot; date.
            </p>
            <p className="text-black/80 text-sm leading-relaxed">
              Where appropriate, we may provide additional notice of material changes.
            </p>
            <p className="text-black/80 text-sm leading-relaxed">
              Your continued use of the website after updated Terms become effective constitutes acceptance of the revised Terms to the extent permitted by applicable law.
            </p>
          </div>

          {/* 20. Governing Law and Jurisdiction */}
          <div id="section-20" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">20. Governing Law and Jurisdiction</h2>
            <p className="text-black/80 text-base leading-relaxed">
              These Terms shall be governed by and interpreted in accordance with the applicable laws of India, without regard to conflict-of-law principles.
            </p>
            <p className="text-black/80 text-base leading-relaxed font-semibold">
              Subject to applicable law, disputes arising from or relating to these Terms or your use of the website shall be subject to the jurisdiction of the competent courts in Ajmer, Rajasthan, India.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              Nothing in this section prevents either party from seeking urgent or legally available remedies in another competent jurisdiction where permitted by law.
            </p>
          </div>

          {/* 21. Severability */}
          <div id="section-21" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">21. Severability</h2>
            <p className="text-black/80 text-base leading-relaxed">
              If any provision of these Terms is determined to be invalid, unlawful, or unenforceable, that provision shall be interpreted or modified to the minimum extent necessary to make it enforceable where legally possible.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              The remaining provisions will continue in full force and effect.
            </p>
          </div>

          {/* 22. No Waiver */}
          <div id="section-22" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">22. No Waiver</h2>
            <p className="text-black/80 text-base leading-relaxed">
              If Macenza does not immediately enforce a provision of these Terms, that does not constitute a waiver of our right to enforce that provision in the future.
            </p>
          </div>

          {/* 23. Entire Agreement */}
          <div id="section-23" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">23. Entire Agreement</h2>
            <p className="text-black/80 text-base leading-relaxed">
              These Terms, together with our Privacy Policy and any additional agreements applicable to specific products or services, constitute the applicable agreement regarding your use of the website, unless a separate written agreement applies.
            </p>
            <p className="text-black/80 text-base leading-relaxed">
              Where a specific written agreement conflicts with these Terms, the specific written agreement will control to the extent of the conflict.
            </p>
          </div>

          {/* 24. Contact Us */}
          <div id="section-24" className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">24. Contact Us</h2>
            <p className="text-black/80 text-base leading-relaxed">
              If you have questions, concerns, or requests regarding these Terms &amp; Conditions, please contact us:
            </p>
            <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl space-y-2">
              <p className="font-bold text-black">Macenza</p>
              <p className="text-sm text-black/80">Email: <a href="mailto:info@macenza.com" className="text-primary font-bold hover:underline">info@macenza.com</a></p>
              <p className="text-sm text-black/80">Website: <a href="https://macenza.com" className="text-primary font-bold hover:underline">macenza.com</a></p>
            </div>
          </div>

          {/* Footer copyright note */}
          <div className="pt-8 border-t border-black/10 text-center">
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

export default Terms;
