import { createPortal } from "react-dom";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

const VideoCommentModal = ({ video, onClose, refreshKey, setRefreshKey }) => {
  if (!video) return null;

  const handleCommentSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  return createPortal(
    <div
      className="video-comment-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-comment-modal-title"
    >
      <div
        className="video-comment-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="video-comment-modal-close"
          onClick={onClose}
          aria-label="Close comments"
        >
          ×
        </button>

        <div className="video-comment-modal-header">
          <img
            src={`https://img.youtube.com/vi/${video.embedCode}/hqdefault.jpg`}
            alt=""
            aria-hidden="true"
          />
          <h2 id="video-comment-modal-title">{video.title}</h2>
        </div>

        <div
          className="video-comment-modal-comments"
          role="region"
          aria-label="Comments for this video"
        >
          <CommentList contentId={video.id} key={refreshKey} />
          <CommentForm contentId={video.id} onSuccess={handleCommentSuccess} />
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default VideoCommentModal;
