'use client'
import React from 'react';

export type ProductStatus = "Available" | "Limited Stock" | "Special Order";

export interface Product {
  name: string;
  category: string;
  indication: string;
  dosage: string;
  status: ProductStatus;
  info: string;
}

export const statusStyles: Record<ProductStatus, string> = {
  "Available": "bg-emerald-100 text-emerald-700",
  "Limited Stock": "bg-amber-100 text-amber-700",
  "Special Order": "bg-sky-100 text-sky-700",
};

interface ProductTableProps {
  products: Product[];
  cellPaddingClassName?: string;
}

export default function ProductTable({ products, cellPaddingClassName = "p-4 sm:p-5" }: ProductTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-sky-200 shadow-sm bg-white">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead>
          <tr className="bg-[#082F49] text-white font-display">
            {["Medicine Name", "Category", "Indication", "Dosage Format", "Availability", "Notes"].map((h) => (
              <th key={h} className={`${cellPaddingClassName} font-bold whitespace-nowrap`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#0284C7]/10">
          {products.length > 0 ? (
            products.map((p) => (
              <tr key={p.name} className="hover:bg-[#EAF6FF]/35 transition-colors group">
                <td className={`${cellPaddingClassName} whitespace-nowrap font-bold text-[#0284C7]`}>
                  {p.name}
                </td>
                <td className={`${cellPaddingClassName} text-[#4B6584] font-medium whitespace-nowrap`}>
                  {p.category}
                </td>
                <td className={`${cellPaddingClassName} text-[#4B6584] whitespace-nowrap`}>
                  {p.indication}
                </td>
                <td className={`${cellPaddingClassName} text-[#4B6584] whitespace-nowrap`}>
                  {p.dosage}
                </td>
                <td className={`${cellPaddingClassName} whitespace-nowrap`}>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${statusStyles[p.status]}`}>
                    {p.status}
                  </span>
                </td>
                <td className={`${cellPaddingClassName} text-[#4B6584] font-medium whitespace-nowrap`}>
                  {p.info}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="p-12 text-center text-[#4B6584] font-medium">
                No medicines found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
