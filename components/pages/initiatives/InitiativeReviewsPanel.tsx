import Ratings from "@/components/Ratings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface InitiativeReview {
  id: number;
  rating: number | null;
  comment: string | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface InitiativeReviewsPanelProps {
  reviews: InitiativeReview[];
}

export default function InitiativeReviewsPanel({
  reviews,
}: InitiativeReviewsPanelProps) {
  const ratedReviews = reviews.filter((r) => r.rating !== null);
  const avgRating =
    ratedReviews.length > 0
      ? ratedReviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
        ratedReviews.length
      : 0;

  if (reviews.length === 0) {
    return (
      <div className="bg-neutrals-100 rounded-lg p-6 text-center">
        <p className="text-neutrals-700">لا توجد تقييمات لهذه المبادرة بعد</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-neutrals-300 flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
        <span className="text-neutrals-700 font-medium">متوسط التقييم</span>
        <div className="flex items-center gap-2">
          <Ratings value={avgRating} readOnly size="sm" isRTL />
          <span className="text-neutrals-700 text-sm">
            {avgRating.toFixed(1)} ({ratedReviews.length})
          </span>
        </div>
      </div>

      <ul className="space-y-3">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="border-neutrals-300 rounded-lg border bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center gap-3">
              <Avatar>
                {review.user.image && (
                  <AvatarImage
                    src={review.user.image}
                    alt={review.user.name ?? "مستخدم"}
                  />
                )}
                <AvatarFallback>
                  {(review.user.name ?? "؟").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-neutrals-800 font-medium">
                {review.user.name ?? "مستخدم"}
              </span>
              <Ratings
                value={review.rating ?? 0}
                readOnly
                size="sm"
                isRTL
                className="mr-auto"
              />
            </div>
            {review.comment && (
              <p className="text-neutrals-700 text-sm whitespace-pre-wrap">
                {review.comment}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
