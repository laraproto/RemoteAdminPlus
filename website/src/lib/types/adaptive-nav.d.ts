import { z } from "zod";

export const NavItem = z.object({
  text: z.string(),
  href: z.string(),
});

export const AdaptiveNavContent = z.array(NavItem);

export type AdaptiveNavContent = z.infer<typeof AdaptiveNavContent>;

export type NavItem = z.infer<typeof NavItem>;

export {};
