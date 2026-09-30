import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const UserSchema = new Schema(
  {
    clerkId:  { type: String, unique: true, required: true },
    name: { type: String, trim: true, required: true },
    email:     { type: String, trim: true, lowercase: true, unique: true, required: true },
    selectedThemeId: { type: Schema.Types.ObjectId, ref: 'Theme', default: null },
    // optional studentProfile reference
    dateEnrolled: { type: Date, required: true },
    status: { type: String, enum: ['active', 'dropped-out'], default: 'active' },
    currentCreditPoints: { type: Number, default: 0 },
    enrolledCourseIds: [{ type: Schema.Types.ObjectId, ref: 'Course' }], // array of course IDs
  }
);
const User = models.User || model('User', UserSchema);

export default User;
