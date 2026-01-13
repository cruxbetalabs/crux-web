'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ControlPanelProps {
  hip2DScale: number;
  onHip2DScaleChange: (value: number) => void;
  smoothingWindow: number;
  onSmoothingWindowChange: (value: number) => void;
  smoothingOrder: number;
  onSmoothingOrderChange: (value: number) => void;
  applySmoothing: boolean;
  onApplySmoothingChange: (checked: boolean) => void;
  animationSpeed: number;
  onAnimationSpeedChange: (value: number) => void;
}

export function ControlPanel({
  hip2DScale,
  onHip2DScaleChange,
  smoothingWindow,
  onSmoothingWindowChange,
  smoothingOrder,
  onSmoothingOrderChange,
  applySmoothing,
  onApplySmoothingChange,
  animationSpeed,
  onAnimationSpeedChange
}: ControlPanelProps) {
  return (
    // <Card>
    //   <CardHeader>
    //     <CardTitle>Pose Reconstruction Controls</CardTitle>
    //   </CardHeader>
    //   <CardContent className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {/* Movement Scale */}
      <div className="space-y-2">
        <Label htmlFor="hip-scale">
          Movement Scale: {hip2DScale.toFixed(1)}
        </Label>
        <Slider
          id="hip-scale"
          min={0.1}
          max={20}
          step={0.1}
          value={[hip2DScale]}
          onValueChange={(value) => onHip2DScaleChange(value[0])}
          className="w-full"
        />
      </div>

      {/* Animation Speed */}
      <div className="space-y-2">
        <Label htmlFor="animation-speed">
          Animation Speed: {animationSpeed.toFixed(1)}x
        </Label>
        <Slider
          id="animation-speed"
          min={0.1}
          max={5.0}
          step={0.1}
          value={[animationSpeed]}
          onValueChange={(value) => onAnimationSpeedChange(value[0])}
          className="w-full"
        />
      </div>

      {/* Smoothing Window */}
      <div className="space-y-2">
        <Label htmlFor="smoothing-window">
          Smoothing Window: {smoothingWindow}
        </Label>
        <Slider
          id="smoothing-window"
          min={3}
          max={21}
          step={2}
          value={[smoothingWindow]}
          onValueChange={(value) => onSmoothingWindowChange(value[0])}
          className="w-full"
        />
      </div>

      {/* Poly Order */}
      <div className="space-y-2">
        <Label htmlFor="poly-order">
          Poly Order: {smoothingOrder}
        </Label>
        <Slider
          id="poly-order"
          min={2}
          max={5}
          step={1}
          value={[smoothingOrder]}
          onValueChange={(value) => onSmoothingOrderChange(value[0])}
          className="w-full"
        />
      </div>

      {/* Apply Smoothing */}
      <div className="space-y-2">
        <Label htmlFor="apply-smoothing">Apply Smoothing</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="apply-smoothing"
            checked={applySmoothing}
            onCheckedChange={onApplySmoothingChange}
          />
          <Label htmlFor="apply-smoothing" className="text-sm">
            Enable
          </Label>
        </div>
      </div>
    </div>
    //   </CardContent>
    // </Card>
  );
}
