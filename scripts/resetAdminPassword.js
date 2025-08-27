require('dotenv').config();
const { sequelize } = require('../config/database');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    const adminEmail = 'admin@yourdomain.com';
    const newPassword = 'Admin@1234'; // New strong password
    
    // Find the admin user
    const admin = await User.findOne({
      where: { 
        email: adminEmail,
        role: 'admin' 
      }
    });

    if (!admin) {
      console.log('Admin user not found');
      return;
    }

    // Update password directly in the database to bypass model validations
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await sequelize.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      {
        replacements: [hashedPassword, admin.id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    console.log('Admin password reset successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`New Password: ${newPassword}`);
    
  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    await sequelize.close();
  }
}

resetAdminPassword();
