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
  stethoscope?: boolean;
  glasses?: boolean;
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
  family: {
    skin: "#D49A78",
    skinSick: "#B9BEC4",
    hair: "#2A1B16",
    shirt: "#E56B8A",
    shirtSick: "#8794A8",
    pants: "#3B4A63",
    shoe: "#2B3645",
    longHair: true,
    scale: 0.96,
  },
  doctor: {
    skin: "#B97E5A",
    skinSick: "#B97E5A",
    hair: "#1E1713",
    shirt: "#2FA39A",
    shirtSick: "#2FA39A",
    pants: "#2B3A52",
    shoe: "#FFFFFF",
    coat: "#F4F8FB",
    stethoscope: true,
    glasses: true,
    scale: 1.04,
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
