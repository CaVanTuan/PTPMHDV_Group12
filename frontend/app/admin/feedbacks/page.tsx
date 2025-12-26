"use client";

import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import {
  getAllFeedback,
  deleteFeedback,
  updateFeedback,
  FeedbackData,
} from "@/services/feedback-services";
import { getAll } from "@/services/product-services";
import { toast } from "react-toastify";

// Component StarRating
function StarRating({ rating, setRating }: { rating: number; setRating: (v: number) => void }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < (hover || rating);
        return (
          <FaStar
            key={i}
            size={22}
            className={`cursor-pointer transition-colors ${filled ? "text-yellow-400" : "text-gray-300"}`}
            onClick={() => setRating(i + 1)}
            onMouseEnter={() => setHover(i + 1)}
            onMouseLeave={() => setHover(0)}
          />
        );
      })}
    </div>
  );
}

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<FeedbackData | null>(null);

  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [productId, setProductId] = useState<number | "">("");

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await getAllFeedback();
      setFeedbacks(res || []);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const res = await getAll();
      setProducts(res?.map((p: any) => ({ id: p.id, name: p.name })) || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    fetchProducts();
  }, []);

  const handleEdit = (fb: FeedbackData) => {
    setEditingFeedback(fb);
    setContent(fb.content);
    setRating(fb.rating);
    setProductId(fb.productId ?? "");
  };

  const handleUpdate = async () => {
    if (!editingFeedback || productId === "") {
      toast.warn("Điền đầy đủ thông tin");
      return;
    }

    try {
      await updateFeedback(editingFeedback.id!, {
        content,
        rating,
        productId: productId as number,
      });
      setEditingFeedback(null);
      setContent("");
      setRating(5);
      setProductId("");
      fetchFeedbacks();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa feedback này?")) return;
    try {
      await deleteFeedback(id);
      fetchFeedbacks();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Quản lý Feedbacks</h1>

      {/* Form chỉnh sửa */}
      {editingFeedback && (
        <div className="mb-6 p-4 border rounded-md">
          <h2 className="font-semibold mb-2">Cập nhật Feedback</h2>
          <div className="flex flex-col gap-2">
            <textarea
              className="border p-2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nội dung feedback"
            />
            
            {/* Star rating */}
            <StarRating rating={rating} setRating={setRating} />

            <select
              className="border p-2"
              value={productId}
              onChange={(e) =>
                setProductId(e.target.value ? parseInt(e.target.value) : "")
              }
            >
              <option value="">Chọn sản phẩm</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <div className="flex gap-2 mt-2">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleUpdate}
              >
                Cập nhật
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setEditingFeedback(null)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách feedback */}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Sản phẩm</th>
              <th className="border p-2">Nội dung đánh giá</th>
              <th className="border p-2">Số sao</th>
              <th className="border p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((fb) => (
              <tr key={fb.id}>
                <td className="border p-2">
                  {products.find((p) => p.id === fb.productId)?.name ?? "-"}
                </td>
                <td className="border p-2">{fb.content}</td>
                <td className="border p-2">
                  <StarRating rating={fb.rating} setRating={() => {}} />
                </td>
                <td className="border p-2 flex gap-2">
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                    onClick={() => handleEdit(fb)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(fb.id!)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
