require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const initAdmin = async () => {
  try {
    console.log('Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecté à MongoDB');

    // Affiche l'URI de connexion (masque le mot de passe pour la sécurité)
    const safeUri = process.env.MONGO_URI.replace(/:[^:]*@/, ':***@');
    console.log('URI de connexion:', safeUri);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@delivery.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Motdepasse123!';
    
    console.log('\nEmail admin:', adminEmail);
    console.log('Mot de passe fourni:', adminPassword);

    // Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('\nUn compte admin existe déjà:');
      console.log('- Email:', existingAdmin.email);
      console.log('- Rôle:', existingAdmin.role);
      console.log('- ID:', existingAdmin._id);
      console.log('\nSuppression de l\'ancien admin...');
      await User.deleteOne({ _id: existingAdmin._id });
      console.log('Ancien admin supprimé');
    }

    // Créer le compte admin
    console.log('\nCréation du nouveau compte admin...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    console.log('Mot de passe haché:', hashedPassword);
    
    const admin = new User({
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('\n✅ Compte admin créé avec succès !');
    console.log('Email:', adminEmail);
    console.log('Mot de passe:', adminPassword);
    
    // Vérification
    const checkAdmin = await User.findOne({ email: adminEmail });
    console.log('\nVérification en base de données:');
    console.log('- Email:', checkAdmin.email);
    console.log('- Rôle:', checkAdmin.role);
    console.log('- ID:', checkAdmin._id);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

initAdmin();