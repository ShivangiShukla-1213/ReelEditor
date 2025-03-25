
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Scissors,
  Type,
  Image,
  Music,
  Sparkles,
  Clock,
  Volume2,
  Undo,
  Redo,
  Play,
  PictureInPicture,
  Combine,
  Merge,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import IconButton from "../UI/IconButton";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ToolType } from "@/types/timeline";

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onPreview: () => void;
  canMergeVideos?: boolean;
  onMergeVideos?: () => void;
}

const Toolbar = ({
  activeTool,
  setActiveTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onPreview,
  canMergeVideos,
  onMergeVideos,
}: ToolbarProps) => {
  const isMobile = useIsMobile();
  
  const tools = [
    { id: "trim" as ToolType, icon: Scissors, label: "Trim" },
    { id: "text" as ToolType, icon: Type, label: "Text" },
    { id: "media" as ToolType, icon: Image, label: "Media" },
    { id: "audio" as ToolType, icon: Music, label: "Audio" },
    { id: "merge" as ToolType, icon: Merge, label: "Merge" },
    { id: "effects" as ToolType, icon: Sparkles, label: "Effects" },
    { id: "speed" as ToolType, icon: Clock, label: "Speed" },
    { id: "volume" as ToolType, icon: Volume2, label: "Volume" },
  ];

  // On mobile, show fewer tools in the main toolbar
  const visibleTools = isMobile ? tools.slice(0, 4) : tools;
  const moreTools = isMobile ? tools.slice(4) : [];

  return (
    <div className={`${isMobile ? 'h-auto py-2' : 'h-14'} flex flex-wrap items-center justify-between gap-4 px-4 md:px-6 bg-white shadow-sm z-10`}>
      <div className="flex items-center gap-2 flex-wrap">
        {visibleTools.map((tool) => (
          <button
            key={tool.id}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200",
              activeTool === tool.id
                ? "bg-purple-100 text-purple-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            )}
            onClick={() => setActiveTool(tool.id)}
          >
            <tool.icon size={16} />
            {!isMobile && tool.label}
          </button>
        ))}

        {(moreTools.length > 0 || !isMobile) && (
          <>
            <div className="h-6 w-px bg-gray-200 mx-2" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 h-9 text-sm font-medium text-gray-600"
                >
                  More <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {moreTools.map((tool) => (
                  <DropdownMenuItem 
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                  >
                    <tool.icon size={16} className="mr-2" />
                    {tool.label}
                  </DropdownMenuItem>
                ))}
                {!isMobile && (
                  <>
                    <DropdownMenuItem>Split Clip</DropdownMenuItem>
                    <DropdownMenuItem>Add Transition</DropdownMenuItem>
                    <DropdownMenuItem>Add Subtitle</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2 md:mt-0">
        <div className="flex">
          <IconButton
            icon={Undo}
            onClick={onUndo}
            disabled={!canUndo}
            tooltip="Undo"
            className="rounded-r-none border-r-0"
          />
          <IconButton
            icon={Redo}
            onClick={onRedo}
            disabled={!canRedo}
            tooltip="Redo"
            className="rounded-l-none"
          />
        </div>

        {canMergeVideos && onMergeVideos && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-9"
            onClick={onMergeVideos}
          >
            <Merge size={16} />
            {!isMobile && "Merge Videos"}
          </Button>
        )}

        <Button
          variant="default"
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2 h-9"
          onClick={onPreview}
        >
          <Play size={16} />
          {!isMobile && "Preview"}
        </Button>

        {!isMobile && (
          <IconButton
            icon={PictureInPicture}
            tooltip="Detach Preview"
            onClick={() => {}}
          />
        )}
      </div>
    </div>
  );
};

export default Toolbar;
