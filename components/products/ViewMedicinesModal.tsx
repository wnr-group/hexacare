'use client'
import React, { useState, useEffect } from 'react';
import { X, Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import ProductTable, { Product } from './ProductTable';

interface ViewMedicinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
}

export default function ViewMedicinesModal({
  isOpen,
  onClose,
  products = []
}: ViewMedicinesModalProps) {
  // If no products passed, use a fallback or import a list.
  // Let's use the static products list as default.
  const displayProducts = products.length > 0 ? products : staticProducts;
  
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [modalActiveCategory, setModalActiveCategory] = useState("All");
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const modalItemsPerPage = 5;

  const modalCategories = ["All", ...Array.from(new Set(displayProducts.map(p => p.category)))];

  const modalFilteredProducts = displayProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) || p.indication.toLowerCase().includes(modalSearchQuery.toLowerCase());
    const matchesCategory = modalActiveCategory === "All" || p.category === modalActiveCategory;
    return matchesSearch && matchesCategory;
  });

  const modalTotalPages = Math.ceil(modalFilteredProducts.length / modalItemsPerPage);
  const modalCurrentProducts = modalFilteredProducts.slice((modalCurrentPage - 1) * modalItemsPerPage, modalCurrentPage * modalItemsPerPage);

  // Reset page when filter changes
  useEffect(() => {
    setModalCurrentPage(1);
  }, [modalSearchQuery, modalActiveCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-6 md:p-10 animate-fade-in">
      <div className="bg-[#EAF6FF] rounded-2xl sm:rounded-3xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-sky-200 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-white border-b border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg sm:text-2xl font-display font-bold text-[#082F49] flex items-center gap-2">
              Specialty Therapeutics Explorer
            </h3>
            <p className="text-xs sm:text-sm text-[#4B6584] mt-0.5">
              Browse our real-time drug database. Can&apos;t find a drug? You can request it.
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0">
            <Link
              href="/product"
              onClick={onClose}
              className="text-xs sm:text-sm font-semibold text-[#0284C7] hover:text-[#075985] flex items-center gap-1 bg-[#EAF6FF] px-3 py-2 rounded-full border border-sky-200 transition-colors"
            >
              Go to Products Page <ExternalLink size={14} />
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-[#4B6584] hover:text-[#082F49] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body with filters and table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B6584]" size={18} />
              <input
                type="text"
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                placeholder="Search medicine or condition..."
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-[#0284C7]/20 bg-white focus:outline-none focus:border-[#0284C7] shadow-sm transition-colors text-sm text-[#082F49]"
              />
            </div>
            {/* Category selector */}
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-full md:max-w-md scrollbar-hide">
              {modalCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setModalActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold border transition-all cursor-pointer ${modalActiveCategory === cat ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm' : 'bg-white text-[#4B6584] border-[#0284C7]/20 hover:bg-[#EAF6FF]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table / Grid */}
          <div className="flex-1 min-h-[300px]">
            <ProductTable products={modalCurrentProducts} cellPaddingClassName="p-3 sm:p-4" />
          </div>

          {/* Numbered Pagination */}
          {modalTotalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-t border-sky-150 mt-auto">
              <span className="text-xs text-[#4B6584] font-medium">
                Showing <span className="font-bold text-[#082F49]">{((modalCurrentPage - 1) * modalItemsPerPage) + 1}</span> to <span className="font-bold text-[#082F49]">{Math.min(modalCurrentPage * modalItemsPerPage, modalFilteredProducts.length)}</span> of <span className="font-bold text-[#082F49]">{modalFilteredProducts.length}</span> results
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setModalCurrentPage(p => Math.max(1, p - 1))}
                  disabled={modalCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-sky-200 bg-white text-[#082F49] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-50 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: modalTotalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setModalCurrentPage(idx + 1)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${modalCurrentPage === idx + 1
                        ? "bg-[#0284C7] text-white shadow-sm border border-[#0284C7]"
                        : "bg-white border border-sky-200 text-[#082F49] hover:bg-sky-50"
                      }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  onClick={() => setModalCurrentPage(p => Math.min(modalTotalPages, p + 1))}
                  disabled={modalCurrentPage === modalTotalPages}
                  className="p-1.5 rounded-lg border border-sky-200 bg-white text-[#082F49] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-50 transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span className="text-[#4B6584] font-medium text-center sm:text-left">
            Can&apos;t find a specific medicine? Submit a sourcing request directly.
          </span>
          <Link
            href="/product#medName"
            onClick={onClose}
            className="w-full sm:w-auto text-center bg-[#0284C7] text-white px-5 py-2.5 rounded-full font-bold hover:bg-[#075985] transition-colors shadow-sm whitespace-nowrap"
          >
            Request Medicines
          </Link>
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
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scale-up { animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
}

const staticProducts: Product[] = [
  { name: "OncoTract 50mg", category: "Oncology", indication: "Targeted Therapy", dosage: "50mg Vial", status: "Special Order", info: "Contact for pricing" },
  { name: "NephroGuard Pro", category: "Nephrology", indication: "Renal Failure", dosage: "10 Sachet Box", status: "Available", info: "Ships in 24 hrs" },
  { name: "CardiaStat Q10", category: "Cardiology", indication: "Heart Failure", dosage: "30 Caps", status: "Available", info: "Ships in 24 hrs" },
  { name: "ImmunoBoost IV", category: "Immunology", indication: "Autoimmune", dosage: "250ml Infusion", status: "Special Order", info: "Cold-chain required" },
  { name: "DiaStabil Max", category: "Endocrinology", indication: "Type 1 Diabetes", dosage: "Pre-filled Pen", status: "Limited Stock", info: "Ships in 48 hrs" },
  { name: "NeuroProtect", category: "Neurology", indication: "Multiple Sclerosis", dosage: "120mg Tabs", status: "Special Order", info: "Contact for pricing" },
  { name: "HepatoCare Liq", category: "Hepatology", indication: "Liver Cirrhosis", dosage: "200ml Bottle", status: "Available", info: "Ships in 24 hrs" },
  { name: "OsteoFix Weekly", category: "Rheumatology", indication: "Osteoporosis", dosage: "1 Tablet/Week", status: "Available", info: "Ships in 24 hrs" },
  { name: "PulmoClear Aero", category: "Pulmonology", indication: "Severe Asthma", dosage: "Inhaler", status: "Limited Stock", info: "Ships in 48 hrs" },
  { name: "RheumaRelief", category: "Rheumatology", indication: "Arthritis", dosage: "10ml Injection", status: "Special Order", info: "Cold-chain required" },
  { name: "OncoBlock 100", category: "Oncology", indication: "Chemotherapy", dosage: "100mg Tabs", status: "Special Order", info: "Contact for pricing" },
  { name: "RenalClear IV", category: "Nephrology", indication: "Dialysis Support", dosage: "1L Bag", status: "Available", info: "Ships in 24 hrs" },
  { name: "CardioRhythm", category: "Cardiology", indication: "Arrhythmia", dosage: "50mg Tabs", status: "Available", info: "Ships in 24 hrs" },
  { name: "ImmunoSuppress", category: "Immunology", indication: "Transplant Rejection", dosage: "1mg Caps", status: "Limited Stock", info: "Ships in 48 hrs" },
];
