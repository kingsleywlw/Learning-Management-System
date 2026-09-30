import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const ThemeSchema = new Schema({
  hexColor: { type: String, required: true, unique: true },
  description: { type: String, required: true }
});

const Theme = models.Theme || model('Theme', ThemeSchema);

export default Theme;
