import React, { useState, useRef } from 'react';
import { 
  ChevronDown, ChevronUp, Download, CheckCircle, AlertTriangle, 
  XCircle, Check, X, FileText, Briefcase, Mail, PenTool, Layout, ListChecks
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import html2pdf from 'html2pdf.js';

const AccordionItem = ({ title, icon: Icon, children, badgeText, defaultOpen = false, themeColor = 'blue' }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const colors = {
    blue: "text-blue-500",
    orange: "text-orange-500",
    red: "text-rose-500",
    pink: "text-pink-500",
    purple: "text-purple-500"
  };

  return (
    <div className="bg-white border text-gray-800 border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-full bg-gray-100 ${colors[themeColor]}`}>
            <Icon size={20} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center gap-4">
          {badgeText && (
             <span className="text-sm font-medium text-gray-500">{badgeText}</span>
          )}
          {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>
      </button>
      {isOpen && (
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
};

const ResumeAuditReport = ({ data }) => {
  const reportRef = useRef(null);

  const downloadPDF = () => {
    const element = reportRef.current;
    html2pdf().from(element).set({
      margin: 10,
      filename: 'resume_audit.pdf',
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
  };

  // Safe fallback if data misses something
  const { content={}, skills={}, format={}, sections={}, style={} } = data;

  return (
    <div className="w-full max-w-7xl mx-auto pb-20">
      
      {/* Download Button */}
      <div className="flex justify-end mb-4">
         <button 
          onClick={downloadPDF}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg transition-all"
        >
          <Download size={18} />
          Download Full Audit Report as PDF
        </button>
      </div>

      <div ref={reportRef} className="bg-gray-100 p-8 rounded-xl !text-gray-800 font-sans">
        
        {/* TOP: Progress Bar */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm flex items-center gap-4 border border-gray-200">
           <div className="flex-1 flex justify-center items-center gap-8">
              <span className="text-emerald-600 font-bold border-b-2 border-emerald-600 pb-1 flex items-center gap-2">
                 <FileText size={16}/> Report
              </span>
              <span className="text-gray-400 border-b-2 border-transparent pb-1 flex items-center gap-2">
                 <FileText size={16}/> Resume
              </span>
              <span className="text-gray-400 border-b-2 border-transparent pb-1 flex items-center gap-2">
                 <Mail size={16}/> Cover Letter
              </span>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT PANEL: Circular Score & Bars */}
          <div className="lg:w-[320px] shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-24">
              
              <div className="flex gap-4 items-center mb-8">
                {/* Circular indicator mock */}
                <div className="w-24 h-24 rounded-full border-8 border-amber-500 flex items-center justify-center font-black text-3xl text-gray-800">
                  {data.matchScore || 71}
                </div>
                <div>
                  <h4 className="font-bold text-rose-600 text-lg">14 suggestions</h4>
                  <p className="text-xs text-gray-500 mt-1">Resumes with a score of 75 or higher are more likely to pass ATS.</p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-5">
                {[
                  { label: "Content", color: "bg-blue-500", val: "w-[85%]", desc: `${content.suggestionCount || 0} suggestions` },
                  { label: "Skills", color: "bg-gray-300", val: "w-[45%]", desc: `${skills.suggestionCount || 0} suggestions` },
                  { label: "Format", color: "bg-orange-500", val: "w-[90%]", desc: "Complete" },
                  { label: "Sections", color: "bg-pink-500", val: "w-[65%]", desc: `${sections.suggestionCount || 0} suggestions` },
                  { label: "Style", color: "bg-purple-500", val: "w-[75%]", desc: `${style.suggestionCount || 0} suggestions` }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm font-bold text-gray-800 mb-1">
                      <span>{item.label}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                       {item.label === 'Format' ? <span className="text-emerald-500 flex items-center gap-1"><CheckCircle size={12}/> Complete</span> : item.desc}
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                       <div className={`h-full ${item.color} ${item.val}`}></div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-8 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">
                Edit Resume
              </button>
            </div>
          </div>

          {/* MAIN CONTENT PANEL */}
          <div className="flex-1 space-y-6">
            
            {/* OVERVIEW PANEL */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="p-6 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Overview</h2>
                  <p className="font-bold text-gray-700 mb-3">Match Score: <span className="text-amber-600">{data.matchScore}</span></p>
                  <p className="text-gray-600 text-sm leading-relaxed">{data.overallSummary}</p>
               </div>
               
               <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Radar Chart */}
                  <div className="flex items-center justify-center h-64 border-r border-gray-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radar}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                        <Radar name="Score" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Highlights & Improvements */}
                  <div className="space-y-4">
                     <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                        <h4 className="font-bold text-emerald-900 mb-2">Highlights</h4>
                        <ul className="space-y-1">
                           {data.highlights?.map((hl, i) => (
                             <li key={i} className="flex gap-2 text-sm text-emerald-800">
                               <CheckCircle size={16} className="shrink-0 text-emerald-600" />
                               <span>{hl}</span>
                             </li>
                           ))}
                        </ul>
                     </div>
                     <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <h4 className="font-bold text-amber-900 mb-2">Improvements</h4>
                        <ul className="space-y-1">
                           {data.improvements?.map((im, i) => (
                             <li key={i} className="flex gap-2 text-sm text-amber-800">
                               <AlertTriangle size={16} className="shrink-0 text-amber-600" />
                               <span>{im}</span>
                             </li>
                           ))}
                        </ul>
                     </div>
                  </div>
               </div>
            </div>

            {/* CONTENT ACCORDION */}
            <AccordionItem title="Content" icon={PenTool} themeColor="blue" badgeText={`${content.suggestionCount || 0} suggestions`} defaultOpen={true}>
                <p className="text-gray-600 text-sm mb-6">
                  This section ensures your resume includes measurable results and is free from spelling and grammar errors.
                </p>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center justify-between mb-6">
                   <h4 className="font-bold text-blue-900">Almost there! Let's refine your content...</h4>
                   <span className="text-sm font-bold text-blue-800">Measurable Result: {content.measurableResults?.length || 0} | Spelling & Grammar: {content.spellingGrammar?.length || 0}</span>
                </div>

                {content.measurableResults?.map((res, i) => (
                  <div key={`mr-${i}`} className="bg-white border border-gray-200 rounded-lg p-5 mb-4 shadow-sm">
                     <div className="flex items-center gap-2 mb-2">
                       <AlertTriangle size={18} className="text-amber-500"/>
                       <h5 className="font-bold text-gray-900">Measurable Result</h5>
                     </div>
                     <p className="text-amber-600 font-medium text-sm mb-4">Add specific, measurable achievements to highlight the impact of your work.</p>
                     
                     <div className="bg-gray-100 p-4 rounded text-gray-600 italic mb-2 text-sm">
                       "{res.original}"
                     </div>
                     <div className="flex gap-2 text-sm text-emerald-700 bg-emerald-50 p-3 rounded items-start">
                        <span className="font-bold">→</span>
                        <span>{res.suggestion}</span>
                     </div>
                  </div>
                ))}

                {content.spellingGrammar?.map((spell, i) => (
                  <div key={`sg-${i}`} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                     <div className="flex items-center gap-2 mb-2">
                       <XCircle size={18} className="text-rose-500"/>
                       <h5 className="font-bold text-gray-900">Spelling & Grammar</h5>
                     </div>
                     <p className="text-amber-600 font-medium text-sm mb-4">Fix the following spelling and grammar errors.</p>
                     
                     <div className="bg-gray-100 p-4 rounded text-gray-600 mb-2 text-sm">
                       {spell.original.split(spell.errorWord).map((part, index, arr) => (
                         <React.Fragment key={index}>
                           {part}
                           {index < arr.length - 1 && <span className="font-bold text-rose-600 underline">{spell.errorWord}</span>}
                         </React.Fragment>
                       ))}
                     </div>
                     <div className="flex gap-2 text-sm text-rose-700 bg-rose-50 p-3 rounded items-center">
                        <span className="font-bold">→</span>
                        <span>{spell.reason}</span>
                     </div>
                  </div>
                ))}
            </AccordionItem>

            {/* SKILLS ACCORDION */}
            <AccordionItem title="Skills" icon={Briefcase} themeColor="red" badgeText={`${skills.suggestionCount || 0} suggestions`}>
                <div className="bg-red-50 border border-red-100 p-4 rounded-lg mb-6">
                   <h4 className="font-bold text-red-900">Add these key skills for a stronger match!</h4>
                   <p className="text-sm text-red-800">Hard Skills: {skills.hardSkills?.length || 0} | Soft Skills: {skills.softSkills?.length || 0}</p>
                </div>

                {/* Hard Skills Table */}
                <h5 className="font-bold text-gray-900 mb-3 ml-1">Hard Skills</h5>
                <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                      <tr>
                        <th className="px-4 py-3 w-10">Status</th>
                        <th className="px-4 py-3">Skill Name</th>
                        <th className="px-4 py-3 text-center">Job Desc.</th>
                        <th className="px-4 py-3 text-center">Your Resume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills.hardSkills?.map((skill, i) => (
                        <tr key={i} className="border-b border-gray-100 bg-white">
                          <td className="px-4 py-3 text-center">
                            {skill.resumeCount > 0 ? <Check size={16} className="text-emerald-500 mx-auto"/> : <X size={16} className="text-rose-500 mx-auto"/>}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {skill.skill} {skill.required && <span className="text-xs text-rose-500 ml-2 bg-rose-50 px-1.5 py-0.5 rounded">Required</span>}
                          </td>
                          <td className="px-4 py-3 text-center">{skill.jdCount}</td>
                          <td className="px-4 py-3 text-center font-bold text-gray-900">{skill.resumeCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Soft Skills Table */}
                <h5 className="font-bold text-gray-900 mb-3 ml-1">Soft Skills</h5>
                <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                      <tr>
                        <th className="px-4 py-3 w-10">Status</th>
                        <th className="px-4 py-3">Skill Name</th>
                        <th className="px-4 py-3 text-center">Job Desc.</th>
                        <th className="px-4 py-3 text-center">Your Resume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills.softSkills?.map((skill, i) => (
                        <tr key={i} className="border-b border-gray-100 bg-white">
                          <td className="px-4 py-3 text-center">
                            {skill.resumeCount > 0 ? <Check size={16} className="text-emerald-500 mx-auto"/> : <X size={16} className="text-rose-500 mx-auto"/>}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {skill.skill}
                          </td>
                          <td className="px-4 py-3 text-center">{skill.jdCount}</td>
                          <td className="px-4 py-3 text-center font-bold text-gray-900">{skill.resumeCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-900 flex gap-3">
                  <span className="font-bold">Pro Tip:</span>
                  <span>If a required skill doesn't fit easily in your resume, mention it in your cover letter.</span>
                </div>
            </AccordionItem>

            {/* FORMAT ACCORDION */}
            <AccordionItem title="Format" icon={Layout} themeColor="orange" badgeText="Complete">
               <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg mb-6 flex items-center justify-between">
                   <h4 className="font-bold text-emerald-900">Nice work! Your formatting is well-optimized.</h4>
               </div>
               <div className="space-y-4">
                 {format.metrics?.map((m, i) => (
                   <div key={i} className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                         <div className="bg-emerald-100 p-1 rounded-full"><Check size={16} className="text-emerald-600" /></div>
                         <h5 className="font-bold text-gray-900">{m.label}</h5>
                         <span className="ml-auto text-sm text-emerald-600 font-bold tracking-widest">{m.status}</span>
                      </div>
                      <p className="text-gray-500 text-sm mt-3 ml-9">{m.message}</p>
                   </div>
                 ))}
               </div>
            </AccordionItem>

            {/* SECTIONS ACCORDION */}
            <AccordionItem title="Sections" icon={ListChecks} themeColor="pink" badgeText={`${sections.suggestionCount || 0} suggestions`}>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                 <h4 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Checklist of required sections</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                    {sections.items?.map((item, i) => (
                       <div key={i} className="flex items-center gap-3">
                         {item.status === 'present' ? (
                            <CheckCircle size={18} className="text-emerald-500" />
                         ) : (
                            <XCircle size={18} className="text-rose-500" />
                         )}
                         <span className={`font-medium ${item.status === 'present' ? 'text-gray-900' : 'text-rose-600 font-bold'}`}>
                           {item.label}
                         </span>
                         {item.status === 'missing' && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded ml-auto mr-4">Missing</span>}
                       </div>
                    ))}
                 </div>
              </div>
            </AccordionItem>

            {/* STYLE ACCORDION */}
            <AccordionItem title="Style" icon={Layout} themeColor="purple" badgeText={`${style.suggestionCount || 0} suggestions`}>
               
               <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4 shadow-sm">
                  <h5 className="font-bold text-gray-900 mb-3">Overall Voice Tone</h5>
                  <div className="flex flex-wrap gap-2">
                     {style.voiceTags?.map((tag, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                           #{tag}
                        </span>
                     ))}
                  </div>
               </div>

               {style.buzzwords?.map((buzz, i) => (
                  <div key={`bw-${i}`} className="bg-white border border-gray-200 rounded-lg p-5 mb-4 shadow-sm">
                     <div className="flex items-center gap-2 mb-2">
                       <AlertTriangle size={18} className="text-amber-500"/>
                       <h5 className="font-bold text-gray-900">Buzzwords & Clichés</h5>
                     </div>
                     
                     <div className="bg-gray-100 p-4 rounded text-gray-600 mb-2 text-sm italic">
                       {buzz.original.split(buzz.clicheWord).map((part, index, arr) => (
                         <React.Fragment key={index}>
                           {part}
                           {index < arr.length - 1 && <span className="font-bold text-rose-600 underline">{buzz.clicheWord}</span>}
                         </React.Fragment>
                       ))}
                     </div>
                     <div className="flex gap-2 text-sm text-gray-700 bg-amber-50 border border-amber-100 p-3 rounded items-center">
                        <span className="font-bold text-amber-600">→</span>
                        <span>{buzz.suggestion}</span>
                     </div>
                  </div>
                ))}
            </AccordionItem>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAuditReport;
