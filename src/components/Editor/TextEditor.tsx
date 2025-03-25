
import { useState } from "react";
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, MoveHorizontal, Type } from "lucide-react";
import Panel from "../UI/Panel";
import IconButton from "../UI/IconButton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TextEditorProps {
  onAddText: (textProps: TextProperties) => void;
}

interface TextProperties {
  content: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  alignment: string;
}

const TextEditor = ({ onAddText }: TextEditorProps) => {
  const [textProps, setTextProps] = useState<TextProperties>({
    content: "New Text",
    fontSize: 24,
    fontWeight: "normal",
    fontStyle: "normal",
    color: "#000000",
    alignment: "center",
  });

  const handleChange = (key: keyof TextProperties, value: string | number) => {
    setTextProps((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddText = () => {
    onAddText(textProps);
  };

  return (
    <Panel className="w-full" title="Text Editor">
      <div className="flex flex-col gap-4">
        <textarea
          value={textProps.content}
          onChange={(e) => handleChange("content", e.target.value)}
          className="w-full p-3 min-h-[100px] border border-editor-border rounded-md focus:outline-none focus:ring-2 focus:ring-editor-accent/20 focus:border-editor-accent/20 transition-all duration-200"
          placeholder="Enter your text here..."
        />
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-editor-muted block mb-1">Size</label>
            <input
              type="range"
              min="12"
              max="72"
              value={textProps.fontSize}
              onChange={(e) => handleChange("fontSize", parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-center mt-1">{textProps.fontSize}px</div>
          </div>
          
          <div>
            <label className="text-xs text-editor-muted block mb-1">Color</label>
            <div className="flex justify-center">
              <Popover>
                <PopoverTrigger>
                  <div 
                    className="w-8 h-8 rounded border border-editor-border" 
                    style={{ backgroundColor: textProps.color }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="grid grid-cols-5 gap-1">
                    {["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", 
                      "#FFFF00", "#FF00FF", "#00FFFF", "#FF5733", "#C70039"].map((color) => (
                      <div
                        key={color}
                        className={cn(
                          "w-6 h-6 rounded cursor-pointer border hover:scale-110 transition-transform duration-200",
                          textProps.color === color ? "ring-2 ring-editor-accent ring-offset-1" : "border-editor-border"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => handleChange("color", color)}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <div className="flex items-center gap-1">
            <IconButton 
              icon={Bold} 
              active={textProps.fontWeight === "bold"}
              onClick={() => handleChange("fontWeight", textProps.fontWeight === "bold" ? "normal" : "bold")}
              tooltip="Bold"
            />
            <IconButton 
              icon={Italic} 
              active={textProps.fontStyle === "italic"}
              onClick={() => handleChange("fontStyle", textProps.fontStyle === "italic" ? "normal" : "italic")}
              tooltip="Italic"
            />
          </div>
          
          <div className="flex items-center gap-1">
            <IconButton 
              icon={AlignLeft} 
              active={textProps.alignment === "left"}
              onClick={() => handleChange("alignment", "left")}
              tooltip="Align Left"
            />
            <IconButton 
              icon={AlignCenter} 
              active={textProps.alignment === "center"}
              onClick={() => handleChange("alignment", "center")}
              tooltip="Align Center"
            />
            <IconButton 
              icon={AlignRight} 
              active={textProps.alignment === "right"}
              onClick={() => handleChange("alignment", "right")}
              tooltip="Align Right"
            />
          </div>
        </div>
        
        <Button 
          onClick={handleAddText}
          className="w-full flex items-center justify-center gap-2 mt-2"
        >
          <Type size={16} />
          Add Text to Canvas
        </Button>
      </div>
    </Panel>
  );
};

export default TextEditor;
