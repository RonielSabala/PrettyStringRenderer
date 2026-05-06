import {
  BracketColorSection,
  CanvasColorSection,
  SyntaxColorSection,
} from "./color/ColorSection";
import "./Sidebar.css";
import ThemesSection from "./themes/ThemesSection";
import TypographySection from "./typography/TypographySection";

export default function Sidebar() {
  return (
    <>
      <ThemesSection />
      <div className="section-separator" />
      <BracketColorSection />
      <div className="section-separator" />
      <SyntaxColorSection />
      <div className="section-separator" />
      <CanvasColorSection />
      <div className="section-separator" />
      <TypographySection />
    </>
  );
}
