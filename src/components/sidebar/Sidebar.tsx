import {
  BracketColorSection,
  CanvasColorSection,
  SyntaxColorSection,
} from "./color/ColorSection";
import ThemesSection from "./themes/ThemesSection";
import TypographySection from "./typography/TypographySection";

export default function Sidebar() {
  return (
    <>
      <ThemesSection />
      <BracketColorSection />
      <SyntaxColorSection />
      <CanvasColorSection />
      <TypographySection />
    </>
  );
}
