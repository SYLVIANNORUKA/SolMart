"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/auth-store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export type Review = {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
}

interface ProductReviewProps {
  productId: string
  reviews: Review[]
  onAddReview?: (review: Omit<Review, "id" | "date">) => void
}

export function ProductReview({ productId, reviews, onAddReview }: ProductReviewProps) {
  const { isAuthenticated, user } = useAuthStore()
  const { toast } = useToast()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitReview = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to leave a review.",
        variant: "destructive",
      })
      return
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

   
    setTimeout(() => {
      if (user && onAddReview) {
        onAddReview({
          userId: user.id,
          userName: user.name,
          rating,
          comment,
        })
      }

    
      setRating(0)
      setComment("")
      setIsSubmitting(false)

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      })
    }, 500)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Customer Reviews</h2>

   
      {isAuthenticated && (
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">Write a Review</h3>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-500 text-yellow-500"
                      : "fill-muted text-muted-foreground"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {rating > 0 ? `You rated this ${rating} out of 5` : "Rate this product"}
            </span>
          </div>
          <Textarea
            placeholder="Share your thoughts about this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
          <Button onClick={handleSubmitReview} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      )}

      
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{review.userName}</p>
                    <p className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? "fill-yellow-500 text-yellow-500" : "fill-muted text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-2">{review.comment}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  )
}
