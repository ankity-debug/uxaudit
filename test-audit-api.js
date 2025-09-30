const axios = require('axios');

async function testAuditAPI() {
  try {
    console.log('🧪 Testing enhanced audit system...');

    const response = await axios.post('http://localhost:3001/api/audit', {
      type: 'url',
      url: 'https://example.com'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    console.log('✅ Analysis completed successfully!');
    console.log('\n📊 Key Results:');

    if (response.data.keyInsights) {
      console.log('\n🔍 Key Insights:');
      response.data.keyInsights.forEach((insight, i) => {
        console.log(`${i + 1}. ${insight}`);
      });
    }

    if (response.data.recommendations) {
      console.log('\n💡 Recommendations:');
      response.data.recommendations.slice(0, 3).forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }

    if (response.data.issues) {
      console.log('\n⚠️  Issues Found:', response.data.issues.length);
      console.log('First issue:', response.data.issues[0]?.title);
      console.log('Description:', response.data.issues[0]?.description);
    }

    // Check if language is user-centric vs technical
    const content = JSON.stringify(response.data);
    const hasUserCentricLanguage = content.includes('users') || content.includes('visitor') || content.includes('customer');
    const hasTechnicalLanguage = content.includes('DOM') || content.includes('MAIN_CONTENT') || content.includes('element');

    console.log('\n🎯 Language Analysis:');
    console.log('User-centric language detected:', hasUserCentricLanguage);
    console.log('Technical language present:', hasTechnicalLanguage);

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error:', error.message);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testAuditAPI();