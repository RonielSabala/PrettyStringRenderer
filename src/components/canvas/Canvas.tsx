import { DOM_IDS } from "../../common/constants/dom";
import { useCanvas } from "../../hooks/useCanvas";
import { SCROLLBAR_ORIENTATION } from "../../hooks/useCanvasScrollbar";
import "./Canvas.css";
import CanvasScrollbar from "./CanvasScrollbar";

export default function Canvas() {
  const {
    wrapRef,
    innerRef,
    canvasRef,
    canvasRenderSize,
    viewportSize,
    zoom,
    panX,
    panY,
    handlePanX,
    handlePanY,
  } = useCanvas();

  return (
    <div id={DOM_IDS.CANVAS_WRAP} ref={wrapRef} tabIndex={-1}>
      <div id="canvas-inner" ref={innerRef} />
      <canvas id="canvas" ref={canvasRef} />
      <CanvasScrollbar
        orientation={SCROLLBAR_ORIENTATION.HORIZONTAL}
        displaySize={canvasRenderSize.width}
        viewportSize={viewportSize.width}
        zoom={zoom}
        pan={panX}
        onPan={handlePanX}
      />
      <CanvasScrollbar
        orientation={SCROLLBAR_ORIENTATION.VERTICAL}
        displaySize={canvasRenderSize.height}
        viewportSize={viewportSize.height}
        zoom={zoom}
        pan={panY}
        onPan={handlePanY}
      />
    </div>
  );
}
