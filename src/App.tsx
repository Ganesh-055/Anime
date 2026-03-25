import React, { useState, useRef } from 'react';
import { 
  Clapperboard, 
  Send, 
  Loader2, 
  ChevronRight, 
  Copy, 
  Check, 
  Download,
  Film,
  Image as ImageIcon,
  Mic,
  Music,
  Scissors,
  Youtube,
  Layout,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Step = {
  id: number;
  title: string;
  icon: React.ReactNode;
};

const STEPS: Step[] = [
  { id: 1, title: 'Script', icon: <Film className="w-4 h-4" /> },
  { id: 2, title: 'Scenes', icon: <Layout className="w-4 h-4" /> },
  { id: 3, title: 'Storyboard', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 4, title: 'Image Prompts', icon: <Sparkles className="w-4 h-4" /> },
  { id: 5, title: 'Motion', icon: <RefreshCw className="w-4 h-4" /> },
  { id: 6, title: 'Voiceover', icon: <Mic className="w-4 h-4" /> },
  { id: 7, title: 'Sound', icon: <Music className="w-4 h-4" /> },
  { id: 8, title: 'Editing', icon: <Scissors className="w-4 h-4" /> },
  { id: 9, title: 'Automation', icon: <Layout className="w-4 h-4" /> },
  { id: 10, title: 'YouTube', icon: <Youtube className="w-4 h-4" /> },
];

interface PipelineData {
  [key: string]: string;
}

export default function App() {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('GENERAL');
  const [duration, setDuration] = useState('60 sec');
  const [platform, setPlatform] = useState('YouTube');
  const [artStyle, setArtStyle] = useState('Anime');
  const [tone, setTone] = useState('Educational');
  const [language, setLanguage] = useState('English');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineData | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [copied, setCopied] = useState(false);

  const generatePipeline = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setPipeline(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        SYSTEM ROLE:
        You are an elite animation director, storyboard supervisor, screenplay writer, and AI pipeline architect. You specialize in creating end-to-end animated video production workflows optimized for YouTube content.

        MISSION:
        Generate a COMPLETE animation pipeline from idea → storyboard → visuals → narration → editing prompts.

        INPUT PARAMETERS:
        - Video Topic: ${topic}
        - Target Audience: ${audience}
        - Video Duration: ${duration}
        - Platform: ${platform}
        - Art Style: ${artStyle}
        - Tone: ${tone}
        - Language: ${language}

        ---
        EXECUTION STEPS:

        STEP 1: SCRIPT GENERATION
        - Write a structured script with: Hook, Main Content, Ending.

        STEP 2: SCENE BREAKDOWN
        - Divide the script into scenes with Duration and Purpose.

        STEP 3: MULTI-PANEL STORYBOARD
        - For EACH scene, generate 2–4 storyboard panels with: Panel Number, Shot Type, Camera Angle, Camera Movement, Character Positioning, Action, Emotion, Lighting, Background, Transition.

        STEP 4: AI IMAGE PROMPTS
        - For EACH panel, generate a HIGH-QUALITY AI image prompt (subject, action, environment, lighting, camera angle, mood, art style, ultra-detailed, cinematic).

        STEP 5: ANIMATION / MOTION PROMPTS
        - For EACH panel, describe: Character motion, Camera motion, Effects.

        STEP 6: VOICEOVER SCRIPT
        - Spoken narration with pauses and emphasis cues.

        STEP 7: SOUND DESIGN
        - For EACH scene: Background music type, SFX, Mood progression.

        STEP 8: EDITING INSTRUCTIONS
        - Timeline-based guide: Cuts, Transitions, Text overlays, Zoom effects, Subtitle style.

        STEP 9: PROMPT CHAINING SYSTEM
        - Create reusable modular prompts for: Script, Storyboard, Image, Animation, Voiceover.

        STEP 10: YOUTUBE OPTIMIZATION
        - Title, Thumbnail Idea, Tags, Description.

        ---
        CONSTRAINTS:
        - Maintain cinematic consistency.
        - Avoid repetition.
        - Keep outputs structured and clean.
        - Return the response in a structured format where each step is clearly labeled with "STEP X: [TITLE]".
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      const text = response.text || '';
      
      // Parse the text into steps
      const stepsData: PipelineData = {};
      const stepRegex = /STEP (\d+): (.*?)(?=STEP \d+:|$)/gs;
      let match;
      while ((match = stepRegex.exec(text)) !== null) {
        stepsData[match[1]] = match[2].trim();
      }

      // If parsing fails, just put everything in step 1 for now or handle gracefully
      if (Object.keys(stepsData).length === 0) {
        stepsData["1"] = text;
      }

      setPipeline(stepsData);
      setActiveStep(1);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!pipeline) return;
    const fullText = Object.entries(pipeline)
      .map(([num, content]) => {
        const step = STEPS.find(s => s.id === parseInt(num));
        return `STEP ${num}: ${step?.title || ''}\n${content}`;
      })
      .join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] font-sans selection:bg-[#F27D26] selection:text-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F27D26] rounded flex items-center justify-center">
              <Clapperboard className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">AnimFlow <span className="text-[#F27D26]">AI</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Production Pipeline Architect</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {pipeline && (
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy All'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12">
        {/* Sidebar: Controls */}
        <aside className="space-y-8">
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Video Topic</label>
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. The history of black holes in 60 seconds..."
                className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-sm focus:border-[#F27D26] focus:ring-1 focus:ring-[#F27D26] outline-none transition-all min-h-[100px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Audience</label>
                <select 
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#F27D26]"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="STUDENTS">Students</option>
                  <option value="GENERAL">General</option>
                  <option value="TECHNICAL">Technical</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Duration</label>
                <input 
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#F27D26]"
                  placeholder="60 sec"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Platform</label>
                <select 
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#F27D26]"
                >
                  <option value="YouTube">YouTube</option>
                  <option value="Shorts">Shorts</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Art Style</label>
                <select 
                  value={artStyle}
                  onChange={(e) => setArtStyle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#F27D26]"
                >
                  <option value="Anime">Anime</option>
                  <option value="Pixar">Pixar</option>
                  <option value="Realistic">Realistic</option>
                  <option value="Motion Graphics">Motion Graphics</option>
                  <option value="Whiteboard">Whiteboard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Tone</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#F27D26]"
                >
                  <option value="Educational">Educational</option>
                  <option value="Cinematic">Cinematic</option>
                  <option value="Funny">Funny</option>
                  <option value="Dark">Dark</option>
                  <option value="Inspirational">Inspirational</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Language</label>
                <input 
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#F27D26]"
                  placeholder="English"
                />
              </div>
            </div>

            <button 
              onClick={generatePipeline}
              disabled={isGenerating || !topic}
              className="w-full bg-[#F27D26] hover:bg-[#ff8c3a] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Architecting Pipeline...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Pipeline
                </>
              )}
            </button>
          </div>

          <div className="bg-[#141414]/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-4 text-white/60">Pipeline Progress</h3>
            <div className="space-y-2">
              {STEPS.map((step) => (
                <button
                  key={step.id}
                  onClick={() => pipeline && setActiveStep(step.id)}
                  disabled={!pipeline}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all text-left",
                    !pipeline ? "opacity-30 cursor-not-allowed" : "hover:bg-white/5",
                    activeStep === step.id && pipeline ? "bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20" : "text-white/40"
                  )}
                >
                  <span className="w-5 flex justify-center">{step.icon}</span>
                  <span className="flex-1 font-medium">{step.title}</span>
                  {pipeline && activeStep === step.id && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content: Output */}
        <div className="min-h-[600px] flex flex-col">
          <AnimatePresence mode="wait">
            {!pipeline && !isGenerating ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-12 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                  <Clapperboard className="w-10 h-10 text-white/20" />
                </div>
                <div className="max-w-md">
                  <h2 className="text-2xl font-bold text-white mb-2">Ready for Action</h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Enter your video details on the left to generate a complete end-to-end animation production workflow.
                  </p>
                </div>
              </motion.div>
            ) : isGenerating ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8"
              >
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-[#F27D26]/20 border-t-[#F27D26] rounded-full animate-spin" />
                  <Sparkles className="w-8 h-8 text-[#F27D26] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white">AI Director at Work</h2>
                  <p className="text-white/40 text-sm font-mono animate-pulse">
                    {activeStep === 1 ? 'Writing script...' : 
                     activeStep === 3 ? 'Drawing storyboards...' : 
                     'Synthesizing production data...'}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#F27D26] text-[10px] font-bold uppercase tracking-[0.2em]">
                      Step {activeStep} of 10
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                      {STEPS[activeStep - 1].title}
                    </h2>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                      disabled={activeStep === 1}
                      className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-20"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <button 
                      onClick={() => setActiveStep(Math.min(10, activeStep + 1))}
                      disabled={activeStep === 10}
                      className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-20"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#141414] border border-white/10 rounded-3xl p-8 min-h-[500px] prose prose-invert prose-orange max-w-none overflow-auto">
                  <ReactMarkdown>
                    {pipeline[activeStep.toString()] || "No data generated for this step."}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-[10px] uppercase tracking-widest font-mono">
            © 2026 AnimFlow AI • Built for elite creators
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-white/20 hover:text-[#F27D26] transition-colors text-[10px] uppercase tracking-widest font-mono">Documentation</a>
            <a href="#" className="text-white/20 hover:text-[#F27D26] transition-colors text-[10px] uppercase tracking-widest font-mono">API Status</a>
            <a href="#" className="text-white/20 hover:text-[#F27D26] transition-colors text-[10px] uppercase tracking-widest font-mono">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
