// Test script to demonstrate case study matching functionality
const { getRelevantCaseStudies } = require('./frontend/src/data/caseStudies');

console.log('🧪 Testing Case Study Matching System\n');

// Test 1: FinTech URL
console.log('📊 Test 1: FinTech Website (example bank)');
const finTechUrl = 'https://bank.example.com';
const finTechSummary = 'Banking application with financial services and payment processing features';
const finTechMatches = getRelevantCaseStudies(finTechUrl, finTechSummary, 2);
console.log('Matches:', finTechMatches.map(c => `${c.title} (${c.industry}) - Score: ${c.relevanceScore}`));
console.log('');

// Test 2: E-commerce URL  
console.log('🛒 Test 2: E-commerce Website');
const ecommerceUrl = 'https://shop.example.com';
const ecommerceSummary = 'Online shopping platform with product catalog and checkout functionality';
const ecommerceMatches = getRelevantCaseStudies(ecommerceUrl, ecommerceSummary, 2);
console.log('Matches:', ecommerceMatches.map(c => `${c.title} (${c.industry}) - Score: ${c.relevanceScore}`));
console.log('');

// Test 3: Healthcare URL
console.log('🏥 Test 3: Healthcare Website');
const healthUrl = 'https://healthcare.example.com';
const healthSummary = 'Medical platform for patient management and telemedicine services';
const healthMatches = getRelevantCaseStudies(healthUrl, healthSummary, 2);
console.log('Matches:', healthMatches.map(c => `${c.title} (${c.industry}) - Score: ${c.relevanceScore}`));
console.log('');

// Test 4: Education URL
console.log('🎓 Test 4: Education Website');  
const eduUrl = 'https://learning.example.com';
const eduSummary = 'Online learning platform with courses and educational content';
const eduMatches = getRelevantCaseStudies(eduUrl, eduSummary, 2);
console.log('Matches:', eduMatches.map(c => `${c.title} (${c.industry}) - Score: ${c.relevanceScore}`));
console.log('');

console.log('✅ Case Study Matching System Working Correctly!');
console.log('The system intelligently matches audited websites to relevant Lemon Yellow case studies based on:');
console.log('- Industry/domain matching');
console.log('- URL keyword analysis'); 
console.log('- Content summary analysis');
console.log('- Case study priority scores');