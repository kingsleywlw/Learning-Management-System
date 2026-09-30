import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const ReactionsSchema = new Schema(
  { love: { type: [String], default: [] } },
  { _id: false }
);

const ReplySchema = new Schema(
  {
    authorId:   { type:String, required:true },
    authorName: { type:String, required:true },
    content:    { type:String, required:true, trim:true },
    reactions:  { type:ReactionsSchema, default:()=>({}) }
    // ⬇️ we'll add .replies after the schema is created to allow self-reference
  },
  { timestamps:true }
);

// ⬅️ Add recursive replies here
ReplySchema.add({
  replies: { type: [ReplySchema], default: [] }
});

const CommentSchema = new Schema(
  {
    authorId:   { type:String, required:true },
    authorName: { type:String, required:true },
    content:    { type:String, required:true, trim:true },
    reactions:  { type:ReactionsSchema, default:()=>({}) },
    replies:    { type:[ReplySchema], default:[] }    // remains the same
  },
  { timestamps:true }
);

const ForumThreadSchema = new Schema(
  { courseIdStr:{type:String,required:true},
    courseRef:{type:Schema.Types.ObjectId, ref:'Course', required:true},
    authorId:{type:String,required:true}, authorName:{type:String,required:true},
    title:{type:String,required:true,trim:true}, content:{type:String,required:true},
    tags:{type:String,default:""}, // CHANGED: String instead of [String]
    reactions:{type:ReactionsSchema, default:()=>({})},
    comments:{type:[CommentSchema], default:[]} },
  { timestamps:true }
);

ForumThreadSchema.index({ courseIdStr: 1 });                 
ForumThreadSchema.index({ title: 'text', content: 'text' });
ForumThreadSchema.index({ tags: 1 });

const ForumThread = models.ForumThread || model('ForumThread', ForumThreadSchema);

export default ForumThread;