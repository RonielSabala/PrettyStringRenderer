export default function CanvasView() {
  return (
    <div id="canvas-wrap" tabIndex={-1}>
      <div id="canvas-inner">
        <canvas id="canvas" />
      </div>
    </div>
  );
}
