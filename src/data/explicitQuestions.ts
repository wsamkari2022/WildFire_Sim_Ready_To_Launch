import { ExplicitQuestion } from '../types/explicitValues';

export const explicitQuestions: ExplicitQuestion[] = [
  {
    id: 1,
    scenario: "Your neighbor's cat frequently visits your garden. You notice it's not well-fed. What do you do?",
    options: [
      { value: "Safety", label: "Report to animal welfare immediately", icon: "🛡️" },
      { value: "Fairness", label: "Discuss the situation with your neighbor first", icon: "⚖️" },
      { value: "Nonmaleficence", label: "Leave food without interfering", icon: "🤲" },
      { value: "Efficiency", label: "Set up deterrents to keep the cat away", icon: "⚡" }
    ]
  },
  {
    id: 2,
    scenario: "You have two routes to work: a shorter route through a busy area or a longer, scenic route. Which do you choose?",
    options: [
      { value: "Efficiency", label: "Take the shorter route to save time", icon: "⚡" },
      { value: "Sustainability", label: "Choose the scenic route with less traffic", icon: "🌱" },
      { value: "Safety", label: "Pick the route with better road conditions", icon: "🛡️" }
    ]
  },
  {
    id: 3,
    scenario: "Your apartment building has limited parking spaces. How should they be allocated?",
    options: [
      { value: "Fairness", label: "First-come, first-served basis", icon: "⚖️" },
      { value: "Efficiency", label: "Closest spaces for most frequent users", icon: "⚡" },
      { value: "Safety", label: "Priority for elderly and disabled residents", icon: "🛡️" },
      { value: "Sustainability", label: "Extra spaces for carpooling residents", icon: "🌱" }
    ]
  },
  {
    id: 4,
    scenario: "You find a wallet with cash and ID. What's your immediate action?",
    options: [
      { value: "Urgency", label: "Contact the owner immediately", icon: "⏱️" },
      { value: "Safety", label: "Turn it in to the police", icon: "🛡️" },
      { value: "Fairness", label: "Leave it where found but monitor", icon: "⚖️" },
      { value: "Efficiency", label: "Drop it in a mailbox", icon: "⚡" }
    ]
  },
  {
    id: 5,
    scenario: "Your community garden has limited water during a drought. How do you manage resources?",
    options: [
      { value: "Sustainability", label: "Implement water-saving techniques", icon: "🌱" },
      { value: "Fairness", label: "Create a strict watering schedule", icon: "⚖️" },
      { value: "Efficiency", label: "Focus on plants with highest yield", icon: "⚡" },
      { value: "Nonmaleficence", label: "Share water equally regardless of need", icon: "🤲" }
    ]
  }
];