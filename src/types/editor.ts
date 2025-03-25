
export type ElementType = "text" | "image" | "video" | "audio";

export interface BaseElement {
  id: string;
  type: ElementType;
  startTime: number;
  endTime: number;
  position?: { x: number; y: number };
  zIndex?: number;
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  alignment?: "left" | "center" | "right";
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  width: number;
  height: number;
}

export interface VideoElement extends BaseElement {
  type: "video";
  src: string;
  width: number;
  height: number;
  volume: number;
  muted?: boolean;
  originalDuration: number;
}

export interface AudioElement extends BaseElement {
  type: "audio";
  src: string;
  volume: number;
  muted?: boolean;
  originalDuration: number;
}

export type CanvasElement = TextElement | ImageElement | VideoElement | AudioElement;
export type TimelineElement = CanvasElement;

export interface ProjectData {
  id: string;
  name: string;
  elements: CanvasElement[];
  duration: number;
  width: number;
  height: number;
  background: string;
  created: Date;
  updated: Date;
}
