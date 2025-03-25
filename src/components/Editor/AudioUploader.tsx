
import { useRef, useState } from "react";
import { Music, Upload } from "lucide-react";
import Panel from "../UI/Panel";
import { toast } from "sonner";

interface AudioUploaderProps {
  onAudioUpload: (files: File[]) => void;
}

const AudioUploader = ({ onAudioUpload }: AudioUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const audioFiles = files.filter(file => 
      file.type.startsWith('audio/')
    );
    
    if (audioFiles.length === 0) {
      toast.error("Please upload audio files only");
      return;
    }
    
    onAudioUpload(audioFiles);
    toast.success(`Added ${audioFiles.length} audio file${audioFiles.length !== 1 ? 's' : ''}`);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Panel className="w-full" title="Add Audio">
      <div
        className={`
          w-full border-2 border-dashed rounded-lg p-6 
          flex flex-col items-center justify-center gap-4 
          transition-colors duration-200 cursor-pointer
          ${isDragging 
            ? "border-editor-accent bg-editor-accent/5" 
            : "border-editor-border hover:border-editor-muted/50 hover:bg-editor-background/30"
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <div className="w-16 h-16 rounded-full bg-editor-accent/10 flex items-center justify-center">
          <Music
            className={`transition-colors duration-200 ${
              isDragging ? "text-editor-accent" : "text-editor-muted"
            }`}
            size={24}
          />
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground mb-1">
            {isDragging ? "Drop your audio here" : "Drag & drop audio files"}
          </p>
          <p className="text-sm text-editor-muted">
            Or click to select from your device
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </Panel>
  );
};

export default AudioUploader;
