// // // 'use client'
// // // import  { useState } from 'react';
// // // import { Menu, X, ArrowRight } from 'lucide-react';

// // // const navLinks = [
// // //   { name: 'Home', href: '/' },
// // //   { name: 'About', href: '/about' },
// // //   { name: 'Products', href: '/products' },
// // //   { name: 'Contact Us', href: '/contact' },
// // // ];

// // // const Navbar = () => {
// // //   const [isOpen, setIsOpen] = useState(false);

// // //   return (
// // //     <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
// // //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// // //         <div className="flex justify-between h-[5rem] items-center">
          
// // //           {/* Logo Built with Code */}
// // //           <div className="flex items-center gap-3 cursor-pointer select-none">
// // //             {/* The Icon */}
// // //             <img 
// // //               src="/hexacare-logo.png" 
// // //               alt="Hexacare Icon" 
// // //               className="h-18 w-18 object-contain rounded-full shrink-0" 
// // //             />
            
// // //             {/* The Code-Based Typography */}
// // //             <div className="flex flex-col justify-center pt-1">
// // //               {/* Top Line: Brand Name + TM */}
// // //               <div className="flex items-start">
// // //                 <span className="text-2xl font-black text-[#0050D0] tracking-wide leading-none">
// // //                   HEXACARE
// // //                 </span>
// // //                 <span className="text-[9px] font-bold text-slate-800 ml-0.5 mt-0.5 leading-none">
// // //                   TM
// // //                 </span>
// // //               </div>
              
// // //               {/* Middle Line: Subtitle */}
// // //               <span className="text-[9px] md:text-[10px] font-medium text-slate-500 tracking-[0.08em] mt-1 leading-none">
// // //                 PHARMACEUTICALS PVT. LTD.
// // //               </span>
              
// // //               {/* Divider Line */}
// // //               <div className="w-full border-t border-slate-400/80 my-1"></div>
              
// // //               {/* Bottom Line: Tagline */}
// // //               <span className="text-[8px] md:text-[9px] font-bold text-slate-600 tracking-[0.18em] leading-none">
// // //                 LIFE SAVING MEDICINE
// // //               </span>
// // //             </div>
// // //           </div>

// // //           {/* Desktop Menu */}
// // //           <div className="hidden md:flex space-x-10 items-center">
// // //             {navLinks.map((link) => (
// // //               <a
// // //                 key={link.name}
// // //                 href={link.href}
// // //                 className="relative group text-[16px] font-medium text-slate-700 hover:text-sky-600 transition-colors duration-300"
// // //               >
// // //                 {link.name}
// // //                 <span className="absolute inset-x-0 -bottom-1 h-[2px] bg-sky-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out rounded-full"></span>
// // //               </a>
// // //             ))}
// // //           </div>

// // //           {/* Sky Blue CTA Button (Desktop) */}
// // //           <div className="hidden md:flex items-center">
// // //             <a
// // //               href="/explorer"
// // //               className="group flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-sky-500 rounded-full hover:bg-sky-600 shadow-lg shadow-sky-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
// // //             >
// // //               Explore Products
// // //               <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
// // //             </a>
// // //           </div>

// // //           {/* Mobile Menu Toggle */}
// // //           <div className="md:hidden flex items-center">
// // //             <button 
// // //               onClick={() => setIsOpen(!isOpen)}
// // //               className="text-slate-600 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/20"
// // //               aria-label="Toggle menu"
// // //             >
// // //               {isOpen ? <X size={24} /> : <Menu size={24} />}
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* Mobile Menu Drawer */}
// // //       <div 
// // //         className={`md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-2xl transition-all duration-300 ease-in-out origin-top ${
// // //           isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'
// // //         }`}
// // //       >
// // //         <div className="px-4 pt-4 pb-6 space-y-2">
// // //           {navLinks.map((link) => (
// // //             <a
// // //               key={link.name}
// // //               href={link.href}
// // //               className="block px-4 py-3 text-[17px] font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-600 rounded-xl transition-all"
// // //               onClick={() => setIsOpen(false)}
// // //             >
// // //               {link.name}
// // //             </a>
// // //           ))}
// // //           {/* Mobile CTA */}
// // //           <div className="pt-4 pb-2">
// // //             <a
// // //               href="/explorer"
// // //               className="flex items-center justify-center gap-2 w-full px-6 py-3 text-sm font-medium text-white bg-sky-500 rounded-xl hover:bg-sky-600 shadow-md shadow-sky-500/20 transition-all active:scale-[0.98]"
// // //               onClick={() => setIsOpen(false)}
// // //             >
// // //               Explore Products
// // //               <ArrowRight size={16} />
// // //             </a>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </nav>
// // //   );
// // // };

// // // export default Navbar;

// // 'use client'
// // import React, { useState } from 'react';
// // import { Menu, X, ArrowRight } from 'lucide-react';

// // const navLinks = [
// //   { name: 'Home', href: '/' },
// //   { name: 'About', href: '/about' },
// //   { name: 'Products', href: '/products' },
// //   { name: 'Contact Us', href: '/contact' },
// // ];

// // const Navbar = () => {
// //   const [isOpen, setIsOpen] = useState(false);

// //   return (
// //     <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
// //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //         <div className="flex justify-between h-[5rem] items-center">
          
// //           {/* Logo Built with Code */}
// //           <div className="flex items-center gap-3 cursor-pointer select-none">
// //             {/* The Icon */}
// //             <img 
// //               src="/hexacare-logo.png" 
// //               alt="Hexacare Icon" 
// //               className="h-18 w-18 object-contain rounded-full shrink-0" 
// //             />
            
// //             {/* The Code-Based Typography */}
// //             <div className="flex flex-col justify-center pt-1">
// //               {/* Top Line: Brand Name + TM */}
// //               <div className="flex items-start">
// //                 <span className="text-2xl font-black text-[#0050D0] tracking-wide leading-none">
// //                   HEXACARE
// //                 </span>
// //                 <span className="text-[9px] font-bold text-slate-800 ml-0.5 mt-0.5 leading-none">
// //                   TM
// //                 </span>
// //               </div>
              
// //               {/* Middle Line: Subtitle */}
// //               <span className="text-[9px] md:text-[10px] font-medium text-slate-500 tracking-[0.08em] mt-1 leading-none">
// //                 PHARMACEUTICALS PVT. LTD.
// //               </span>
              
// //               {/* Divider Line */}
// //               <div className="w-full border-t border-slate-400/80 my-1"></div>
              
// //               {/* Bottom Line: Tagline */}
// //               <span className="text-[8px] md:text-[9px] font-bold text-slate-600 tracking-[0.18em] leading-none">
// //                 LIFE SAVING MEDICINE
// //               </span>
// //             </div>
// //           </div>

// //           {/* Desktop Menu */}
// //           <div className="hidden md:flex space-x-6 items-center">
// //             {navLinks.map((link) => (
// //               <a
// //                 key={link.name}
// //                 href={link.href}
// //                 className="px-4 py-2 text-[16px] font-medium text-slate-700 rounded-full hover:text-sky-600 hover:bg-white/80 hover:shadow-md hover:shadow-sky-500/20 transition-all duration-300"
// //               >
// //                 {link.name}
// //               </a>
// //             ))}
// //           </div>

// //           {/* Sky Blue CTA Button (Desktop) */}
// //           <div className="hidden md:flex items-center">
// //             <a
// //               href="/explorer"
// //               className="group flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-sky-500 rounded-full hover:bg-sky-600 shadow-lg shadow-sky-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
// //             >
// //               Explore Products
// //               <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
// //             </a>
// //           </div>

// //           {/* Mobile Menu Toggle */}
// //           <div className="md:hidden flex items-center">
// //             <button 
// //               onClick={() => setIsOpen(!isOpen)}
// //               className="text-slate-600 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/20"
// //               aria-label="Toggle menu"
// //             >
// //               {isOpen ? <X size={24} /> : <Menu size={24} />}
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Mobile Menu Drawer */}
// //       <div 
// //         className={`md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-2xl transition-all duration-300 ease-in-out origin-top ${
// //           isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'
// //         }`}
// //       >
// //         <div className="px-4 pt-4 pb-6 space-y-2">
// //           {navLinks.map((link) => (
// //             <a
// //               key={link.name}
// //               href={link.href}
// //               className="block px-4 py-3 text-[17px] font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-600 rounded-sm hover:shadow-md hover:shadow-sky-500/10 transition-all"
// //               onClick={() => setIsOpen(false)}
// //             >
// //               {link.name}
// //             </a>
// //           ))}
// //           {/* Mobile CTA */}
// //           <div className="pt-4 pb-2">
// //             <a
// //               href="/explorer"
// //               className="flex items-center justify-center gap-2 w-full px-6 py-3 text-sm font-medium text-white bg-sky-500 rounded-xl hover:bg-sky-600 shadow-md shadow-sky-500/20 transition-all active:scale-[0.98]"
// //               onClick={() => setIsOpen(false)}
// //             >
// //               Explore Products
// //               <ArrowRight size={16} />
// //             </a>
// //           </div>
// //         </div>
// //       </div>
// //     </nav>
// //   );
// // };

// // export default Navbar;


// 'use client'
// import React, { useState } from 'react';
// import { Menu, X, ArrowRight } from 'lucide-react';

// const navLinks = [
//   { name: 'Home', href: '/' },
//   { name: 'About', href: '/about' },
//   { name: 'Products', href: '/products' },
//   { name: 'Contact Us', href: '/contact' },
// ];

// const Navbar = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <nav className="fixed w-full z-50 bg-slate-50/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm transition-all">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-[5rem] items-center">
          
//           {/* Logo Built with Code */}
//           <div className="flex items-center gap-3 cursor-pointer select-none">
//             {/* The Icon */}
//             <img 
//               src="/hexacare-logo.png" 
//               alt="Hexacare Icon" 
//               className="h-18 w-18 object-contain rounded-full shrink-0" 
//             />
            
//             {/* The Code-Based Typography */}
//             <div className="flex flex-col justify-center pt-1">
//               {/* Top Line: Brand Name + TM */}
//               <div className="flex items-start">
//                 <span className="text-2xl font-black text-[#0050D0] tracking-wide leading-none">
//                   HEXACARE
//                 </span>
//                 <span className="text-[9px] font-bold text-slate-800 ml-0.5 mt-0.5 leading-none">
//                   TM
//                 </span>
//               </div>
              
//               {/* Middle Line: Subtitle */}
//               <span className="text-[9px] md:text-[10px] font-medium text-slate-500 tracking-[0.08em] mt-1 leading-none">
//                 PHARMACEUTICALS PVT. LTD.
//               </span>
              
//               {/* Divider Line */}
//               <div className="w-full border-t border-slate-300 my-1"></div>
              
//               {/* Bottom Line: Tagline */}
//               <span className="text-[8px] md:text-[9px] font-bold text-slate-600 tracking-[0.18em] leading-none">
//                 LIFE SAVING MEDICINE
//               </span>
//             </div>
//           </div>

//           {/* Desktop Menu - UPGRADED */}
//           <div className="hidden md:flex space-x-1 lg:space-x-2 items-center">
//             {navLinks.map((link) => (
//               <a
//                 key={link.name}
//                 href={link.href}
//                 className="px-4 py-2 text-[16px] font-medium text-slate-600 rounded-full hover:text-sky-600 hover:bg-sky-50 transition-colors duration-200"
//               >
//                 {link.name}
//               </a>
//             ))}
//           </div>

//           {/* Sky Blue CTA Button (Desktop) */}
//           <div className="hidden md:flex items-center ml-4">
//             <a
//               href="/explorer"
//               className="group flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-sky-500 rounded-full hover:bg-sky-600 shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
//             >
//               Explore Products
//               <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
//             </a>
//           </div>

//           {/* Mobile Menu Toggle */}
//           <div className="md:hidden flex items-center">
//             <button 
//               onClick={() => setIsOpen(!isOpen)}
//               className="text-slate-600 hover:text-sky-600 p-2 rounded-full bg-white shadow-sm border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/20"
//               aria-label="Toggle menu"
//             >
//               {isOpen ? <X size={24} /> : <Menu size={24} />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Menu Drawer - UPGRADED */}
//       <div 
//         className={`md:hidden absolute top-full left-0 w-full bg-slate-50/95 backdrop-blur-xl border-b border-slate-200/80 shadow-2xl transition-all duration-300 ease-in-out origin-top ${
//           isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'
//         }`}
//       >
//         <div className="px-4 pt-4 pb-6 space-y-1">
//           {navLinks.map((link) => (
//             <a
//               key={link.name}
//               href={link.href}
//               className="block px-4 py-3 text-[16px] font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-colors"
//               onClick={() => setIsOpen(false)}
//             >
//               {link.name}
//             </a>
//           ))}
//           {/* Mobile CTA */}
//           <div className="pt-4 pb-2">
//             <a
//               href="/explorer"
//               className="flex items-center justify-center gap-2 w-full px-6 py-3.5 text-sm font-semibold text-white bg-sky-500 rounded-xl hover:bg-sky-600 shadow-md shadow-sky-500/25 transition-all active:scale-[0.98]"
//               onClick={() => setIsOpen(false)}
//             >
//               Explore Products
//               <ArrowRight size={16} />
//             </a>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

'use client'
import React, { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Products', href: '/product' },
  { name: 'Contact Us', href: '/contact' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-sky-50/90 backdrop-blur-xl border-b border-sky-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[5rem] items-center">
          
          {/* Logo Built with Code */}
          <div className="flex items-center gap-3 cursor-pointer select-none">
            {/* The Icon */}
            <img 
              src="/hexacare-logo.png" 
              alt="Hexacare Icon" 
              className="h-18 w-18 object-contain rounded-full shrink-0" 
            />
            
            {/* The Code-Based Typography */}
            <div className="flex flex-col justify-center pt-1">
              {/* Top Line: Brand Name + TM */}
              <div className="flex items-start">
                <span className="text-2xl font-black text-[#0050D0] tracking-wide leading-none">
                  HEXACARE
                </span>
                <span className="text-[9px] font-bold text-slate-800 ml-0.5 mt-0.5 leading-none">
                  TM
                </span>
              </div>
              
              {/* Middle Line: Subtitle */}
              <span className="text-[9px] md:text-[10px] font-medium text-slate-500 tracking-[0.08em] mt-1 leading-none">
                PHARMACEUTICALS PVT. LTD.
              </span>
              
              {/* Divider Line */}
              <div className="w-full border-t border-slate-300 my-1"></div>
              
              {/* Bottom Line: Tagline */}
              <span className="text-[8px] md:text-[9px] font-bold text-slate-600 tracking-[0.18em] leading-none">
                LIFE SAVING MEDICINE
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-1 lg:space-x-2 items-center">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-[16px] font-medium text-slate-600 rounded-full hover:text-sky-600 hover:bg-white/80 transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Sky Blue CTA Button (Desktop) */}
          <div className="hidden md:flex items-center ml-4">
            <a
              href="/explorer"
              className="group flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-sky-500 rounded-full hover:bg-sky-600 shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Explore Products
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-sky-600 p-2 rounded-full bg-white shadow-sm border border-sky-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-sky-50/95 backdrop-blur-xl border-b border-sky-100 shadow-2xl transition-all duration-300 ease-in-out origin-top ${
          isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'
        }`}
      >
        <div className="px-4 pt-4 pb-6 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block px-4 py-3 text-[16px] font-medium text-slate-600 hover:bg-white/80 hover:text-sky-600 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </a>
          ))}
          {/* Mobile CTA */}
          <div className="pt-4 pb-2">
            <a
              href="/explorer"
              className="flex items-center justify-center gap-2 w-full px-6 py-3.5 text-sm font-semibold text-white bg-sky-500 rounded-xl hover:bg-sky-600 shadow-md shadow-sky-500/25 transition-all active:scale-[0.98]"
              onClick={() => setIsOpen(false)}
            >
              Explore Products
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;