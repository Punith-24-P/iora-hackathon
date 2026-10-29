import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, AlertTriangle, CheckCircle, Scale, ArrowRight, Award } from 'lucide-react';

export default function RulesPage() {
  const rules = [
    {
      num: 1,
      title: 'Registration fee',
      content: 'Participants must register and pay ₹400 per team through the website\'s official payment flow. The registration fee will not be refunded when a team is disqualified due to late arrival.',
    },
    {
      num: 2,
      title: 'Attendance and punctuality',
      content: 'All teams should arrive between 9:00 AM and 9:30 AM. The final arrival deadline is 9:30 AM sharp. Teams arriving after the deadline will be disqualified. The registration fee will not be refunded for late-arrival disqualification.',
    },
    {
      num: 3,
      title: 'Silence and discipline',
      content: 'Every student must maintain silence and discipline throughout the hackathon and follow the organizers\' instructions. Disruptive behaviour may result in disqualification.',
    },
    {
      num: 4,
      title: 'Respect other teams',
      content: 'Teams must not disturb, interrupt or interfere with other teams. Participants must not access, modify or damage another team\'s laptop, code or project.',
    },
    {
      num: 5,
      title: 'Problem statements',
      content: 'The organizers will provide two problem statements at the beginning of the hackathon. Every team must select one and develop a solution that addresses it.',
    },
    {
      num: 6,
      title: 'Project requirements',
      content: 'Every project must be a website or web application incorporating at least one meaningful AI feature and addressing the selected problem statement.',
    },
    {
      num: 7,
      title: 'Technology and tools',
      content: 'Teams may use their preferred technologies, programming languages, frameworks, AI models, APIs and development tools. Every team member must understand and be able to explain the project.',
    },
    {
      num: 8,
      title: 'Originality and plagiarism',
      content: 'Teams must not copy another team\'s project or present someone else\'s work as their own. Previously developed projects must not be submitted as newly created hackathon projects. Existing libraries, frameworks, templates and development tools may be used, but the team\'s main solution must be developed during the hackathon. Plagiarism or deliberate misrepresentation may result in disqualification.',
    },
    {
      num: 9,
      title: 'Project submission deadline',
      content: 'Every team must submit the completed project before 3:00 PM sharp. Failure to submit by the deadline may result in disqualification. The deadline will not be extended for lunch, food breaks or early completion.',
    },
    {
      num: 10,
      title: 'Internet connectivity',
      content: 'The management will not provide Wi-Fi. Each team must arrange its own internet connection or mobile hotspot. In critical situations, management may provide network access if necessary and subject to availability.',
    },
    {
      num: 11,
      title: 'Laptop and power supply',
      content: 'Every participant must bring a fully charged laptop and their own charger. Power supply facilities will be provided at the venue.',
    },
    {
      num: 12,
      title: 'Food and lunch',
      content: 'Organizers will provide snacks and a water bottle. Lunch and other meals will not be provided. Participants must bring their own food if required. There will be no dedicated lunch break. Participants may eat at their convenience, but food breaks will not extend the 3:00 PM deadline.',
    },
    {
      num: 13,
      title: 'Assigned rooms',
      content: 'Participants must remain in their assigned rooms throughout the hackathon. Teams finishing early must remain in their rooms until further instructions. Moving to another room without permission is not allowed.',
    },
    {
      num: 14,
      title: 'Prizes and certificates',
      content: 'Prize money will be awarded to the 1st, 2nd and 3rd place winners. Certificates will be provided to all participants. Prize amounts will be published only after the organizers configure them.',
    },
    {
      num: 15,
      title: 'Judging criteria',
      content: 'Judges will evaluate projects using the announced criteria. Their decision will be final.',
      hasTable: true,
    },
    {
      num: 16,
      title: 'General compliance',
      content: 'Participants must follow all rules and instructions announced by the organizing team. Failure to comply may result in disqualification.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 cyber-grid">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs font-mono text-cyan-400">
            <Scale className="w-3.5 h-3.5" />
            OFFICIAL CODE OF CONDUCT & REGULATIONS
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Official Rules & Regulations
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            All participating teams must strictly adhere to these regulations throughout the event on Thursday, 5 November 2026.
          </p>
        </div>

        {/* Highlight Banner */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-10 flex items-start gap-3 text-xs sm:text-sm text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">Punctuality Reminder:</strong> Arrival window is 9:00 AM – 9:30 AM IST. The final arrival deadline is <strong>9:30 AM sharp</strong>. Teams arriving after 9:30 AM will be disqualified with NO refund.
          </div>
        </div>

        {/* 16 Rules List */}
        <div className="space-y-6">
          {rules.map((rule) => (
            <div
              key={rule.num}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-sm font-mono">
                  {rule.num}
                </div>
                <div className="space-y-3 flex-1">
                  <h3 className="text-lg font-bold text-white capitalize">
                    {rule.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {rule.content}
                  </p>

                  {/* Criteria Table for Rule 15 */}
                  {rule.hasTable && (
                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-3">
                        Judging Criteria Breakdown:
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-700 bg-slate-950/60">
                              <th className="py-2.5 px-3 font-semibold text-slate-300">Evaluation Criterion</th>
                              <th className="py-2.5 px-3 font-semibold text-cyan-300 text-right">Maximum Marks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            <tr>
                              <td className="py-2.5 px-3 text-slate-300">Innovation and originality</td>
                              <td className="py-2.5 px-3 text-cyan-300 font-mono text-right font-bold">20 marks</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 text-slate-300">Real-world usefulness</td>
                              <td className="py-2.5 px-3 text-cyan-300 font-mono text-right font-bold">20 marks</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 text-slate-300">AI implementation</td>
                              <td className="py-2.5 px-3 text-cyan-300 font-mono text-right font-bold">20 marks</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 text-slate-300">Working functionality</td>
                              <td className="py-2.5 px-3 text-cyan-300 font-mono text-right font-bold">20 marks</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 text-slate-300">UI/UX and web design</td>
                              <td className="py-2.5 px-3 text-cyan-300 font-mono text-right font-bold">10 marks</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 text-slate-300">Code quality and explanation</td>
                              <td className="py-2.5 px-3 text-cyan-300 font-mono text-right font-bold">10 marks</td>
                            </tr>
                            <tr className="bg-slate-950/80 font-bold text-white border-t-2 border-cyan-500/40">
                              <td className="py-3 px-3">Total Evaluation Marks</td>
                              <td className="py-3 px-3 text-cyan-400 font-mono text-right text-sm">100 marks</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 italic">
                        Judges will evaluate projects using the announced criteria. Their decision will be final.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center space-y-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            Agree & Proceed to Registration <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
