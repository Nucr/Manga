"use client";

import React, { useState } from "react";

export default function MangaCover({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src || "/default-cover.png");
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc("/default-cover.png")}
    />
  );
} 