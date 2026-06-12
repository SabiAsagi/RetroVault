"use client";
import { useState, useEffect } from "react";
import { Star, MessageSquare, Trash2, Edit2, AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";
import { getGameReviews, createReview, deleteReview } from "@/app/actions/games";

interface ReviewSectionProps {
  gameId: string;
}

export default function ReviewSection({ gameId }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const userId = session?.user ? (session.user as any).id : null;
  const userReview = reviews.find(r => r.userId === userId);

  useEffect(() => {
    fetchReviews();
  }, [gameId]);

  const fetchReviews = async () => {
    try {
      const data = await getGameReviews(gameId);
      setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (rating === 0) {
      alert("별점을 선택해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createReview(gameId, rating, content);
      await fetchReviews();
      setRating(0);
      setContent("");
      alert("리뷰가 등록되었습니다.");
    } catch (e) {
      alert("리뷰 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("정말 리뷰를 삭제하시겠습니까?")) return;
    try {
      await deleteReview(reviewId, gameId);
      await fetchReviews();
    } catch (e) {
      alert("리뷰 삭제에 실패했습니다.");
    }
  };

  const handleEdit = (r: any) => {
    setRating(r.rating);
    setContent(r.content || "");
    // scroll to form
    document.getElementById("review-form")?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <div className="py-8 text-center text-text-muted">리뷰를 불러오는 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-vault-border pb-4">
        <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <MessageSquare size={20} className="text-mint" /> 
          유저 리뷰 <span className="text-sm font-normal text-text-muted">({reviews.length})</span>
        </h3>
      </div>

      {/* Review Form */}
      {session ? (
        <form id="review-form" onSubmit={handleSubmit} className="bg-vault-surface border border-vault-border rounded-xl p-5 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-text-primary">{userReview ? '내 리뷰 수정하기' : '이 게임에 대한 평가를 남겨주세요'}</h4>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                type="button"
                onMouseEnter={() => setHoveredStar(num)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(num)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star size={24} className={num <= (hoveredStar || rating) ? "fill-amber text-amber" : "text-vault-border-light"} />
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="게임에 대한 리뷰를 자유롭게 작성해주세요."
            className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-sm text-text-primary resize-none min-h-[100px] focus:outline-none focus:border-mint/50"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="px-6 py-2.5 bg-mint hover:bg-mint-dim text-vault-bg font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '저장 중...' : (userReview ? '수정하기' : '등록하기')}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-vault-surface-light border border-vault-border rounded-xl p-6 text-center space-y-2">
          <AlertTriangle size={24} className="mx-auto text-amber" />
          <p className="text-sm font-bold text-text-primary">로그인 후 리뷰를 작성할 수 있습니다.</p>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-text-muted py-8 bg-vault-surface border border-vault-border rounded-xl border-dashed">
            아직 등록된 리뷰가 없습니다. 첫 리뷰를 작성해보세요!
          </p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-vault-surface border border-vault-border rounded-xl p-5 shadow-sm hover:border-mint/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vault-border to-vault-surface-light flex items-center justify-center border border-vault-border overflow-hidden shrink-0">
                    {review.user.image ? (
                      <img src={review.user.image} alt="user" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-text-muted">{review.user.nickname?.charAt(0) || review.user.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{review.user.nickname || review.user.name || '익명'}</p>
                    <p className="text-xs text-text-muted">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(num => (
                      <Star key={num} size={14} className={num <= review.rating ? "fill-amber text-amber" : "text-vault-border-light"} />
                    ))}
                  </div>
                  {userId === review.userId && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(review)} className="text-text-muted hover:text-mint transition-colors" title="수정"><Edit2 size={12} /></button>
                      <button onClick={() => handleDelete(review.id)} className="text-text-muted hover:text-coral transition-colors" title="삭제"><Trash2 size={12} /></button>
                    </div>
                  )}
                </div>
              </div>
              {review.content && (
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap pl-13">
                  {review.content}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
