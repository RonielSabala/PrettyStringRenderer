import { getStore } from "../common/store";
import { saveCollapsedSectionIdsState } from "./persistence";

export function toggleSectionById(id: string): void {
  const sections = { ...getStore().collapsedSectionIds };
  sections[id] = !sections[id];
  getStore().setCollapsedSectionIds(sections);
  saveCollapsedSectionIdsState();
}

export interface InputRange {
  value: number;
  min: number;
  max: number;
  step: number;
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
