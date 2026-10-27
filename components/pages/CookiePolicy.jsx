import React, { useEffect } from 'react';
import Section from '../components/Section';
import BouncyText from '../components/BouncyText';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const CookiePolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cookieSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Cookie Policy | Macenza",
    "url": "https://www.macenza.com/cookie-policy",
    "description": "Read Macenza's Cookie Policy to understand how cookies and similar technologies are used on macenza.com."
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-primary selection:text-white overflow-x-hidden">
      <SEO
        title="Cookie Policy | Macenza"
        description="Read Macenza's Cookie Policy to understand how cookies and similar technologies are used on macenza.com."
        canonicalPath="/cookie-policy"
        schema={cookieSchema}
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
            <BouncyText text="Cookie " />
            <BouncyText text="Policy" className="text-primary italic" />
          </h1>
          <p className="text-black/60 text-sm font-bold tracking-widest uppercase">
            Last Updated: 11 August 2026
          </p>
        </div>
      </section>

      {/* Main Content */}
      <Section id="cookie-policy-content" className="py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-0 space-y-12">
          
          {/* 1. Introduction */}
          <div id="section-1" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">1. Introduction</h2>
            <p className="text-black/80 text-base md:text-lg leading-relaxed">
              Macenza uses cookies and similar technologies on its website to provide essential functionality, improve website performance, understand how visitors use the website, maintain security, and improve the overall user experience. This Cookie Policy explains what cookies are, how Macenza may use them, and the choices available to you.
            </p>
          </div>

          {/* 2. What Are Cookies? */}
          <div id="section-2" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">2. What Are Cookies?</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Cookies are small text files that may be stored on your device when you visit a website. They allow a website to recognize your device and remember certain information about your visit. Similar technologies may include pixels, tags, local storage, and other technologies that perform functions similar to cookies.
            </p>
          </div>

          {/* 3. How We Use Cookies */}
          <div id="section-3" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">3. How We Use Cookies</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Macenza may use cookies and similar technologies for website functionality, security, performance monitoring, analytics, remembering preferences, understanding website usage, and improving our products and services.
            </p>
          </div>

          {/* 4. Types of Cookies We May Use */}
          <div id="section-4" className="border-b border-black/10 pb-10 space-y-6">
            <h2 className="text-2xl md:text-3xl font-black text-black">4. Types of Cookies We May Use</h2>
            
            <div className="space-y-6 pl-4 border-l-2 border-primary/20">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-black">Essential Cookies</h3>
                <p className="text-black/80 text-sm leading-relaxed">
                  These cookies may be necessary for the website to operate properly, maintain security, enable core functionality, and support navigation. These cookies generally cannot be disabled through website preference controls without affecting website functionality.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-black">Functional Cookies</h3>
                <p className="text-black/80 text-sm leading-relaxed">
                  These cookies may remember preferences and settings to provide a more personalized and convenient experience.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-black">Analytics Cookies</h3>
                <p className="text-black/80 text-sm leading-relaxed">
                  Analytics cookies may help us understand how visitors interact with our website, which pages are visited, how users navigate the website, and how website performance can be improved.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-black">Performance and Security Technologies</h3>
                <p className="text-black/80 text-sm leading-relaxed">
                  We may use cookies or similar technologies to monitor performance, detect abuse, protect the website, prevent fraudulent activity, and maintain security.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-black">Third-Party Cookies</h3>
                <p className="text-black/80 text-sm leading-relaxed">
                  Some third-party services integrated into our website may place cookies or use similar technologies. These services may include analytics, security, embedded media, hosting, or other technology services. Third parties may process information according to their own privacy policies and terms.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Third-Party Services */}
          <div id="section-5" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">5. Third-Party Services</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Depending on the features currently implemented on our website, Macenza may use third-party technology providers for analytics, security, hosting, communications, embedded content, or other website functionality. The specific cookies and technologies used may change as our website and services evolve.
            </p>
          </div>

          {/* 6. Managing Cookies */}
          <div id="section-6" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">6. Managing Cookies</h2>
            <p className="text-black/80 text-base leading-relaxed">
              You can control or manage cookies through your web browser settings. Most browsers allow you to block, delete, or restrict cookies. Please note that disabling certain cookies may affect the availability or functionality of some parts of the website.
            </p>
          </div>

          {/* 7. Cookie Preferences */}
          <div id="section-7" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">7. Cookie Preferences</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Where applicable, Macenza may provide cookie preference controls that allow visitors to manage non-essential cookies. Your preferences may be stored so that they can be applied during future visits.
            </p>
          </div>

          {/* 8. Personal Information and Cookies */}
          <div id="section-8" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">8. Personal Information and Cookies</h2>
            <p className="text-black/80 text-base leading-relaxed">
              Some cookies or similar technologies may collect information that can be associated with a device, browser, or user. The collection and processing of personal information is described in our Privacy Policy.
            </p>
          </div>

          {/* 9. Data Retention */}
          <div id="section-9" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">9. Data Retention</h2>
            <p className="text-black/80 text-base leading-relaxed">
              The length of time cookies remain on your device depends on whether they are session cookies or persistent cookies and on the purpose for which they are used. We may periodically review and update the technologies used on our website.
            </p>
          </div>

          {/* 10. Changes to This Cookie Policy */}
          <div id="section-10" className="border-b border-black/10 pb-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">10. Changes to This Cookie Policy</h2>
            <p className="text-black/80 text-base leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our website, technologies, services, business practices, or applicable legal requirements. When we make changes, we will update the Last Updated date displayed on this page.
            </p>
          </div>

          {/* 11. Contact Us */}
          <div id="section-11" className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-black">11. Contact Us</h2>
            <p className="text-black/80 text-base leading-relaxed">
              If you have questions or concerns about our use of cookies or similar technologies, please contact Macenza:
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

export default CookiePolicy;
