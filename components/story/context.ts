"use client";
import { createContext, useContext } from "react";
import type { StoryState } from "./state";

export const StoryContext = createContext<StoryState | null>(null);

export function useStory(): StoryState {
  const s = useContext(StoryContext);
  if (!s) throw new Error("useStory must be used inside <Scene>");
  return s;
}
