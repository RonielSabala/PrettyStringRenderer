import { getStore } from "../common/store";
import type { InputRange } from "../common/types";
import { saveCollapsedSectionsState } from "./persistence";

export function toggleSectionById(id: string): void {
  const sections = { ...getStore().collapsedSections };
  sections[id] = !sections[id];
  getStore().setCollapsedSections(sections);
  saveCollapsedSectionsState();
}

export function getInputRange(
  config: Record<string, number>,
  configKey: string,
  defaults: Record<
    string,
    { value: number; min: number; max: number; step?: number }
  >,
): InputRange {
  const range = defaults[configKey];
  return {
    value: config[configKey] ?? range.value,
    min: range.min,
    max: range.max,
    step: range.step ?? 1,
  };
}
