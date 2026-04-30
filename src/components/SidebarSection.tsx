import { type ReactNode } from "react";
import { useStore } from "../common/store";
import { saveCollapsedSectionIdsState } from "../utils/persistence";

interface Props {
  id: string;
  headerId: string;
  title: string;
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export default function SidebarSection({
  id,
  headerId,
  title,
  children,
  defaultCollapsed = false,
}: Props) {
  const isCollapsed = useStore(
    (state) => state.collapsedSectionIds[headerId] ?? defaultCollapsed,
  );
  const setCollapsed = useStore((state) => state.setCollapsedSectionIds);
  const allIds = useStore((state) => state.collapsedSectionIds);

  const toggleCollapse = () => {
    const next = { ...allIds, [headerId]: !isCollapsed };
    setCollapsed(next);
    saveCollapsedSectionIdsState();
  };

  return (
    <div id={id}>
      <div
        id={headerId}
        className={`section-header no-select${isCollapsed ? " header-collapsed" : ""}`}
        onClick={toggleCollapse}
      >
        {title}
        <span className="accordion-control">▾</span>
      </div>
      <div className={`section-body${isCollapsed ? " body-hidden" : ""}`}>
        {children}
      </div>
    </div>
  );
}
