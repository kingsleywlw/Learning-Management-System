import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const ForumReplySchema = new Schema(
  {
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
    postId: { 
      type: Schema.Types.ObjectId, 
      ref: 'ForumPost', 
      required: true 
    },
    likes: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }]
  },
  {
    timestamps: true
  }
);

// Index for better query performance
ForumReplySchema.index({ postId: 1, createdAt: 1 });
ForumReplySchema.index({ authorId: 1 });

const ForumReply = models.ForumReply || model('ForumReply', ForumReplySchema);
export default ForumReply;