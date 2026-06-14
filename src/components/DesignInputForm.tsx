import React, { useState } from "react";
import { GenerationRequest } from "../types";
import { FASHION_PRESETS, FashionPreset } from "../data/presets";
import { Sparkles, Compass, Lightbulb, User, DollarSign, Scissors, ShieldAlert } from "lucide-react";

interface DesignInputFormProps {
  onSubmit: (data: GenerationRequest) => void;
  isLoading: boolean;
}

export default function DesignInputForm({ onSubmit, isLoading }: DesignInputFormProps) {
  const [description, setDescription] = useState("");
  const [occasion, setOccasion] = useState("Casual Wear");
  const [genderNeutrality, setGenderNeutrality] = useState<"Androgynous" | "Feminine" | "Masculine" | "All">("All");
  const [targetBudget, setTargetBudget] = useState<"Thrift/Low" | "Moderate" | "Student Project ($20 limit)">("Student Project ($20 limit)");
  const [skillLevel, setSkillLevel] = useState<"Beginner" | "Intermediate" | "No Sewing Skills">("Beginner");

  // Load a preset to jumpstart creativity
  const handleApplyPreset = (preset: FashionPreset) => {
    setDescription(preset.params.description);
    setOccasion(preset.params.occasion);
    setGenderNeutrality(preset.params.genderNeutrality);
    setTargetBudget(preset.params.targetBudget);
    setSkillLevel(preset.params.skillLevel);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSubmit({
      description: description.trim(),
      occasion,
      genderNeutrality,
      targetBudget,
      skillLevel
    });
  };

  return (
    <form id="fashion-input-form" onSubmit={handleFormSubmit} className="space-y-6">
      {/* Description Prompt Arena */}
      <div className="bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-500" /> Describe Your Dream Clothing Idea
          </span>
          <span className="text-[10px] text-slate-400 font-mono normal-case">Be as specific as you wish</span>
        </label>
        <textarea
          id="clothing-description-textarea"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="E.g., A loose gender-fluid kimono cardigan with heavy patchwork denim pockets, raw fray seams, and thick wooden button toggles..."
          className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4 focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden transition-all resize-y"
          required
        />

        {/* Quick Inspiration Presets */}
        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Stuck? Try a beginner concept template:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FASHION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                id={`preset-btn-${preset.id}`}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-left py-2 px-3 bg-white dark:bg-slate-900 hover:bg-indigo-50/45 dark:hover:bg-slate-800/50 rounded-xl border border-slate-150 dark:border-slate-800 transition-all text-xs flex flex-col gap-0.5 group hover:border-slate-200 active:scale-99"
              >
                <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {preset.title}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">
                  {preset.shortDesc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Structured Configurations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Occasion / Context Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" /> Occasion Context
          </label>
          <select
            id="occasion-select"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all"
          >
            <option>Casual Wear</option>
            <option>Streetwear / Activewear</option>
            <option>Special Event / Gala</option>
            <option>Alternative Casual</option>
            <option>Creative Formal</option>
            <option>Summer Casual</option>
            <option>Cozy Loungewear</option>
          </select>
        </div>

        {/* Gender Neutrality Focus */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" /> Target Silhouette / Profile
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Androgynous", val: "Androgynous" },
              { label: "All / Unisex", val: "All" },
              { label: "Feminine Shapes", val: "Feminine" },
              { label: "Masculine Shapes", val: "Masculine" }
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                id={`gender-btn-${opt.val}`}
                onClick={() => setGenderNeutrality(opt.val as any)}
                className={`py-2 px-1 border rounded-xl text-[11px] font-medium transition-all ${
                  genderNeutrality === opt.val
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target Budget Tier */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-500" /> Budget Tier
          </label>
          <div className="flex flex-col gap-2">
            {[
              { label: "Student Limit (Under $20 fabric cost)", val: "Student Project ($20 limit)" },
              { label: "Thrifty & Recycle (Under $15 hacks)", val: "Thrift/Low" },
              { label: "Intermediate Maker ($20-$50 fabrics)", val: "Moderate" }
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                id={`budget-btn-${opt.val.replace(/[^a-zA-Z]/g, "")}`}
                onClick={() => setTargetBudget(opt.val as any)}
                className={`py-2 w-full text-left px-3 border rounded-xl text-xs transition-all flex items-center justify-between ${
                  targetBudget === opt.val
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                }`}
              >
                <span>{opt.label}</span>
                {targetBudget === opt.val && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sewing skill level */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-slate-500" /> Sewer Skill Level
          </label>
          <div className="flex flex-col gap-2">
            {[
              { label: "No Sewing (Fabric glue, pins & styling)", val: "No Sewing Skills" },
              { label: "Beginner Sewist (Single machine seam)", val: "Beginner" },
              { label: "Intermediate (Draping, collar folds, zippers)", val: "Intermediate" }
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                id={`skill-btn-${opt.val.replace(/[^a-zA-Z]/g, "")}`}
                onClick={() => setSkillLevel(opt.val as any)}
                className={`py-2 w-full text-left px-3 border rounded-xl text-xs transition-all flex items-center justify-between ${
                  skillLevel === opt.val
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                }`}
              >
                <span>{opt.label}</span>
                {skillLevel === opt.val && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Safe Disclaimer message for beginners */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 flex gap-2.5">
        <ShieldAlert className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="m-0 leading-relaxed font-sans">
          Our system translates high-fashion rules into step-by-step assembly steps and color combinations. Standard household items and old blankets make excellent muslin testing mockups!
        </p>
      </div>

      {/* Submission trigger */}
      <button
        id="submit-form-btn"
        type="submit"
        disabled={isLoading || !description.trim()}
        className={`w-full py-3 px-4 rounded-xl text-sm font-semibold tracking-wide text-white shadow-md shadow-indigo-600/10 cursor-pointer transition-all flex items-center justify-center gap-2 ${
          isLoading || !description.trim()
            ? "bg-indigo-400 dark:bg-indigo-850 cursor-not-allowed opacity-75"
            : "bg-indigo-600 hover:bg-indigo-700 active:scale-99 hover:shadow-indigo-600/20"
        }`}
      >
        {isLoading ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            <span>Drafting Design Blueprint...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Generate Custom Fashion Concept</span>
          </>
        )}
      </button>
    </form>
  );
}
