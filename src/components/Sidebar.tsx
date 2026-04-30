import {
  BracketColorSection,
  CanvasColorSection,
  SyntaxColorSection,
} from "./ColorSection";

export default function Sidebar() {
  return (
    <>
      <div className="section-separator" />
      <BracketColorSection />
      <div className="section-separator" />
      <SyntaxColorSection />
      <div className="section-separator" />
      <CanvasColorSection />
      <div className="section-separator" />
    </>
  );
}
