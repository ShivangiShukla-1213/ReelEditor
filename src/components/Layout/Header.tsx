
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, Menu, Crown, Share2, ArrowLeft, ArrowRight, Save, Play } from "lucide-react";
import IconButton from "../UI/IconButton";

interface HeaderProps {
  onExport: () => void;
  onShare: () => void;
  onSettings: () => void;
  projectName: string;
  setProjectName: (name: string) => void;
  isSaved: boolean;
  currentTime: number;
}

const Header = ({
  onExport,
  onShare,
  onSettings,
  projectName,
  setProjectName,
  isSaved,
  currentTime,
}: HeaderProps) => {
  // Format time to display as 5.0s format
  const formattedTime = `${currentTime.toFixed(1)}s`;

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-gradient-to-r from-sky-400 to-blue-500 text-white z-10">
      <div className="flex items-center gap-4">
        <IconButton 
          icon={Menu} 
          tooltip="Menu" 
          className="bg-transparent hover:bg-white/10 text-white"
        />
        <div className="h-6 w-px bg-white/20" />
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-white hover:bg-white/10 h-9 px-3">
            File
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/10 h-9 px-3 flex items-center gap-1">
            <span className="text-yellow-300 mr-1">✦</span>
            Resize
          </Button>
          <div className="relative group">
            <Button variant="ghost" className="text-white hover:bg-white/10 h-9 px-3 flex items-center gap-1">
              Editing
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="ml-1">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6"></path>
              </svg>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton 
            icon={ArrowLeft} 
            tooltip="Undo" 
            className="bg-transparent hover:bg-white/10 text-white"
          />
          <IconButton 
            icon={ArrowRight} 
            tooltip="Redo" 
            className="bg-transparent hover:bg-white/10 text-white"
          />
          <IconButton 
            icon={Save} 
            tooltip="Save" 
            className="bg-transparent hover:bg-white/10 text-white"
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="bg-transparent font-medium text-white focus:outline-none border-b-2 border-transparent focus:border-white/50 transition-colors duration-200 mr-2"
          placeholder="Untitled design - Video"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="bg-white/10 text-white hover:bg-white/20 h-9 flex items-center gap-1"
        >
          <Crown size={16} className="text-yellow-300" />
          Upgrade to Pro
        </Button>
        
        <div className="bg-white/10 text-white px-3 py-1.5 rounded-md mx-1">
          {formattedTime}
        </div>
        
        <IconButton 
          icon={Play} 
          tooltip="Play" 
          className="bg-white/10 hover:bg-white/20 text-white"
        />
        
        <Button
          variant="outline"
          className="text-white border-white/20 bg-white/10 hover:bg-white/20 flex items-center gap-1 h-9"
          onClick={onShare}
        >
          <Share2 size={16} />
          Share
        </Button>
      </div>
    </header>
  );
};

export default Header;
