const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Import models
const User = require('./User');
const CompanyProfile = require('./CompanyProfile');
const JobSeekerProfile = require('./JobSeekerProfile');
const Job = require('./Job');
const Bookmark = require('./Bookmark')(sequelize, DataTypes);
const AdminLog = require('./AdminLog');
const JobApplication = require('./JobApplication')(sequelize);
const UserEducation = require('./UserEducation');
const UserExperience = require('./UserExperience');
const Notification = require("./Notification")(sequelize, DataTypes);
const CompanyVerification = require('./CompanyVerification')(sequelize, DataTypes);
const CompanyReview = require('./CompanyReview')(sequelize, DataTypes);
const Report = require('./Report')(sequelize, DataTypes);
const ReportCounter = require('./ReportCounter')(sequelize, DataTypes);

// associations
User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "user_id", as: "user" });


// Define associations
// User to CompanyProfile (One-to-One)
User.hasOne(CompanyProfile, {
  foreignKey: 'userId',
  as: 'companyProfile',
  onDelete: 'CASCADE',
  hooks: true
});

CompanyProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// CompanyProfile to Job (One-to-Many)
CompanyProfile.hasMany(Job, {
  foreignKey: 'company_id',
  sourceKey: 'userId',
  as: 'jobs'
});

Job.belongsTo(CompanyProfile, {
  foreignKey: 'company_id',
  targetKey: 'userId',
  as: 'company'
});

// User to JobSeekerProfile (One-to-One)
User.hasOne(JobSeekerProfile, {
  foreignKey: 'userId',
  as: 'jobSeekerProfile',
  onDelete: 'CASCADE',
  hooks: true
});

JobSeekerProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});
// JobSeekerProfile to Education (One-to-Many)
JobSeekerProfile.hasMany(UserEducation, {
  foreignKey: 'user_id',
  as: 'education',
  onDelete: 'CASCADE',
});
UserEducation.belongsTo(JobSeekerProfile, {
  foreignKey: 'user_id',
  as: 'jobSeeker',
});

// JobSeekerProfile to Experience (One-to-Many)
JobSeekerProfile.hasMany(UserExperience, {
  foreignKey: 'user_id',
  as: 'experience',
  onDelete: 'CASCADE',
});
UserExperience.belongsTo(JobSeekerProfile, {
  foreignKey: 'user_id',
  as: 'jobSeeker',
});

// Set up associations for AdminLog (One-to-Many)
User.hasMany(AdminLog, {
  foreignKey: 'adminId',
  as: 'adminLogs',
  onDelete: 'CASCADE'
});

AdminLog.belongsTo(User, {
  foreignKey: 'adminId',
  as: 'admin'
});
// Job includes CompanyProfile via User → This is optional chaining later
Job.belongsTo(User, {
  foreignKey: 'company_id',
  as: 'companyUser'
});
User.hasMany(UserExperience, {
  foreignKey: 'user_id',
  as: 'experiences',
  onDelete: 'CASCADE',
});

UserExperience.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Job to Bookmark (One-to-Many)
Job.hasMany(Bookmark, {
  foreignKey: 'job_id',
  as: 'bookmarks',
  onDelete: 'CASCADE'
});

Bookmark.belongsTo(Job, {
  foreignKey: 'job_id',
  as: 'job'
});

// CompanyReview associations
User.hasMany(CompanyReview, {
  foreignKey: 'reviewer_id',
  as: 'reviews',
  onDelete: 'CASCADE'
});

CompanyReview.belongsTo(User, {
  foreignKey: 'reviewer_id',
  as: 'reviewer'
});

CompanyProfile.hasMany(CompanyReview, {
  foreignKey: 'company_id',
  as: 'reviews',
  onDelete: 'CASCADE'
});

CompanyReview.belongsTo(CompanyProfile, {
  foreignKey: 'company_id',
  as: 'company'
});

// Report associations
User.hasMany(Report, {
  foreignKey: 'reporter_id',
  as: 'reports',
  onDelete: 'CASCADE'
});

Report.belongsTo(User, {
  foreignKey: 'reporter_id',
  as: 'reporter'
});


// Set up associations after all models are defined
Object.values(sequelize.models).forEach(model => {
  if (model.associate) {
    model.associate(sequelize.models);
  }
});

module.exports = {
  sequelize,
  User,
  CompanyProfile,
  JobSeekerProfile,
  Job,
  Bookmark,
  AdminLog,
  JobApplication,
  UserEducation,
  UserExperience,
  Notification,
  CompanyVerification,
  CompanyReview,
  Report,
  ReportCounter
};

