'use client'
import React from 'react';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

// Custom SVG Social Icons to replace the missing Lucide brand icons
const FacebookIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const LinkedinIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 pt-16 pb-8 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-6">
            {/* Dark Mode Logo Built with Code */}
            <div className="flex items-center gap-3 select-none">
              <img 
                src="/hexacare-logo.png" 
                alt="Hexacare Icon" 
                className="h-14 w-14 object-contain rounded-full shrink-0 bg-white p-1" 
              />
              <div className="flex flex-col justify-center pt-1">
                <div className="flex items-start">
                  <span className="text-2xl font-black text-white tracking-wide leading-none">
                    HEXACARE
                  </span>
                  <span className="text-[9px] font-bold text-sky-400 ml-0.5 mt-0.5 leading-none">
                    TM
                  </span>
                </div>
                <span className="text-[9px] md:text-[10px] font-medium text-slate-400 tracking-[0.08em] mt-1 leading-none">
                  PHARMACEUTICALS PVT. LTD.
                </span>
                <div className="w-full border-t border-slate-700 my-1"></div>
                <span className="text-[8px] md:text-[9px] font-bold text-sky-500 tracking-[0.18em] leading-none">
                  LIFE SAVING MEDICINE
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed pr-4">
              Dedicated to pioneering life-saving medical solutions. We combine advanced research with uncompromising quality to improve healthcare outcomes globally.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Quick Links</h3>
            <ul className="space-y-4">
              {['About Us', 'Our Products', 'Research & Development', 'Careers', 'Contact Us'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-300 flex items-center gap-2 group">
                    <span className="h-1 w-1 rounded-full bg-slate-700 group-hover:bg-sky-400 transition-colors"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Connect With Us</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin size={18} className="text-sky-500 shrink-0 mt-0.5" />
                <span>123 Innovation Drive,<br />Tech Park, Sector 45<br />New Delhi, 110001</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <Phone size={18} className="text-sky-500 shrink-0" />
                <span>+91 1800 123 4567</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <Mail size={18} className="text-sky-500 shrink-0" />
                <a href="mailto:contact@hexacare.com" className="hover:text-sky-400 transition-colors">
                  contact@hexacare.com
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Newsletter</h3>
            <p className="text-sm text-slate-400 mb-4">
              Subscribe to get the latest updates on our products and medical breakthroughs.
            </p>
            <form className="relative mt-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-500"
                required
              />
              <button 
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg px-4 flex items-center justify-center transition-colors"
                aria-label="Subscribe"
              >
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © {currentYear} Hexacare Pharmaceuticals Pvt. Ltd. All rights reserved.
          </p>
          
          {/* Social Icons */}
          <div className="flex items-center space-x-4">
            <a href="#" className="text-slate-500 hover:text-sky-400 transition-colors p-2 hover:bg-slate-800 rounded-full">
              <LinkedinIcon size={18} />
            </a>
            <a href="#" className="text-slate-500 hover:text-sky-400 transition-colors p-2 hover:bg-slate-800 rounded-full">
              <TwitterIcon size={18} />
            </a>
            <a href="#" className="text-slate-500 hover:text-sky-400 transition-colors p-2 hover:bg-slate-800 rounded-full">
              <FacebookIcon size={18} />
            </a>
            <a href="#" className="text-slate-500 hover:text-sky-400 transition-colors p-2 hover:bg-slate-800 rounded-full">
              <InstagramIcon size={18} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;