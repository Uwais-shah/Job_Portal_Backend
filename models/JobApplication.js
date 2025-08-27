const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const JobApplication = sequelize.define('JobApplication', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    job_seeker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cover_letter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resume_link: {
  type: DataTypes.STRING(512),
  allowNull: true,
},
status: {
  type: DataTypes.STRING(20),
  defaultValue: 'applied',
},

    applied_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'applications',
    timestamps: false,
  });

  JobApplication.associate = (models) => {
    // Define association with Job using a specific alias
    JobApplication.belongsTo(models.Job, { 
      foreignKey: "job_id", 
      as: "appliedJob"  // Changed from 'job' to 'appliedJob' to avoid conflicts
    });
    JobApplication.belongsTo(models.User, { 
      foreignKey: "job_seeker_id", 
      as: "applicant" 
    });
  };
  return JobApplication;
};
