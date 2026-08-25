import { useState } from "react";
import { ImageOff } from "lucide-react";

const NewsImageMedia = ({ src, alt }) => {
  const [errored, setErrored] = useState(false);

  if (errored || !src) {
    return (
      <div
        className="news-media news-media-placeholder"
        role="img"
        aria-label={alt || "Image unavailable"}
      >
        <ImageOff size={32} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      className="news-media"
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
};

export default NewsImageMedia;
