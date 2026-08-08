"use client";
import React, { useState, useEffect } from "react";
import AppButton from "@/components/AppButton";
import { authRoutes } from "@/data/routes";
import { useMediaQuery } from "react-responsive";

export default function SignInButton({
  onMenuAction,
}: {
  onMenuAction?: () => void;
}) {
  const [isClient, setIsClient] = useState(false);
  const isTablet = useMediaQuery({ maxWidth: 1024, minWidth: 768 });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR, default to desktop size to avoid hydration mismatch
  const buttonSize = isClient ? (isTablet ? "sm" : "lg") : "lg";

  return (
    <AppButton
      type="outline"
      url={authRoutes.login.url}
      border="rounded"
      size={buttonSize}
      onClick={onMenuAction ? onMenuAction : undefined}
    >
      {authRoutes.login.label}
    </AppButton>
  );
}
