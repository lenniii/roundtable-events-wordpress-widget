import { EventCardSkeleton } from "./EventCardSkeleton";

type EventCardGridSkeletonProps = {
  count?: number;
};

export function EventCardGridSkeleton({ count = 6 }: EventCardGridSkeletonProps) {
  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <EventCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
