import { GenerationRequest } from "../types";

export interface FashionPreset {
  id: string;
  title: string;
  shortDesc: string;
  category: string;
  params: GenerationRequest;
}

export const FASHION_PRESETS: FashionPreset[] = [
  {
    id: "techwear-jacket",
    title: "Cyberpunk Utility Jacket",
    shortDesc: "Waterproof functional streetwear with pocket straps and high neck.",
    category: "Streetwear",
    params: {
      description: "Oversized waterproof utility jacket with multiple cargo pockets, tactical strap closures, modular hood, and breathable underarm mesh panels. Industrial cyberpunk aesthetic.",
      occasion: "Streetwear / Activewear",
      genderNeutrality: "Androgynous",
      targetBudget: "Student Project ($20 limit)",
      skillLevel: "Intermediate"
    }
  },
  {
    id: "gothic-corset-skirt",
    title: "Victorian Goth Wrap Skirt",
    shortDesc: "Draped asymmetric layering with metal grommets and lace trim.",
    category: "Alternative",
    params: {
      description: "Asymmetrical double-layered heavy cotton wrap skirt with metal eyelets, integrated lace-up side panels, raw frayed hemline, and delicate black chiffon lace trim around the edges.",
      occasion: "Alternative Casual",
      genderNeutrality: "Feminine",
      targetBudget: "Thrift/Low",
      skillLevel: "Beginner"
    }
  },
  {
    id: "deconstructed-blazer",
    title: "Deconstructed Denim Blazer",
    shortDesc: "Structured tailoring made from repurposed thrift shop jeans.",
    category: "Tailoring",
    params: {
      description: "Single-breasted structured blazer crafted completely from contrasting shades of repurposed blue jeans. Asymmetric lapel detail, exposed stitch lines, and silver rivet buttons.",
      occasion: "Creative Formal",
      genderNeutrality: "All",
      targetBudget: "Thrift/Low",
      skillLevel: "Intermediate"
    }
  },
  {
    id: "summer-linen-dress",
    title: "Minimalist Linen Wrap",
    shortDesc: "Breathable, simple silhouette with clean lines and tie closure.",
    category: "Casual Wear",
    params: {
      description: "Breathable wrap-around knee-length dress with a soft V-neckline, drop shoulders, kimono-style wide short sleeves, and self-fabric waist tie closure. Clean minimalist silhouette.",
      occasion: "Summer Casual",
      genderNeutrality: "Feminine",
      targetBudget: "Moderate",
      skillLevel: "Beginner"
    }
  }
];
