import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, ChevronDown, ChevronUp, AlertTriangle, 
  ArrowRight, Download, Edit3, Type, Layout, List, FileText, 
  Settings, Award, Sparkles, HelpCircle 
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/* ─── Expandable Section Wrapper ─────────────────────────── */
const ExpandableSection = ({ id, icon: Icon, title, badge, description, color, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="glass-panel overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300">
      <div 
        className="flex items-center justify-between p-6 cursor-pointer bg-dark-900/30"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
            <Icon size={20} style={{ color: color }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{title}</h3>
              {badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gray-800 text-gray-400">
                  {badge}
                </span>
              )}
            </div>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
          </div>
        </div>
        <div className="text-gray-600 group">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      {isOpen && (
        <div className="p-6 border-t border-gray-800 animate-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

/* ─── Summary Banner ─────────────────────────────────────── */
const SummaryBanner = ({ title, metrics, color }) => (
  <div className="rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6" style={{ backgroundColor: color + '10', border: `1px solid ${color}20` }}>
    <p className="text-sm font-bold text-gray-200">{title}</p>
    <div className="flex flex-wrap gap-4">
      {metrics.map((m, i) => (
        <div key={i} className="flex items-center gap-2 bg-dark-950/50 px-3 py-1.5 rounded-lg border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-gray-500">{m.label}:</span>
          <span className="text-sm font-black" style={{ color: color }}>{m.value}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Flagged Sentence Card ──────────────────────────────── */
const FlaggedCard = ({ title, subtitle, count, children }) => (
  <div className="glass-panel p-5 bg-dark-950/40 border-l-4 border-amber-500/50 mb-4">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-500" /> {title}
        </h4>
        <p className="text-xs text-amber-500/70 mt-1">{subtitle}</p>
      </div>
      {count !== undefined && (
        <span className="text-xs font-bold text-amber-500 px-2 py-1 rounded bg-amber-500/10">
          {count} suggestions
        </span>
      )}
    </div>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

const ResumeAuditResult = ({ data, onReset }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    const element = document.getElementById('resume-audit-report');
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#080C18' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`resume-audit-${data.sections?.checklist[0]?.value || 'report'}.pdf`);
    setDownloading(false);
  };

  const categories = [
    { label: 'Content', key: 'content', color: '#3b82f6', count: data.categories?.content?.suggestions },
    { label: 'Skills', key: 'skills', color: '#94a3b8', count: data.categories?.skills?.suggestions },
    { label: 'Format', key: 'format', color: '#f97316', count: data.categories?.format?.suggestions },
    { label: 'Sections', key: 'sections', color: '#ec4899', count: data.categories?.sections?.suggestions },
    { label: 'Style', key: 'style', color: '#a855f7', count: data.categories?.style?.suggestions },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* ── Progress Bar ── */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">1</div>
          <span className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Report</span>
        </div>
        <div className="h-[2px] w-12 bg-gray-800"></div>
        <div className="flex items-center gap-3 opacity-30">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold">2</div>
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Resume</span>
        </div>
        <div className="h-[2px] w-12 bg-gray-800"></div>
        <div className="flex items-center gap-3 opacity-30">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold">3</div>
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Cover Letter</span>
        </div>
      </div>

      <div id="resume-audit-report" className="space-y-8">
        
        {/* ── SECTION 1: Score Overview ── */}
        <div className="glass-panel p-10 bg-gradient-to-br from-dark-900 via-dark-950 to-dark-950 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
             <Award size={120} className="text-amber-500" />
          </div>
          
          <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
            {/* Ring Score */}
            <div className="relative w-48 h-48 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                <circle 
                  cx="96" cy="96" r="80" stroke="#f59e0b" strokeWidth="12" fill="transparent"
                  strokeDasharray={2 * Math.PI * 80}
                  strokeDashoffset={2 * Math.PI * 80 * (1 - data.score / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black text-white leading-none">{data.score}</span>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest mt-1">Score</span>
              </div>
            </div>

            {/* Info and Progress Bars */}
            <div className="flex-1 w-full space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                  {data.suggestionsCount} suggestions <HelpCircle size={16} className="text-gray-500" />
                </h2>
                <p className="text-gray-400 text-sm">Resumes with a score of 75 or higher are more likely to pass ATS.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {categories.map((cat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                      <span className="text-gray-400">{cat.label}</span>
                      <span className="text-gray-500">{cat.count} suggestions</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(data.categories[cat.key]?.score || 0) * 10}%`, backgroundColor: cat.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                <Edit3 size={18} /> Edit Resume
              </button>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: Overview Panel ── */}
        <ExpandableSection id="overview" icon={Sparkles} title="Overview" color="#3b82f6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <div>
                    <p className="text-sm font-black text-white mb-2 uppercase tracking-widest">Match Score: <span className="text-primary-400">{data.score}%</span></p>
                    <p className="text-gray-400 text-sm leading-relaxed">{data.overview?.summary}</p>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                       <h5 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-3">Highlights</h5>
                       <ul className="space-y-2">
                          {data.overview?.highlights?.map((h, i) => (
                            <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                               <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" /> {h}
                            </li>
                          ))}
                       </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                       <h5 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-3">Key Improvements</h5>
                       <ul className="space-y-2">
                          {data.overview?.improvements?.map((im, i) => (
                            <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                               <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" /> {im}
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </div>

              <div className="h-64 lg:h-full min-h-[300px] flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.overview?.radarData}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} />
                      <Radar name="Resume" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </ExpandableSection>

        {/* ── SECTION 3: Content ── */}
        <ExpandableSection 
          id="content" icon={Type} title="Content" color="#3b82f6" 
          badge={data.categories?.content?.suggestions} 
          description="This section ensures your resume includes measurable results and is free from errors."
        >
           <SummaryBanner 
             title="Almost there! Let's refine your content..." 
             color="#3b82f6"
             metrics={[
               { label: 'Measurable Result', value: data.content?.measurableResults?.count },
               { label: 'Spelling & Grammar', value: data.content?.spellingGrammar?.errors?.length }
             ]}
           />
           
           <FlaggedCard 
             title="Measurable Result" 
             subtitle="Add specific, measurable achievements to highlight the impact of your work."
             count={data.content?.measurableResults?.count}
           >
              {data.content?.measurableResults?.flagged?.map((s, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-lg text-xs text-gray-400 italic">"{s}"</div>
              ))}
           </FlaggedCard>

           <FlaggedCard 
             title="Spelling & Grammar" 
             subtitle="Fix the following spelling and grammar errors."
           >
              {data.content?.spellingGrammar?.errors?.map((err, i) => (
                <div key={i} className="space-y-1">
                   <p className="text-xs text-gray-300">
                      {err.original.split(err.error).map((part, j, arr) => (
                        <React.Fragment key={j}>
                          {part}
                          {j < arr.length - 1 && <span className="font-bold text-rose-500 underline decoration-rose-500/50">{err.error}</span>}
                        </React.Fragment>
                      ))}
                      <ArrowRight size={12} className="inline mx-2 text-gray-600" />
                      <span className="text-emerald-400 font-bold">{err.fix}</span>
                   </p>
                   <p className="text-[10px] text-gray-500 italic">— {err.explanation}</p>
                </div>
              ))}
           </FlaggedCard>
        </ExpandableSection>

        {/* ── SECTION 4: Skills ── */}
        <ExpandableSection id="skills" icon={Award} title="Skills" color="#ef4444" badge={data.categories?.skills?.suggestions}>
           <SummaryBanner 
             title="Add these key skills for a stronger match!" 
             color="#ef4444"
             metrics={[
               { label: 'Hard Skills', value: data.skills?.hardSkills?.filter(s => s.status === 'missing').length },
               { label: 'Soft Skills', value: data.skills?.softSkills?.filter(s => s.status === 'missing').length }
             ]}
           />

           <div className="space-y-6">
              <div>
                 <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Hard Skills</h4>
                 <div className="overflow-hidden rounded-xl border border-gray-800">
                    <table className="w-full text-left text-xs">
                       <thead className="bg-white/5 text-gray-500 font-bold">
                          <tr>
                             <th className="p-4 w-10">Status</th>
                             <th className="p-4">Skill Name</th>
                             <th className="p-4 text-center">JD</th>
                             <th className="p-4 text-center">Resume</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-800">
                          {data.skills?.hardSkills?.map((s, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                               <td className="p-4">{s.status === 'found' ? <CheckCircle2 className="text-emerald-500" size={14} /> : <XCircle className="text-rose-500" size={14} />}</td>
                               <td className="p-4 font-bold text-gray-200">{s.name}</td>
                               <td className="p-4 text-center text-gray-400">{s.required}</td>
                               <td className="p-4 text-center font-bold" style={{ color: s.found > 0 ? '#10b981' : '#ef4444' }}>{s.found}</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/20 text-xs text-gray-400 italic">
                 <span className="font-bold text-primary-400 mr-2">Pro Tip:</span>
                 If a skill doesn't fit easily in your resume, mention it in your cover letter.
              </div>
           </div>
        </ExpandableSection>

        {/* ── SECTION 5: Format ── */}
        <ExpandableSection id="format" icon={Layout} title="Format" color="#f97316">
           <SummaryBanner title="Nice work! Your formatting is well-optimized..." color="#f97316" metrics={[]} />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(data.format || {}).map(([key, val], i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-gray-800 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                   </div>
                   <span className="text-[10px] font-black text-emerald-500">PASS</span>
                </div>
              ))}
           </div>
        </ExpandableSection>

        {/* ── SECTION 6: Sections ── */}
        <ExpandableSection id="sections" icon={List} title="Sections" color="#ec4899">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.sections?.checklist?.map((item, i) => (
                <div key={i} className={`p-4 rounded-xl border flex items-center justify-between ${item.status === 'PASS' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                   <div className="flex items-center gap-3 overflow-hidden">
                      {item.status === 'PASS' ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> : <XCircle size={14} className="text-rose-500 shrink-0" />}
                      <div className="overflow-hidden">
                        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider leading-none mb-1">{item.label}</p>
                        <p className="text-xs font-bold text-gray-200 truncate">{item.value || (item.status === 'PASS' ? 'Present' : 'Missing')}</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </ExpandableSection>

        {/* ── SECTION 7: Style ── */}
        <ExpandableSection id="style" icon={Settings} title="Style" color="#a855f7">
           <div className="space-y-6">
              <div className="glass-panel p-5 bg-dark-950/40 border-l-4 border-purple-500/50">
                 <h4 className="text-sm font-bold text-white flex items-center justify-between">
                   Voice <div className="flex gap-2">{data.style?.voice?.tags?.map((t, i) => <span key={i} className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">{t}</span>)}</div>
                 </h4>
                 <div className="mt-4 space-y-3">
                    {data.style?.voice?.flagged?.map((f, i) => (
                      <div key={i} className="text-xs">
                        <p className="text-gray-500 italic mb-1">"{f.original}"</p>
                        <p className="text-gray-300"><ArrowRight size={12} className="inline mr-2 text-purple-500" /> <span className="text-purple-400 font-bold">{f.suggestion}</span></p>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="glass-panel p-5 bg-dark-950/40 border-l-4 border-rose-500/50">
                 <h4 className="text-sm font-bold text-white mb-4">Buzzwords & Clichés</h4>
                 <div className="space-y-4">
                    {data.style?.buzzwords?.map((b, i) => (
                      <div key={i} className="text-xs">
                        <p className="text-gray-300">
                           {b.sentence.split(b.phrase).map((part, j, arr) => (
                             <React.Fragment key={j}>
                               {part}
                               {j < arr.length - 1 && <span className="font-bold text-rose-500">{b.phrase}</span>}
                             </React.Fragment>
                           ))}
                           <ArrowRight size={12} className="inline mx-2 text-gray-600" />
                           <span className="text-emerald-400 font-bold">{b.suggestion}</span>
                        </p>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </ExpandableSection>
      </div>

      {/* ── Actions ── */}
      <div className="mt-12 space-y-4">
        <button 
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 text-white font-black text-xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
        >
          {downloading ? <Loader2 className="animate-spin" /> : <><Download size={22} /> Download Full Audit Report as PDF</>}
        </button>
        <button onClick={onReset} className="w-full py-4 text-gray-500 font-bold hover:text-white transition-colors">
          Analyze Another Resume
        </button>
      </div>

    </div>
  );
};

export default ResumeAuditResult;
