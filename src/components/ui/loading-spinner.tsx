"use client";

import Lottie from "lottie-react";
import loadingAnimation from "../../../public/lottie/loading-food.json";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 100, className }: LoadingSpinnerProps) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Lottie
        animationData={loadingAnimation}
        loop={true}
        autoplay={true}
      />
    </div>
  );
}
