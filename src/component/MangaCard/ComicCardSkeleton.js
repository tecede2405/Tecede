export default function ComicCardSkeleton() {
  return (
    <div className="comicCard skeleton">

      <div className="comicThumb skeleton-box"></div>

      <div className="comicInfo">
        <div className="skeleton-line title"></div>
        <div className="skeleton-line small"></div>
        <div className="skeleton-line small"></div>
      </div>

    </div>
  );
}