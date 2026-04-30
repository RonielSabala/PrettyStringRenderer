import {
  BracketColorSection,
  CanvasColorSection,
  SyntaxColorSection,
} from "./ColorSection";
import ThemesSection from "./ThemesSection";
import TypographySection from "./TypographySection";

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
