import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { STAGES, type ObraStage } from "./AnimatedHouse";
import { cn } from "@/lib/utils";

interface Props {
  current: ObraStage;
  onChange: (stage: ObraStage) => void;
}

export default function StageSelector({ current, onChange }: Props) {
  const currentIdx = STAGES.findIndex((s) => s.id === current);

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max px-1">
        {STAGES.map((stage, i) => {
          const done    = i < currentIdx;
          const active  = i === currentIdx;
          const locked  = i > currentIdx;

          return (
            <motion.button
              key={stage.id}
              onClick={() => onChange(stage.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                active  && "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25",
                done    && "bg-primary/10 text-primary border-primary/20",
                locked  && "bg-muted text-muted-foreground border-border hover:border-primary/30",
              )}
            >
              {done   && <CheckCircle2 className="h-3.5 w-3.5" />}
              {active && <Clock className="h-3.5 w-3.5 animate-pulse" />}
              {locked && <Circle className="h-3.5 w-3.5" />}
              {stage.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
