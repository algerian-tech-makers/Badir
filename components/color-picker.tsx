"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
}

const ColorPicker = React.forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ value = "#000000", onChange, label, disabled, error }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const presetColors = [
      "#000000",
      "#FFFFFF",
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#FF00FF",
      "#00FFFF",
      "#FFA500",
      "#800080",
      "#008000",
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DFE6E9",
      "#6C5CE7",
      "#FD79A8",
      "#FDCB6E",
    ];

    const handleColorChange = (newColor: string) => {
      onChange(newColor);
    };

    const isValidHex = (color: string) => {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    };

    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <div className="flex gap-2">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  className={cn(
                    "h-10 w-12 border-2 p-0",
                    error && "border-red-500",
                  )}
                  style={{
                    backgroundColor: isValidHex(value) ? value : "#000000",
                  }}
                >
                  <span className="sr-only">اختر لون</span>
                </Button>
              }
            ></PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-3">
                <div>
                  <Label className="mb-2 block text-xs">الألوان المحفوظة</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "h-10 w-10 rounded border-2 transition-transform hover:scale-110",
                          value === color
                            ? "border-black ring-2 ring-black ring-offset-2"
                            : "border-gray-300",
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          handleColorChange(color);
                          setIsOpen(false);
                        }}
                      >
                        <span className="sr-only">{color}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="custom-color" className="mb-2 block text-xs">
                    اختر لون مخصص
                  </Label>
                  <div className="flex gap-2">
                    <input
                      id="custom-color"
                      type="color"
                      value={isValidHex(value) ? value : "#000000"}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="h-10 w-full cursor-pointer rounded border"
                      disabled={disabled}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Input
            ref={ref}
            type="text"
            dir="ltr"
            value={value}
            onChange={(e) => handleColorChange(e.target.value)}
            placeholder="#000000"
            disabled={disabled}
            className={cn(
              "flex-1 font-mono uppercase",
              error && "border-red-500",
            )}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

ColorPicker.displayName = "ColorPicker";

export default ColorPicker;
