
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Clock, Save } from "lucide-react";
import Panel from "../UI/Panel";
import { Button } from "@/components/ui/button";
import { TimelineElement } from "@/types/timeline";
import { toast } from "sonner";

interface SpeedControlProps {
  selectedElementId: string | null;
  onSpeedChange: (id: string, speed: number) => void;
  elements: TimelineElement[];
}

const SpeedControl = ({ selectedElementId, onSpeedChange, elements }: SpeedControlProps) => {
  const selectedElement = elements.find(el => el.id === selectedElementId);
  const [speed, setSpeed] = useState<number>(1.0);
  
  // Update local speed when selected element changes
  useEffect(() => {
    if (selectedElement) {
      setSpeed(selectedElement.speed || 1.0);
    } else {
      setSpeed(1.0);
    }
  }, [selectedElement]);
  
  const handleSpeedChange = (value: number[]) => {
    setSpeed(value[0]);
  };
  
  const applySpeed = () => {
    if (selectedElementId) {
      onSpeedChange(selectedElementId, speed);
      toast.success(`Speed set to ${speed.toFixed(2)}x`);
    }
  };
  
  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  
  return (
    <Panel title="Playback Speed" className="w-full">
      <div className="space-y-4">
        {!selectedElementId || !selectedElement || (selectedElement.type !== "video" && selectedElement.type !== "audio") ? (
          <div className="text-center text-editor-muted py-8">
            <Clock className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a video or audio clip to adjust speed</p>
          </div>
        ) : (
          <>
            <div className="text-sm mb-4">
              <span className="font-medium">Selected: </span>
              <span className="text-editor-muted">{selectedElement?.name || "Unknown"}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Speed</span>
                <span className="text-sm bg-editor-accent/10 px-2 py-0.5 rounded text-editor-accent">{speed.toFixed(2)}x</span>
              </div>
              
              <Slider 
                value={[speed]} 
                min={0.1} 
                max={3} 
                step={0.05}
                onValueChange={handleSpeedChange}
              />
              
              <div className="flex flex-wrap gap-2 mt-3">
                {speedOptions.map(option => (
                  <button 
                    key={option}
                    className={`text-xs px-2 py-1 rounded ${Math.abs(speed - option) < 0.01
                      ? 'bg-editor-accent text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => setSpeed(option)}
                  >
                    {option}x
                  </button>
                ))}
              </div>
            </div>
            
            <Button 
              className="w-full mt-4 flex items-center justify-center gap-2"
              onClick={applySpeed}
            >
              <Save size={16} />
              Apply Speed Change
            </Button>
          </>
        )}
      </div>
    </Panel>
  );
};

export default SpeedControl;
