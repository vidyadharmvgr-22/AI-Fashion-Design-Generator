/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { FashionConcept, GenerationRequest, StyleVariation } from "./types";
import DesignInputForm from "./components/DesignInputForm";
import SketchCanvasRenderer from "./components/SketchCanvasRenderer";
import {
  Sparkles,
  Palette,
  ShoppingBag,
  Layers,
  Printer,
  Download,
  BookOpen,
  Info,
  Check,
  Copy,
  Scissors,
  HelpCircle,
  Plus,
  Trash2,
  Bookmark,
  Shield,
  Heart
} from "lucide-react";

// Premium offline concept block so the system looks stunning on first load
const SAMPLE_INITIAL_CONCEPT: FashionConcept = {
  conceptName: "Neo-Earth Patchwork Kimono",
  aesthetic: "Eco-Industrial Streetwear",
  silhouette: "Oversized utility boxy jacket with drop shoulders and asymmetric layered wrap",
  moodDescription: "A striking fusion of organic hand-woven textures and clinical industrial paneling. It evokes a feeling of structured shelter, cozy security, and forward-thinking sustainability.",
  canvasGuide: "Draft a wide, structured 3/4 kimono sleeve with raw exposed seam lines. The main shell utilizes heavy utility panels with vertical topstitching. Add dual asymmetrical 6x8-inch cargo pocket flaps across the bottom chest. Crop the rear waist hem horizontally while leaving the front draping panels 4 inches longer for a cascaded closure.",
  colorPalette: [
    { name: "Smoky Charcoal", hex: "#2F3E46", weight: 45, pantone: "19-4008 TCX" },
    { name: "Rustic Clay", hex: "#B07D62", weight: 30, pantone: "17-1140 TCX" },
    { name: "Raw Oatmeal", hex: "#E6CCB2", weight: 15, pantone: "13-1013 TCX" },
    { name: "Sage Glow", hex: "#8F9D86", weight: 10, pantone: "15-6315 TCX" }
  ],
  materials: [
    {
      name: "Repurposed Cotton Canvas",
      type: "Main Fabric",
      description: "Thick 10oz heavy woven thread with organic structural stiffness.",
      sourcingTip: "Use old canvas tote bags, army surplus duffels, or heavy drop-cloths from builders yards style."
    },
    {
      name: "Raw Denim Patchwork",
      type: "Accent Paneling",
      description: "Mid-weight structural weave for high-wear pocket sections.",
      sourcingTip: "Chop up worn-out thrift store blue jeans or scrap trousers from roommates."
    },
    {
      name: "Unbleached Cotton Cord",
      type: "Fastener",
      description: "Soft rope detail for adjustable kimono-style waist ties.",
      sourcingTip: "Standard household laundry line or thick hoodie drawstrings."
    }
  ],
  variations: [
    {
      id: "var-1",
      name: "Runway High-Drape Variation",
      description: "Elevates the kimono into high-couture using extended side seams and high contrast silk accents.",
      keyChanges: ["Elongate front hemline by 8 inches", "Replace cotton canvas with soft modal or heavy raw silk scraps", "Introduce contrasting neon color linings"]
    },
    {
      id: "var-2",
      name: "Casual Streetwear Bomber",
      description: "A highly wearable, sporty translation with tight ribbing and metal elements.",
      keyChanges: ["Add elastic ribbed cuffs and waist band", "Replace kimono side-ties with a recycled metal zipper closure", "Include a concealed hood structure"]
    },
    {
      id: "var-3",
      name: "Minimalist Lounge Gown",
      description: "Relaxed drape focused purely on organic pastel tones and cozy leisure comfort.",
      keyChanges: ["Drop heavy utility pockets and tactical loop panels", "Lighten main fabric to sandwashed soft linen sheets", "Pastel monochromatic coloring"]
    }
  ],
  budgetSuggestions: [
    {
      itemName: "Oversized Utility Cardigan base",
      whereToFind: "Local Thrift Shop (Men's Outerwear rack)",
      approxPrice: "$6.00",
      stylingTip: "Buy 2 sizes up, chop off the collar ribbing to form the V-neck, and fringe the bottom hem manually."
    },
    {
      itemName: "Contrasting heavy pockets strip",
      whereToFind: "Scrap collection or thrift denim jacket",
      approxPrice: "$3.00",
      stylingTip: "Cut rectangular swatches from raw denim, fray the borders, and attach with heavy-duty heat-activated hem tape."
    },
    {
      itemName: "Braided jute styling wrap tie",
      whereToFind: "Hardware Store utility aisle",
      approxPrice: "$1.50",
      stylingTip: "Knot the ends of raw rope, thread through hand-punched canvas slots to create modular closures."
    }
  ],
  assemblySteps: [
    {
      stepNumber: 1,
      phase: "Drafting & Cropping",
      title: "Map the Silhouette",
      instruction: "Use standard chalk to lay out your oversized block pattern. Lay the fabric flat and mark a 28-inch width with drop shoulders.",
      difficulty: "Easy"
    },
    {
      stepNumber: 2,
      phase: "Cutting",
      title: "Sleeve & Shell Prep",
      instruction: "Cut the wide kimono sleeves at 18 inches. Leave 1-inch extra boundaries to accommodate raw fringed edge lockstitches.",
      difficulty: "Easy"
    },
    {
      stepNumber: 3,
      phase: "Assembly",
      title: "Affix Accent Pockets",
      instruction: "Overlay the denim scrap cargo pockets on the lower front panels. Stitch around three sides securely, leaving the top mouth accessible.",
      difficulty: "Medium"
    },
    {
      stepNumber: 4,
      phase: "Stitching",
      title: "Join Shoulders & Sleeves",
      instruction: "Complete simple flat-fell seams along the shoulder lines. Ease the drop-sleeves into the armholes and sew in place.",
      difficulty: "Medium"
    },
    {
      stepNumber: 5,
      phase: "Finishing",
      title: "Fringing & Closures",
      instruction: "Wash the unhemmed borders once to naturally fray the cotton fibers. Lock the stretch point with a parallel reinforcing seam.",
      difficulty: "Easy"
    }
  ]
};

export default function App() {
  const [activeConcept, setActiveConcept] = useState<FashionConcept | null>(SAMPLE_INITIAL_CONCEPT);
  const [history, setHistory] = useState<FashionConcept[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [errMessage, setErrMessage] = useState<string | null>(null);
  const [successAnimation, setSuccessAnimation] = useState(false);

  // Active toggles for interactive variations
  const [selectedVarId, setSelectedVarId] = useState<string | null>(null);

  // Load portfolio from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("atelier_fashion_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          // Set the latest saved design as active if available
          setActiveConcept(parsed[0]);
        }
      }
    } catch (e) {
      console.error("Failed to parse saved fashion concept history:", e);
    }
  }, []);

  // Save history helper
  const updateHistory = (newConcept: FashionConcept) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.conceptName !== newConcept.conceptName);
      const updated = [newConcept, ...filtered].slice(0, 15); // limit to 15 items
      try {
        localStorage.setItem("atelier_fashion_history", JSON.stringify(updated));
      } catch (e) {
        console.error("Storage save issue:", e);
      }
      return updated;
    });
  };

  const handleGenerate = async (formData: GenerationRequest) => {
    setIsLoading(true);
    setErrMessage(null);
    setSuccessAnimation(false);

    try {
      const response = await fetch("/api/fashion/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Server could not process your fashion prompt.");
      }

      const generatedConcept: FashionConcept = await response.json();
      if (!generatedConcept || !generatedConcept.conceptName) {
        throw new Error("Invalid response structural format returned by deep learning designer.");
      }

      // Update state
      setActiveConcept(generatedConcept);
      updateHistory(generatedConcept);
      setSelectedVarId(null); // Reset variation highlight
      setSuccessAnimation(true);
      setTimeout(() => setSuccessAnimation(false), 2000);
    } catch (err: any) {
      console.error("Generation error:", err);
      setErrMessage(err.message || "Failed to establish secure proxy channel.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFromHistory = (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((_, idx) => idx !== indexToDelete);
    setHistory(updated);
    try {
      localStorage.setItem("atelier_fashion_history", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    // fallback active concept if active deleted
    if (history[indexToDelete]?.conceptName === activeConcept?.conceptName) {
      setActiveConcept(updated.length > 0 ? updated[0] : SAMPLE_INITIAL_CONCEPT);
    }
  };

  const handleCopyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  // Printing the design spec sheet for offline work in real sewing studio
  const handlePrintWorkspace = () => {
    window.print();
  };

  // Helper code to handle variation injection previews
  const activeVariation = activeConcept?.variations.find(v => v.id === selectedVarId);

  return (
    <div id="frosted-glass-workspace" className="min-h-screen bg-linear-to-br from-indigo-100 via-rose-100 to-amber-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Frosted Glass Floating Navbar */}
      <nav id="header-nav" className="h-16 flex items-center justify-between px-6 md:px-8 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md border-b border-white/40 dark:border-slate-800/40 sticky top-0 z-30 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 transform hover:rotate-3 transition-transform">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a2 2 0 012.828 0l1.172 1.172a2 2 0 010 2.828L21.7 13.3a1 1 0 000 1.4l1.6 1.6a1 1 0 010 1.4l-3.77 3.77a2 2 0 01-2.828 0l-1.172-1.172a2 2 0 010-2.828L17.3 14.7a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0l-3.77 3.77a2 2 0 01-2.828 0l-1.172-1.172a2 2 0 010-2.828L10.3 17.3a1 1 0 000-1.4l-1.6-1.6z" />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
              Atelier.ai <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-mono py-0.5 px-2 rounded-full border border-indigo-100/50">v1.2</span>
            </span>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 -mt-0.5 font-sans uppercase tracking-widest hidden sm:block">AI Fashion School Workshop</p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex space-x-1 bg-white/40 dark:bg-slate-800/40 p-1 rounded-full border border-white/50 dark:border-slate-800">
            <button className="px-4 py-1.5 text-xs font-semibold bg-white dark:bg-slate-700 rounded-full shadow-xs text-indigo-600 dark:text-white">Studio Concept Drafter</button>
            <button className="px-4 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-not-allowed">Fabric Estimator (Coming)</button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="print-btn"
              onClick={handlePrintWorkspace}
              disabled={!activeConcept}
              className="p-2 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-white/80 dark:border-slate-700 shadow-xs transition-all active:scale-95"
              title="Print Concept Spec Sheet for Offline Work"
            >
              <Printer className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full border border-indigo-200 dark:border-indigo-850 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs select-none">
              JD
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container Layout */}
      <div id="master-layout-grid" className="flex-1 flex flex-col lg:flex-row min-h-0">
        
        {/* Left Control Sidebar */}
        <aside id="aside-sidebar" className="w-full lg:w-96 bg-white/15 dark:bg-slate-900/10 backdrop-blur-xl border-r border-white/30 dark:border-slate-850 p-6 flex flex-col gap-6 shrink-0 print:hidden overflow-y-auto">
          
          {/* Main prompt interface */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-indigo-500" /> Pattern parameters
              </h2>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 font-mono py-0.5 px-2 rounded-md">Drafting Studio</span>
            </div>

            {/* Configured form component */}
            <DesignInputForm onSubmit={handleGenerate} isLoading={isLoading} />
          </div>

          {/* Quick Portfolio history deck */}
          <div className="mt-4 pt-6 border-t border-white/40 dark:border-slate-800/40">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-indigo-500" /> Saved Collections ({history.length})
              </h3>
              {history.length > 0 && (
                <span className="text-[9px] text-slate-400 font-mono">Click to restore previous drafts</span>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-8 px-4 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl text-center text-xs text-slate-400 dark:text-slate-500">
                <p className="m-0 italic">No previous concepts loaded yet. Successfully generated concepts will persist here automatically!</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                {history.map((item, index) => (
                  <div
                    key={index}
                    id={`history-card-${index}`}
                    onClick={() => {
                      setActiveConcept(item);
                      setSelectedVarId(null);
                    }}
                    className={`p-3 rounded-xl border transition-all text-left cursor-pointer flex items-center justify-between gap-3 group relative overflow-hidden ${
                      activeConcept?.conceptName === item.conceptName
                        ? "bg-white/70 dark:bg-slate-800/70 border-indigo-400 dark:border-indigo-950 shadow-xs"
                        : "bg-white/30 dark:bg-slate-900/30 border-white/40 dark:border-slate-850 hover:bg-white/50"
                    }`}
                  >
                    {/* Tiny visual representation accent circle */}
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="flex -space-x-1 hover:space-x-0 transition-all">
                        {item.colorPalette.slice(0, 2).map((col, cIdx) => (
                          <div
                            key={cIdx}
                            className="w-3 h-3 rounded-full border border-white"
                            style={{ backgroundColor: col.hex }}
                          />
                        ))}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {item.conceptName}
                        </div>
                        <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono truncate">
                          {item.aesthetic}
                        </div>
                      </div>
                    </div>

                    <button
                      id={`delete-history-btn-${index}`}
                      onClick={(e) => deleteFromHistory(index, e)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 rounded-md transition-all shrink-0"
                      title="Clear from local portfolio logs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick learning tip */}
          <div className="mt-auto p-4 bg-linear-to-br from-indigo-500/10 to-rose-500/10 rounded-2xl border border-white/50 dark:border-slate-800/40">
            <h4 className="text-[10px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-500" /> Fabric Yardage Rules
            </h4>
            <p className="text-[11px] text-slate-650 dark:text-slate-400 leading-relaxed m-0 font-sans">
              As a general rule, a typical student jacket takes 2-3 yards of lightweight fabric. If substituting with thrift sheets, a standard double bed sheet yields up to 4 yards of clean pattern material!
            </p>
          </div>
        </aside>

        {/* Workspace Display Area */}
        <section id="workspace-arena" className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto">
          
          {/* Error Board banner */}
          {errMessage && (
            <div id="error-banner" className="p-4 bg-red-50/90 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-fade-in print:hidden">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center shrink-0 text-red-600 dark:text-red-400">
                  ⚠️
                </div>
                <div>
                  <div className="text-xs font-bold text-red-800 dark:text-red-300">Generative AI Error encountered</div>
                  <p className="text-xs text-red-600 dark:text-red-400/80 leading-relaxed mt-0.5">
                    {errMessage.includes("GEMINI_API_KEY") ? (
                      <span><strong>Missing Secret Key!</strong> Please click the <strong>Secrets panel</strong> on the top right in AI Studio menu and add a key named <code>GEMINI_API_KEY</code> to enable instant smart generations.</span>
                    ) : (
                      errMessage
                    )}
                  </p>
                </div>
              </div>
              <button
                id="dismiss-err-btn"
                onClick={() => setErrMessage(null)}
                className="py-1.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-semibold rounded-lg hover:border-red-300"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Success banner */}
          {successAnimation && (
            <div id="success-banner" className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl flex items-center gap-3 animate-bounce print:hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0 text-emerald-600">
                ✓
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Aesthetic Concept Spliced!</span>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Specifications generated and saved into your active portfolio.</p>
              </div>
            </div>
          )}

          {activeConcept ? (
            /* Realized concept workspace container */
            <div id="active-concept-board" className="space-y-6">
              
              {/* Concept Master details card */}
              <div id="concept-summary-card" className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[32px] border border-white/60 dark:border-slate-800/60 shadow-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-white/60 dark:bg-slate-800/60 rounded-full text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 border border-white dark:border-slate-750 inline-block font-mono">
                      {activeConcept.aesthetic}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-750 inline-block">
                      {activeConcept.silhouette}
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-850 dark:text-white tracking-tight leading-tight">
                    {activeConcept.conceptName}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-sans italic leading-relaxed max-w-2xl">
                    "{activeConcept.moodDescription}"
                  </p>
                </div>

                {/* Print button on mobile */}
                <div className="flex gap-2 shrink-0 relative z-10 self-end md:self-center">
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950 py-2.5 px-4 rounded-2xl flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-left">
                      <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Fabric Level</div>
                      <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Student Budget Hackable</div>
                    </div>
                  </div>
                </div>

                {/* Decorative background visual blob */}
                <div className="absolute right-0 bottom-0 w-48 h-48 bg-gradient-to-t from-indigo-200/20 to-purple-200/20 dark:from-indigo-950/10 dark:to-transparent rounded-full filter blur-xl leading-none"></div>
              </div>

              {/* Main functional workspace split block (Sketchpad vs Spec sheets) */}
              <div id="workspace-columns-grid" className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                
                {/* 1. Left Interactive Model Design Drawing panel */}
                <div className="xl:col-span-7 h-full">
                  <SketchCanvasRenderer
                    conceptName={activeConcept.conceptName}
                    canvasGuide={activeConcept.canvasGuide}
                    colorPalette={activeConcept.colorPalette}
                    silhouette={activeConcept.silhouette}
                  />
                </div>

                {/* 2. Middle Panel: Color Swatches & Thrift Outfit Alternatives */}
                <div className="xl:col-span-5 flex flex-col gap-6">
                  
                  {/* Colors Board */}
                  <div id="palette-enclosure" className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-slate-800/60 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                          <Palette className="w-4 h-4 text-indigo-500" /> Color Combinations
                        </label>
                        <span className="text-[10px] text-slate-400 italic">Tap to copy hex code</span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2.5">
                        {activeConcept.colorPalette.map((col, idx) => (
                          <div
                            key={idx}
                            id={`color-swatch-box-${idx}`}
                            onClick={() => handleCopyToClipboard(col.hex)}
                            className="bg-white/60 dark:bg-slate-900/60 rounded-xl border border-white dark:border-slate-800 p-2.5 flex flex-col items-center gap-2 group cursor-pointer hover:border-indigo-400 hover:shadow-xs transition-all active:scale-95 text-center"
                          >
                            <div
                              style={{ backgroundColor: col.hex }}
                              className="w-full aspect-square rounded-lg border border-slate-100 shadow-xs relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                {copiedHex === col.hex ? (
                                  <Check className="w-4 h-4 text-white drop-shadow-md" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-white/0 group-hover:text-white drop-shadow-md transition-opacity" />
                                )}
                              </div>
                            </div>
                            <div className="w-full overflow-hidden text-ellipsis">
                              <div className="text-[10px] font-bold text-slate-700 dark:text-slate-200 leading-tight truncate">
                                {col.name}
                              </div>
                              <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                                {col.hex}
                              </div>
                              {col.pantone && (
                                <div className="text-[8px] text-indigo-500/80 dark:text-indigo-400/80 mt-0.5 truncate font-sans">
                                  {col.pantone}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Palette visual ratio progress bar */}
                    <div className="mt-4 pt-4 border-t border-white/40 dark:border-slate-800/40">
                      <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-2 font-mono flex items-center justify-between">
                        <span>Palette Space Distribution Ratio</span>
                        <span>100% total coverage</span>
                      </div>
                      <div className="h-4 rounded-lg overflow-hidden flex shadow-xs border border-white dark:border-slate-800/50">
                        {activeConcept.colorPalette.map((col, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: col.hex,
                              width: `${col.weight}%`
                            }}
                            className="h-full relative group transition-all"
                            title={`${col.name}: ${col.weight}% coverage`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Thrift store similar suggestions */}
                  <div id="hack-suggestions-enclosure" className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-slate-800/60 p-6 flex-1 flex flex-col justify-between min-h-[290px]">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                          <ShoppingBag className="w-4 h-4 text-indigo-500" /> Thrift Hacks & similar suggestions
                        </label>
                        <span className="text-[10px] bg-amber-50 dark:bg-indigo-950 text-amber-700 dark:text-indigo-300 py-0.5 px-2 rounded-md font-mono">No Software Required</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans mb-3.5">
                        Students can duplicate this high-fashion concept look affordably without sewing a stitch, by combining the following readily available thrift store layers:
                      </p>

                      <div className="space-y-2.5">
                        {activeConcept.budgetSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            id={`budget-item-card-${idx}`}
                            className="p-3 bg-white/50 dark:bg-slate-900/40 rounded-xl border border-white/70 dark:border-slate-800/50 flex gap-3 shadow-xs hover:bg-white/80 transition-colors"
                          >
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0 text-xs">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{item.itemName}</div>
                                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">{item.approxPrice}</div>
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">Where: {item.whereToFind}</div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic font-sans m-0 mt-1 leading-snug">
                                "{item.stylingTip}"
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Aesthetic Variations Toggles row */}
              <div id="variations-panel" className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-slate-800/60 p-6">
                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                    <Layers className="w-4 h-4 text-indigo-500" /> Explore Style Variations & Adaptations
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-1">
                    Select a curated style adaptation direction to see alternative pattern lines and fabric weight replacements.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeConcept.variations.map((v) => (
                    <button
                      key={v.id}
                      id={`variation-toggle-${v.id}`}
                      onClick={() => setSelectedVarId(selectedVarId === v.id ? null : v.id)}
                      className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between h-full relative group cursor-pointer ${
                        selectedVarId === v.id
                          ? "bg-white/80 dark:bg-slate-800/80 border-indigo-500 dark:border-indigo-900 ring-4 ring-indigo-500/10 shadow-md scale-[1.01]"
                          : "bg-white/30 dark:bg-slate-900/30 border-white/60 dark:border-slate-800/50 hover:bg-white/60 shadow-xs"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold font-mono tracking-wide ${
                            selectedVarId === v.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
                          }`}>
                            {selectedVarId === v.id ? "★ ACTIVE DIRECTION" : "CURATED VARIANT"}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 opacity-60 group-hover:bg-indigo-500 transition-colors"></span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {v.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug font-sans">
                          {v.description}
                        </p>
                      </div>

                      {/* Display altered lines immediately */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">Key line changes:</div>
                        <ul className="m-0 p-0 list-none space-y-1">
                          {v.keyChanges.slice(0, 2).map((chg, keyIdx) => (
                            <li key={keyIdx} className="text-[9px] text-slate-600 dark:text-slate-400 leading-tight flex items-start gap-1">
                              <span className="text-indigo-500 select-none shrink-0">→</span>
                              <span className="line-clamp-1">{chg}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Highlighted selection view */}
                {activeVariation && (
                  <div className="mt-4 p-4 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/40 rounded-xl animate-fade-in flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500 inline shrink-0" />
                        Selected Variant Path: {activeVariation.name}
                      </div>
                      <p className="text-[11px] text-indigo-755 dark:text-indigo-400 italic m-0 mt-1 leading-relaxed">
                        To adapt your main sketch pad mockup towards this direction, apply these altered cutting guidelines:
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 justify-end">
                      {activeVariation.keyChanges.map((tweak, i) => (
                        <span key={i} className="text-[10px] font-mono font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 py-1 px-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800 shadow-3xs">
                          {tweak}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Lower 3: Materials Requirements & Sewing assembly steps */}
              <div id="assembly-and-materials-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* A. Recommended Fabrics specs details */}
                <div id="fabrics-enclosure" className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-slate-800/60 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                        <BookOpen className="w-4 h-4 text-indigo-500" /> Fabric & Materials Requirements
                      </h3>
                      <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono tracking-wide">Repurpose & Save</span>
                    </div>

                    <div className="space-y-4">
                      {activeConcept.materials.map((mat, idx) => (
                        <div
                          key={idx}
                          id={`material-row-${idx}`}
                          className="border-b border-white/40 dark:border-slate-800/45 pb-3.5 last:border-0 last:pb-0 font-sans"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <span className="text-[9px] font-bold tracking-wider uppercase font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded-md inline-block">
                                {mat.type}
                              </span>
                              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
                                {mat.name}
                              </h4>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">Item #{idx + 1}</span>
                          </div>
                          
                          <p className="text-[10px] text-slate-550 dark:text-slate-400 mt-1.5 leading-relaxed">
                            {mat.description}
                          </p>

                          {/* Cheap student alternative tip */}
                          <div className="mt-2 text-[10px] p-2 bg-amber-50/50 dark:bg-slate-900/50 text-amber-800 dark:text-indigo-300 rounded-lg border border-amber-100/30 dark:border-slate-800 flex gap-2 items-start">
                            <span className="text-amber-500 shrink-0 font-bold select-none text-[9px] uppercase tracking-wide">Student Hack:</span>
                            <span className="italic leading-snug">{mat.sourcingTip}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* B. Assembly Stitch Schedule block */}
                <div id="stitch-steps-enclosure" className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-slate-800/60 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                      <Scissors className="w-4 h-4 text-indigo-500" /> DIY Stitch Schedule
                    </h3>
                    <span className="text-[9px] text-slate-400 font-mono uppercase">Assembly Stages</span>
                  </div>

                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {activeConcept.assemblySteps.map((step) => (
                      <div
                        key={step.stepNumber}
                        id={`step-${step.stepNumber}`}
                        className="p-3 bg-white/40 dark:bg-slate-900/40 rounded-xl border border-white/60 dark:border-slate-800/50 flex gap-3 transition-colors hover:bg-white/70"
                      >
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-mono font-semibold flex items-center justify-center shadow-xs">
                            {step.stepNumber}
                          </div>
                          <span className="text-[8px] uppercase font-bold text-indigo-500 dark:text-indigo-400 font-mono tracking-tighter">
                            {step.phase}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              {step.title}
                            </h4>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold font-mono tracking-wider shrink-0 select-none ${
                              step.difficulty === "Easy"
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/45 dark:text-emerald-400"
                                : step.difficulty === "Medium"
                                ? "bg-amber-50 text-amber-600 dark:bg-amber-950/45 dark:text-amber-400"
                                : "bg-rose-50 text-rose-600 dark:bg-rose-950/45 dark:text-rose-400"
                            }`}>
                              {step.difficulty}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed font-sans mt-1.5 m-0">
                            {step.instruction}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* Empty state when no concepts exist */
            <div id="no-concept-state" className="flex-1 bg-white/40 backdrop-blur-2xl rounded-[32px] border border-white/60 dark:border-slate-800/60 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-8 relative min-h-[460px]">
              <div className="text-center max-w-md relative z-10">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900 shadow-xs">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-serif font-bold text-slate-800 dark:text-slate-100 tracking-tight">Atelier Design Canvas Empty</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 font-sans">
                  Craft standard high-fashion concept schematics based on student restrictions. Enter a customized descriptive phrase into the template builder or pick an inspiration model preset on the sidebar.
                </p>
                
                <div className="mt-6 p-4 bg-white/60 dark:bg-slate-900/60 border border-white dark:border-slate-800 rounded-2xl flex items-start gap-3 text-left">
                  <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed font-sans">
                    <strong>Have fabric already?</strong> Try describing what you have, e.g. <i>"I have two old denim shirts and a white tablecloth"</i>, and our algorithm will tailor a blueprint around those exact components!
                  </div>
                </div>
              </div>
              
              {/* Absolutes decorative shapes */}
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-300/10 rounded-full filter blur-xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-rose-300/10 rounded-full filter blur-xl"></div>
            </div>
          )}

          {/* Bottom decorative credits bar aligning with style boundaries */}
          <footer className="mt-auto border-t border-white/30 dark:border-slate-800/40 pt-4 pb-1 text-center flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-sans print:hidden">
            <div>
              &copy; {new Date().getFullYear()} Atelier.ai Studio App. Designed with Frosted Glass.
            </div>
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-500 shrink-0" /> Built for beginners and students</span>
              <span className="font-mono">Offline-ready PDF Exports</span>
            </div>
          </footer>

        </section>

      </div>

    </div>
  );
}

