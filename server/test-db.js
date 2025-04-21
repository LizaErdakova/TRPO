const pool = require('./src/config/database.js');

async function testDatabase() {
  try {
    console.log('Attempting to connect to database...');
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Connected successfully');
    console.log('Tables in database:', tables);
    
    // Check if users table exists and has records
    if (tables.some(table => Object.values(table)[0] === 'users')) {
      const [users] = await pool.query('SELECT * FROM users LIMIT 5');
      console.log(`Found ${users.length} users in the database`);
      if (users.length > 0) {
        console.log('Sample user data (excluding password):', users.map(user => {
          const { password, ...userData } = user;
          return userData;
        }));
      }
    }
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase(); 