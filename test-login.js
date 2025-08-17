import fetch from 'node-fetch';

const testLogin = async () => {
  try {
    console.log('🧪 Testing Login Functionality...');
    console.log('=====================================');
    
    // Test admin login
    console.log('📧 Testing Admin Login...');
    const adminResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'safiuddin102030@gmail.com',
        password: 'Safi@102030'
      })
    });

    const adminResult = await adminResponse.json();
    
    if (adminResponse.ok) {
      console.log('✅ Admin login successful!');
      console.log('👤 User:', adminResult.user.name);
      console.log('🔑 Role:', adminResult.user.role);
      console.log('🎫 Token received:', adminResult.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Admin login failed:', adminResult.message);
    }
    
    console.log('');
    
    // Test with wrong password
    console.log('📧 Testing Wrong Password...');
    const wrongResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'safiuddin102030@gmail.com',
        password: 'wrongpassword'
      })
    });

    const wrongResult = await wrongResponse.json();
    
    if (!wrongResponse.ok) {
      console.log('✅ Wrong password correctly rejected:', wrongResult.message);
    } else {
      console.log('❌ Wrong password was accepted (this is wrong!)');
    }
    
    console.log('');
    console.log('✨ Login functionality test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testLogin();
