
import { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  Scissors,
} from "lucide-react";
import IconButton from "../UI/IconButton";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimelineProps {
  clips: TimelineClip[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onPlayPause: () => void;
  onClipSelect: (clipId: string) => void;
  selectedClipId: string | null;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onTrimClip?: (clipId: string, newStart: number, newEnd: number) => void;
}

interface TimelineClip {
  id: string;
  type: "video" | "image" | "text" | "audio";
  name: string;
  thumbnail?: string;
  start: number;
  end: number;
  track: number;
}

const Timeline = ({
  clips,
  currentTime,
  duration,
  isPlaying,
  onTimeUpdate,
  onPlayPause,
  onClipSelect,
  selectedClipId,
  zoom,
  onZoomChange,
  onTrimClip,
}: TimelineProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimSide, setTrimSide] = useState<"start" | "end" | null>(null);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [showSelectionTooltip, setShowSelectionTooltip] = useState(false);
  const [timelineHeight, setTimelineHeight] = useState(256); // Default height
  const timelineRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newTime = (offsetX / rect.width) * duration;
    
    onTimeUpdate(Math.max(0, Math.min(newTime, duration)));
  };

  const handleTrimStart = (clipId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTrimming(true);
    setTrimSide("start");
    onClipSelect(clipId);
  };

  const handleTrimEnd = (clipId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTrimming(true);
    setTrimSide("end");
    onClipSelect(clipId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    // Get current mouse position on timeline
    const rect = timelineRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const currentPoint = (offsetX / rect.width) * duration;
    const clampedPoint = Math.max(0, Math.min(currentPoint, duration));
    
    // Update hover time indicator
    const hoverTimeEl = document.getElementById('hover-time');
    if (hoverTimeEl) {
      hoverTimeEl.style.left = `${offsetX}px`;
      hoverTimeEl.textContent = formatTime(clampedPoint);
      hoverTimeEl.style.display = 'block';
    }

    // Handle selection area or trimming
    if (isTrimming && selectedClipId) {
      const clip = clips.find(c => c.id === selectedClipId);
      if (!clip) return;
      
      if (trimSide === "start") {
        if (clampedPoint >= clip.end - 0.5) return; // Minimum clip duration
        if (onTrimClip) onTrimClip(selectedClipId, clampedPoint, clip.end);
      } else if (trimSide === "end") {
        if (clampedPoint <= clip.start + 0.5) return; // Minimum clip duration
        if (onTrimClip) onTrimClip(selectedClipId, clip.start, clampedPoint);
      }
    } else if (selectionStart !== null) {
      // Update selection area
      setSelectionEnd(clampedPoint);
      setShowSelectionTooltip(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Start selection if not clicking on a clip
    if (e.target === timelineRef.current || (e.target as HTMLElement).classList.contains('timeline-tracks')) {
      const rect = timelineRef.current!.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const startPoint = (offsetX / rect.width) * duration;
      setSelectionStart(Math.max(0, Math.min(startPoint, duration)));
      setSelectionEnd(null);
    }
  };

  const handleMouseUp = () => {
    if (selectionStart !== null && selectionEnd !== null) {
      // Sort the selection points
      const start = Math.min(selectionStart, selectionEnd);
      const end = Math.max(selectionStart, selectionEnd);
      
      // If the selection is very small, it might be a click rather than a selection
      if (Math.abs(end - start) < 0.1) {
        setSelectionStart(null);
        setSelectionEnd(null);
        setShowSelectionTooltip(false);
        setIsTrimming(false);
        setTrimSide(null);
        return;
      }
      
      // Show tooltip with trim options
      setShowSelectionTooltip(true);
    } else {
      setIsTrimming(false);
      setTrimSide(null);
    }
  };

  const handleMouseLeave = () => {
    // Hide hover time indicator
    const hoverTimeEl = document.getElementById('hover-time');
    if (hoverTimeEl) {
      hoverTimeEl.style.display = 'none';
    }
    
    if (!showSelectionTooltip) {
      setSelectionStart(null);
      setSelectionEnd(null);
    }
    
    setIsTrimming(false);
    setTrimSide(null);
  };

  const applySelectionToClip = () => {
    if (selectedClipId && selectionStart !== null && selectionEnd !== null && onTrimClip) {
      const start = Math.min(selectionStart, selectionEnd);
      const end = Math.max(selectionStart, selectionEnd);
      onTrimClip(selectedClipId, start, end);
      clearSelection();
    }
  };

  const clearSelection = () => {
    setSelectionStart(null);
    setSelectionEnd(null);
    setShowSelectionTooltip(false);
  };

  // Initialize resize functionality
  useEffect(() => {
    const resizeBar = resizeRef.current;
    if (!resizeBar) return;

    let startY = 0;
    let startHeight = 0;
    let isResizing = false;

    const onResizeStart = (e: MouseEvent) => {
      isResizing = true;
      startY = e.clientY;
      startHeight = timelineHeight;
      document.body.style.cursor = 'ns-resize';
      document.addEventListener('mousemove', onResizeMove);
      document.addEventListener('mouseup', onResizeEnd);
    };

    const onResizeMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const deltaY = startY - e.clientY;
      const newHeight = Math.max(150, Math.min(500, startHeight + deltaY));
      setTimelineHeight(newHeight);
    };

    const onResizeEnd = () => {
      isResizing = false;
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeEnd);
    };

    resizeBar.addEventListener('mousedown', onResizeStart);

    return () => {
      resizeBar.removeEventListener('mousedown', onResizeStart);
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeEnd);
    };
  }, [timelineHeight]);

  const pixelsPerSecond = 100 * zoom;

  const getClipStyle = (clip: TimelineClip) => {
    return {
      left: `${clip.start * pixelsPerSecond}px`,
      width: `${(clip.end - clip.start) * pixelsPerSecond}px`,
      top: `${clip.track * 38}px`,
    };
  };

  // Selection area style
  const selectionStyle = selectionStart !== null && selectionEnd !== null ? {
    left: `${Math.min(selectionStart, selectionEnd) * pixelsPerSecond}px`,
    width: `${Math.abs(selectionEnd - selectionStart) * pixelsPerSecond}px`,
    display: 'block'
  } : { display: 'none' };

  useEffect(() => {
    // Clean up selection when selected clip changes
    if (selectedClipId) {
      clearSelection();
    }
  }, [selectedClipId]);

  return (
    <div className="relative">
      {/* Resize handle */}
      <div 
        ref={resizeRef}
        className="absolute top-0 left-0 right-0 h-2 bg-editor-border cursor-ns-resize z-10"
        style={{ transform: 'translateY(-50%)' }}
      />
      
      <div 
        className={`border-t border-editor-border bg-editor-background transition-all duration-300 ${isExpanded ? "" : "h-12"}`}
        style={{ height: isExpanded ? `${timelineHeight}px` : '48px', marginTop: '1.5rem' }}
      >
        <div className={`flex items-center justify-between px-4 h-12 border-b border-editor-border ${isMobile ? 'flex-wrap' : ''}`}>
          <div className="flex items-center gap-3">
            <IconButton
              icon={isPlaying ? Pause : Play}
              onClick={onPlayPause}
              tooltip={isPlaying ? "Pause" : "Play"}
            />
            <div className="font-mono text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-editor-timeline rounded-md">
              <IconButton
                icon={Minus}
                onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
                tooltip="Zoom Out"
                className="rounded-r-none border-r-0"
              />
              <div className="flex items-center justify-center w-14 text-sm">
                {Math.round(zoom * 100)}%
              </div>
              <IconButton
                icon={Plus}
                onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
                tooltip="Zoom In"
                className="rounded-l-none"
              />
            </div>
            
            <IconButton
              icon={isExpanded ? ChevronDown : ChevronUp}
              onClick={() => setIsExpanded(!isExpanded)}
              tooltip={isExpanded ? "Collapse Timeline" : "Expand Timeline"}
            />
          </div>
        </div>
        
        {isExpanded && (
          <div className="relative h-[calc(100%-48px)] overflow-x-auto overflow-y-auto custom-scrollbar">
            {/* Ruler */}
            <div className="sticky top-0 h-8 border-b border-editor-border bg-editor-timeline flex items-end px-4 z-10">
              <div className="relative w-full h-full">
                {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute bottom-0 h-3 border-l border-editor-border"
                    style={{ left: `${i * pixelsPerSecond}px` }}
                  >
                    {i % 5 === 0 && (
                      <div className="absolute bottom-4 transform -translate-x-1/2 text-[10px] text-editor-muted">
                        {formatTime(i)}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Hover time indicator */}
                <div 
                  id="hover-time" 
                  className="absolute bottom-full transform -translate-x-1/2 bg-black text-white text-xs px-1 py-0.5 rounded pointer-events-none hidden"
                  style={{ zIndex: 30 }}
                ></div>
              </div>
            </div>
            
            {/* Timeline Content */}
            <div 
              ref={timelineRef}
              className="relative h-[calc(100%-32px)] min-w-full timeline-tracks"
              style={{ width: `${duration * pixelsPerSecond}px` }}
              onClick={handleTimelineClick}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {/* Time markers every second */}
              {Array.from({ length: Math.ceil(duration) }).map((_, i) => (
                <div
                  key={`marker-${i}`}
                  className="absolute top-0 bottom-0 border-l border-editor-border/20"
                  style={{ left: `${i * pixelsPerSecond}px` }}
                />
              ))}
              
              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-px bg-editor-accent z-10"
                style={{ left: `${currentTime * pixelsPerSecond}px` }}
              >
                <div className="absolute top-0 left-0 transform -translate-x-1/2 w-3 h-3 bg-editor-accent border-2 border-white rounded-full" />
                <div className="absolute top-4 left-0 transform -translate-x-1/2 bg-editor-accent text-white text-xs px-1 py-0.5 rounded-sm">
                  {formatTime(currentTime)}
                </div>
              </div>
              
              {/* Selection area */}
              <div 
                ref={selectionRef}
                className="absolute top-0 bottom-0 bg-editor-accent/20 border border-editor-accent z-5"
                style={selectionStyle}
              >
                {showSelectionTooltip && selectionStart !== null && selectionEnd !== null && (
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded p-2 z-20 flex flex-col gap-1">
                    <div className="text-xs text-center">
                      {formatTime(Math.min(selectionStart, selectionEnd))} - {formatTime(Math.max(selectionStart, selectionEnd))}
                    </div>
                    {selectedClipId && (
                      <button 
                        className="text-xs bg-editor-accent text-white px-2 py-1 rounded hover:bg-editor-accent/90"
                        onClick={applySelectionToClip}
                      >
                        Apply to Selected Clip
                      </button>
                    )}
                    <button 
                      className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                      onClick={clearSelection}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
              
              {/* Track backgrounds */}
              {[0, 1, 2].map((trackIndex) => (
                <div 
                  key={`track-${trackIndex}`} 
                  className="absolute h-10 left-0 right-0 border-b border-editor-border/50"
                  style={{ top: `${trackIndex * 38}px` }}
                />
              ))}
              
              {/* Clips */}
              {clips.map((clip) => (
                <div
                  key={clip.id}
                  className={`timeline-item absolute h-9 flex items-center px-2 rounded-sm ${
                    selectedClipId === clip.id
                      ? "ring-2 ring-editor-accent"
                      : ""
                  } ${
                    clip.type === 'video' ? 'bg-blue-100' :
                    clip.type === 'audio' ? 'bg-green-100' :
                    clip.type === 'text' ? 'bg-purple-100' :
                    clip.type === 'image' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}
                  style={getClipStyle(clip)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClipSelect(clip.id);
                  }}
                >
                  <div className="flex items-center gap-2 overflow-hidden w-full">
                    {clip.thumbnail && (
                      <div className="w-6 h-6 flex-shrink-0 rounded overflow-hidden">
                        <img
                          src={clip.thumbnail}
                          alt={clip.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="truncate text-xs font-medium">
                      {clip.name}
                    </div>
                  </div>
                  
                  {/* Trim handles */}
                  {onTrimClip && (
                    <>
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-editor-accent hover:bg-opacity-30"
                        onMouseDown={(e) => handleTrimStart(clip.id, e)}
                      />
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-editor-accent hover:bg-opacity-30"
                        onMouseDown={(e) => handleTrimEnd(clip.id, e)}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
