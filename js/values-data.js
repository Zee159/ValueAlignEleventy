/**
 * ValueAlign Core Values Data
 * Comprehensive list of values with descriptions and categories for the assessment
 */

const valuesData = [
    {
        id: 'achievement',
        name: 'Achievement',
        description: 'Accomplishing goals and making notable contributions',
        category: 'personal'
    },
    {
        id: 'adventure',
        name: 'Adventure',
        description: 'Exciting and novel experiences that involve risk or danger',
        category: 'personal'
    },
    {
        id: 'authenticity',
        name: 'Authenticity',
        description: 'Being genuine and true to yourself and your beliefs',
        category: 'personal'
    },
    {
        id: 'balance',
        name: 'Balance',
        description: 'Harmony between various aspects of life: work, family, personal',
        category: 'lifestyle'
    },
    {
        id: 'compassion',
        name: 'Compassion',
        description: 'Concern for the suffering of others and desire to help',
        category: 'relationship'
    },
    {
        id: 'creativity',
        name: 'Creativity',
        description: 'Using imagination to develop new ideas or things',
        category: 'personal'
    },
    {
        id: 'curiosity',
        name: 'Curiosity',
        description: 'Desire to learn, explore, and understand new things',
        category: 'personal'
    },
    {
        id: 'determination',
        name: 'Determination',
        description: 'Firmness of purpose; resoluteness',
        category: 'personal'
    },
    {
        id: 'fairness',
        name: 'Fairness',
        description: 'Impartial and just treatment without favoritism or discrimination',
        category: 'relationship'
    },
    {
        id: 'family',
        name: 'Family',
        description: 'Prioritizing and nurturing family relationships',
        category: 'relationship'
    },
    {
        id: 'freedom',
        name: 'Freedom',
        description: 'Ability to think, act, and express oneself without constraints',
        category: 'personal'
    },
    {
        id: 'generosity',
        name: 'Generosity',
        description: 'Readiness to give more than necessary or expected',
        category: 'relationship'
    },
    {
        id: 'gratitude',
        name: 'Gratitude',
        description: 'Appreciating what you have and showing thankfulness',
        category: 'personal'
    },
    {
        id: 'growth',
        name: 'Growth',
        description: 'Continuous personal and professional development',
        category: 'personal'
    },
    {
        id: 'health',
        name: 'Health',
        description: 'Maintaining physical and mental wellbeing',
        category: 'lifestyle'
    },
    {
        id: 'honesty',
        name: 'Honesty',
        description: 'Truthfulness, sincerity, and integrity',
        category: 'relationship'
    },
    {
        id: 'humor',
        name: 'Humor',
        description: 'Appreciating and expressing amusement, joy, and laughter',
        category: 'personal'
    },
    {
        id: 'independence',
        name: 'Independence',
        description: 'Self-reliance and freedom from the control of others',
        category: 'personal'
    },
    {
        id: 'justice',
        name: 'Justice',
        description: 'Fair treatment and due reward according to merit',
        category: 'societal'
    },
    {
        id: 'kindness',
        name: 'Kindness',
        description: 'Being friendly, generous, and considerate',
        category: 'relationship'
    },
    {
        id: 'knowledge',
        name: 'Knowledge',
        description: 'Pursuit of facts, information, and skills through education',
        category: 'personal'
    },
    {
        id: 'leadership',
        name: 'Leadership',
        description: 'Influencing and guiding others toward a goal',
        category: 'professional'
    },
    {
        id: 'loyalty',
        name: 'Loyalty',
        description: 'Faithfulness to commitments, obligations, or relationships',
        category: 'relationship'
    },
    {
        id: 'mindfulness',
        name: 'Mindfulness',
        description: 'Being present and fully engaged in the current moment',
        category: 'lifestyle'
    },
    {
        id: 'optimism',
        name: 'Optimism',
        description: 'Hopefulness and confidence about the future',
        category: 'personal'
    },
    {
        id: 'patience',
        name: 'Patience',
        description: 'Ability to wait without frustration; perseverance',
        category: 'personal'
    },
    {
        id: 'peace',
        name: 'Peace',
        description: 'Freedom from disturbance; tranquility',
        category: 'lifestyle'
    },
    {
        id: 'perseverance',
        name: 'Perseverance',
        description: 'Continued effort despite difficulties or obstacles',
        category: 'personal'
    },
    {
        id: 'respect',
        name: 'Respect',
        description: 'Due regard for the feelings, wishes, rights, or traditions of others',
        category: 'relationship'
    },
    {
        id: 'responsibility',
        name: 'Responsibility',
        description: 'Being accountable for one\'s actions and obligations',
        category: 'personal'
    },
    {
        id: 'security',
        name: 'Security',
        description: 'Freedom from danger, risk, or financial worry',
        category: 'lifestyle'
    },
    {
        id: 'spirituality',
        name: 'Spirituality',
        description: 'Connection to something beyond the physical or material world',
        category: 'personal'
    },
    {
        id: 'success',
        name: 'Success',
        description: 'Achievement of desired aims or prosperity',
        category: 'professional'
    },
    {
        id: 'teamwork',
        name: 'Teamwork',
        description: 'Collaborative effort towards a common goal',
        category: 'professional'
    },
    {
        id: 'trust',
        name: 'Trust',
        description: 'Firm belief in the reliability, truth, or ability of someone or something',
        category: 'relationship'
    },
    {
        id: 'wisdom',
        name: 'Wisdom',
        description: 'Good judgment based on knowledge, experience, and understanding',
        category: 'personal'
    }
];

// Categories for grouping values
const valuesCategories = {
    'personal': 'Personal Development',
    'relationship': 'Relationships & Community',
    'professional': 'Work & Achievement',
    'lifestyle': 'Lifestyle & Wellbeing',
    'societal': 'Society & Ethics'
};

// Export the data for use in the values assessment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { valuesData, valuesCategories };
} else {
    // Make data available in browser environment
    window.valuesData = valuesData;
    window.valuesCategories = valuesCategories;
}
