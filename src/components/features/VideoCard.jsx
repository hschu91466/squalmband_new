import { useState } from "react";
import { Play } from "lucide-react";

const VideoCard = ({ title, embedCode }) => {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="card video-card">
      {playing ? (
        <div className="video-card-embed">
          <iframe
            title={title}
            src={`https://www.youtube.com/embed/${embedCode}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <button
          type="button"
          className="video-card-thumb"
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
      )}
      <p className="video-card-title">{title}</p>
    </div>
  );
};

export default VideoCard;
