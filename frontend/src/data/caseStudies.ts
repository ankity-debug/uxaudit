// Lemon Yellow Design Case Studies Database
export interface CaseStudy {
  id: string;
  title: string;
  url: string;
  industry: string;
  description: string;
  workType: string[];
  keywords: string[];
  priority: number; // Higher priority = better showcase
}

export const caseStudies: CaseStudy[] = [
  // FinTech
  {
    id: 'phongsavanh-bank',
    title: 'Phongsavanh Bank',
    url: 'https://lemonyellow.design/work/phongsavanh-bank',
    industry: 'fintech',
    description: 'Catered to the diverse users of a multi-lingual app with three different currencies',
    workType: ['ui-ux-design'],
    keywords: ['banking', 'multi-language', 'multi-currency', 'mobile-app', 'financial'],
    priority: 8
  },
  {
    id: 'vayana',
    title: 'Vayana',
    url: 'https://lemonyellow.design/work/vayana',
    industry: 'fintech',
    description: 'Defined a frictionless loan origination system to boost conversions',
    workType: ['ui-ux-design'],
    keywords: ['lending', 'loan', 'conversion-optimization', 'financial', 'b2b'],
    priority: 7
  },
  {
    id: 'arthaone',
    title: 'ArthaOne',
    url: 'https://lemonyellow.design/work/arthaone',
    industry: 'fintech',
    description: 'Designing an extensive wealth management platform',
    workType: ['ui-ux-design', 'visual-design', 'branding'],
    keywords: ['wealth-management', 'investment', 'financial-planning', 'dashboard'],
    priority: 9
  },
  {
    id: 'fibe',
    title: 'Fibe',
    url: 'https://lemonyellow.design/work/fibe',
    industry: 'fintech',
    description: 'Application redesign aimed at revamping brand identity',
    workType: ['ui-ux-design', 'graphic-design', 'performance-marketing'],
    keywords: ['redesign', 'brand-identity', 'mobile-app', 'financial'],
    priority: 8
  },
  {
    id: 'rxil',
    title: 'RXIL',
    url: 'https://lemonyellow.design/work/rxil',
    industry: 'fintech',
    description: 'A modern MSME transaction experience for easy accessibility',
    workType: ['ui-ux-design', 'frontend-development', 'cms'],
    keywords: ['msme', 'transactions', 'accessibility', 'business', 'b2b'],
    priority: 7
  },
  {
    id: 'pay-unified',
    title: 'PayUnified',
    url: 'https://lemonyellow.design/work/pay-unified',
    industry: 'fintech',
    description: 'A unified payment platform for businesses of all sizes',
    workType: ['ui-ux-design', 'platform-design'],
    keywords: ['payment', 'payment-processing', 'platform', 'saas', 'b2b', 'fintech'],
    priority: 10
  },

  // Healthcare
  {
    id: 'curebay',
    title: 'Curebay',
    url: 'https://lemonyellow.design/work/curebay',
    industry: 'healthcare',
    description: 'Unified the complete healthcare experience for doctors, patients, and their families',
    workType: ['ui-ux-design'],
    keywords: ['healthcare', 'medical', 'doctor', 'patient', 'telemedicine', 'health-platform'],
    priority: 9
  },

  // E-commerce
  {
    id: 'uppercase',
    title: 'Uppercase',
    url: 'https://lemonyellow.design/work/uppercase',
    industry: 'ecommerce',
    description: 'Designed a complete e-commerce shopping experience for sustainable travel gears',
    workType: ['ui-ux-design'],
    keywords: ['e-commerce', 'shopping', 'travel', 'sustainable', 'retail', 'product-catalog'],
    priority: 8
  },
  {
    id: 'tata-neu',
    title: 'Tata Neu',
    url: 'https://lemonyellow.design/work/tata-neu',
    industry: 'ecommerce',
    description: 'Design in collaboration to create an integrated super app experience',
    workType: ['ui-ux-design'],
    keywords: ['super-app', 'marketplace', 'integrated-platform', 'multi-service', 'tata'],
    priority: 10
  },
  {
    id: 'rezolve',
    title: 'Rezolve',
    url: 'https://lemonyellow.design/work/rezolve',
    industry: 'ecommerce',
    description: 'Designed for an innovative platform aimed at revolutionizing experiences across brands',
    workType: ['ui-ux-design'],
    keywords: ['platform', 'brand-experience', 'innovation', 'multi-brand'],
    priority: 7
  },
  {
    id: 'tata-cliq',
    title: 'Tata CLiQ',
    url: 'https://lemonyellow.design/work/tata-cliq',
    industry: 'ecommerce',
    description: 'UI design to create an aesthetic, seamless shopping experience',
    workType: ['ui-design'],
    keywords: ['e-commerce', 'shopping', 'aesthetic', 'seamless', 'tata', 'retail'],
    priority: 8
  },
  {
    id: 'orra',
    title: 'Orra',
    url: 'https://lemonyellow.design/work/orra',
    industry: 'ecommerce',
    description: 'Polishing the Orra buying experience with a simple and seamless checkout journey',
    workType: ['ui-ux-design'],
    keywords: ['jewelry', 'luxury', 'checkout', 'conversion-optimization', 'e-commerce'],
    priority: 7
  },

  // EdTech
  {
    id: 'mkcl',
    title: 'MKCL',
    url: 'https://lemonyellow.design/work/mkcl',
    industry: 'edtech',
    description: 'Revamped the entire website with a smooth-flowing concept and thoughtful designs',
    workType: ['website-design'],
    keywords: ['education', 'website-redesign', 'learning-platform', 'edtech'],
    priority: 6
  },
  {
    id: 'ffreedom',
    title: 'ffreedom',
    url: 'https://lemonyellow.design/work/ffreedom',
    industry: 'edtech',
    description: 'A redesign that complemented the new futuristic leap of the brand',
    workType: ['redesign', 'branding'],
    keywords: ['education', 'learning', 'brand-redesign', 'futuristic', 'edtech'],
    priority: 7
  },
  {
    id: 'nijuedx',
    title: 'NijuEDx',
    url: 'https://lemonyellow.design/work/nijuedx',
    industry: 'edtech',
    description: 'An immersive online learning experience for IB Board students',
    workType: ['ui-ux-design'],
    keywords: ['online-learning', 'education', 'ib-board', 'students', 'immersive'],
    priority: 8
  },

  // Real Estate
  {
    id: 'clicbrics',
    title: 'Clicbrics',
    url: 'https://lemonyellow.design/work/clicbrics',
    industry: 'real-estate',
    description: 'Transforming the search of easily finding, comparing, and purchasing properties',
    workType: ['ui-ux-design'],
    keywords: ['real-estate', 'property-search', 'comparison', 'property-purchase', 'search-experience'],
    priority: 8
  },

  // SaaS & Technology
  {
    id: 'rxil-saas',
    title: 'RXIL Platform',
    url: 'https://lemonyellow.design/work/rxil',
    industry: 'saas',
    description: 'A modern business platform with dashboard design and user experience optimization',
    workType: ['ui-ux-design', 'platform-design'],
    keywords: ['saas', 'platform', 'dashboard', 'business-tool', 'interface-design', 'user-experience'],
    priority: 9
  },
  {
    id: 'curebay-saas',
    title: 'Curebay Platform',
    url: 'https://lemonyellow.design/work/curebay',
    industry: 'saas',
    description: 'Healthcare platform with comprehensive user interface and experience design',
    workType: ['ui-ux-design', 'platform-design'],
    keywords: ['saas', 'platform', 'dashboard', 'interface', 'user-experience', 'design-system'],
    priority: 8
  }
];

// Industry mapping for smart matching
export const industryMapping: Record<string, string[]> = {
  'fintech': ['financial', 'banking', 'investment', 'payment', 'lending', 'insurance', 'cryptocurrency', 'trading'],
  'healthcare': ['medical', 'health', 'hospital', 'clinic', 'telemedicine', 'pharma', 'wellness', 'fitness'],
  'ecommerce': ['retail', 'shopping', 'marketplace', 'store', 'commerce', 'fashion', 'goods', 'products'],
  'edtech': ['education', 'learning', 'school', 'university', 'course', 'training', 'academy', 'knowledge'],
  'real-estate': ['property', 'real-estate', 'housing', 'construction', 'architecture', 'apartment'],
  'saas': ['software', 'platform', 'service', 'tool', 'dashboard', 'analytics', 'crm', 'enterprise', 'interface', 'app', 'system'],
  'logistics': ['shipping', 'delivery', 'transport', 'logistics', 'supply-chain', 'warehouse'],
  'travel': ['travel', 'tourism', 'booking', 'hotel', 'flight', 'vacation', 'trip'],
  'media': ['news', 'media', 'entertainment', 'streaming', 'content', 'social'],
  'food': ['food', 'restaurant', 'delivery', 'recipe', 'dining', 'catering'],
  'default': ['business', 'corporate', 'company', 'service', 'platform', 'website', 'app']
};

// Smart matching algorithm - only returns truly relevant case studies
export function getRelevantCaseStudies(auditUrl?: string, auditSummary?: string, limit: number = 2): CaseStudy[] {
  // If no context provided, return empty - no generic fallbacks
  if (!auditUrl && !auditSummary) {
    return [];
  }

  let scoredCaseStudies = caseStudies.map(caseStudy => ({
    ...caseStudy,
    relevanceScore: calculateRelevanceScore(caseStudy, auditUrl, auditSummary)
  }));

  // Filter out case studies with low relevance scores (less than 30)
  // This prevents showing irrelevant case studies
  const relevantCaseStudies = scoredCaseStudies.filter(cs => cs.relevanceScore >= 30);

  // If no truly relevant case studies found, return empty
  if (relevantCaseStudies.length === 0) {
    console.log('No relevant case studies found for:', auditUrl);
    return [];
  }

  // Sort by relevance score (descending) and priority
  relevantCaseStudies.sort((a, b) => {
    if (a.relevanceScore !== b.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return b.priority - a.priority;
  });

  // Debug logging
  console.log('Case Study Matching for:', auditUrl);
  console.log('Relevant matches found:', relevantCaseStudies.slice(0, limit).map(cs => ({
    title: cs.title,
    industry: cs.industry,
    score: cs.relevanceScore,
    priority: cs.priority,
    description: cs.description.substring(0, 50) + '...'
  })));

  // Only return studies that meet our relevance threshold
  return relevantCaseStudies.slice(0, limit);
}

function calculateRelevanceScore(caseStudy: CaseStudy, auditUrl?: string, auditSummary?: string): number {
  let score = 0;
  let hasStrongMatch = false;

  // PRIORITY 1: Strong domain-based industry detection (highest priority)
  if (auditUrl) {
    const domain = extractDomain(auditUrl);
    
    // Fintech domains and patterns - strong matches only
    const fintechDomains = ['stripe.com', 'paypal.com', 'square.com', 'klarna.com', 'razorpay.com', 'payu.com'];
    const fintechPatterns = ['pay', 'bank', 'finance', 'loan', 'money', 'card', 'payment', 'fintech'];
    
    if (fintechDomains.includes(domain) || fintechPatterns.some(pattern => domain.includes(pattern))) {
      if (caseStudy.industry === 'fintech') {
        score += 80;
        hasStrongMatch = true;
      }
    }
    
    // Healthcare domains - strong matches only
    const healthcarePatterns = ['health', 'medical', 'doctor', 'hospital', 'clinic', 'pharma', 'healthcare'];
    if (healthcarePatterns.some(pattern => domain.includes(pattern))) {
      if (caseStudy.industry === 'healthcare') {
        score += 80;
        hasStrongMatch = true;
      }
    }
    
    // E-commerce domains - strong matches only
    const ecommercePatterns = ['shop', 'store', 'market', 'buy', 'cart', 'retail', 'ecommerce', 'commerce'];
    if (ecommercePatterns.some(pattern => domain.includes(pattern))) {
      if (caseStudy.industry === 'ecommerce') {
        score += 80;
        hasStrongMatch = true;
      }
    }

    // EdTech domains
    const edtechPatterns = ['edu', 'learn', 'course', 'academy', 'school', 'university', 'training'];
    if (edtechPatterns.some(pattern => domain.includes(pattern))) {
      if (caseStudy.industry === 'edtech') {
        score += 80;
        hasStrongMatch = true;
      }
    }

    // Real Estate domains
    const realEstatePatterns = ['property', 'realestate', 'housing', 'homes', 'apartment'];
    if (realEstatePatterns.some(pattern => domain.includes(pattern))) {
      if (caseStudy.industry === 'real-estate') {
        score += 80;
        hasStrongMatch = true;
      }
    }

    // SaaS domains
    const saasPatterns = ['app', 'platform', 'software', 'saas', 'tool', 'dashboard', 'analytics'];
    if (saasPatterns.some(pattern => domain.includes(pattern))) {
      if (caseStudy.industry === 'saas') {
        score += 70; // Slightly lower as SaaS is broader
        hasStrongMatch = true;
      }
    }
  }

  // PRIORITY 2: Summary-based contextual analysis 
  if (auditSummary && !hasStrongMatch) {
    const summaryLower = auditSummary.toLowerCase();
    
    // Look for specific industry indicators in summary
    const industryIndicators = {
      'fintech': ['payment', 'financial', 'banking', 'lending', 'investment', 'money', 'transaction'],
      'healthcare': ['health', 'medical', 'patient', 'doctor', 'clinic', 'hospital', 'treatment'],
      'ecommerce': ['shopping', 'product', 'cart', 'checkout', 'retail', 'purchase', 'order'],
      'edtech': ['education', 'learning', 'student', 'course', 'teaching', 'classroom', 'knowledge'],
      'real-estate': ['property', 'real estate', 'housing', 'apartment', 'home', 'rent', 'buy'],
      'saas': ['platform', 'dashboard', 'analytics', 'software', 'tool', 'system', 'interface']
    };

    for (const [industry, indicators] of Object.entries(industryIndicators)) {
      const matches = indicators.filter(indicator => summaryLower.includes(indicator));
      if (matches.length >= 2) { // Require at least 2 industry indicators
        if (caseStudy.industry === industry) {
          score += 60 + (matches.length * 10);
          hasStrongMatch = true;
          break; // Only match one industry
        }
      }
    }
  }

  // PRIORITY 3: Specific keyword matching (only if we have strong industry match)
  if (hasStrongMatch) {
    const urlKeywords = auditUrl ? extractKeywordsFromUrl(auditUrl) : [];
    const summaryWords = auditSummary ? auditSummary.toLowerCase().split(/\s+/) : [];
    const allWords = [...urlKeywords, ...summaryWords];

    // Count exact keyword matches
    const matchingKeywords = caseStudy.keywords.filter(keyword => 
      allWords.some(word => word.includes(keyword) || keyword.includes(word))
    );
    
    if (matchingKeywords.length > 0) {
      score += matchingKeywords.length * 5; // Bonus for keyword matches
    }
  }

  // Only add priority bonus if we have a strong industry match
  if (hasStrongMatch) {
    score += caseStudy.priority * 2; // Amplify priority for relevant studies
  }

  return score;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function extractKeywordsFromUrl(url: string): string[] {
  const urlParts = url.toLowerCase().split(/[./-_?]/);
  return urlParts.filter(part => part.length > 2);
}