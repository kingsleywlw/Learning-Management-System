import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

// Individual student's work on an assignment
const StudentSubmissionSchema = new Schema(
  {
    studentId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    assignmentId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Assignment', 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['Pending', 'Submitted', 'Overdue', 'Graded'], 
      default: 'Pending',
      required: true 
    },
    grade: { 
      type: String, 
      enum: ['P', 'F', 'N'],  //N for Not graded yet
      default: 'N',
      required: true 
    },
    feedback: { type: String, trim: true },
    // Add fields to store PDF file data
    fileData: { type: Buffer },
    fileName: { type: String },
    fileType: { type: String },
    fileSize: { type: Number }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure one submission per student per assignment
StudentSubmissionSchema.index({ studentId: 1, assignmentId: 1 }, { unique: true });

const StudentSubmission = models.StudentSubmission || model('StudentSubmission', StudentSubmissionSchema);
export default StudentSubmission;