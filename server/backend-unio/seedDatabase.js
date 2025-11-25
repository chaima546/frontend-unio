import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from './config/db.js';

// Import all models
import User from './models/UserModel.js';
import Course from './models/CourseModel.js';
import Calendrier from './models/CalendrierModel.js';
import Ressource from './models/RessourcesModel.js';
import Notification from './models/NotificationModel.js';

// 🎨 Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// 📦 Mock Data

// 1️⃣ Users (Students)
const mockUsers = [
  {
    firstName: 'Ahmed',
    lastName: 'Ben Ali',
    username: 'ahmed.benali',
    email: 'ahmed.benali@student.tn',
    password: 'password123',
    role: 'user',
    niveauScolaire: '1ère',
    section: null
  },
  {
    firstName: 'Fatima',
    lastName: 'Trabelsi',
    username: 'fatima.trabelsi',
    email: 'fatima.trabelsi@student.tn',
    password: 'password123',
    role: 'user',
    niveauScolaire: '2ème',
    section: 'Sciences'
  },
  {
    firstName: 'Mohamed',
    lastName: 'Jendoubi',
    username: 'mohamed.jendoubi',
    email: 'mohamed.jendoubi@student.tn',
    password: 'password123',
    role: 'user',
    niveauScolaire: '3ème',
    section: 'Informatique'
  },
  {
    firstName: 'Amira',
    lastName: 'Hammami',
    username: 'amira.hammami',
    email: 'amira.hammami@student.tn',
    password: 'password123',
    role: 'user',
    niveauScolaire: 'Bac',
    section: 'Mathématiques'
  },
  {
    firstName: 'Youssef',
    lastName: 'Gharbi',
    username: 'youssef.gharbi',
    email: 'youssef.gharbi@student.tn',
    password: 'password123',
    role: 'user',
    niveauScolaire: 'Bac',
    section: 'Économie'
  },
  {
    firstName: 'Sarra',
    lastName: 'Mansouri',
    username: 'sarra.mansouri',
    email: 'sarra.mansouri@student.tn',
    password: 'password123',
    role: 'user',
    niveauScolaire: '2ème',
    section: 'Lettres'
  },
  {
    firstName: 'Karim',
    lastName: 'Bouazizi',
    username: 'karim.bouazizi',
    email: 'karim.bouazizi@student.tn',
    password: 'password123',
    role: 'user',
    niveauScolaire: '3ème',
    section: 'Technologie'
  },
  {
    firstName: 'Leila',
    lastName: 'Abidi',
    username: 'leila.abidi',
    email: 'leila.abidi@student.tn',
    password: 'password123',
    role: 'user',
    niveauScolaire: '1ère',
    section: null
  }
];

// 2️⃣ Professors (stored in User model with role 'prof')
const mockProfs = [
  {
    firstName: 'Dr. Khaled',
    lastName: 'Salah',
    username: 'khaled.salah',
    email: 'khaled.salah@prof.tn',
    password: 'prof123',
    role: 'prof'
  },
  {
    firstName: 'Prof. Samira',
    lastName: 'Kacem',
    username: 'samira.kacem',
    email: 'samira.kacem@prof.tn',
    password: 'prof123',
    role: 'prof'
  },
  {
    firstName: 'Dr. Nabil',
    lastName: 'Zaied',
    username: 'nabil.zaied',
    email: 'nabil.zaied@prof.tn',
    password: 'prof123',
    role: 'prof'
  },
  {
    firstName: 'Prof. Hana',
    lastName: 'Mejri',
    username: 'hana.mejri',
    email: 'hana.mejri@prof.tn',
    password: 'prof123',
    role: 'prof'
  },
  {
    firstName: 'Dr. Tarek',
    lastName: 'Sfar',
    username: 'tarek.sfar',
    email: 'tarek.sfar@prof.tn',
    password: 'prof123',
    role: 'prof'
  }
];

// 3️⃣ Admin User
const mockAdmin = {
  firstName: 'Admin',
  lastName: 'System',
  username: 'admin',
  email: 'admin@unio.tn',
  password: 'admin123',
  role: 'admin'
};

// 🌱 Seed Function
const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    log('\n✅ Connected to MongoDB', 'green');

    // Clear existing data
    log('\n🗑️  Clearing existing data...', 'yellow');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Calendrier.deleteMany({});
    await Ressource.deleteMany({});
    await Notification.deleteMany({});
    log('✅ Existing data cleared', 'green');

    // 1. Create Admin
    log('\n👤 Creating admin user...', 'blue');
    const admin = await User.create(mockAdmin);
    log(`✅ Admin created: ${admin.email}`, 'green');

    // 2. Create Students
    log('\n🎓 Creating students...', 'blue');
    const students = [];
    for (const userData of mockUsers) {
      const student = await User.create(userData);
      students.push(student);
    }
    log(`✅ ${students.length} students created`, 'green');

    // 3. Create Professors (in User model with role 'prof')
    log('\n👨‍🏫 Creating professors...', 'blue');
    const profs = [];
    for (const profData of mockProfs) {
      const prof = await User.create(profData);
      profs.push(prof);
    }
    log(`✅ ${profs.length} professors created`, 'green');

    // 4. Create Courses
    log('\n📚 Creating courses...', 'blue');
    const mockCourses = [
      {
        name: 'Physique - Mécanique',
        teacher: profs[0]._id,
        students: [students[0]._id, students[1]._id, students[2]._id],
        progress: 45,
        nextLesson: 'Les forces et le mouvement',
        description: 'Introduction à la mécanique classique et les lois de Newton.'
      },
      {
        name: 'Mathématiques - Algèbre',
        teacher: profs[1]._id,
        students: [students[1]._id, students[3]._id, students[4]._id],
        progress: 60,
        nextLesson: 'Équations du second degré',
        description: 'Cours d\'algèbre pour les classes avancées.'
      },
      {
        name: 'Développement Web',
        teacher: profs[2]._id,
        students: [students[2]._id, students[4]._id, students[6]._id],
        progress: 30,
        nextLesson: 'React et composants',
        description: 'Création d\'applications web modernes avec React.'
      },
      {
        name: 'Français - Littérature',
        teacher: profs[3]._id,
        students: [students[0]._id, students[5]._id, students[7]._id],
        progress: 75,
        nextLesson: 'Le romantisme français',
        description: 'Étude de la littérature française classique et moderne.'
      },
      {
        name: 'Économie - Microéconomie',
        teacher: profs[4]._id,
        students: [students[3]._id, students[4]._id, students[5]._id],
        progress: 50,
        nextLesson: 'L\'offre et la demande',
        description: 'Principes fondamentaux de la microéconomie.'
      },
      {
        name: 'Informatique - Algorithmique',
        teacher: profs[2]._id,
        students: [students[2]._id, students[3]._id, students[6]._id],
        progress: 20,
        nextLesson: 'Structures de données',
        description: 'Introduction aux algorithmes et structures de données.'
      }
    ];

    const courses = await Course.insertMany(mockCourses);
    log(`✅ ${courses.length} courses created`, 'green');

    // 5. Create Calendar Events
    log('\n📅 Creating calendar events...', 'blue');
    const now = new Date();
    const mockEvents = [
      {
        titre: 'Examen de Physique',
        description: 'Examen final de mécanique',
        debut: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        fin: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        proprietaire: students[0]._id,
        courseId: courses[0]._id,
        type: 'examen'
      },
      {
        titre: 'Projet Web - Deadline',
        description: 'Soumission du projet final React',
        debut: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        fin: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        proprietaire: students[2]._id,
        courseId: courses[2]._id,
        type: 'projet'
      },
      {
        titre: 'Révision Mathématiques',
        description: 'Session de révision avant l\'examen',
        debut: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        fin: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000),
        proprietaire: students[3]._id,
        courseId: courses[1]._id,
        type: 'classe'
      },
      {
        titre: 'Réunion Parents-Profs',
        description: 'Réunion trimestrielle',
        debut: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        fin: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        proprietaire: profs[0]._id,
        type: 'personnel'
      },
      {
        titre: 'Exposé Économie',
        description: 'Présentation sur la théorie des jeux',
        debut: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        fin: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
        proprietaire: students[4]._id,
        courseId: courses[4]._id,
        type: 'classe'
      }
    ];

    const events = await Calendrier.insertMany(mockEvents);
    log(`✅ ${events.length} calendar events created`, 'green');

    // 6. Create Resources
    log('\n📁 Creating resources...', 'blue');
    const mockRessources = [
      {
        titre: 'Cours Physique - Chapitre 1',
        description: 'Introduction à la mécanique',
        type: 'file',
        url: 'https://example.com/files/physique-chap1.pdf',
        courseId: courses[0]._id,
        uploadedByProf: profs[0]._id
      },
      {
        titre: 'Exercices Algèbre',
        description: 'Série d\'exercices sur les équations',
        type: 'file',
        url: 'https://example.com/files/algebre-exercices.pdf',
        courseId: courses[1]._id,
        uploadedByProf: profs[1]._id
      },
      {
        titre: 'Tutoriel React',
        description: 'Vidéo explicative sur les hooks React',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=example',
        courseId: courses[2]._id,
        uploadedByProf: profs[2]._id
      },
      {
        titre: 'Documentation MDN - JavaScript',
        description: 'Lien vers la documentation officielle',
        type: 'link',
        url: 'https://developer.mozilla.org/fr/docs/Web/JavaScript',
        courseId: courses[2]._id,
        uploadedByProf: profs[2]._id
      },
      {
        titre: 'Résumé Littérature Française',
        description: 'Résumé du romantisme français',
        type: 'file',
        url: 'https://example.com/files/litterature-resume.pdf',
        courseId: courses[3]._id,
        uploadedByProf: profs[3]._id
      },
      {
        titre: 'Graphiques Économie',
        description: 'Graphiques de l\'offre et la demande',
        type: 'image',
        url: 'https://example.com/images/offre-demande.png',
        courseId: courses[4]._id,
        uploadedByProf: profs[4]._id
      },
      {
        titre: 'TD Algorithmique',
        description: 'Travaux dirigés sur les algorithmes de tri',
        type: 'file',
        url: 'https://example.com/files/algo-td.pdf',
        courseId: courses[5]._id,
        uploadedByProf: profs[2]._id
      }
    ];

    const ressources = await Ressource.insertMany(mockRessources);
    log(`✅ ${ressources.length} resources created`, 'green');

    // 7. Create Notifications
    log('\n🔔 Creating notifications...', 'blue');
    const mockNotifications = [
      {
        recipient: students[0]._id,
        sender: profs[0]._id,
        title: 'Nouveau cours disponible',
        link: '/courses/' + courses[0]._id,
        relatedCourse: courses[0]._id,
        type: 'resource_added',
        isRead: false
      },
      {
        recipient: students[2]._id,
        sender: profs[2]._id,
        title: 'Projet assigné',
        link: '/projects/new',
        relatedCourse: courses[2]._id,
        type: 'project_assigned',
        isRead: false
      },
      {
        recipient: students[3]._id,
        sender: profs[1]._id,
        title: 'Note publiée',
        link: '/grades',
        relatedCourse: courses[1]._id,
        type: 'grade_posted',
        isRead: true
      },
      {
        recipient: students[1]._id,
        title: 'Rappel: Examen dans 7 jours',
        link: '/calendar',
        relatedCourse: courses[0]._id,
        type: 'general',
        isRead: false
      },
      {
        recipient: students[4]._id,
        sender: profs[4]._id,
        title: 'Nouvelle ressource ajoutée',
        link: '/resources',
        relatedCourse: courses[4]._id,
        type: 'resource_added',
        isRead: false
      },
      {
        recipient: students[5]._id,
        sender: profs[3]._id,
        title: 'Modification du programme',
        link: '/courses/' + courses[3]._id,
        relatedCourse: courses[3]._id,
        type: 'general',
        isRead: false
      },
      {
        recipient: students[6]._id,
        sender: profs[2]._id,
        title: 'TD disponible',
        link: '/resources',
        relatedCourse: courses[5]._id,
        type: 'resource_added',
        isRead: true
      }
    ];

    const notifications = await Notification.insertMany(mockNotifications);
    log(`✅ ${notifications.length} notifications created`, 'green');

    // 8. Summary
    log('\n' + '='.repeat(60), 'cyan');
    log('📊 DATABASE SEEDING SUMMARY', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`👤 Admin: 1`, 'green');
    log(`🎓 Students: ${students.length}`, 'green');
    log(`👨‍🏫 Professors: ${profs.length} (stored in User model)`, 'green');
    log(`📚 Courses: ${courses.length}`, 'green');
    log(`📅 Calendar Events: ${events.length}`, 'green');
    log(`📁 Resources: ${ressources.length}`, 'green');
    log(`🔔 Notifications: ${notifications.length}`, 'green');
    log('='.repeat(60), 'cyan');

    log('\n📋 TEST CREDENTIALS:', 'yellow');
    log('─'.repeat(60), 'yellow');
    log('\n🔐 Admin:', 'cyan');
    log(`   Email: ${mockAdmin.email}`, 'green');
    log(`   Password: ${mockAdmin.password}`, 'green');
    
    log('\n🔐 Sample Student:', 'cyan');
    log(`   Email: ${mockUsers[0].email}`, 'green');
    log(`   Password: ${mockUsers[0].password}`, 'green');
    
    log('\n🔐 Sample Professor:', 'cyan');
    log(`   Email: ${mockProfs[0].email}`, 'green');
    log(`   Password: ${mockProfs[0].password}`, 'green');
    log('─'.repeat(60), 'yellow');

    log('\n✅ Database seeding completed successfully!', 'green');
    process.exit(0);

  } catch (error) {
    log(`\n❌ Error seeding database: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
