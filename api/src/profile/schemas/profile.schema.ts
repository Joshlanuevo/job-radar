import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Profile {
  @Prop({ type: String, default: '' })
  resumeText: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: Number, default: 0 })
  yearsExperience: number;

  @Prop({ type: Number, default: null })
  minSalary: number | null; // monthly, PHP

  @Prop({ type: Boolean, default: false })
  acceptsOnsite: boolean;

  @Prop({ type: Boolean, default: false })
  acceptsNightShift: boolean;

  @Prop({ type: [String], default: [] })
  avoidSkills: string[];
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
