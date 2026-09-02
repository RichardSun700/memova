import { cn } from "@/lib/utils";

type MemovaBrandProps = {
  className?: string;
  compact?: boolean;
};

export default function MemovaBrand({
  className,
  compact = false,
}: MemovaBrandProps) {
  return (
    <span
      className={cn(
        "memova-brand-lockup",
        compact && "memova-brand-lockup--compact",
        className
      )}
    >
      <img
        src="/brand/memova-app-icon-liquid-blue.svg"
        alt=""
        aria-hidden="true"
      />
      <span>MEMOVA</span>
    </span>
  );
}
