const formatDate = (dateStr) => {
  const date = new Date(dateStr.replace(" ", "T"));
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr.replace(" ", "T"));
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

const TourDateRow = ({ tourDate }) => {
  return (
    <li className="tour-row">
      <div className="tour-date">
        <span className="tour-date-day">{formatDate(tourDate.tour_date)}</span>
        <span className="tour-date-time">{formatTime(tourDate.tour_date)}</span>
      </div>
      <div className="tour-details">
        <span className="tour-venue">{tourDate.venue}</span>
        {tourDate.location && (
          <span className="tour-location">{tourDate.location}</span>
        )}
      </div>
    </li>
  );
};

export default TourDateRow;
