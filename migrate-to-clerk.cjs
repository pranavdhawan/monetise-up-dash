// migrate-to-clerk.js
const axios = require('axios');
const mongoose = require('mongoose');

const CLERK_SECRET_KEY = 'sk_test_eJvZkci5WFoeyOOkmjTPosrFEAadtOcbYLaOHl9skJ';
const MONGO_URI = 'mongodb+srv://pranav:applemango@cluster0.j7rrtrp.mongodb.net/';

// Define the User model directly here (since we're in a different directory)
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    sheetId: { type: String },
  },
  { collection: 'user-data' }
);

const User = mongoose.model('UserData', UserSchema);

async function migrateUsers() {
  // Connect to MongoDB
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB!');
  
  // Get all users from MongoDB
  const users = await User.find({});
  
  console.log(`Found ${users.length} users to migrate`);
  
  for (const user of users) {
    try {
      // Find user in Clerk by email
      const clerkUser = await axios.get(
        `https://api.clerk.com/v1/users?email_address=${user.email}`,
        {
          headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
        }
      );
      
      if (clerkUser.data.length > 0) {
        const userId = clerkUser.data[0].id;
        
        // Update Clerk metadata with sheetId
        await axios.patch(
          `https://api.clerk.com/v1/users/${userId}/metadata`,
          {
            public_metadata: {
              sheetId: user.sheetId
            }
          },
          {
            headers: {
              Authorization: `Bearer ${CLERK_SECRET_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log(`✅ Migrated ${user.email} - sheetId: ${user.sheetId}`);
      } else {
        console.log(`⚠️  User not found in Clerk: ${user.email}`);
      }
    } catch (error) {
      console.error(`❌ Error migrating ${user.email}:`, error.message);
    }
  }
  
  console.log('Migration complete!');
  process.exit(0);
}

migrateUsers();