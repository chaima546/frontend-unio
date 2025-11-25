import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import User from './models/UserModel.js';

const testLogin = async () => {
  try {
    await connectDB();
    console.log('\n✅ Connected to MongoDB\n');

    // Test credentials
    const testEmail = 'ahmed.benali@student.tn';
    const testPassword = 'password123';

    console.log('🔍 Testing login for:', testEmail);
    console.log('🔑 Password attempting:', testPassword);
    console.log('─'.repeat(60));

    // Find user
    const user = await User.findOne({ email: testEmail }).select('+password');
    
    if (!user) {
      console.log('❌ User not found!');
      console.log('\n📋 Let\'s check all users in database:\n');
      
      const allUsers = await User.find({}).select('email firstName lastName role');
      console.log(`Found ${allUsers.length} users:`);
      allUsers.forEach((u, i) => {
        console.log(`${i + 1}. ${u.email} - ${u.firstName} ${u.lastName} (${u.role})`);
      });
      
      process.exit(1);
    }

    console.log('✅ User found!');
    console.log('   Name:', user.firstName, user.lastName);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Hashed Password:', user.password.substring(0, 30) + '...');
    console.log('');

    // Test password comparison
    console.log('🔐 Testing password comparison...');
    const isMatch = await bcrypt.compare(testPassword, user.password);
    
    if (isMatch) {
      console.log('✅ Password matches! Login would succeed.');
    } else {
      console.log('❌ Password does NOT match! Login would fail.');
      console.log('');
      console.log('🔧 Troubleshooting:');
      console.log('   - The password in DB might be double-hashed');
      console.log('   - The password might not have been hashed correctly');
      console.log('');
      
      // Test if the password is stored as plain text
      if (user.password === testPassword) {
        console.log('⚠️  Password is stored as PLAIN TEXT (not hashed)');
      } else {
        // Try comparing with a fresh hash
        const freshHash = await bcrypt.hash(testPassword, 10);
        console.log('   Fresh hash would be:', freshHash.substring(0, 30) + '...');
        
        // Test if password is correct format
        const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
        console.log('   Is valid bcrypt format:', isBcryptHash);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🧪 Additional Tests');
    console.log('='.repeat(60));

    // Test all seeded students
    const students = [
      'ahmed.benali@student.tn',
      'fatima.trabelsi@student.tn',
      'mohamed.jendoubi@student.tn',
    ];

    console.log('\n📝 Testing first 3 students with password: "password123"\n');
    
    for (const email of students) {
      const student = await User.findOne({ email }).select('+password');
      if (student) {
        const match = await bcrypt.compare('password123', student.password);
        console.log(`${match ? '✅' : '❌'} ${email} - ${student.firstName} ${student.lastName}`);
      } else {
        console.log(`❌ ${email} - NOT FOUND`);
      }
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

testLogin();
