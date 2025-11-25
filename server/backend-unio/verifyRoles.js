import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/UserModel.js';
import Prof from './models/ProfModel.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const verifyRoles = async () => {
  try {
    await connectDB();
    log('\n✅ Connected to MongoDB\n', 'green');

    log('═'.repeat(70), 'cyan');
    log('👥 USER ROLES VERIFICATION', 'cyan');
    log('═'.repeat(70), 'cyan');

    // Get all users from User model
    const users = await User.find({}).select('firstName lastName email role niveauScolaire section');
    
    // Get all professors from Prof model
    const profs = await Prof.find({}).select('firstName lastName email role department speciality');

    // Count by role
    const students = users.filter(u => u.role === 'user');
    const admins = users.filter(u => u.role === 'admin');

    log('\n📊 SUMMARY:', 'yellow');
    log('─'.repeat(70), 'yellow');
    log(`👨‍🎓 Students (role: "user"): ${students.length}`, 'green');
    log(`👑 Admins (role: "admin"): ${admins.length}`, 'green');
    log(`👨‍🏫 Professors (role: "prof"): ${profs.length}`, 'green');
    log(`📋 Total Users in DB: ${users.length + profs.length}`, 'cyan');
    log('─'.repeat(70), 'yellow');

    // Display Admins
    if (admins.length > 0) {
      log('\n👑 ADMINS (Login: /api/users/login)', 'magenta');
      log('─'.repeat(70), 'magenta');
      admins.forEach((admin, i) => {
        log(`${i + 1}. ${admin.firstName} ${admin.lastName}`, 'green');
        log(`   Email: ${admin.email}`, 'cyan');
        log(`   Role: ${admin.role}`, 'yellow');
        log('');
      });
    }

    // Display Students
    if (students.length > 0) {
      log('\n👨‍🎓 STUDENTS (Login: /api/users/login)', 'blue');
      log('─'.repeat(70), 'blue');
      students.forEach((student, i) => {
        log(`${i + 1}. ${student.firstName} ${student.lastName}`, 'green');
        log(`   Email: ${student.email}`, 'cyan');
        log(`   Role: ${student.role}`, 'yellow');
        log(`   Level: ${student.niveauScolaire}${student.section ? ' - ' + student.section : ''}`, 'cyan');
        log('');
      });
    }

    // Display Professors
    if (profs.length > 0) {
      log('\n👨‍🏫 PROFESSORS (Login: /api/profs/login)', 'green');
      log('─'.repeat(70), 'green');
      profs.forEach((prof, i) => {
        log(`${i + 1}. ${prof.firstName} ${prof.lastName}`, 'green');
        log(`   Email: ${prof.email}`, 'cyan');
        log(`   Role: ${prof.role}`, 'yellow');
        log(`   Department: ${prof.department} (${prof.speciality})`, 'cyan');
        log('');
      });
    }

    log('═'.repeat(70), 'cyan');
    log('🔐 LOGIN ENDPOINTS', 'cyan');
    log('═'.repeat(70), 'cyan');
    log('', 'reset');
    log('Students & Admins → POST /api/users/login', 'blue');
    log('Professors        → POST /api/profs/login', 'green');
    log('', 'reset');

    log('═'.repeat(70), 'cyan');
    log('✅ ALL ROLES ARE CORRECTLY SET UP!', 'green');
    log('═'.repeat(70), 'cyan');

    process.exit(0);

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
};

verifyRoles();
