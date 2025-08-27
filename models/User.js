const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

// Import models after they're defined to avoid circular dependencies
let CompanyVerification;

// Define the User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'Email already in use',
    },
    validate: {
      isEmail: {
        msg: 'Please provide a valid email address',
      },
      notEmpty: {
        msg: 'Email is required',
      },
    },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Password is required',
      },
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Name is required',
      },
      len: {
        args: [2, 100],
        msg: 'Name must be between 2 and 100 characters',
      },
    },
  },
  role: {
    type: DataTypes.ENUM('job_seeker', 'company', 'admin'),
    allowNull: false,
    defaultValue: 'job_seeker',
    validate: {
      isIn: {
        args: [['job_seeker', 'company', 'admin']],
        msg: 'Invalid role specified',
      },
    },
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'banned'),
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: {
        args: [['active', 'inactive', 'banned']],
        msg: 'Invalid status specified',
      },
    },
  },
}, {
  tableName: 'users',
  timestamps: false, // Disable timestamps to match database schema
  underscored: true,
  defaultScope: {
    attributes: {
      exclude: ['password_hash'],
    },
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password_hash'] },
    },
  },
});

// Set up associations after all models are loaded
User.associate = function(models) {
  CompanyVerification = models.CompanyVerification;
  
  User.hasMany(CompanyVerification, {
    foreignKey: 'companyId',
    as: 'verifications',
    onDelete: 'CASCADE'
  });

  User.hasMany(CompanyVerification, {
    foreignKey: 'verifiedBy',
    as: 'verificationsApproved',
    onDelete: 'SET NULL'
  });

  User.hasMany(CompanyVerification, {
    foreignKey: 'rejectedBy',
    as: 'verificationsRejected',
    onDelete: 'SET NULL'
  });
};

/**
 * Instance method to validate a password
 * @param {string} password - The password to validate
 * @returns {Promise<boolean>} True if password is valid, false otherwise
 */
User.prototype.validPassword = async function(password) {
  if (!password || !this.password_hash) {
    console.error('Password or hash is missing');
    console.log('Password exists:', !!password);
    console.log('Hash exists:', !!this.password_hash);
    return false;
  }
  
  try {
    console.log('Password being checked:', password);
    console.log('Stored hash:', this.password_hash);
    const isMatch = await bcrypt.compare(password, this.password_hash);
    console.log('Password match result:', isMatch);
    
    // Debug: Check hash generation
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(password, salt);
    console.log('New hash of provided password:', newHash);
    
    return isMatch;
  } catch (error) {
    console.error('Error validating password:', error);
    return false;
  }
};

// Hash password before saving
User.beforeSave(async (user, options) => {
  // Prevent setting role to 'admin' through normal user creation/update
  if (user.role === 'admin' && (!options || !options.isAdminCreation)) {
    throw new Error('Admin role cannot be assigned through this operation');
  }
  
  if (user.changed('password_hash')) {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

/**
 * Static method to create an admin user (only for internal/direct DB use)
 * This should only be used in secure contexts (migrations, seeds, or direct DB operations)
 */
User.createAdmin = async function(adminData) {
  return this.create({
    ...adminData,
    role: 'admin',
    status: 'active'
  }, { isAdminCreation: true });
};

// Hook to ensure email is lowercase and trim whitespace
User.beforeValidate((user, options) => {
  if (user.email) {
    user.email = user.email.toLowerCase().trim();
  }
  if (user.name) {
    user.name = user.name.trim();
  }
});

module.exports = User;
