import { type ReactNode } from "react";
import { ChevronDown } from "react-bootstrap-icons";
import {
  useSidebarSection,
  type UseSidebarSectionProps,
} from "../../hooks/sidebar/useSidebarSection";
import "./SidebarSection.css";

interface Props extends UseSidebarSectionProps {
  children: ReactNode;
}

export default function SidebarSection({
  title,
  children,
  defaultCollapsed = false,
}: Props) {
  const { sectionId, isCollapsed, toggleCollapse } = useSidebarSection({
    title,
    defaultCollapsed,
  });

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
