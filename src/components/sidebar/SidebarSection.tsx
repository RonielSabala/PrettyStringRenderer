import { type ReactNode } from "react";
import { useStore } from "../../common/store";
import { saveCollapsedSectionsState } from "../../utils/persistence";

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
  const allIds = useStore((state) => state.collapsedSections);

  const toggleCollapse = () => {
    const next = { ...allIds, [headerId]: !isCollapsed };
    setCollapsed(next);
    saveCollapsedSectionsState();
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
