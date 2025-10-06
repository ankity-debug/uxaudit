// Lemon Yellow Design Case Studies Database - Active Only v2.1
// Last updated: Cleaned to include ONLY verified active case studies
// Total: 17 active case studies across 9 industries

export interface CaseStudy {
  id: string;
  title: string;
  url: string;
  industry: string;
  subIndustry?: string;
  description: string;
  workType: string[];
  keywords: string[];
  priority: number; // Higher priority = better showcase (1-10)
  thumbnail?: string;
}

export const caseStudies: CaseStudy[] = [
  // ========== FINTECH (3 active) ==========
  {
    id: 'vayana',
    title: 'Vayana',
    url: 'https://lemonyellow.design/work/vayana/',
    industry: 'fintech',
    subIndustry: 'lending',
    description: 'Transforming credit ecosystem with UX innovation - frictionless loan origination system to boost conversions',
    workType: ['ui-ux-design'],
    keywords: ['lending', 'loan', 'conversion-optimization', 'financial', 'b2b', 'credit', 'supply-chain-finance'],
    priority: 9
  },
  {
    id: 'fibe',
    title: 'Fibe',
    url: 'https://lemonyellow.design/work/fibe',
    industry: 'fintech',
    subIndustry: 'consumer-lending',
    description: 'Application redesign aimed at revamping brand identity for personal loans and financial services',
    workType: ['ui-ux-design', 'graphic-design', 'performance-marketing'],
    keywords: ['redesign', 'brand-identity', 'mobile-app', 'financial', 'personal-loans', 'consumer-finance'],
    priority: 8
  },
  {
    id: 'rxil',
    title: 'RXIL',
    url: 'https://lemonyellow.design/work/rxil',
    industry: 'fintech',
    subIndustry: 'invoice-financing',
    description: 'Modern MSME transaction experience for easy accessibility and receivables financing',
    workType: ['ui-ux-design', 'frontend-development', 'cms'],
    keywords: ['msme', 'transactions', 'accessibility', 'business', 'b2b', 'invoice-financing', 'working-capital'],
    priority: 8
  },

  // ========== BFSI - Banking, Financial Services, Insurance (5 active) ==========
  {
    id: 'kotak-mahindra',
    title: 'Kotak Mahindra Bank',
    url: 'https://lemonyellow.design/work/kotakmahindra',
    industry: 'bfsi',
    subIndustry: 'banking',
    description: 'Comprehensive UI/UX and frontend development for leading private sector bank',
    workType: ['ui-ux-design', 'frontend-development'],
    keywords: ['banking', 'financial-services', 'retail-banking', 'digital-banking', 'private-bank'],
    priority: 10
  },
  {
    id: 'homefirst',
    title: 'HomeFirst',
    url: 'https://lemonyellow.design/work/homefirst',
    industry: 'bfsi',
    subIndustry: 'housing-finance',
    description: 'Home finance platform with motion design and UX writing for seamless loan journey',
    workType: ['ui-ux-design', 'motion-design', 'ux-writing'],
    keywords: ['housing-finance', 'home-loans', 'mortgage', 'financial-services', 'motion'],
    priority: 9
  },
  {
    id: 'hdfc-mutual-funds',
    title: 'HDFC Mutual Funds',
    url: 'https://lemonyellow.design/work/hdfc/',
    industry: 'bfsi',
    subIndustry: 'asset-management',
    description: 'Visual design and UX audit for India\'s leading mutual fund platform',
    workType: ['ui-ux-design', 'visual-design', 'ux-audit'],
    keywords: ['mutual-funds', 'investment', 'asset-management', 'trading', 'portfolio', 'financial-planning'],
    priority: 10
  },
  {
    id: 'icici-securities',
    title: 'ICICI Securities',
    url: 'https://lemonyellow.design/work/icici-securities',
    industry: 'bfsi',
    subIndustry: 'securities-trading',
    description: 'UI/UX and visual design for comprehensive securities trading platform',
    workType: ['ui-ux-design', 'visual-design'],
    keywords: ['securities', 'trading', 'stock-market', 'investment', 'brokerage', 'demat'],
    priority: 9
  },
  {
    id: 'mahindra-finance',
    title: 'Mahindra Finance',
    url: 'https://lemonyellow.design/work/mahindra-finance',
    industry: 'bfsi',
    subIndustry: 'vehicle-finance',
    description: 'Dealers\' dashboard UI/UX for vehicle financing and loan management',
    workType: ['ui-ux-design', 'dashboard-design'],
    keywords: ['vehicle-finance', 'auto-loans', 'dealer-management', 'b2b-portal', 'dashboard'],
    priority: 8
  },

  // ========== ENTERTAINMENT (1 active) ==========
  {
    id: 'gigs-live',
    title: 'Gigs.live',
    url: 'https://lemonyellow.design/work/gigs',
    industry: 'entertainment',
    subIndustry: 'live-events',
    description: 'Live event streaming platform with immersive UI/UX for concerts and performances',
    workType: ['ui-ux-design'],
    keywords: ['live-streaming', 'concerts', 'events', 'entertainment', 'music', 'performances'],
    priority: 8
  },

  // ========== AUTOMOTIVE (2 active) ==========
  {
    id: 'bajaj-freedom',
    title: 'Bajaj Freedom (Bajaj Auto)',
    url: 'https://lemonyellow.design/work/bajaj-freedom/',
    industry: 'automotive',
    subIndustry: 'two-wheeler',
    description: 'CNG motorcycle launch campaign with UI/UX, web design, and motion graphics',
    workType: ['ui-ux-design', 'website-design', 'motion-design'],
    keywords: ['automotive', 'motorcycle', 'cng-vehicle', 'product-launch', 'campaign', 'motion-graphics'],
    priority: 9
  },
  {
    id: 'bridgestone',
    title: 'Bridgestone',
    url: 'https://lemonyellow.design/work/bridgestone/',
    industry: 'automotive',
    subIndustry: 'tires',
    description: 'Graphic design manual for premium tire brand guidelines and standards',
    workType: ['graphic-design', 'brand-manual'],
    keywords: ['automotive', 'tires', 'brand-guidelines', 'graphic-design', 'manual'],
    priority: 7
  },

  // ========== E-COMMERCE (1 active) ==========
  {
    id: 'tata-neu',
    title: 'Tata Neu',
    url: 'https://lemonyellow.design/work/tata-neu',
    industry: 'ecommerce',
    subIndustry: 'super-app',
    description: 'Integrated super app experience combining shopping, payments, and rewards',
    workType: ['ui-ux-design', 'platform-design'],
    keywords: ['super-app', 'marketplace', 'integrated-platform', 'multi-service', 'tata', 'rewards', 'shopping'],
    priority: 10
  },

  // ========== EDTECH (2 active) ==========
  {
    id: 'ffreedom',
    title: 'ffreedom',
    url: 'https://lemonyellow.design/work/ffreedom',
    industry: 'edtech',
    subIndustry: 'skill-development',
    description: 'Brand redesign with futuristic UI/UX for livelihood and skill development platform',
    workType: ['ui-ux-design', 'graphic-design', 'brand-redesign'],
    keywords: ['education', 'learning', 'brand-redesign', 'futuristic', 'edtech', 'skill-development', 'livelihood'],
    priority: 8
  },
  {
    id: 'nijuedx-uiux',
    title: 'NijuEDx',
    url: 'https://lemonyellow.design/work/nijuedx-uiux',
    industry: 'edtech',
    subIndustry: 'k12-education',
    description: 'Immersive online learning experience for IB Board students with modern UI/UX and CMS',
    workType: ['ui-ux-design', 'cms'],
    keywords: ['online-learning', 'education', 'ib-board', 'students', 'immersive', 'k12', 'elearning'],
    priority: 8
  },

  // ========== IT SOLUTIONS (1 active) ==========
  {
    id: 'quantiphi',
    title: 'Quantiphi',
    url: 'https://lemonyellow.design/work/quantiphi',
    industry: 'it-solutions',
    subIndustry: 'ai-analytics',
    description: 'UI/UX design for AI and analytics solutions platform',
    workType: ['ui-ux-design'],
    keywords: ['ai', 'analytics', 'machine-learning', 'data-science', 'enterprise', 'technology'],
    priority: 8
  },

  // ========== IMPACT/NGO (1 active) ==========
  {
    id: 'roots-and-shoots',
    title: 'Roots & Shoots',
    url: 'https://lemonyellow.design/work/roots-and-shoots',
    industry: 'impact-ngo',
    subIndustry: 'environmental',
    description: 'UI/UX and frontend development for environmental conservation NGO',
    workType: ['ui-ux-design', 'frontend-development'],
    keywords: ['ngo', 'environmental', 'conservation', 'impact', 'non-profit', 'jane-goodall'],
    priority: 7
  },

  // ========== SHIPPING/MARINE IT (2 active) ==========
  {
    id: 'torm',
    title: 'TORM',
    url: 'https://lemonyellow.design/work/torm',
    industry: 'shipping-marine',
    subIndustry: 'tanker-operations',
    description: 'UI/UX and web design for global tanker shipping operations platform',
    workType: ['ui-ux-design', 'web-design'],
    keywords: ['shipping', 'maritime', 'tankers', 'logistics', 'operations', 'b2b-platform'],
    priority: 7
  },
  {
    id: 'pisces-uiux',
    title: 'PiscesER1 Marine',
    url: 'https://lemonyellow.design/work/pisces-uiux',
    industry: 'shipping-marine',
    subIndustry: 'marine-technology',
    description: 'UI/UX design for marine IT solutions and vessel management systems',
    workType: ['ui-ux-design'],
    keywords: ['marine', 'shipping', 'vessel-management', 'maritime-technology', 'fleet-operations'],
    priority: 7
  }
];

// Enhanced industry mapping for smart matching
export const industryMapping: Record<string, string[]> = {
  'fintech': ['financial', 'banking', 'investment', 'payment', 'lending', 'insurance', 'cryptocurrency', 'trading', 'loan', 'credit', 'wallet', 'neobank', 'digital-payment', 'fintech', 'finance'],
  'bfsi': ['banking', 'financial-services', 'insurance', 'mutual-fund', 'securities', 'asset-management', 'wealth', 'brokerage', 'credit-rating', 'housing-finance', 'bank', 'finance'],
  'healthcare': ['medical', 'health', 'hospital', 'clinic', 'telemedicine', 'pharma', 'wellness', 'fitness', 'doctor', 'patient', 'healthcare-platform', 'healthcare'],
  'ecommerce': ['retail', 'shopping', 'marketplace', 'store', 'commerce', 'fashion', 'goods', 'products', 'cart', 'checkout', 'super-app', 'ecommerce'],
  'edtech': ['education', 'learning', 'school', 'university', 'course', 'training', 'academy', 'knowledge', 'elearning', 'student', 'teacher', 'k12', 'edtech'],
  'entertainment': ['media', 'streaming', 'content', 'video', 'music', 'ott', 'live-events', 'concerts', 'shows', 'movies', 'entertainment'],
  'automotive': ['car', 'vehicle', 'automobile', 'bike', 'motorcycle', 'auto', 'tires', 'mobility', 'ev', 'electric-vehicle', 'automotive'],
  'real-estate': ['property', 'real-estate', 'housing', 'construction', 'architecture', 'apartment', 'home', 'listings', 'realestate'],
  'saas': ['software', 'platform', 'service', 'tool', 'dashboard', 'analytics', 'crm', 'enterprise', 'interface', 'app', 'system', 'cloud', 'saas'],
  'it-solutions': ['technology', 'software', 'consulting', 'it-services', 'ai', 'machine-learning', 'data-analytics', 'enterprise-solutions', 'it'],
  'shipping-marine': ['shipping', 'maritime', 'logistics', 'marine', 'vessel', 'fleet', 'tanker', 'cargo', 'port', 'ocean'],
  'impact-ngo': ['non-profit', 'ngo', 'social-impact', 'charity', 'foundation', 'environmental', 'conservation', 'sustainability', 'nonprofit'],
  'default': ['business', 'corporate', 'company', 'service', 'platform', 'website', 'app']
};

console.log(`📊 Active Case Studies Loaded: ${caseStudies.length} verified working links`);

/**
 * Smart Case Study Recommendation Engine v2.1
 * Returns top 3 most relevant case studies based on audit context
 * Only includes verified active case studies
 */
export function getRelevantCaseStudies(
  auditUrl?: string,
  auditSummary?: string,
  targetIndustry?: string,
  limit: number = 3
): CaseStudy[] {
  // If no context, return top priority studies
  if (!auditUrl && !auditSummary && !targetIndustry) {
    return caseStudies
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }

  // Score all case studies
  const scoredCaseStudies = caseStudies.map(caseStudy => ({
    ...caseStudy,
    relevanceScore: calculateRelevanceScore(caseStudy, auditUrl, auditSummary, targetIndustry)
  }));

  // Filter for minimum relevance (threshold: 10 points - lowered for better matches)
  const relevantCaseStudies = scoredCaseStudies.filter(cs => cs.relevanceScore >= 10);

  // If no relevant matches, return top priority studies
  if (relevantCaseStudies.length === 0) {
    console.log('⚠️ No relevant matches found, showing top priority case studies');
    return caseStudies
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }

  // Sort by relevance score, then priority
  relevantCaseStudies.sort((a, b) => {
    if (Math.abs(a.relevanceScore - b.relevanceScore) > 10) {
      return b.relevanceScore - a.relevanceScore;
    }
    return b.priority - a.priority;
  });

  // Apply diversity to prevent all from same industry
  const seedSource = (auditUrl || auditSummary || targetIndustry || 'default').toString();
  const candidateWindow = relevantCaseStudies.slice(0, Math.min(6, relevantCaseStudies.length));
  const diversified = pickDiversified(seedSource, candidateWindow, limit);

  // Debug logging
  if (auditUrl || auditSummary) {
    console.log('🎯 Case Study Recommendations:', {
      input: {
        url: auditUrl?.substring(0, 50),
        summary: auditSummary?.substring(0, 60) + '...',
        industry: targetIndustry
      },
      results: diversified.map(cs => ({
        title: cs.title,
        industry: cs.industry,
        score: (cs as any).relevanceScore,
        priority: cs.priority
      }))
    });
  }

  return diversified;
}

/**
 * Multi-factor relevance scoring
 */
function calculateRelevanceScore(
  caseStudy: CaseStudy,
  auditUrl?: string,
  auditSummary?: string,
  targetIndustry?: string
): number {
  let score = 0;
  let hasStrongMatch = false;

  // FACTOR 1: Direct industry match (highest priority)
  if (targetIndustry) {
    const normalizedTarget = targetIndustry.toLowerCase().replace(/[_-]/g, '');
    const normalizedCase = caseStudy.industry.toLowerCase().replace(/[_-]/g, '');

    if (normalizedCase === normalizedTarget) {
      score += 100;
      hasStrongMatch = true;
    } else if (normalizedCase.includes(normalizedTarget) || normalizedTarget.includes(normalizedCase)) {
      score += 60;
      hasStrongMatch = true;
    }
  }

  // FACTOR 2: Domain-based industry detection
  if (auditUrl && !hasStrongMatch) {
    const domain = extractDomain(auditUrl);

    // FinTech/BFSI detection
    const financePatterns = ['stripe', 'paypal', 'square', 'razorpay', 'payu', 'bank', 'finance', 'loan', 'money', 'payment', 'invest', 'mutual', 'fund', 'stock', 'trading', 'wealth', 'credit', 'demat', 'securities'];
    if (financePatterns.some(p => domain.includes(p))) {
      if (caseStudy.industry === 'fintech' || caseStudy.industry === 'bfsi') {
        score += 80;
        hasStrongMatch = true;
      }
    }

    // E-commerce detection
    const ecommercePatterns = ['shop', 'store', 'market', 'buy', 'cart', 'retail', 'commerce', 'mall', 'amazon', 'flipkart'];
    if (ecommercePatterns.some(p => domain.includes(p))) {
      if (caseStudy.industry === 'ecommerce') {
        score += 80;
        hasStrongMatch = true;
      }
    }

    // EdTech detection
    const edtechPatterns = ['edu', 'learn', 'course', 'academy', 'school', 'university', 'training', 'student'];
    if (edtechPatterns.some(p => domain.includes(p))) {
      if (caseStudy.industry === 'edtech') {
        score += 80;
        hasStrongMatch = true;
      }
    }

    // Automotive detection
    const autoPatterns = ['car', 'auto', 'vehicle', 'bike', 'motor', 'wheel', 'bajaj', 'mahindra', 'tata'];
    if (autoPatterns.some(p => domain.includes(p))) {
      if (caseStudy.industry === 'automotive') {
        score += 80;
        hasStrongMatch = true;
      }
    }

    // Entertainment detection
    const entertainmentPatterns = ['stream', 'video', 'music', 'media', 'entertainment', 'movie', 'show', 'ott', 'netflix', 'prime'];
    if (entertainmentPatterns.some(p => domain.includes(p))) {
      if (caseStudy.industry === 'entertainment') {
        score += 80;
        hasStrongMatch = true;
      }
    }

    // IT/SaaS detection
    const itPatterns = ['saas', 'software', 'platform', 'app', 'tech', 'data', 'analytics', 'ai', 'ml'];
    if (itPatterns.some(p => domain.includes(p))) {
      if (caseStudy.industry === 'it-solutions' || caseStudy.industry === 'saas') {
        score += 70;
        hasStrongMatch = true;
      }
    }

    // Shipping/Marine detection
    const shippingPatterns = ['ship', 'marine', 'maritime', 'vessel', 'cargo', 'logistics', 'freight'];
    if (shippingPatterns.some(p => domain.includes(p))) {
      if (caseStudy.industry === 'shipping-marine') {
        score += 80;
        hasStrongMatch = true;
      }
    }
  }

  // FACTOR 3: Content/summary-based detection
  if (auditSummary && !hasStrongMatch) {
    const summaryLower = auditSummary.toLowerCase();

    // Check for industry keywords in summary (need 2+ matches)
    const industryIndicators = {
      'fintech': ['payment', 'financial', 'banking', 'lending', 'investment', 'money', 'transaction', 'loan', 'credit'],
      'bfsi': ['bank', 'insurance', 'mutual fund', 'securities', 'wealth', 'asset management', 'brokerage'],
      'ecommerce': ['shopping', 'product', 'cart', 'checkout', 'retail', 'purchase', 'order', 'marketplace'],
      'edtech': ['education', 'learning', 'student', 'course', 'teaching', 'training', 'classroom'],
      'automotive': ['vehicle', 'car', 'bike', 'motorcycle', 'auto', 'transport'],
      'entertainment': ['entertainment', 'streaming', 'video', 'music', 'content', 'media'],
      'it-solutions': ['technology', 'software', 'ai', 'machine learning', 'data', 'analytics'],
      'shipping-marine': ['shipping', 'maritime', 'marine', 'vessel', 'logistics'],
      'impact-ngo': ['non-profit', 'ngo', 'social', 'environmental', 'conservation']
    };

    for (const [industry, indicators] of Object.entries(industryIndicators)) {
      const matches = indicators.filter(indicator => summaryLower.includes(indicator));
      if (matches.length >= 2 && caseStudy.industry === industry) {
        score += 60 + (matches.length * 5);
        hasStrongMatch = true;
        break;
      }
    }
  }

  // FACTOR 4: Keyword matching bonus
  if (hasStrongMatch && (auditUrl || auditSummary)) {
    const urlKeywords = auditUrl ? extractKeywordsFromUrl(auditUrl) : [];
    const summaryWords = auditSummary ? auditSummary.toLowerCase().split(/\s+/) : [];
    const allWords = [...urlKeywords, ...summaryWords];

    const matchingKeywords = caseStudy.keywords.filter(keyword =>
      allWords.some(word => word.includes(keyword) || keyword.includes(word))
    );

    if (matchingKeywords.length > 0) {
      score += matchingKeywords.length * 3;
    }
  }

  // FACTOR 5: Priority boost
  if (hasStrongMatch) {
    score += caseStudy.priority * 2;
  } else {
    score += caseStudy.priority;
  }

  return score;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace('www.', '');
  } catch {
    return url.toLowerCase();
  }
}

function extractKeywordsFromUrl(url: string): string[] {
  const urlParts = url.toLowerCase().split(/[./-_?&=]/);
  return urlParts.filter(part => part.length > 2 && part.length < 20);
}

/**
 * Diversity picker - ensures variety across industries
 */
function pickDiversified(seed: string, items: CaseStudy[], limit: number): CaseStudy[] {
  if (items.length <= limit) return items;

  const shuffled = seededShuffle(items, seed);
  const result: CaseStudy[] = [];
  const industryCount: Record<string, number> = {};
  const maxPerIndustry = Math.max(1, Math.floor(limit / 2));

  for (const item of shuffled) {
    const industry = item.industry;
    const count = industryCount[industry] || 0;

    if (count < maxPerIndustry || result.length < limit) {
      result.push(item);
      industryCount[industry] = count + 1;
    }

    if (result.length >= limit) break;
  }

  // Fill remaining
  if (result.length < limit) {
    for (const item of items) {
      if (!result.includes(item)) {
        result.push(item);
        if (result.length >= limit) break;
      }
    }
  }

  return result;
}

function seededShuffle<T>(array: T[], seed: string): T[] {
  const arr = array.slice();
  let random = mulberry32(hashString(seed));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function hashString(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h >>> 0);
}

function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

// Export stats for monitoring
export const caseStudyStats = {
  total: caseStudies.length,
  byIndustry: caseStudies.reduce((acc, cs) => {
    acc[cs.industry] = (acc[cs.industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
};
