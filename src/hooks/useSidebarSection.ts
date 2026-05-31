import { useStore } from "../common/store";
import { titleToKebab } from "../utils/parse";
import { saveCollapsedSectionsState } from "../utils/persistence";

export interface UseSidebarSectionProps {
  title: string;
  defaultCollapsed?: boolean;
}

export function useSidebarSection({
  title,
  defaultCollapsed,
}: UseSidebarSectionProps) {
  const sectionId = titleToKebab(title);
  const isCollapsed = useStore(
    (state) => state.collapsedSections[sectionId] ?? defaultCollapsed,
  );

  const setCollapsed = useStore((state) => state.setCollapsedSections);
  const collapsedSections = useStore((state) => state.collapsedSections);

  const toggleCollapse = () => {
    const next = { ...collapsedSections, [sectionId]: !isCollapsed };
    setCollapsed(next);
    saveCollapsedSectionsState();
  };

  return { sectionId, isCollapsed, toggleCollapse };
}
