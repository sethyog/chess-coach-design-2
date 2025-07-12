const { Client } = require('pg');
require('dotenv').config();

const createDatabase = async () => {
  // Connect to PostgreSQL without specifying database
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres' // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');

    // Check if database exists
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME || 'chess_coach'}'`;
    const result = await client.query(checkDbQuery);

    if (result.rows.length === 0) {
      // Create database
      const createDbQuery = `CREATE DATABASE ${process.env.DB_NAME || 'chess_coach'}`;
      await client.query(createDbQuery);
      console.log(`Database '${process.env.DB_NAME || 'chess_coach'}' created successfully`);
    } else {
      console.log(`Database '${process.env.DB_NAME || 'chess_coach'}' already exists`);
    }

    await client.end();
    console.log('Database setup completed successfully');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    await client.end();
    return false;
  }
};

// Run setup if called directly
if (require.main === module) {
  createDatabase().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = createDatabase;
