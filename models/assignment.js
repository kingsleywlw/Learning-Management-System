import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

// Assignment Template - created by teachers, belongs to course
const AssignmentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    courseId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Course', 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['active', 'inactive'], 
      default: 'active' 
    }
  },
  {
    timestamps: true
  }
);

const Assignment = models.Assignment || model('Assignment', AssignmentSchema);
export default Assignment;
