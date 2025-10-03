import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CustomTooltip = ({
  children,
  content,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
}) => {
  return (
    <Tooltip aria-label={`Tooltip: ${content}`}>
      <TooltipTrigger>
        {children}
        <TooltipContent>{content}</TooltipContent>
      </TooltipTrigger>
    </Tooltip>
  );
};

export default CustomTooltip;
