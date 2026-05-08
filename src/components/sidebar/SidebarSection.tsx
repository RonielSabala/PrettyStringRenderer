import { type ReactNode } from "react";
import { ChevronDown } from "react-bootstrap-icons";
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
    <div id={id} className="sidebar-section">
      <div
        id={`section-header-${headerId}`}
        className={`section-header no-user-select${isCollapsed ? " header-collapsed" : ""}`}
        onClick={toggleCollapse}
      >
        <span className="section-title">{title}</span>
        <ChevronDown className="accordion-icon" size={10} />
      </div>
      <div className={`section-body-wrapper ${isCollapsed ? "collapsed" : ""}`}>
        <div className="section-body">{children}</div>
      </div>
    </div>
  );
}
