import { useState } from "react";
import { Play } from "lucide-react";
import VideoCommentModal from "../comments/VideoCommentModal";

const VideoCard = ({ id, title, embedCode }) => {
  const [playing, setPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

      <div className="video-card-title-row">
        <p className="video-card-title">{title}</p>
        <button
          type="button"
          className="video-card-comment-btn"
          onClick={() => setShowComments(true)}
          aria-label={`Comment on ${title}`}
          title="Add/View comments"
        >
          💬
        </button>
      </div>

      {showComments && (
        <VideoCommentModal
          video={{ id, title, embedCode }}
          onClose={() => setShowComments(false)}
          refreshKey={refreshKey}
          setRefreshKey={setRefreshKey}
        />
      )}
    </div>
  );
};

export default VideoCard;
