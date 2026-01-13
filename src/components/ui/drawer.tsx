'use client';

import { ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface DrawerProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Drawer({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange
}: DrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div>
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
