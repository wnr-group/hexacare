'use client'
import React, { useState } from 'react';
import { X, ArrowRight, Check, MessageSquare } from 'lucide-react';

interface OrderMedicinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderMedicinesModal({ isOpen, onClose }: OrderMedicinesModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; phone?: string } = {};
    if (!name.trim()) errors.name = "Name is required";
    if (!phone.trim()) errors.phone = "Phone is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setSubmitted(true);
  };

  const whatsappNumber = "919832487454";
  const whatsappText = "Hello HexaCare, I am a new customer and I would like to enquire about specialty medicines.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 animate-fade-in">
      <div className="bg-[#EAF6FF] rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-sky-200 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-white border-b border-sky-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-2xl font-display font-bold text-[#082F49]">
              Order Medicines Now
            </h3>
            <p className="text-[11px] sm:text-sm text-[#4B6584] mt-0.5">
              Select your customer status to place your order or submit an enquiry.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-[#4B6584] hover:text-[#082F49] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
          
          {/* Section 1: Existing Customer */}
          <div className="flex flex-col gap-6 bg-white/70 backdrop-blur-md rounded-2xl p-5 sm:p-8 border border-sky-150 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl" />
            <div className="flex-1 space-y-3">
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#0284C7] uppercase font-bold block">
                Fast Track Portal
              </span>
              <h4 className="font-display font-bold text-lg sm:text-xl text-[#082F49]">
                Existing Customer
              </h4>
              <p className="text-xs sm:text-sm text-[#4B6584] leading-relaxed">
                If you have ordered from HexaCare before, click below to access our online ordering portal and request your refills instantly.
              </p>
            </div>
            
            <a
              href="https://893679.true-order.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center bg-[#0284C7] hover:bg-[#075985] text-white py-3.5 px-6 rounded-xl font-bold transition-all shadow-lg shadow-[#0284C7]/20 active:scale-[0.98] flex items-center justify-center gap-2 animate-pulse-slow shrink-0"
            >
              Place Order Online <ArrowRight size={18} />
            </a>
          </div>

          {/* Section 2: New Customer Enquiry */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 sm:p-8 border border-sky-150 shadow-sm flex flex-col gap-6">
            <div className="space-y-3">
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#0284C7] uppercase font-bold block">
                Quick Sourcing
              </span>
              <h4 className="font-display font-bold text-lg sm:text-xl text-[#082F49]">
                New Customer
              </h4>
            </div>

            {submitted ? (
              <div className="text-center py-6 flex flex-col items-center justify-center gap-3 flex-1">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <Check size={24} strokeWidth={3} />
                </div>
                <h5 className="font-display font-bold text-lg text-[#082F49]">Enquiry Submitted!</h5>
                <p className="text-xs text-[#4B6584] max-w-xs">
                  Thank you for reaching out. A clinical pharmacist will contact you shortly to assist you.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName("");
                    setPhone("");
                    setMessage("");
                  }}
                  className="mt-2 text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
                >
                  Submit another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="flex flex-col gap-4 flex-1 justify-center">
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Your Name"
                    className={`w-full px-4 py-2.5 rounded-xl border bg-white focus:outline-none focus:border-[#0284C7] shadow-sm transition-colors text-xs text-[#082F49] placeholder:text-[#4B6584]/50 ${formErrors.name ? 'border-rose-500' : 'border-[#0284C7]/20'}`}
                  />
                  {formErrors.name && <p className="text-rose-600 text-[10px] mt-1 font-semibold">{formErrors.name}</p>}
                </div>

                <div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, phone: undefined }));
                    }}
                    placeholder="Phone Number"
                    className={`w-full px-4 py-2.5 rounded-xl border bg-white focus:outline-none focus:border-[#0284C7] shadow-sm transition-colors text-xs text-[#082F49] placeholder:text-[#4B6584]/50 ${formErrors.phone ? 'border-rose-500' : 'border-[#0284C7]/20'}`}
                  />
                  {formErrors.phone && <p className="text-rose-600 text-[10px] mt-1 font-semibold">{formErrors.phone}</p>}
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Medicine name or message (optional)"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#0284C7]/20 bg-white focus:outline-none focus:border-[#0284C7] shadow-sm transition-colors text-xs text-[#082F49] placeholder:text-[#4B6584]/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#082F49] hover:bg-[#0b3252] text-white py-3 rounded-xl font-bold transition-all shadow-md text-xs active:scale-[0.98] shrink-0 cursor-pointer"
                >
                  Submit Enquiry
                </button>
              </form>
            )}

            {/* WhatsApp Integration */}
            <div className="mt-4 pt-4 border-t border-sky-100 flex items-center justify-between gap-2 text-xs shrink-0">
              <span className="text-[#4B6584] font-medium">Or enquire instantly via WhatsApp:</span>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full font-bold shadow-sm transition-transform hover:scale-105 active:scale-95 shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes pulseSlow {
          0%, 100% { transform: scale(1); shadow-color: rgba(2,132,199,0.2); }
          50% { transform: scale(1.02); shadow-color: rgba(2,132,199,0.4); }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scale-up { animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-pulse-slow { animation: pulseSlow 2.5s infinite ease-in-out; }
      `}</style>
    </div>
  );
}
