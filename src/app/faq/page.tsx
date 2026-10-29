import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HelpCircle, ArrowRight } from 'lucide-react';

export default function FaqPage() {
  const faqs = [
    {
      category: 'Registration & Eligibility',
      questions: [
        {
          q: 'Who can register for the AIORA Hackathon?',
          a: 'Undergraduate and postgraduate students from engineering and technology colleges across India are eligible. Every participant must have a valid University Seat Number (USN) or student identity card.',
        },
        {
          q: 'What is the required team size?',
          a: 'A team must have a minimum of 2 and maximum of 4 students, including the team leader (valid team sizes: 2, 3, or 4 members). Solo participation or teams of 5+ are not permitted.',
        },
        {
          q: 'Can members be from different branches or colleges?',
          a: 'Yes. Cross-department and inter-college team members are welcome as long as each student provides their verified USN and institution name during registration.',
        },
      ],
    },
    {
      category: 'Payment & Verification',
      questions: [
        {
          q: 'What is the registration fee?',
          a: 'The registration fee is ₹400 per team. The entire team is covered under this single fee.',
        },
        {
          q: 'How do we make the payment?',
          a: 'During online registration, the official PhonePe QR code is displayed with receiver name PUNITH K K. Scan and pay ₹400 using PhonePe, Google Pay, Paytm, or any UPI application. Enter the 12-digit UPI transaction reference (UTR) on the website.',
        },
        {
          q: 'How does payment verification work?',
          a: 'Because UPI QR payments are processed externally, organizers manually verify each submitted UTR against account statements. Your status will show "Payment verification pending" until approved. Once approved, your team is marked Confirmed.',
        },
        {
          q: 'Is the registration fee refundable?',
          a: 'No. The registration fee of ₹400 is strictly non-refundable, including in instances of late arrival or disqualification.',
        },
      ],
    },
    {
      category: 'Event Logistics & Requirements',
      questions: [
        {
          q: 'What is the arrival deadline?',
          a: 'Arrival and check-in takes place between 9:00 AM and 9:30 AM IST on Thursday, 5 November 2026. 9:30 AM is the strict deadline. Teams arriving after 9:30 AM will be disqualified.',
        },
        {
          q: 'Will Wi-Fi be provided by the organizers?',
          a: 'No. Management will not provide Wi-Fi. Every team must arrange its own internet connection or mobile hotspot. Power supply points will be provided in every room.',
        },
        {
          q: 'What meals will be provided?',
          a: 'The organizers will provide snacks and a water bottle. Lunch and other meals will NOT be provided. Participants must bring their own food if required. There is no dedicated lunch break; development continues until 3:00 PM.',
        },
        {
          q: 'What are the problem statements?',
          a: 'Two problem statements will be revealed by the organizers at 9:30 AM IST sharp at the start of the hackathon. Teams will select one statement to solve.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 cyber-grid">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs font-mono text-cyan-400">
            <HelpCircle className="w-3.5 h-3.5" />
            HACKATHON FAQ KNOWLEDGEBASE
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Everything you need to know about registering, paying, attending, and competing at AIORA.
          </p>
        </div>

        <div className="space-y-12">
          {faqs.map((cat) => (
            <div key={cat.category} className="space-y-4">
              <h2 className="text-xl font-bold text-cyan-300 font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                {cat.category}
              </h2>
              <div className="space-y-4">
                {cat.questions.map((q, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                    <h3 className="text-base font-bold text-white flex items-start gap-2.5">
                      <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                      {q.q}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 pl-7 leading-relaxed">
                      {q.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            Register Your Team Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
