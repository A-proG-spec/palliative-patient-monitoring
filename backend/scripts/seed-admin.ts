import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Admin } from '../src/models/Admin.js';
import { Counter } from '../src/models/Counter.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME;

    if (!adminEmail || !adminPassword || !adminName) {
      process.exit(1);
    }

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/palliative-care';
    await mongoose.connect(MONGODB_URI);
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin
    await Admin.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
    });


    // Initialize counter for patient display IDs
    await Counter.findOneAndUpdate(
      { name: 'patientId' },
      { $setOnInsert: { value: 0 } },
      { upsert: true }
    );

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();