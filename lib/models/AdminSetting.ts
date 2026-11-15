import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminSetting extends Document {
  key: string;
  value: string;
  updatedAt: Date;
}

const AdminSettingSchema = new Schema<IAdminSetting>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'adminsettings' }
);

const AdminSetting: Model<IAdminSetting> =
  mongoose.models.AdminSetting ||
  mongoose.model<IAdminSetting>('AdminSetting', AdminSettingSchema);

export default AdminSetting;
