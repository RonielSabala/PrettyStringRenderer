import { type ReactNode } from "react";
import { ChevronDown } from "react-bootstrap-icons";
import { useStore } from "../../common/store";
import { titleToKebab } from "../../utils/parse";
import { saveCollapsedSectionsState } from "../../utils/persistence";
import "./SidebarSection.css";

interface Props {
  title: string;
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export default function SidebarSection({
  title,
  children,
  defaultCollapsed = false,
}: Props) {
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

  return (
    <div id={`sidebar-section-${sectionId}`} className="sidebar-section">
      <div
        id={`section-header-${sectionId}`}
        className={`app-btn section-header${isCollapsed ? " header-collapsed" : ""}`}
        onClick={toggleCollapse}
      >
        <span className="section-title">{title}</span>
        <ChevronDown className="app-icon accordion-icon" />
      </div>
      <div className={`section-body-wrapper ${isCollapsed ? "collapsed" : ""}`}>
        <div className="section-body">{children}</div>
      </div>
    </div>
  );
}
