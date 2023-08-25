const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'postgres', // Use the appropriate database dialect
  database: 'gallerys',
  username: 'postgres',
  password: 'root123',
  host: 'localhost', // Update with your database host
  port: 5432, // Update with your database port
});

module.exports = sequelize;
