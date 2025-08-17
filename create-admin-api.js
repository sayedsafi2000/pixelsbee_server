import fetch from 'node-fetch';

const createAdminViaAPI = async () => {
  try {
    const adminData = {
      name: "Sayed Safi",
      email: "safiuddin102030@gmail.com",
      password: "Safi@102030",
      role: "admin",
      status: "approved"
    };

    console.log('🔐 Creating Admin User via API...');
    console.log('=====================================');
    
    const response = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: safiuddin102030@gmail.com');
      console.log('🔑 Password: Safi@102030');
      console.log('👤 Role: admin');
      console.log('');
      console.log('✨ You can now login as admin!');
    } else {
      console.log('❌ Failed to create admin user:');
      console.log(result.message || 'Unknown error');
      
      if (result.message && result.message.includes('already exists')) {
        console.log('');
        console.log('💡 The admin user already exists. You can try logging in with:');
        console.log('📧 Email: safiuddin102030@gmail.com');
        console.log('🔑 Password: Safi@102030');
      }
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.log('');
    console.log('💡 Make sure the server is running on port 5001');
  }
};

createAdminViaAPI();
