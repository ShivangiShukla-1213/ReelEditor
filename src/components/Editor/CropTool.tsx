import { useState, useEffect } from "react";
import { Crop, RotateCcw, Check, X } from "lucide-react";
import { TimelineElement } from "@/types/timeline";
import Panel from "../UI/Panel";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/UI/slider";
import { toast } from "sonner";
import { AspectRatio } from "@/components/UI/aspect-ratio";

interface CropToolProps {
  elements: TimelineElement[];
  selectedElementId: string | null;
  onCropApply: (id: string, crop: { x: number; y: number; width: number; height: number }) => void;
}

interface AspectRatioOption {
  id: string;
  name: string;
  value: number | null; // null for freeform
  icon: string;
}

const CropTool = ({ elements, selectedElementId, onCropApply }: CropToolProps) => {
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(100);
  const [cropHeight, setCropHeight] = useState(100);
  const [previewCrop, setPreviewCrop] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string | null>("freeform");

  // Aspect ratio options
  const aspectRatioOptions: AspectRatioOption[] = [
    { id: "freeform", name: "Freeform", value: null, icon: "⊞" },
    { id: "1:1", name: "1:1", value: 1, icon: "□" },
    { id: "16:9", name: "16:9", value: 16 / 9, icon: "▭" },
    { id: "9:16", name: "9:16", value: 9 / 16, icon: "▯" },
    { id: "5:4", name: "5:4", value: 5 / 4, icon: "▭" },
    { id: "4:5", name: "4:5", value: 4 / 5, icon: "▯" },
    { id: "4:3", name: "4:3", value: 4 / 3, icon: "▭" },
    { id: "3:4", name: "3:4", value: 3 / 4, icon: "▯" },
    { id: "3:2", name: "3:2", value: 3 / 2, icon: "▭" },
  ];

  // Find the selected element
  const selectedElement = selectedElementId
    ? elements.find(el => el.id === selectedElementId)
    : null;

  // Reset crop values when selected element changes
  useEffect(() => {
    if (selectedElement) {
      if (selectedElement.type === 'video' || selectedElement.type === 'image') {
        // Initialize with existing crop values or defaults
        const crop = selectedElement.content.crop || { x: 0, y: 0, width: 100, height: 100 };
        setCropX(crop.x);
        setCropY(crop.y);
        setCropWidth(crop.width);
        setCropHeight(crop.height);
        setPreviewCrop(crop);
        setSelectedAspectRatio("freeform"); // Reset aspect ratio selection
      }
    }
  }, [selectedElement]);

  // Update preview crop as user adjusts sliders
  const updatePreviewCrop = (x = cropX, y = cropY, width = cropWidth, height = cropHeight) => {
    const newCrop = {
      x, y, width, height
    };

    setPreviewCrop(newCrop);
  };

  // Debounced crop application
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedElementId) {
        onCropApply(selectedElementId, {
          x: cropX,
          y: cropY,
          width: cropWidth,
          height: cropHeight
        });
      }
    }, 100); // Increased debounce time for smoother performance

    return () => clearTimeout(timer);
  }, [cropX, cropY, cropWidth, cropHeight, selectedElementId, onCropApply]);

  // Update preview on slider change
  useEffect(() => {
    updatePreviewCrop();
  }, [cropX, cropY, cropWidth, cropHeight]);

  // Apply the crop
  const handleApplyCrop = () => {
    if (!selectedElementId || !selectedElement) return;

    if (selectedElement.type !== 'video' && selectedElement.type !== 'image') {
      toast.error("Cropping is only available for video and image elements");
      return;
    }

    const crop = {
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight
    };

    onCropApply(selectedElementId, crop);
    setPreviewCrop(crop);
    toast.success("Crop applied successfully");
  };

  // Reset crop to default
  const handleResetCrop = () => {
    const defaultCrop = { x: 0, y: 0, width: 100, height: 100 };
    setCropX(0);
    setCropY(0);
    setCropWidth(100);
    setCropHeight(100);
    setSelectedAspectRatio("freeform");

    if (selectedElementId) {
      onCropApply(selectedElementId, defaultCrop);
      setPreviewCrop(defaultCrop);
    }
  };

  // Change aspect ratio
  const handleAspectRatioChange = (ratioId: string) => {
    setSelectedAspectRatio(ratioId);

    const ratioOption = aspectRatioOptions.find(option => option.id === ratioId);
    if (!ratioOption) return;

    // For freeform, don't change the current crop dimensions
    if (ratioOption.value === null) return;

    // Calculate new dimensions based on the aspect ratio
    let newWidth = cropWidth;
    let newHeight = cropHeight;

    // Keep width and adjust height
    newHeight = newWidth / ratioOption.value;

    // Ensure height is not greater than 100
    if (newHeight > 100) {
      newHeight = 100;
      newWidth = newHeight * ratioOption.value;
    }

    setCropWidth(newWidth);
    setCropHeight(newHeight);

    updatePreviewCrop(cropX, cropY, newWidth, newHeight);
  };

  if (!selectedElement || (selectedElement.type !== 'video' && selectedElement.type !== 'image')) {
    return (
      <Panel title="Crop Tool" className="p-4">
        <p className="text-sm text-editor-muted text-center">
          Select a video or image to crop
        </p>
      </Panel>
    );
  }

  return (
    <Panel title="Crop Tool" className="p-4 max-h-screen overflow-y-auto">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Crop</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={handleResetCrop}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Aspect ratio</h4>
            <div className="grid grid-cols-3 gap-2">
              {aspectRatioOptions.slice(0, 9).map((option) => (
                <button
                  key={option.id}
                  className={`aspect-square border rounded-md flex items-center justify-center text-xl ${selectedAspectRatio === option.id
                    ? 'border-purple-500 border-2 text-purple-500'
                    : 'border-gray-300 text-gray-700'
                    }`}
                  onClick={() => handleAspectRatioChange(option.id)}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-xs absolute bottom-1">{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Horizontal Position</div>
            <Slider
              value={[cropX]}
              min={0}
              max={50}
              step={1}
              onValueChange={(value) => setCropX(value[0])}
            />
            <div className="flex justify-between text-xs text-editor-muted mt-1">
              <span>Left</span>
              <span>{cropX}%</span>
              <span>Right</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Vertical Position</div>
            <Slider
              value={[cropY]}
              min={0}
              max={50}
              step={1}
              onValueChange={(value) => setCropY(value[0])}
            />
            <div className="flex justify-between text-xs text-editor-muted mt-1">
              <span>Top</span>
              <span>{cropY}%</span>
              <span>Bottom</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Width</div>
            <Slider
              value={[cropWidth]}
              min={20}
              max={100}
              step={1}
              onValueChange={(value) => {
                setCropWidth(value[0]);
                // Adjust height based on aspect ratio if one is selected
                if (selectedAspectRatio && selectedAspectRatio !== "freeform") {
                  const ratio = aspectRatioOptions.find(opt => opt.id === selectedAspectRatio);
                  if (ratio && ratio.value) {
                    setCropHeight(value[0] / ratio.value);
                  }
                }
              }}
            />
            <div className="text-xs text-right text-editor-muted mt-1">
              {cropWidth}%
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Height</div>
            <Slider
              value={[cropHeight]}
              min={20}
              max={100}
              step={1}
              onValueChange={(value) => {
                setCropHeight(value[0]);
                // Adjust width based on aspect ratio if one is selected
                if (selectedAspectRatio && selectedAspectRatio !== "freeform") {
                  const ratio = aspectRatioOptions.find(opt => opt.id === selectedAspectRatio);
                  if (ratio && ratio.value) {
                    setCropWidth(value[0] * ratio.value);
                  }
                }
              }}
            />
            <div className="text-xs text-right text-editor-muted mt-1">
              {cropHeight}%
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleResetCrop}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleApplyCrop}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default CropTool;
