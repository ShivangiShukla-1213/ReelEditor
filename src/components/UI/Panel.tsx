
import { cn } from "../../lib/utils";
import React, { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  contentClassName?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

const Panel = ({ 
  children, 
  className, 
  title, 
  contentClassName,
  collapsible = false,
  defaultCollapsed = false
}: PanelProps) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  return (
    <div className={cn("panel overflow-hidden", className)}>
      {title && (
        <div className="px-4 py-2 border-b border-editor-border bg-white bg-opacity-70 flex justify-between items-center">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          {collapsible && (
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="text-editor-muted hover:text-editor-accent"
              aria-label={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? "+" : "-"}
            </button>
          )}
        </div>
      )}
      <div 
        className={cn(
          "transition-all duration-300", 
          collapsed ? "h-0 p-0 overflow-hidden" : "p-4", 
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Panel;
