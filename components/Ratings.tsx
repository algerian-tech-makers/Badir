"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Star, StarHalf } from "lucide-react";

interface RatingsProps {
  /**
   * Current rating value
   */
  value: number;
  /**
   * Max number of stars
   * @default 5
   */
  maxStars?: number;
  /**
   * Whether the rating is read-only or interactive
   * @default false
   */
  readOnly?: boolean;
  /**
   * Callback when rating changes (only in interactive mode)
   */
  onChange?: (value: number) => void;
  /**
   * Size of the stars
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Custom classes to apply to the container
   */
  className?: string;
  /**
   * Allow half-star ratings
   * @default true
   */
  allowHalf?: boolean;

  /**
   * Right-to-left layout support
   * @default false
   */
  isRTL?: boolean;
}

export default function Ratings({
  value,
  maxStars = 5,
  readOnly = false,
  onChange,
  size = "md",
  className,
  allowHalf = true,
  isRTL = true,
}: RatingsProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const starSize = {
    sm: 16,
    md: 24,
    lg: 32,
  }[size];

  const activeRating = hoverValue !== null ? hoverValue : value;

  const getStarValueFromPointer = (
    event: React.MouseEvent<HTMLDivElement>,
    starIndex: number,
  ) => {
    if (!allowHalf) return starIndex + 1;

    const rect = event.currentTarget.getBoundingClientRect();
    const position = isRTL
      ? (rect.right - event.clientX) / rect.width
      : (event.clientX - rect.left) / rect.width;

    let starValue = starIndex + 1;

    if (position <= 0.5) {
      starValue -= isRTL ? 0.5 : 0;
    } else {
      starValue -= isRTL ? 0 : 0.5;
    }

    return starValue;
  };

  const handleStarClick = (
    event: React.MouseEvent<HTMLDivElement>,
    starIndex: number,
  ) => {
    if (readOnly) return;

    if (onChange) {
      onChange(getStarValueFromPointer(event, starIndex));
    }
  };

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement>,
    starIndex: number,
  ) => {
    if (readOnly || !allowHalf) return;

    setHoverValue(getStarValueFromPointer(event, starIndex));
  };

  const renderStar = (starIndex: number) => {
    const starValue = starIndex + 1;

    // Determine if this star should be fully filled, half filled, or empty
    const isFilled = activeRating >= starValue;
    const isHalfFilled =
      allowHalf && !isFilled && activeRating >= starValue - 0.5;

    return (
      <div
        key={starIndex}
        className={cn(
          "relative cursor-default transition-colors",
          !readOnly && "cursor-pointer",
          isFilled && "text-amber-400",
          isHalfFilled && "text-amber-400",
          !isFilled && !isHalfFilled && "text-neutrals-300",
        )}
        onClick={(e) => handleStarClick(e, starIndex)}
        onMouseMove={(e) => handleMouseMove(e, starIndex)}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        data-rating={starValue}
        aria-label={`${starValue} من ${maxStars} نجوم`}
        role={!readOnly ? "button" : undefined}
      >
        {isHalfFilled ? (
          <StarHalf
            className="fill-current"
            style={{ transform: isRTL ? "scaleX(-1)" : "none" }}
            size={starSize}
          />
        ) : (
          <Star className={isFilled ? "fill-current" : ""} size={starSize} />
        )}
      </div>
    );
  };

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={() => !isDragging && setHoverValue(null)}
      onMouseUp={() => setIsDragging(false)}
      onMouseOut={() => setIsDragging(false)}
      role="group"
      aria-label={`تقييم ${value} من ${maxStars}`}
    >
      {Array.from({ length: maxStars }).map((_, index) => renderStar(index))}

      {/* Accessible text for screen readers */}
      <span className="sr-only">
        التقييم {value} من {maxStars}
      </span>
    </div>
  );
}
