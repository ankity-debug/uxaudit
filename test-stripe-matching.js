
import { getRelevantCaseStudies } from './frontend/src/data/caseStudies.js';

const auditUrl = 'https://stripe.com';
const auditSummary = 'Stripe is a global technology company that builds economic infrastructure for the internet. Businesses of every size—from new startups to public companies—use our software to accept payments and manage their businesses online.';

console.log('Testing with URL:', auditUrl);
const relevantCaseStudies = getRelevantCaseStudies(auditUrl, auditSummary, 5);
console.log('Relevant Case Studies:', relevantCaseStudies);
