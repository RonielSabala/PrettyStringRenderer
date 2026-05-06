import { type ReactNode } from "react";
import { useStore } from "../../common/store";
import { saveCollapsedSectionsState } from "../../utils/persistence";
import "./SidebarSection.css";

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
    (state) => state.collapsedSections[headerId] ?? defaultCollapsed,
  );
  const setCollapsed = useStore((state) => state.setCollapsedSections);
  const allSections = useStore((state) => state.collapsedSections);

  const toggleCollapse = () => {
    const next = { ...allSections, [headerId]: !isCollapsed };
    setCollapsed(next);
    saveCollapsedSectionsState();
  };

  return (
    <div id={id}>
      <div
        id={`section-header-${headerId}`}
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
