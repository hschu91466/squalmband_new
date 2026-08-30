import { useEffect, useState } from "react";
import { commentsService } from "../../services/comments";
import { formatDateTime } from "../../utils/formatDate";

const CommentList = ({ contentId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contentId) return;

    const fetchComments = async () => {
      try {
        setLoading(true);
        const data = await commentsService.list("video", contentId);

        if (data.ok) {
          setComments(data.data);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [contentId]);

  if (loading) {
    return (
      <p role="status" aria-live="polite">
        Loading comments…
      </p>
    );
  }

  return (
    <div role="region" aria-label="Comments">
      {comments.length === 0 ? (
        <p role="status">No comments yet</p>
      ) : (
        <ol className="video-comment-list">
          {comments.map((comment) => (
            <li key={comment.comment_id} className="video-comment">
              <div className="video-comment-header">
                <strong>{comment.name}</strong>
                <span className="video-comment-date" aria-label="Posted on">
                  {formatDateTime(comment.created_at)}
                </span>
              </div>
              <p>{comment.body}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default CommentList;
