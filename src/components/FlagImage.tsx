
import { useState } from "react";

type FlagImageProps = {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
};

const FlagImage = ({ src, alt, className = "", fallbackText }: FlagImageProps) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <span className={`inline-flex items-center justify-center bg-gray-200 text-gray-600 text-xs font-medium rounded ${className}`}>
        {fallbackText || alt}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`inline-block ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

export default FlagImage;
