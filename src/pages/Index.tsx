import { useEffect, useState } from "react";
import { Trash, Upload, Merge, Music, Save, Download, Play, Pause, TextIcon, ImageIcon, Layers, ZoomIn, ZoomOut, Crop, AudioLines } from "lucide-react";

import Header from "@/components/Layout/Header";
import Canvas from "@/components/Editor/Canvas";
import Timeline from "@/components/Editor/Timeline";
import Toolbar from "@/components/Editor/Toolbar";
import MediaUploader from "@/components/Editor/MediaUploader";
import AudioUploader from "@/components/Editor/AudioUploader";
import TextEditor from "@/components/Editor/TextEditor";
import Preview from "@/components/Editor/Preview";
import SpeedControl from "@/components/Editor/SpeedControl";
import AudioControl from "@/components/Editor/AudioControl";
import CropTool from "@/components/Editor/CropTool";
import Panel from "@/components/UI/Panel";
import IconButton from "@/components/UI/IconButton";

import useMediaLibrary from "@/hooks/useMediaLibrary";
import useTimeline from "@/hooks/useTimeline";
import useEditor from "@/hooks/useEditor";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ToolType } from "@/types/timeline";

const Index = () => {
  const isMobile = useIsMobile();
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [selectedVideosForMerge, setSelectedVideosForMerge] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  
  const {
    mediaItems,
    audioItems,
    isLoading: isMediaLoading,
    addMedia,
    removeMedia,
  } = useMediaLibrary();
  
  const {
    elements,
    selectedElementId,
    currentTime,
    duration,
    isPlaying,
    setSelectedElementId,
    setCurrentTime,
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
    canUndo,
    canRedo,
  } = useTimeline();
  
  const {
    activeTool,
    projectName,
    canvasWidth,
    canvasHeight,
    isSaved,
    setActiveTool,
    setProjectName,
    exportProject,
    openSettings,
    shareProject,
    saveProject,
  } = useEditor();

  // Handle file uploads
  const handleMediaUpload = async (files: File[]) => {
    const newItems = await addMedia(files);
    
    // Automatically add to timeline if in media tool
    if (activeTool === "media" && newItems.length > 0) {
      // Place each item sequentially on the timeline
      newItems.forEach((item, index) => {
        // Calculate start time for sequential placement
        const prevItemsTime = index > 0 
          ? newItems.slice(0, index).reduce((total, item) => total + (item.duration || 5), 0) 
          : 0;
        
        if (item.type === "audio") {
          addAudioElement(item, 2, currentTime + prevItemsTime);
        } else {
          addMediaElement(item, 0, currentTime + prevItemsTime);
        }
      });
    }
  };

  // Handle audio upload
  const handleAudioUpload = async (files: File[]) => {
    const newItems = await addMedia(files);
    
    // Add audio to timeline
    newItems.forEach((item, index) => {
      const prevItemsTime = index > 0 
        ? newItems.slice(0, index).reduce((total, item) => total + (item.duration || 5), 0) 
        : 0;
      
      addAudioElement(item, 2, currentTime + prevItemsTime);
    });
  };

  // Handle media library item click
  const handleMediaItemClick = (item: any) => {
    if (activeTool === "merge") {
      // In merge mode, select videos for merging
      if (item.type !== "video") {
        toast.error("Only videos can be merged");
        return;
      }
      
      // Check if this item is already in the timeline
      const elementInTimeline = elements.find(el => 
        el.type === "video" && el.content.src === item.url
      );
      
      if (!elementInTimeline) {
        // Add to timeline first
        const elementId = addMediaElement(item);
        handleSelectForMerge(elementId);
      } else {
        // Select existing element
        handleSelectForMerge(elementInTimeline.id);
      }
    } else {
      // Normal mode, add to timeline
      addMediaElement(item);
    }
  };

  // Handle selecting elements for merging
  const handleSelectForMerge = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element || element.type !== "video") {
      toast.error("Only videos can be merged");
      return;
    }
    
    setSelectedVideosForMerge(prev => {
      if (prev.includes(elementId)) {
        return prev.filter(id => id !== elementId);
      } else {
        if (prev.length >= 2) {
          toast.info("You can only select two videos to merge at once");
          return [prev[1], elementId]; // Keep the second and add the new one
        }
        return [...prev, elementId];
      }
    });
  };

  // Handle merging videos
  const handleMergeVideos = () => {
    if (selectedVideosForMerge.length !== 2) {
      toast.error("Please select exactly two videos to merge");
      return;
    }
    
    mergeVideoElements(selectedVideosForMerge[0], selectedVideosForMerge[1]);
    setSelectedVideosForMerge([]);
    setActiveTool("select");
  };

  // Handle adding text
  const handleAddText = (textProps: any) => {
    addTextElement(textProps);
  };

  // Handle deleting selected element
  const handleDeleteElement = () => {
    if (selectedElementId) {
      removeElement(selectedElementId);
    }
  };

  // Handle tool changes
  useEffect(() => {
    // Set the active panel based on the active tool
    switch (activeTool) {
      case "media":
        setActivePanel("media");
        break;
      case "text":
        setActivePanel("text");
        break;
      case "audio":
        setActivePanel("audio");
        break;
      case "merge":
        setActivePanel("merge");
        setSelectedVideosForMerge([]);
        break;
      case "speed":
        setActivePanel("speed");
        break;
      case "crop":
        setActivePanel("crop");
        break;
      default:
        setActivePanel(null);
    }
  }, [activeTool]);

  // Handle playback
  useEffect(() => {
    if (!isPlaying) return;
    
    let animationFrame: number;
    let lastTime = performance.now();
    
    const updateTime = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      setCurrentTime((time) => {
        // Stop at the end of the timeline
        if (time + delta >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return time + delta;
      });
      
      animationFrame = requestAnimationFrame(updateTime);
    };
    
    animationFrame = requestAnimationFrame(updateTime);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isPlaying, duration, setCurrentTime, setIsPlaying]);

  // Handle export
  const handleExport = () => {
    setIsExporting(true);
    
    // Use the browser's download dialog via anchor element
    const handleSaveAs = () => {
      const downloadLink = document.createElement('a');
      downloadLink.style.display = 'none';
      
      // Create a fake file for demonstration
      // In a real app, this would be a real video file from the server
      const dummy = new Blob(['Example video data'], { type: 'video/mp4' });
      const url = URL.createObjectURL(dummy);
      
      // This will open the browser's "Save As" dialog
      downloadLink.href = url;
      downloadLink.download = `${projectName.replace(/\s+/g, '-')}.mp4`;
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setIsExporting(false);
        toast.success("Project exported successfully");
      }, 1500);
    };
    
    handleSaveAs();
  };

  // Sidebar navigation items
  const sidebarItems = [
    { id: "design", label: "Design", icon: Layers },
    { id: "elements", label: "Elements", icon: Layers },
    { id: "text", label: "Text", icon: TextIcon },
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "audio", label: "Audio", icon: AudioLines },
    { id: "crop", label: "Crop", icon: Crop },
    { id: "uploads", label: "Uploads", icon: Upload },
    { id: "tools", label: "Tools", icon: ImageIcon },
  ];

  // Render the active panel based on sidebar selection
  const renderActivePanel = () => {
    switch (activePanel) {
      case "media":
        return (
          <div className="flex flex-col gap-4 p-4">
            <MediaUploader onMediaUpload={handleMediaUpload} />
            
            <Panel title="Media Library" className="flex-1" collapsible={isMobile}>
              {mediaItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-editor-muted">
                  <Upload className="mb-2 opacity-50" />
                  <p className="text-sm">No media files added yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      className={`media-item ${selectedVideosForMerge.includes(elements.find(el => el.content.src === item.url)?.id || '') ? 'ring-2 ring-editor-accent' : ''}`}
                      onClick={() => handleMediaItemClick(item)}
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity duration-200">
                        <p className="text-white text-xs px-2 truncate max-w-full">
                          {item.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        );
        
      case "audio":
        return (
          <div className="flex flex-col gap-4 p-4">
            <AudioUploader onAudioUpload={handleAudioUpload} />
            
            <Panel title="Audio Library" className="flex-1" collapsible={isMobile}>
              {audioItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-editor-muted">
                  <Music className="mb-2 opacity-50" />
                  <p className="text-sm">No audio files added yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
                  {audioItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 border border-editor-border rounded-md hover:bg-editor-background/50 cursor-pointer"
                      onClick={() => addAudioElement(item)}
                    >
                      <Music size={20} className="text-editor-muted" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        {item.duration && (
                          <p className="text-xs text-editor-muted">
                            {Math.floor(item.duration / 60)}:{Math.floor(item.duration % 60).toString().padStart(2, '0')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
            
            <AudioControl 
              elements={elements}
              selectedElementId={selectedElementId}
              onVolumeChange={updateElementVolume}
              onMuteToggle={toggleElementMute}
            />
          </div>
        );
      
      case "text":
        return <TextEditor onAddText={handleAddText} />;
        
      case "speed":
        return (
          <SpeedControl 
            selectedElementId={selectedElementId}
            onSpeedChange={updateElementSpeed}
            elements={elements}
          />
        );
        
      case "crop":
        return (
          <CropTool 
            elements={elements}
            selectedElementId={selectedElementId}
            onCropApply={cropElement}
          />
        );
        
      case "merge":
        return (
          <Panel title="Merge Videos" className="flex-1 m-4">
            <div className="space-y-4">
              <p className="text-sm text-editor-muted">
                Select two videos from your timeline or media library to merge them together.
              </p>
              
              <div className="bg-editor-border/30 p-3 rounded-md">
                <h4 className="text-sm font-medium mb-2">Selected Videos ({selectedVideosForMerge.length}/2)</h4>
                {selectedVideosForMerge.length === 0 ? (
                  <p className="text-xs text-editor-muted">No videos selected</p>
                ) : (
                  <div className="space-y-2">
                    {selectedVideosForMerge.map((id, index) => {
                      const element = elements.find(el => el.id === id);
                      return element ? (
                        <div key={id} className="flex items-center gap-2 bg-white p-2 rounded-md">
                          <div className="w-10 h-10 bg-editor-border/50 rounded overflow-hidden">
                            {element.thumbnail && (
                              <img src={element.thumbnail} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{element.name}</p>
                          </div>
                          <button 
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setSelectedVideosForMerge(prev => prev.filter(i => i !== id))}
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
              
              <button
                className={`w-full py-2 rounded-md text-white font-medium ${
                  selectedVideosForMerge.length === 2 
                    ? 'bg-editor-accent hover:bg-editor-accent/90' 
                    : 'bg-editor-border/50 cursor-not-allowed'
                }`}
                disabled={selectedVideosForMerge.length !== 2}
                onClick={handleMergeVideos}
              >
                <div className="flex items-center justify-center gap-2">
                  <Merge size={16} />
                  Merge Videos
                </div>
              </button>
            </div>
          </Panel>
        );
        
      default:
        return (
          <div className="flex flex-col gap-4 p-4">
            <Panel title="Design" className="flex-1">
              <p className="text-sm text-center text-editor-muted p-4">
                Select a tool from the sidebar to get started
              </p>
            </Panel>
          </div>
        );
    }
  };

  // Canva-style sidebar
  const renderSidebar = () => {
    return (
      <div className="bg-gray-50 border-r border-editor-border w-[60px] flex flex-col overflow-hidden">
        {sidebarItems.map((item) => (
          <div 
            key={item.id}
            className={`flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-gray-100 transition-colors ${activePanel === item.id ? 'bg-gray-100' : ''}`}
            onClick={() => setActivePanel(item.id)}
          >
            <item.icon size={20} className="text-gray-700 mb-1" />
            <span className="text-[10px] text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  // Filter for canvas elements
  const canvasElements = elements.filter(el => el.type !== "audio").map(el => ({
    id: el.id,
    type: el.type,
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    rotation: el.rotation,
    content: el.content,
    start: el.start,
    end: el.end
  }));

  return (
    <div className="flex flex-col h-screen bg-editor-background">
      <Header
        onExport={handleExport}
        onShare={shareProject}
        onSettings={openSettings}
        projectName={projectName}
        setProjectName={setProjectName}
        isSaved={isSaved}
        currentTime={currentTime}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        {renderSidebar()}
        
        {/* Left Panel */}
        <div className={`${activePanel ? 'w-[260px]' : 'w-0'} border-r border-editor-border overflow-y-auto bg-white transition-all duration-300`}>
          {renderActivePanel()}
        </div>
        
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between bg-gray-100 p-2 border-b border-editor-border">
            <div className="flex items-center gap-2">
              <button className="p-1 rounded hover:bg-gray-200">
                <ZoomOut size={16} className="text-gray-700" />
              </button>
              <span className="text-xs font-medium text-gray-700">100%</span>
              <button className="p-1 rounded hover:bg-gray-200">
                <ZoomIn size={16} className="text-gray-700" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded bg-white border border-gray-200 text-xs">
                Position
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center items-center bg-gray-200 p-4 overflow-auto">
            {activePanel !== null ? (
              <div className="bg-white rounded-md border border-purple-400 shadow-lg overflow-hidden">
                <Canvas
                  width={canvasWidth}
                  height={canvasHeight}
                  elements={canvasElements}
                  selectedElementId={selectedElementId}
                  onElementSelect={setSelectedElementId}
                  onElementMove={updateElementPosition}
                  onElementResize={updateElementDimensions}
                  currentTime={currentTime}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Preview
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={setCurrentTime}
                  onRestart={restartTimeline}
                  elements={elements}
                />
              </div>
            )}
          </div>
          
          <div className="bg-white border-t border-editor-border">
            <Timeline
              clips={elements.map((el) => ({
                id: el.id,
                type: el.type,
                name: el.type === "text" ? el.content.content : el.name,
                thumbnail: el.thumbnail,
                start: el.start,
                end: el.end,
                track: el.track,
              }))}
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              onTimeUpdate={setCurrentTime}
              onPlayPause={togglePlayback}
              onClipSelect={setSelectedElementId}
              selectedClipId={selectedElementId}
              zoom={timelineZoom}
              onZoomChange={setTimelineZoom}
              onTrimClip={updateElementTimeRange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
