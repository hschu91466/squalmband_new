import { useState } from "react";
import { Play } from "lucide-react";

const NewsVideoEmbed = ({ embedCode, title }) => {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="news-media news-video-embed">
        <iframe
          title={title}
          src={`https://www.youtube.com/embed/${embedCode}?autoplay=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="news-media news-video-thumb"
      onClick={() => setPlaying(true)}
      aria-label={`Play ${title}`}
    >
      <img
        src={`https://img.youtube.com/vi/${embedCode}/hqdefault.jpg`}
        alt=""
        aria-hidden="true"
        loading="lazy"
      />
      <span className="play-button" aria-hidden="true">
        <Play size={28} fill="currentColor" />
      </span>
    </button>
  );
};

export default NewsVideoEmbed;
