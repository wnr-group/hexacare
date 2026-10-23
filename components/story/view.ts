import { storyConfig } from "./story.config";

export interface Marks {
  pointStart: number;
  per: number;
  pipeStart: number;
  impactStart: number;
  finaleStart: number;
}

/** DOM-facing slice of the story, derived purely from the timeline time (so seeking/pausing just works). */
export interface StoryView {
  caption: string | null;
  service: number;
  station: number;
  cities: number;
  statP: number;
  cta: boolean;
}

export const initialView: StoryView = { caption: null, service: -1, station: -1, cities: 0, statP: 0, cta: false };

export function deriveView(t: number, m: Marks): StoryView {
  const cap = storyConfig.captions.find((c) => t >= c.from && t < c.to);
  let service = -1;
  if (t >= m.pointStart && t < m.pointStart + 6 * m.per) service = Math.floor((t - m.pointStart) / m.per);

  const stationT = (t - m.pipeStart) / 0.9;
  const station = t >= m.pipeStart - 0.1 && t < m.pipeStart + 4.3 ? Math.min(3, Math.max(0, Math.floor(stationT))) : -1;

  const impactOn = t >= m.impactStart - 0.2 && t < m.finaleStart - 0.7;
  const impLen = storyConfig.scenes.impact[1] - storyConfig.scenes.impact[0];
  let cities = 0;
  storyConfig.cities.forEach((_, i) => {
    if (impactOn && t >= m.impactStart + impLen * (0.3 + 0.13 * i) + 0.2) cities = i + 1;
  });
  const p = impactOn ? Math.min(1, Math.max(0, (t - (m.impactStart + impLen * 0.35)) / (impLen * 0.5))) : 0;
  const statP = Math.round((1 - Math.pow(1 - p, 3)) * 50) / 50;

  return { caption: cap?.text ?? null, service, station, cities, statP, cta: t >= m.finaleStart + 0.8 };
}

export const viewKey = (v: StoryView) =>
  `${v.caption}|${v.service}|${v.station}|${v.cities}|${v.statP}|${v.cta}`;
