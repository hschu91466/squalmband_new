import { useEffect, useState } from "react";
import { mediaService } from "../services/media";
import VideoCard from "../components/features/VideoCard";

const Video = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const response = await mediaService.list({
          platform: "youtube",
          placement: "list",
        });

        if (response.success) {
          setVideos(response.data);
        }
      } catch (err) {
        console.error("Failed to load videos:", err);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  return (
    <section id="video" className="section-flex">
      <h2 className="section-heading">Videos</h2>

      <div className="section-content-center">
        {loading && <p>Loading...</p>}

        {!loading && videos.length === 0 && (
          <p>No videos yet — check back soon.</p>
        )}

        {!loading && videos.length > 0 && (
          <div className="video-grid">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                title={video.title}
                embedCode={video.embed_code}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Video;
