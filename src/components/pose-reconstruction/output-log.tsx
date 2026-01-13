'use client';

import { useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface OutputLogProps {
  value: string;
  className?: string;
}

export function OutputLog({ value, className }: OutputLogProps) {
  const logRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [value]);

  return (
    <div className={cn("space-y-2 text-left pb-4", className)}>
      <h3 className="font-semibold">Processing Log</h3>
      <Textarea
        ref={logRef}
        value={value}
        readOnly
        placeholder="Pose landmarks will appear here..."
        className="min-h-[12rem] h-[30vh] max-h-[50vh] font-mono text-xs resize-none overflow-y-auto"
      />
    </div>
  );
}
