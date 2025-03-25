
import { cn } from "../../lib/utils";
import { LucideIcon } from "lucide-react";

interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
  tooltip?: string;
  active?: boolean;
  disabled?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const IconButton = ({
  icon: Icon,
  onClick,
  className,
  tooltip,
  active = false,
  disabled = false,
  onMouseEnter,
  onMouseLeave,
}: IconButtonProps) => {
  return (
    <button
      type="button"
      className={cn(
        "icon-button relative group",
        active && "bg-editor-accent text-white hover:bg-editor-accent hover:text-white",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={tooltip}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Icon size={18} />
      {tooltip && (
        <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 pointer-events-none transition-opacity duration-200">
          <div className="bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap shadow-lg animate-fade-in">
            {tooltip}
          </div>
        </div>
      )}
    </button>
  );
};

export default IconButton;
