import React, { useRef, useState, useEffect } from "react";
import { ColorPaletteItem } from "../types";
import { Eye, Edit2, Trash2, Sliders, ChevronRight, Sparkles, Volume2 } from "lucide-react";

interface SketchCanvasRendererProps {
  conceptName: string;
  canvasGuide: string;
  colorPalette: ColorPaletteItem[];
  silhouette: string;
}

// Minimal croquis (fashion figure) SVGs for drawing/overlay
const MANNEQUIN_TEMPLATES = {
  unisex: (
    <svg viewBox="0 0 100 200" className="w-full h-full text-slate-300 dark:text-slate-700 opacity-40 transition-opacity duration-300" stroke="currentColor" strokeWidth="0.75" fill="none">
      {/* Head & Neck */}
      <ellipse cx="50" cy="18" rx="7" ry="10" />
      <path d="M 47,28 L 47,35 H 53 L 53,28" />
      {/* Shoulders */}
      <path d="M 32,38 L 50,35 L 68,38" />
      {/* Torso */}
      <path d="M 32,38 L 35,80 L 42,110 L 58,110 L 65,80 L 68,38 Z" />
      {/* Chest Line */}
      <path d="M 33,52 C 40,56 60,56 67,52" strokeDasharray="1 1" />
      {/* Waist line */}
      <path d="M 35,80 C 42,82 58,82 65,80" strokeWidth="1" />
      {/* Hips line */}
      <path d="M 38,100 C 44,102 56,102 62,100" />
      {/* Legs core track */}
      <path d="M 42,110 L 40,150 L 38,190" />
      <path d="M 58,110 L 60,150 L 62,190" />
      {/* Arms core track */}
      <path d="M 32,38 L 27,80 L 23,120" />
      <path d="M 68,38 L 73,80 L 77,120" />
    </svg>
  ),
  female: (
    <svg viewBox="0 0 100 200" className="w-full h-full text-slate-300 dark:text-slate-700 opacity-40 transition-opacity duration-300" stroke="currentColor" strokeWidth="0.75" fill="none">
      {/* Head & Neck */}
      <ellipse cx="50" cy="15" rx="6" ry="8.5" />
      <path d="M 47,23 L 48,30 H 52 L 53,23" />
      {/* Shoulders */}
      <path d="M 34,32 L 50,30 L 66,32" />
      {/* Bust & Waist & Hip curves */}
      <path d="M 34,32 Q 31,52 38,52 Q 40,54 36,75 Q 32,95 38,112 L 44,112" />
      <path d="M 66,32 Q 69,52 62,52 Q 60,54 64,75 Q 68,95 62,112 L 56,112" />
      {/* Bust details */}
      <path d="M 37,52 Q 43,60 50,53 Q 57,60 63,52" strokeDasharray="1 1" />
      {/* Waist line */}
      <path d="M 36,75 Q 50,77 64,75" strokeWidth="1" />
      {/* Hip Level */}
      <path d="M 35,93 Q 50,96 65,93" strokeDasharray="1 2" />
      {/* Legs */}
      <path d="M 44,112 L 42,155 L 40,195" />
      <path d="M 56,112 L 58,155 L 60,195" />
      {/* Arms */}
      <path d="M 34,32 Q 29,70 25,110" />
      <path d="M 66,32 Q 71,70 75,110" />
    </svg>
  ),
  male: (
    <svg viewBox="0 0 100 200" className="w-full h-full text-slate-300 dark:text-slate-700 opacity-40 transition-opacity duration-300" stroke="currentColor" strokeWidth="0.75" fill="none">
      {/* Head & Neck */}
      <ellipse cx="50" cy="16" rx="7" ry="10" />
      <path d="M 46,26 L 46,33 H 54 L 54,26" />
      {/* Broad Shoulders */}
      <path d="M 28,34 L 50,32 L 72,34" />
      {/* Chest, Waist, Hips */}
      <path d="M 28,34 L 32,68 L 35,84 L 41,114 L 59,114 L 65,84 L 68,68 L 72,34 Z" />
      {/* Chest contour */}
      <path d="M 30,55 H 70" strokeDasharray="1 1" />
      {/* Waist line */}
      <path d="M 32,84 H 68" strokeWidth="1" />
      {/* Legs */}
      <path d="M 41,114 L 39,158 L 37,196" />
      <path d="M 59,114 L 61,158 L 63,196" />
      {/* Arms */}
      <path d="M 28,34 L 24,78 L 21,115" />
      <path d="M 72,34 L 76,78 L 79,115" />
    </svg>
  )
};

// Key pointers for garment annotations
const ANNOTATION_POINTS = [
  { id: "collar", name: "Neck & Collar", top: "18%", left: "50%", desc: "Focuses on neckline, hood structure, collars, or shoulder transitions." },
  { id: "chest", name: "Bodice & Chest", top: "32%", left: "50%", desc: "Addresses the main bodice, chest fittings, pockets, or closure methods." },
  { id: "sleeves", name: "Sleeve & Cuffs", top: "36%", left: "26%", desc: "Specifies sleeve style, cuffs, armhole cuts, and shoulder seams." },
  { id: "waist", name: "Waist & Fits", top: "50%", left: "45%", desc: "Defines the midsection fit, belt straps, wrapping mechanisms, or drawstrings." },
  { id: "hem", name: "Hemline & Length", top: "70%", left: "44%", desc: "Covers skirt length, dress hemlines, jacket vents, or inseams." }
];

export default function SketchCanvasRenderer({
  conceptName,
  canvasGuide,
  colorPalette,
  silhouette
}: SketchCanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<"interactive-sketch" | "canvas-guide">("interactive-sketch");
  const [templateType, setTemplateType] = useState<keyof typeof MANNEQUIN_TEMPLATES>("female");
  const [templateOpacity, setTemplateOpacity] = useState(0.5);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeMarker, setActiveMarker] = useState<string | null>("collar");

  // Canvas drawing state
  const lastX = useRef(0);
  const lastY = useRef(0);

  // Resize canvas to load nicely
  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // Set initial default brush color to dominant color if available
  useEffect(() => {
    if (colorPalette && colorPalette.length > 0) {
      setBrushColor(colorPalette[0].hex);
    }
  }, [colorPalette]);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Cache the drawn image before resize
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    // Set new dimensions based on parent container
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Restore drawn items
    const ctx = canvas.getContext("2d");
    if (ctx && tempCanvas.width > 0) {
      ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const coords = getEventCoords(e);
    lastX.current = coords.x;
    lastY.current = coords.y;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const coords = getEventCoords(e);

    ctx.beginPath();
    ctx.moveTo(lastX.current, lastY.current);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastX.current = coords.x;
    lastY.current = coords.y;

    // Prevent default touch scrolling when drawing
    if (e.cancelable) {
      e.preventDefault();
    }
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const getEventCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Helper to extract relevant sentence from canvasGuide based on category query
  const getGuideSectionText = (id: string) => {
    if (!canvasGuide) return "Analyze instructions from main drafting layout guidelines.";
    const lowerGuide = canvasGuide.toLowerCase();

    // Custom filtering phrases to make annotation pointers smarter and directly matching generated output!
    let searchTerms: string[] = [];
    if (id === "collar") searchTerms = ["collar", "neck", "hood", "shoulder", "top"];
    if (id === "chest") searchTerms = ["chest", "pockets", "front", "bodice", "closure", "buttons", "zipper"];
    if (id === "sleeves") searchTerms = ["sleeve", "cuff", "arm", "wrist", "shoulder"];
    if (id === "waist") searchTerms = ["waist", "belt", "belt", "drawstring", "tie", "middle"];
    if (id === "hem") searchTerms = ["hem", "skirt", "length", "bottom", "pant", "leg"];

    // Find first sentence in canvasGuide mentioning any of the search terms
    const sentences = canvasGuide.split(/[.!?]+/);
    for (const s of sentences) {
      const trimmed = s.trim();
      if (!trimmed) continue;
      for (const term of searchTerms) {
        if (trimmed.toLowerCase().includes(term)) {
          return trimmed + ".";
        }
      }
    }

    // Fallback if no specific sentence found, return first sentence or chunk
    return sentences[0] ? sentences[0].trim() + "." : canvasGuide;
  };

  return (
    <div id="sketch-canvas-container" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full min-h-[580px]">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 py-4 items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-sans font-semibold text-slate-800 dark:text-slate-200">Creative Form & Canvas</h3>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
          <button
            id="tab-interactive-sketch-btn"
            onClick={() => setActiveTab("interactive-sketch")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === "interactive-sketch"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Interactive Sketchpad
          </button>
          <button
            id="tab-canvas-guide-btn"
            onClick={() => setActiveTab("canvas-guide")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === "canvas-guide"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Pattern Blueprint
          </button>
        </div>
      </div>

      {activeTab === "interactive-sketch" ? (
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Main Visualizer Drawing Area */}
          <div className="flex-1 relative bg-slate-50 dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 flex items-center justify-center p-4 min-h-[360px]">
            {/* Annotation Overlay Dots */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {ANNOTATION_POINTS.map((pt) => (
                <button
                  key={pt.id}
                  id={`marker-${pt.id}`}
                  style={{ top: pt.top, left: pt.left }}
                  onClick={() => setActiveMarker(pt.id)}
                  className={`absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all shadow-md group ${
                    activeMarker === pt.id
                      ? "bg-indigo-600 border-white text-white scale-125 ring-4 ring-indigo-500/30"
                      : "bg-white border-indigo-600 hover:bg-indigo-50 text-indigo-600 scale-100"
                  }`}
                  title={`View design guidlines for: ${pt.name}`}
                >
                  <span className="text-[10px] font-bold">!</span>
                  <span className="absolute left-8 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none z-20 font-mono">
                    {pt.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Mannequin Overlay template layer */}
            <div
              style={{ opacity: templateOpacity }}
              className="absolute pointer-events-none w-5/6 h-5/6 max-w-[280px] flex items-center justify-center transition-all bg-transparent"
            >
              {MANNEQUIN_TEMPLATES[templateType]}
            </div>

            {/* Dynamic drawing canvas */}
            <div ref={containerRef} className="absolute inset-0 z-5">
              <canvas
                id="interactive-sketch-canvas"
                ref={canvasRef}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
                className="w-full h-full cursor-crosshair"
              />
            </div>

            {/* Canvas Instructions Watermark */}
            <div className="absolute bottom-3 left-4 text-[10px] text-slate-400 dark:text-slate-500 pointer-events-none font-mono z-10 flex gap-1.5 items-center">
              <Edit2 className="w-3 h-3" /> Tap and drag to sketch details over template model
            </div>
          </div>

          {/* Sketch Settings & Color Swatch Pickers */}
          <div className="w-full md:w-80 p-6 flex flex-col gap-6 bg-white dark:bg-slate-900 border-t md:border-t-0 border-slate-100 dark:border-slate-800 overflow-y-auto">
            {/* Template Chooser */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span>Croquis Template</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(MANNEQUIN_TEMPLATES) as Array<keyof typeof MANNEQUIN_TEMPLATES>).map((type) => (
                  <button
                    key={type}
                    id={`mannequin-${type}`}
                    onClick={() => setTemplateType(type)}
                    className={`py-2 px-3 border text-xs font-medium rounded-xl capitalize transition-all ${
                      templateType === type
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Opacity Slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium mb-2">
                <span>Template Guide Visibility</span>
                <span className="font-mono">{Math.round(templateOpacity * 100)}%</span>
              </div>
              <input
                id="template-opacity-slider"
                type="range"
                min="0"
                max="100"
                value={templateOpacity * 100}
                onChange={(e) => setTemplateOpacity(Number(e.target.value) / 100)}
                className="w-full accent-indigo-600 bg-slate-100 dark:bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Custom Palette Brush Selector */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">
                <span>Color Palette Swatch</span>
                <span className="text-[10px] text-slate-400 capitalize font-mono">Use your colors</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {colorPalette.map((color, idx) => (
                  <button
                    key={idx}
                    id={`palette-color-${idx}`}
                    onClick={() => setBrushColor(color.hex)}
                    style={{ backgroundColor: color.hex }}
                    className={`w-9 h-9 rounded-full relative shadow-xs transition-transform transform active:scale-95 ${
                      brushColor === color.hex ? "scale-110 ring-4 ring-indigo-500/30 border-2 border-white" : "scale-100 border border-slate-200"
                    }`}
                    title={`${color.name} (${color.hex})`}
                  >
                    {brushColor === color.hex && (
                      <span className="absolute inset-0 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold text-white drop-shadow-sm">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
                {/* Standard pencil shades */}
                {["#000000", "#64748b", "#ffffff"].map((stdColor, idx) => (
                  <button
                    key={idx}
                    id={`standard-color-${idx}`}
                    onClick={() => setBrushColor(stdColor)}
                    style={{ backgroundColor: stdColor }}
                    className={`w-9 h-9 rounded-full relative shadow-xs transition-transform transform active:scale-95 ${
                      brushColor === stdColor ? "scale-110 ring-4 ring-indigo-500/30 border-2 border-white" : "scale-100 border border-slate-200"
                    }`}
                    title="Draft Pencil"
                  >
                    {brushColor === stdColor && (
                      <span className={`absolute inset-0 rounded-full flex items-center justify-center text-xs font-bold ${stdColor === "#ffffff" ? "text-slate-900" : "text-white"}`}>
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Brush Size Selector */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">
                <span>Drafting Line Weight</span>
                <span className="font-mono text-slate-500">{brushSize}px</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Fine</span>
                <input
                  id="brush-size-slider"
                  type="range"
                  min="1"
                  max="12"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="flex-1 accent-indigo-600 bg-slate-100 dark:bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <span className="text-xs text-slate-400">Thick</span>
              </div>
            </div>

            {/* Clear Button */}
            <button
              id="clear-canvas-btn"
              onClick={clearCanvas}
              className="mt-2 w-full py-2.5 border border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-950/30 dark:hover:bg-red-950/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Clear Blueprint Lines
            </button>

            {/* Smart Marker Advice Display */}
            {activeMarker && (
              <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">
                  Draft Marker: {ANNOTATION_POINTS.find(p => p.id === activeMarker)?.name}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans italic bg-indigo-50/20 dark:bg-indigo-950/10 p-3 rounded-xl border border-indigo-100/50 dark:border-indigo-950/30">
                  "{getGuideSectionText(activeMarker)}"
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Full text panel pattern blueprint details */
        <div className="p-6 md:p-8 flex-1 overflow-y-auto max-h-[500px]">
          {/* Silhouette Box */}
          <div className="mb-6 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
              <ChevronRight className="w-4 h-4 text-indigo-500" /> Silhouette Structure
            </h4>
            <div className="text-sm font-sans font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
              {silhouette}
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
              <ChevronRight className="w-4 h-4 text-indigo-500" /> Complete Garment Construction Spec Sheet
            </h4>
            {/* Split canvasGuide into clean Paragraph chunks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {canvasGuide.split(/[.!?]+\s+/).filter(Boolean).map((sentence, i) => (
                <div
                  key={i}
                  id={`blueprint-spec-${i}`}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex items-start gap-3 shadow-xs hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-100/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans m-0">
                    {sentence.trim()}.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
