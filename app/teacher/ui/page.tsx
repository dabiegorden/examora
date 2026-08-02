import type { Metadata } from "next";

import { requireTeacher } from "@/lib/auth/dal";
import { UiShowcase } from "./showcase";

export const metadata: Metadata = {
  title: "Component showcase",
  robots: { index: false, follow: false },
};

/**
 * Internal design-system gallery.
 *
 * Deliberately not in the sidebar: it is a development reference, not a feature.
 * It still sits under `/teacher`, so the existing authorization boundary in the
 * teacher layout applies and it is not publicly reachable.
 */
export default async function UiShowcasePage() {
  await requireTeacher();
  return <UiShowcase />;
}
