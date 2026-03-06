import mongoose, { Schema, Document } from "mongoose";

export interface IQualification extends Document {
  name: string;
  abbreviation?: string;
  description?: string;

  isActive: boolean;
    image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QualificationSchema = new Schema<IQualification>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    

    abbreviation: {
      type: String,
      trim: true,
    },


    image: {
      type: String, 
    },

    description: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IQualification>(
  "Qualification",
  QualificationSchema
);