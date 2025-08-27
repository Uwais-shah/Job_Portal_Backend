const fetch = require('node-fetch');

async function testReportAPI() {
  const testData = {
    companyId: 'test-company-id', // Replace with a real company ID
    token: 'test-token', // Replace with a real token or leave as is to test unauthorized
    reason: 'This is a test report'
  };

  const url = `http://localhost:3000/api/company/report/${testData.companyId}`;
  
  console.log('Testing API endpoint:', url);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testData.token}`
      },
      body: JSON.stringify({ comment: testData.reason })
    });

    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response text:', text);
    
    try {
      const json = text ? JSON.parse(text) : {};
      console.log('Response JSON:', json);
    } catch (e) {
      console.log('Response is not valid JSON');
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testReportAPI();
