import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const LessonSchema = new Schema(
  {
    title:      { type: String, required: true, trim: true },
    description:{ type: String, default: '' },
    objectives: { type: String, default: '' },
    readingList:{ type: [String], default: [] },
    estHoursPerWeek: { type: Number, min: 1, max: 40 },
    designerId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // teacher
    status:     { type: String, enum: ['active', 'inactive'], default: 'active' },
    credit:     { type: Number, default: 6 }, // each lesson = 6cp
  }
);

const Lesson = models.Lesson || model('Lesson', LessonSchema);

export default Lesson;
