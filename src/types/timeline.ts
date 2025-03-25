
export type ToolType = "select" | "text" | "media" | "audio" | "transition" | "crop" | "speed" | "merge" | "trim" | "effects" | "volume";

export interface TimelineElement {
  id: string;
  type: "video" | "image" | "text" | "audio";
  name: string;
  start: number;
  end: number;
  track: number;
  thumbnail?: string;
  content: {
    src: string;
    volume?: number;
    muted?: boolean;
    crop?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    [key: string]: any;
  };
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  speed?: number;
}

export interface CanvasElement {
  id: string;
  type: "video" | "image" | "text" | "audio";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: any;
  start: number;
  end: number;
}
