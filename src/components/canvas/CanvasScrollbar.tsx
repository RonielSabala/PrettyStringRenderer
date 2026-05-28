import {
  useCanvasScrollbar,
  type ScrollbarProps,
} from "../../hooks/useCanvasScrollbar";
import "./CanvasScrollbar.css";

export default function CanvasScrollbar(props: ScrollbarProps) {
  const {
    visiblePortionFraction,
    trackRef,
    handleTrackClick,
    isHorizontal,
    thumbSizeFraction,
    thumbPositionFraction,
    handleThumbMouseDown,
  } = useCanvasScrollbar(props);

  if (visiblePortionFraction >= 1) {
    return null;
  }

  return (
    <div
      className={`canvas-scrollbar canvas-scrollbar-${props.orientation}`}
      ref={trackRef}
      onClick={handleTrackClick}
    >
      <div
        className="canvas-scrollbar-thumb"
        style={
          isHorizontal
            ? {
                width: `${thumbSizeFraction * 100}%`,
                left: `${thumbPositionFraction * 100}%`,
              }
            : {
                height: `${thumbSizeFraction * 100}%`,
                top: `${thumbPositionFraction * 100}%`,
              }
        }
        onMouseDown={handleThumbMouseDown}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}
