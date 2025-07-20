const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

async function resetPassword() {
  const password = 'password123'; // Simple password for testing
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('New password hash:', hashedPassword);
  console.log('Password:', password);
  
  // Connect to MongoDB and update the user
  const client = new MongoClient('mongodb://localhost:27019');
  
  try {
    await client.connect();
    const db = client.db('toolthinker');
    
    const result = await db.collection('users').updateOne(
      { email: 'marc@toolthinker.com' },
      { $set: { password: hashedPassword } }
    );
    
    if (result.modifiedCount > 0) {
      console.log('Password updated successfully!');
      console.log('You can now login with: marc@toolthinker.com / password123');
    } else {
      console.log('User not found or password not updated');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

resetPassword(); 