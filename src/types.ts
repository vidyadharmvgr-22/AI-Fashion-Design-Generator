export interface ColorPaletteItem {
  name: string;
  hex: string;
  weight: number; // e.g., 60 for dominant, 30 for secondary, etc.
  pantone?: string;
}

export interface MaterialSpec {
  name: string;
  type: string; // e.g., "Main Fabric", "Trim", "Lining"
  description: string;
  sourcingTip: string; // Affordable sourcing tip
}

export interface StyleVariation {
  id: string;
  name: string; // e.g., "Minimalist Daily", "Dramatic Runway", "Sustainable Eco"
  description: string;
  keyChanges: string[]; // key changes from the original
}

export interface BudgetOutfitSuggestion {
  itemName: string;
  whereToFind: string; // e.g., "Thrift shop, online budget retailers"
  approxPrice: string;
  stylingTip: string;
}

export interface AssemblyStep {
  stepNumber: number;
  phase: string; // e.g., "Pattern", "Cutting", "Sewing", "Finishing"
  title: string;
  instruction: string;
  difficulty: "Easy" | "Medium" | "Challenging";
}

export interface FashionConcept {
  conceptName: string;
  aesthetic: string;
  silhouette: string;
  moodDescription: string;
  canvasGuide: string; // Instructions for sketching or visualizing the lines, form, and focal points
  colorPalette: ColorPaletteItem[];
  materials: MaterialSpec[];
  variations: StyleVariation[];
  budgetSuggestions: BudgetOutfitSuggestion[];
  assemblySteps: AssemblyStep[];
}

export interface GenerationRequest {
  description: string;
  occasion: string; // e.g., "Casual", "Formal", "Streetwear", "Gala"
  genderNeutrality: "Masculine" | "Feminine" | "Androgynous" | "All";
  targetBudget: "Thrift/Low" | "Moderate" | "Student Project ($20 limit)";
  skillLevel: "Beginner" | "Intermediate" | "No Sewing Skills";
}
