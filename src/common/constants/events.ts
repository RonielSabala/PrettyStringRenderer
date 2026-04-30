export const EVENTS = Object.freeze({
  KEY_DOWN: "keydown",
  KEY_UP: "keyup",
  MOUSE_UP: "mouseup",
  MOUSE_DOWN: "mousedown",
  MOUSE_MOVE: "mousemove",
  WHEEL: "wheel",
  CLICK: "click",
  DBL_CLICK: "dblclick",
  INPUT: "input",
  CHANGE: "change",
  CONTEXT_MENU: "contextmenu",
  WINDOW_RELOAD: "beforeunload",
} as const);

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
