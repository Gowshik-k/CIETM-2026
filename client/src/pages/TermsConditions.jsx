import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CreditCard, RefreshCw, ShieldCheck, Mail } from 'lucide-react';

const TermsConditions = () => {
  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-5 py-2 rounded-full bg-indigo-50 text-indigo-600 font-extrabold text-xs tracking-widest uppercase mb-5">Legal Documentation</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Policies</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Please read these terms and conditions carefully before registering for CIETM-2026.
          </p>
        </div>

        <div className="space-y-12">

          {/* Terms of Service Section */}
          <section id="terms" className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <FileText size={200} />
            </div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <FileText size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Terms & Conditions</h2>
            </div>
            
            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p>
                Welcome to CIETM-2026. By registering for the conference, you agree to comply with and be bound by the following terms and conditions.
              </p>
              
              <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2">1. Registration & Participation</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Registration is confirmed only after full payment of fees.</li>
                <li>The organizing committee reserves the right to accept or reject any registration.</li>
                <li>Participants must carry their confirmation email/ID card for entry.</li>
                <li>All attendees are expected to behave professionally and respectfully.</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2">2. Paper Submission & Publication</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Authors must guarantee that their work is original and not published elsewhere.</li>
                <li>Plagiarism checks will be conducted; papers with &gt;15% similarity may be rejected.</li>
                <li>Accepted papers must be presented by at least one author to be included in proceedings.</li>
                <li>The conference organizers reserve the right to publish titles and abstracts of accepted papers.</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2">3. Intellectual Property</h3>
              <p>
                Authors retain copyright of their work but grant CIETM-2026 a license to publish and distribute their paper in conference proceedings and associated journals.
              </p>
            </div>
          </section>

          {/* Payment Policy Section */}
          <section id="payment" className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <CreditCard size={200} />
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <CreditCard size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Payment Policy</h2>
            </div>

            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p>
                All registration fees must be paid in full to secure your participation.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-2">Currency</h4>
                  <p className="text-sm">All fees are billed in Indian Rupees (INR). International delegates may be charged equivalent amounts based on current exchange rates.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-2">Payment Methods</h4>
                  <p className="text-sm">We accept major Credit/Debit Cards, Net Banking, and UPI via our secure payment gateway partner (PayU).</p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2">Confirmation & Receipts</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>A payment receipt will be generated and emailed instantly upon successful transaction.</li>
                <li>If payment is deducted but no receipt is received, please contact support immediately with transaction details.</li>
                <li>GST and other applicable taxes are included/excluded as per government norms at the time of payment.</li>
              </ul>
            </div>
          </section>

          {/* Refund Policy Section */}
          <section id="refund" className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <RefreshCw size={200} />
            </div>
            
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <ShieldCheck size={24} /> {/* Using ShieldCheck or RefreshCw */}
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Refund & Cancellation Policy</h2>
            </div>

            <div className="space-y-6 text-slate-600 leading-relaxed">
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 text-amber-900">
                <p className="font-bold mb-2">Important Notice</p>
                <p className="text-sm">
                  Registration fees are generally non-refundable once the paper is accepted and registered. Please review your availability before paying.
                </p>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2">Cancellation Rules</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                      <th className="py-3 font-bold">Timeframe</th>
                      <th className="py-3 font-bold">Refund Eligibility</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-slate-100">
                      <td className="py-4 font-bold text-slate-700">Paper Rejected</td>
                      <td className="py-4 text-blue-600 font-bold">100% Refund (if paid early)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-4 font-bold text-slate-700">Before March 24, 2026</td>
                      <td className="py-4 text-slate-600">50% Refund (Processing fee deducted)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                       <td className="py-4 font-bold text-slate-700">After March 24, 2026</td>
                      <td className="py-4 text-red-500 font-bold">No Refund</td>
                    </tr>
                    <tr>
                       <td className="py-4 font-bold text-slate-700">Duplicate Payment</td>
                      <td className="py-4 text-blue-600 font-bold">100% Refund (within 7-10 days)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2">Refund Processing</h3>
              <p>
                Refunds (if approved) will be processed to the original payment method within 7-10 business days.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <div className="text-center pt-10">
            <p className="text-slate-500 mb-4">Have questions regarding these policies?</p>
            <a href="mailto:support@cietm2026.com" className="inline-flex items-center gap-2 btn btn-secondary px-8 py-3 rounded-full hover:bg-slate-100">
              <Mail size={18} /> Contact Support
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
