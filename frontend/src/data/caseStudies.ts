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

// Smart matching algorithm
export function getRelevantCaseStudies(auditUrl?: string, auditSummary?: string, limit: number = 2): CaseStudy[] {
  let scoredCaseStudies = caseStudies.map(caseStudy => ({
    ...caseStudy,
    relevanceScore: calculateRelevanceScore(caseStudy, auditUrl, auditSummary)
  }));

  // Sort by relevance score (descending) and priority
  scoredCaseStudies.sort((a, b) => {
    if (a.relevanceScore !== b.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return b.priority - a.priority;
  });

  // Debug logging
  console.log('Case Study Matching for:', auditUrl);
  console.log('Top 5 matches:', scoredCaseStudies.slice(0, 5).map(cs => ({
    title: cs.title,
    industry: cs.industry,
    score: cs.relevanceScore,
    priority: cs.priority
  })));

  return scoredCaseStudies.slice(0, limit);
}

function calculateRelevanceScore(caseStudy: CaseStudy, auditUrl?: string, auditSummary?: string): number {
  let score = 0;
  let hasIndustryMatch = false;

  // PRIORITY 1: Direct domain-based industry detection (highest priority)
  if (auditUrl) {
    const domain = extractDomain(auditUrl);
    
    // Known fintech domains and patterns
    const fintechDomains = ['stripe.com', 'paypal.com', 'square.com', 'klarna.com', 'razorpay.com', 'payu.com'];
    const fintechPatterns = ['pay', 'bank', 'finance', 'loan', 'money', 'card', 'payment'];
    
    if (fintechDomains.includes(domain) || fintechPatterns.some(pattern => domain.includes(pattern))) {
      if (caseStudy.industry === 'fintech') {
        score += 60; // Reduced score for direct fintech match to allow keywords to have more impact
        hasIndustryMatch = true;
      }
    }
    
    // Healthcare domains
    const healthcarePatterns = ['health', 'medical', 'doctor', 'hospital', 'clinic', 'pharma'];
    if (healthcarePatterns.some(pattern => domain.includes(pattern))) {
      if (caseStudy.industry === 'healthcare') {
        score += 80;
        hasIndustryMatch = true;
      }
    }
    
    // E-commerce domains
    const ecommercePatterns = ['shop', 'store', 'market', 'buy', 'cart', 'retail'];
    if (ecommercePatterns.some(pattern => domain.includes(pattern))) {
      if (caseStudy.industry === 'ecommerce') {
        score += 80;
        hasIndustryMatch = true;
      }
    }
  }

  // PRIORITY 2: URL-based matching for broader industry terms
  if (auditUrl && !hasIndustryMatch) {
    const domain = extractDomain(auditUrl);
    const urlKeywords = extractKeywordsFromUrl(auditUrl);
    
    // Direct industry match from URL
    for (const [industry, keywords] of Object.entries(industryMapping)) {
      if (keywords.some(keyword => domain.includes(keyword) || urlKeywords.includes(keyword))) {
        if (caseStudy.industry === industry) {
          score += 50;
          hasIndustryMatch = true;
        }
      }
    }

    // Keyword matching in URL
    const matchingKeywords = caseStudy.keywords.filter(keyword => 
      domain.includes(keyword) || urlKeywords.includes(keyword)
    );
    score += matchingKeywords.length * 10;
  }

  // PRIORITY 3: Summary-based analysis (lower priority than URL)
  if (auditSummary) {
    const summaryLower = auditSummary.toLowerCase();
    
    // Check for specific industry terms in summary
    for (const [industry, keywords] of Object.entries(industryMapping)) {
      const matches = keywords.filter(keyword => summaryLower.includes(keyword));
      if (matches.length > 0) {
        if (caseStudy.industry === industry) {
          const summaryScore = hasIndustryMatch ? 20 : 40; // Lower if we already have URL match
          score += summaryScore + (matches.length * 5);
          hasIndustryMatch = true;
        }
      }
    }

    // Enhanced keyword matching in summary  
    const matchingKeywords = caseStudy.keywords.filter(keyword => 
      summaryLower.includes(keyword.replace('-', ' '))
    );
    score += matchingKeywords.length * 10; // Increased weight for summary keywords
  }

  // PRIORITY 4: Fallback for generic business sites
  if (!hasIndustryMatch) {
    // For unknown industries, prioritize versatile, high-quality case studies
    if (caseStudy.priority >= 9) {
      score += 20; // High-priority versatile studies
    } else if (caseStudy.priority >= 7) {
      score += 15; // Medium-priority studies
    }
  }

  // Base priority score (minimal weight to ensure quality)
  score += caseStudy.priority;

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