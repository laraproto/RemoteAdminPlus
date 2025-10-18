import { writable } from "svelte/store";
import type { AdaptiveNavContent } from "$lib/types/adaptive-nav";

export const adaptiveNavContent = writable<AdaptiveNavContent | null>(null);

export const clearAdaptiveNavContent = () => {
  adaptiveNavContent.set(null);
};
