
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ToolType } from "@/types/timeline";

const DEFAULT_CANVAS_WIDTH = 480;
const DEFAULT_CANVAS_HEIGHT = 270;
const DEFAULT_ASPECT_RATIO = "16:9";

export const useEditor = () => {
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [projectName, setProjectName] = useState("Untitled Project");
  const [canvasWidth, setCanvasWidth] = useState(DEFAULT_CANVAS_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(DEFAULT_CANVAS_HEIGHT);
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_ASPECT_RATIO);
  const [isSaved, setIsSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const addElement = (type: string, data: any) => {
    // Handle adding elements, including audio
    // This is a placeholder for actual implementation
  };

  const changeCanvasSize = useCallback((width: number, height: number) => {
    setCanvasWidth(width);
    setCanvasHeight(height);
    setAspectRatio(`${width}:${height}`);
  }, []);

  const setCanvasAspectRatio = useCallback((ratio: string) => {
    let width = DEFAULT_CANVAS_WIDTH;
    let height = DEFAULT_CANVAS_HEIGHT;

    switch (ratio) {
      case "1:1":
        width = 360;
        height = 360;
        break;
      case "4:3":
        width = 480;
        height = 360;
        break;
      case "16:9":
        width = 480;
        height = 270;
        break;
      case "9:16":
        width = 270;
        height = 480;
        break;
      default:
        width = 480;
        height = 270;
    }

    setCanvasWidth(width);
    setCanvasHeight(height);
    setAspectRatio(ratio);
  }, []);

  const saveProject = useCallback((elements: any, mediaItems: any) => {
    try {
      const projectData = {
        name: projectName,
        elements,
        mediaItems,
        canvasWidth,
        canvasHeight,
        aspectRatio,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(`reelcraft_project_${Date.now()}`, JSON.stringify(projectData));
      setIsSaved(true);
      toast.success("Project saved successfully");
      return true;
    } catch (error) {
      console.error("Failed to save project:", error);
      toast.error("Failed to save project");
      return false;
    }
  }, [projectName, canvasWidth, canvasHeight, aspectRatio]);

  const exportProject = useCallback(() => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      toast.success("Project exported successfully");
    }, 2000);
  }, []);

  const openSettings = useCallback(() => {
    toast("Settings menu would open here");
  }, []);

  const shareProject = useCallback(() => {
    toast("Share dialog would open here");
  }, []);

  return {
    activeTool,
    projectName,
    canvasWidth,
    canvasHeight,
    aspectRatio,
    isSaved,
    isExporting,
    setActiveTool,
    setProjectName,
    changeCanvasSize,
    setCanvasAspectRatio,
    saveProject,
    exportProject,
    openSettings,
    shareProject,
    addElement,
  };
};

export default useEditor;
