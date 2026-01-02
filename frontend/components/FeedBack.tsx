"use client";

import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import {
  getFeedbackByProduct,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  FeedbackData,
} from "@/services/feedback-services";

interface FeedbackProps {
  productId: number;
}

// JWT payload
interface TokenPayload {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role": string;
}

export default function Feedback({ productId }: FeedbackProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth info (optional)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Create
  const [newContent, setNewContent] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // Edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingRating, setEditingRating] = useState(0);
  const [editingHover, setEditingHover] = useState(0);

  /* =====================
     Decode JWT (nếu có)
  ====================== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      setCurrentUserId(
        Number(
          decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
        )
      );
      setIsAdmin(
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] === "Admin"
      );
    } catch {
      setCurrentUserId(null);
      setIsAdmin(false);
    }
  }, []);

  /* =====================
     Fetch feedback (PUBLIC)
  ====================== */
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const data = await getFeedbackByProduct(productId);
        setFeedbacks(data);
      } catch {
        toast.error("Không thể tải feedback");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [productId]);

  /* =====================
     Create
  ====================== */
  const handleCreate = async () => {
    if (!newContent || newRating < 1 || newRating > 5) {
      toast.error("Nội dung và đánh giá từ 1–5 sao");
      return;
    }

    try {
      const created = await createFeedback({
        productId,
        content: newContent,
        rating: newRating,
      });
      setFeedbacks((prev) => [...prev, created]);
      setNewContent("");
      setNewRating(0);
      setHoverRating(0);
    } catch {}
  };

  /* =====================
     Update
  ====================== */
  const handleUpdate = async (id: number) => {
    if (!editingContent || editingRating < 1 || editingRating > 5) {
      toast.error("Nội dung và đánh giá từ 1–5 sao");
      return;
    }

    try {
      const updated = await updateFeedback(id, {
        productId,
        content: editingContent,
        rating: editingRating,
      });
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? updated : f))
      );
      setEditingId(null);
    } catch {}
  };

  /* =====================
     Delete
  ====================== */
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá feedback này?")) return;

    try {
      await deleteFeedback(id);
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    } catch {}
  };

  /* =====================
     Render stars
  ====================== */
  const renderStars = (
    rating: number,
    setRating?: (v: number) => void,
    hover?: number,
    setHover?: (v: number) => void
  ) =>
    Array.from({ length: 5 }).map((_, i) => {
      const filled = hover && hover > 0 ? i < hover : i < rating;
      return (
        <FaStar
          key={i}
          size={22}
          className={`${
            filled ? "text-yellow-400" : "text-gray-300"
          } ${setRating ? "cursor-pointer" : ""}`}
          onClick={() => setRating?.(i + 1)}
          onMouseEnter={() => setHover?.(i + 1)}
          onMouseLeave={() => setHover?.(0)}
        />
      );
    });

  if (loading) return <p>Đang tải feedback...</p>;

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4">Đánh giá sản phẩm</h2>

      {/* Create feedback (LOGIN ONLY) */}
      {currentUserId ? (
        <div className="bg-white p-4 rounded shadow mb-6">
          <textarea
            className="w-full border rounded p-2 mb-2"
            rows={3}
            placeholder="Viết đánh giá..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <div className="flex gap-1 mb-3">
            {renderStars(newRating, setNewRating, hoverRating, setHoverRating)}
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Gửi đánh giá
          </button>
        </div>
      ) : (
        <p className="text-gray-500 italic mb-6">
          Vui lòng đăng nhập để viết đánh giá
        </p>
      )}

      {/* List */}
      {feedbacks.length === 0 ? (
        <p className="text-gray-500">Chưa có đánh giá nào 😢</p>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((f) => (
            <div key={f.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <strong>
                    {f.userId === currentUserId ? "Bạn" : f.userName}
                  </strong>
                  <div className="flex gap-1">
                    {editingId === f.id
                      ? renderStars(editingRating, setEditingRating, editingHover, setEditingHover)
                      : renderStars(f.rating)}
                  </div>
                </div>

                {(isAdmin || f.userId === currentUserId) && (
                  <div className="flex gap-2 text-sm">
                    <button
                      className="text-blue-500"
                      onClick={() => {
                        setEditingId(f.id);
                        setEditingContent(f.content);
                        setEditingRating(f.rating);
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      className="text-red-500"
                      onClick={() => handleDelete(f.id)}
                    >
                      Xoá
                    </button>
                  </div>
                )}
              </div>

              {editingId === f.id ? (
                <>
                  <textarea
                    className="w-full border rounded p-2 mt-2"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                  />
                  <div className="flex gap-1 my-2">
                    {renderStars(editingRating, setEditingRating, editingHover, setEditingHover)}
                  </div>
                  <button
                    onClick={() => handleUpdate(f.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-300 px-3 py-1 rounded"
                  >
                    Huỷ
                  </button>
                </>
              ) : (
                <p className="mt-2">{f.content}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
