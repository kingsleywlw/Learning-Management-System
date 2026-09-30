import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const ForumPostSchema = new Schema(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    content: { 
      type: String, 
      required: true, 
      trim: true 
    },
    authorId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    category: { 
      type: String, 
      enum: ['General', 'Teaching Strategies', 'Assessment', 'Course Design', 'Technology', 'Student Engagement', 'Help & Support', 'Announcements'],
      default: 'General'
    },
    likes: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    replyCount: {
      type: Number,
      default: 0
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isLocked: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for better query performance
ForumPostSchema.index({ authorId: 1, createdAt: -1 });
ForumPostSchema.index({ category: 1 });

const ForumPost = models.ForumPost || model('ForumPost', ForumPostSchema);
export default ForumPost;