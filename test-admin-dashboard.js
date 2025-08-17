import fetch from 'node-fetch';

const testAdminDashboard = async () => {
  try {
    console.log('🧪 Testing Admin Dashboard...');
    console.log('=====================================');
    
    // First, login as admin to get a token
    console.log('📧 Logging in as admin...');
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'safiuddin102030@gmail.com',
        password: 'Safi@102030'
      })
    });

    const loginResult = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('❌ Admin login failed:', loginResult.message);
      return;
    }
    
    console.log('✅ Admin login successful!');
    const token = loginResult.token;
    
    // Test admin dashboard stats
    console.log('📊 Testing Admin Dashboard Stats...');
    const statsResponse = await fetch('http://localhost:5001/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const statsResult = await statsResponse.json();
    
    if (statsResponse.ok) {
      console.log('✅ Admin dashboard stats successful!');
      console.log('📈 Stats:', statsResult);
    } else {
      console.log('❌ Admin dashboard stats failed:', statsResult.message);
    }
    
    console.log('');
    console.log('✨ Admin dashboard test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAdminDashboard();




