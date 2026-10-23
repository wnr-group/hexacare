import { storyConfig } from "../story.config";

const c = storyConfig.brand.colors;

export interface RoleStyle {
  skin: string;
  skinSick: string;
  hair: string;
  shirt: string;
  shirtSick: string;
  pants: string;
  shoe: string;
  /** white coat with hexagon badge */
  coat?: string;
  badge?: boolean;
  cap?: string;
  backpack?: string;
  /** hair style: 0 short, 1 long/bun */
  longHair?: boolean;
  scale: number;
}

export const ROLES = {
  patient: {
    skin: "#E3AE8D",
    skinSick: "#B9BEC4",
    hair: "#8E959E",
    shirt: "#F4A340",
    shirtSick: c.sick,
    pants: "#44566C",
    shoe: "#2B3645",
    scale: 1,
  },
  expert: {
    skin: "#C98F6B",
    skinSick: "#C98F6B",
    hair: "#2B1D17",
    shirt: c.primary,
    shirtSick: c.primary,
    pants: c.deep,
    shoe: "#FFFFFF",
    coat: "#FFFFFF",
    badge: true,
    longHair: true,
    scale: 1,
  },
  delivery: {
    skin: "#8D5A3B",
    skinSick: "#8D5A3B",
    hair: "#1B1512",
    shirt: c.primary,
    shirtSick: c.primary,
    pants: "#1F3347",
    shoe: "#1B1B1B",
    cap: c.accent,
    backpack: c.accent,
    scale: 1.02,
  },
} satisfies Record<string, RoleStyle>;

export type RoleId = keyof typeof ROLES;
