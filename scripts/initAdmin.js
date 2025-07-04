require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const initAdmin = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI);
    
    // Vérifier si un admin avec cet email existe déjà
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@delivery.com';
    let admin = await User.findOne({ email: adminEmail });
    
    // Hachage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Motdepasse123!', salt);

    if (admin) {
      // Mise à jour du mot de passe si l'admin existe déjà
      admin.password = hashedPassword;
      admin.role = 'admin';
      await admin.save();
      console.log('Compte admin mis à jour avec succès');
    } else {
      // Création d'un nouvel admin
      admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Compte admin créé avec succès');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour du compte admin:', error);
    process.exit(1);
  }
};

initAdmin();