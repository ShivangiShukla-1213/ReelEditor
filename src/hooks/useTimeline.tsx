
import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { TimelineElement } from "@/types/timeline";

export const useTimeline = () => {
  const [elements, setElements] = useState<TimelineElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(5); // Shorter default timeline duration
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState<TimelineElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save current state to history
  const saveHistory = useCallback(() => {
    // Limit history to 50 states
    const newHistory = [...history.slice(0, historyIndex + 1), [...elements]].slice(-50);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [elements, history, historyIndex]);

  // Recalculate timeline duration based on all elements
  const recalculateDuration = useCallback((currentElements: TimelineElement[]) => {
    if (currentElements.length === 0) {
      setDuration(5); // Default duration if no elements
      return;
    }
    
    const maxEnd = Math.max(...currentElements.map(el => el.end));
    setDuration(maxEnd);
  }, []);

  // Add a media element to the timeline
  const addMediaElement = useCallback((mediaItem: any, trackIndex: number = 0, startTime: number = currentTime) => {
    const id = uuidv4();
    const mediaDuration = mediaItem.duration || 5;
    
    const newElement: TimelineElement = {
      id,
      type: mediaItem.type,
      name: mediaItem.name,
      start: startTime,
      end: startTime + mediaDuration,
      track: trackIndex,
      thumbnail: mediaItem.thumbnail,
      content: {
        src: mediaItem.url,
        volume: 1.0, // Ensure video has volume
      },
      x: 10,
      y: 10,
      width: mediaItem.type === "image" ? 300 : 480,
      height: mediaItem.type === "image" ? 200 : 270,
      rotation: 0,
      speed: 1.0, // Default speed
    };
    
    setElements((prev) => {
      const newElements = [...prev, newElement];
      recalculateDuration(newElements);
      return newElements;
    });
    
    saveHistory();
    return id;
  }, [currentTime, recalculateDuration, saveHistory]);

  // Add an audio element to the timeline
  const addAudioElement = useCallback((audioFile: any, trackIndex: number = 2, startTime: number = currentTime) => {
    const id = uuidv4();
    const audioDuration = audioFile.duration || 10;
    
    const newElement: TimelineElement = {
      id,
      type: "audio",
      name: audioFile.name || "Audio Track",
      start: startTime,
      end: startTime + audioDuration,
      track: trackIndex,
      content: {
        src: audioFile.url,
        volume: 1.0, // Default to full volume
        muted: false,
      },
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      rotation: 0,
      speed: 1.0, // Default speed
    };
    
    setElements((prev) => {
      const newElements = [...prev, newElement];
      recalculateDuration(newElements);
      return newElements;
    });
    
    saveHistory();
    toast.success(`Added audio: ${audioFile.name || "Audio Track"}`);
    return id;
  }, [currentTime, recalculateDuration, saveHistory]);

  // Add a text element to the timeline
  const addTextElement = useCallback((textProps: any, trackIndex: number = 0, startTime: number = currentTime) => {
    const id = uuidv4();
    
    const newElement: TimelineElement = {
      id,
      type: "text",
      name: "Text",
      start: startTime,
      end: startTime + 5,
      track: trackIndex,
      content: textProps,
      x: 240 - (textProps.content.content.length * 5),
      y: 135,
      width: Math.max(200, textProps.content.content.length * 10),
      height: 40,
      rotation: 0,
      speed: 1.0, // Default speed
    };
    
    setElements((prev) => {
      const newElements = [...prev, newElement];
      recalculateDuration(newElements);
      return newElements;
    });
    
    saveHistory();
    return id;
  }, [currentTime, recalculateDuration, saveHistory]);

  // Remove an element from the timeline
  const removeElement = useCallback((id: string) => {
    setElements((prev) => {
      const newElements = prev.filter((el) => el.id !== id);
      recalculateDuration(newElements);
      return newElements;
    });
    
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
    saveHistory();
  }, [selectedElementId, saveHistory, recalculateDuration]);

  // Update an element's position on the canvas
  const updateElementPosition = useCallback((id: string, x: number, y: number) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, x, y } : el
      )
    );
  }, []);

  // Update an element's dimensions
  const updateElementDimensions = useCallback((id: string, width: number, height: number) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, width, height } : el
      )
    );
  }, []);

  // Update element volume
  const updateElementVolume = useCallback((id: string, volume: number) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id ? { 
          ...el, 
          content: { 
            ...el.content, 
            volume 
          }
        } : el
      )
    );
    saveHistory();
  }, [saveHistory]);

  // Toggle element mute
  const toggleElementMute = useCallback((id: string, muted: boolean) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id ? { 
          ...el, 
          content: { 
            ...el.content, 
            muted 
          }
        } : el
      )
    );
    saveHistory();
  }, [saveHistory]);

  // Apply crop to element
  const cropElement = useCallback((id: string, crop: { x: number; y: number; width: number; height: number }) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id ? { 
          ...el, 
          content: { 
            ...el.content, 
            crop 
          }
        } : el
      )
    );
    saveHistory();
  }, [saveHistory]);

  // Update an element's time range (trim functionality)
  const updateElementTimeRange = useCallback((id: string, start: number, end: number) => {
    setElements((prev) => {
      const updatedElements = prev.map((el) => {
        if (el.id === id) {
          // If this is a video element, we should update both the start/end times
          // and adjust the video content to reflect the new trimmed section
          return { 
            ...el, 
            start, 
            end,
            // Update content if needed to reflect the trimmed section
            content: {
              ...el.content,
              trimStart: start, // Store trim information
              trimEnd: end
            }
          };
        }
        return el;
      });
      
      // Recalculate the timeline duration based on all elements
      recalculateDuration(updatedElements);
      return updatedElements;
    });
    
    // If we're trimming and the current time is outside the new range, 
    // update it to be at the start of the trimmed section
    const element = elements.find(el => el.id === id);
    if (element && (currentTime < start || currentTime > end)) {
      setCurrentTime(start);
    }
    
    saveHistory();
    toast.success("Element trimmed successfully");
  }, [elements, currentTime, saveHistory, recalculateDuration]);

  // Update an element's speed
  const updateElementSpeed = useCallback((id: string, speed: number) => {
    setElements((prev) => {
      const updatedElements = prev.map((el) => {
        if (el.id === id) {
          // Calculate new duration based on speed
          const originalDuration = el.end - el.start;
          const newDuration = originalDuration / speed;
          const newEnd = el.start + newDuration;
          
          return { 
            ...el, 
            speed, 
            end: newEnd 
          };
        }
        return el;
      });
      
      // Recalculate the timeline duration
      recalculateDuration(updatedElements);
      return updatedElements;
    });
    
    saveHistory();
    toast.success(`Speed set to ${speed}x`);
  }, [saveHistory, recalculateDuration]);

  // Merge two video elements
  const mergeVideoElements = useCallback((firstId: string, secondId: string) => {
    const first = elements.find(el => el.id === firstId);
    const second = elements.find(el => el.id === secondId);
    
    if (!first || !second || first.type !== "video" || second.type !== "video") {
      toast.error("Can only merge video elements");
      return;
    }
    
    // Create a new merged element
    const id = uuidv4();
    const mergedElement: TimelineElement = {
      id,
      type: "video",
      name: `Merged: ${first.name} + ${second.name}`,
      start: Math.min(first.start, second.start),
      end: Math.max(first.end, second.end),
      track: first.track,
      thumbnail: first.thumbnail,
      content: {
        src: first.content.src, // Fix: Using first video's source instead of array
        mergedWith: second.content.src, // Store second source as a property
        isMerged: true,
        volume: first.content.volume || 1.0, // Keep volume settings
      },
      x: first.x,
      y: first.y,
      width: first.width,
      height: first.height,
      rotation: 0,
      speed: 1.0,
    };
    
    setElements(prev => {
      const newElements = [...prev.filter(el => el.id !== firstId && el.id !== secondId), mergedElement];
      recalculateDuration(newElements);
      return newElements;
    });
    
    setSelectedElementId(id);
    saveHistory();
    toast.success("Videos merged successfully");
    
    return id;
  }, [elements, saveHistory, recalculateDuration]);

  // Play/Pause the timeline
  const togglePlayback = useCallback(() => {
    setIsPlaying(prev => {
      // If we're at the end, restart playback from the beginning
      if (currentTime >= duration - 0.1) {
        setCurrentTime(0);
      }
      return !prev;
    });
  }, [currentTime, duration]);

  // Undo the last action
  const undo = useCallback(() => {
    if (historyIndex <= 0) return false;
    
    const prevState = history[historyIndex - 1];
    setElements(prevState);
    setHistoryIndex((prev) => prev - 1);
    recalculateDuration(prevState);
    return true;
  }, [history, historyIndex, recalculateDuration]);

  // Redo the last undone action
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return false;
    
    const nextState = history[historyIndex + 1];
    setElements(nextState);
    setHistoryIndex((prev) => prev + 1);
    recalculateDuration(nextState);
    return true;
  }, [history, historyIndex, recalculateDuration]);

  // Restart the timeline
  const restartTimeline = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  return {
    elements,
    selectedElementId,
    currentTime,
    duration,
    isPlaying,
    setSelectedElementId,
    setCurrentTime,
    setDuration,
    addMediaElement,
    addTextElement,
    addAudioElement,
    removeElement,
    updateElementPosition,
    updateElementDimensions,
    updateElementTimeRange,
    updateElementSpeed,
    updateElementVolume,
    toggleElementMute,
    cropElement,
    mergeVideoElements,
    togglePlayback,
    setIsPlaying,
    undo,
    redo,
    restartTimeline,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
};

export default useTimeline;
