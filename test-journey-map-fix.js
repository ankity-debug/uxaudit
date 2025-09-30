/**
 * Test script to verify the persona journey transformation fix
 */

// Mock AI response (what the AI returns)
const mockAIResponse = {
  personaDrivenJourney: {
    persona: "Fintech startup founder seeking reliable UI/UX partners for app redesign",
    personaReasoning: "Based on the site content showing design services and portfolio",
    steps: [
      {
        step: 1,
        stage: "awareness",
        userGoal: "Understand what design services are offered",
        emotionalState: "curious",
        currentExperience: "Landing on homepage and scanning for relevant information",
        frictionPoints: [
          "Portfolio not immediately visible on homepage",
          "Services description lacks specific details"
        ],
        trustBarriers: [
          "No client testimonials in hero section",
          "Missing case studies on first screen"
        ],
        improvements: [
          "Add portfolio preview to homepage hero section",
          "Include client logos above the fold"
        ]
      },
      {
        step: 2,
        stage: "exploration",
        userGoal: "Review past work and case studies",
        emotionalState: "cautious",
        currentExperience: "Navigating to portfolio section",
        frictionPoints: [
          "Portfolio items lack context and results",
          "Navigation to case studies not obvious"
        ],
        trustBarriers: [
          "No metrics or outcomes shown in portfolio",
          "Client names are missing"
        ],
        improvements: [
          "Add results metrics to each portfolio item",
          "Show client names and testimonials"
        ]
      },
      {
        step: 3,
        stage: "trust",
        userGoal: "Verify expertise and credibility",
        emotionalState: "hesitant",
        currentExperience: "Looking for proof of expertise",
        frictionPoints: [
          "Team credentials not prominently displayed",
          "Pricing information hidden or unclear"
        ],
        trustBarriers: [
          "No awards or recognition mentioned",
          "Missing industry certifications"
        ],
        improvements: [
          "Add team credentials section with years of experience",
          "Include transparent pricing or pricing ranges"
        ]
      }
    ],
    overallExperience: "fair",
    keyTakeaway: "Users face significant trust barriers when evaluating the agency's expertise"
  }
};

// Transformation function (what we added to the backend)
function transformPersonaDrivenJourney(journey) {
  if (!journey) return null;

  if (journey.steps && Array.isArray(journey.steps)) {
    const transformedSteps = journey.steps.map((step) => {
      // Combine frictionPoints and trustBarriers into issues array
      const issues = [
        ...(step.frictionPoints || []),
        ...(step.trustBarriers || [])
      ];

      return {
        action: step.userGoal || step.currentExperience || 'User interaction',
        issues: issues,
        improvements: step.improvements || []
      };
    });

    return {
      persona: journey.persona || '',
      personaReasoning: journey.personaReasoning || '',
      steps: transformedSteps,
      overallExperience: journey.overallExperience || 'fair'
    };
  }

  return journey;
}

// Test the transformation
console.log('=== TESTING PERSONA JOURNEY TRANSFORMATION ===\n');

const transformedJourney = transformPersonaDrivenJourney(mockAIResponse.personaDrivenJourney);

console.log('✅ Transformed Journey Structure:');
console.log(JSON.stringify(transformedJourney, null, 2));

console.log('\n=== VERIFICATION ===');
console.log(`Persona: ${transformedJourney.persona}`);
console.log(`Number of steps: ${transformedJourney.steps.length}`);
console.log(`Overall experience: ${transformedJourney.overallExperience}`);

console.log('\n=== STEP DETAILS ===');
transformedJourney.steps.forEach((step, index) => {
  console.log(`\nStep ${index + 1}:`);
  console.log(`  Action: ${step.action}`);
  console.log(`  Issues (${step.issues.length}):`);
  step.issues.forEach((issue, i) => {
    console.log(`    ${i + 1}. ${issue}`);
  });
  console.log(`  Improvements (${step.improvements.length}):`);
  step.improvements.forEach((improvement, i) => {
    console.log(`    ${i + 1}. ${improvement}`);
  });
});

console.log('\n=== FRONTEND RENDERING TEST ===');
// Simulate what the frontend getCurrentExperience() function does
const getCurrentExperience = (journey) => {
  if (!journey || !journey.steps?.length) return [];
  const pts = [];
  journey.steps.forEach((s) => {
    if (s.issues && s.issues.length) pts.push(s.issues[0]);
  });
  return pts.slice(0, 3);
};

const currentExperiencePoints = getCurrentExperience(transformedJourney);
console.log('\n📋 Current Experience (will display in UI):');
currentExperiencePoints.forEach((exp, index) => {
  console.log(`  ${index + 1}. ${exp}`);
});

// Verify the condition that was failing
const passesRenderCondition = transformedJourney &&
                               transformedJourney.steps &&
                               transformedJourney.steps.length > 0;

console.log('\n✅ Passes render condition:', passesRenderCondition);
console.log('✅ Issues array populated:', currentExperiencePoints.length > 0);

if (passesRenderCondition && currentExperiencePoints.length > 0) {
  console.log('\n🎉 SUCCESS! The "Current User Experience" section will now display correctly.');
} else {
  console.log('\n❌ FAILED! The section would still be empty.');
}