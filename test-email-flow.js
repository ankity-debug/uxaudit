const axios = require('axios');

const testData = {
  auditData: {
    scores: {
      overall: { score: 85, maxScore: 100, grade: "B+" },
      heuristics: { score: 88, maxScore: 100 },
      accessibility: { score: 82, maxScore: 100 }
    },
    keyInsights: [
      "Strong visual hierarchy with clear navigation structure",
      "Good mobile responsiveness across different screen sizes",
      "Some accessibility improvements needed for screen readers"
    ],
    recommendations: [
      "Improve color contrast ratios for better accessibility compliance",
      "Add alt text to all decorative images and icons",
      "Optimize loading speed for better user experience"
    ],
    issues: [
      {
        title: "Color Contrast Issue",
        description: "Some text elements don't meet WCAG contrast requirements",
        severity: "medium",
        recommendation: "Increase contrast ratio to at least 4.5:1"
      }
    ]
  },
  recipientEmail: "ankit.y@ly.design",
  recipientName: "Test User",
  platformName: "Sample Website"
};

async function testEmailFlow() {
  try {
    console.log('🧪 Testing email flow...');

    const response = await axios.post('http://localhost:3001/api/share-report', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('✅ Success:', response.data);
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

testEmailFlow();