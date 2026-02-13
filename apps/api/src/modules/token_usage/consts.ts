export interface ModelPricingDefaults {
  inputPricePerMillionMicros: number;
  outputPricePerMillionMicros: number;
}

export const FALLBACK_MODEL_PRICING: ModelPricingDefaults = {
  inputPricePerMillionMicros: 0,
  outputPricePerMillionMicros: 0,
};

export const DEFAULT_MODEL_PRICING: Record<string, ModelPricingDefaults> = {
  'gpt-4.1-mini': {
    inputPricePerMillionMicros: 400000,
    outputPricePerMillionMicros: 1600000,
  },
};
