// The questions people ask about AI at work, in the words they search and post
// them on Reddit (the 2026-10-27 research), each answered from the guide. The
// page shows them, and page.tsx gives them to search engines as FAQPage data,
// so the two can't disagree. `chapters` are the guide's chapter numbers.
export const QUESTIONS = [
  {
    question: 'Why does ChatGPT agree with everything I say?',
    answer:
      'Because you’ve handed it a detailed map of what you want to hear. The more it knows about your preferences, the more it leans your way. The fix is a habit, not a setting: on any decision that matters, break frame with “Ignore my stated preferences for this one. Argue the opposite case as strongly as you can.”',
    chapters: [3],
  },
  {
    question: 'Is using AI at work cheating?',
    answer:
      'Not if the work is still yours. The real worry usually isn’t ethics. It’s whether people will think less of your work. Three rules cover it: get permission in writing, talk about the mundane uses before the work ones, and never let AI do work you’ll be held accountable for. Before anything leaves your hands, ask whether you could defend every claim in it, in a room, as if you’d written it yourself.',
    chapters: [6],
  },
  {
    question: 'Should I tell my boss I use ChatGPT?',
    answer:
      'Yes, once, in writing, before you paste in anything that belongs to the company. Asking costs you one mildly awkward message. Not asking, and being wrong, can cost you your job. The guide has the two-sentence message to send: which tools are approved, and what company information shouldn’t go into them.',
    chapters: [6],
  },
  {
    question: 'How do I get better answers from ChatGPT?',
    answer:
      'Brief it once, the way you’d brief a new hire. The guide’s shortcut is a one-page Context Document in a file you own: who you are, what you’re responsible for, what you already know, how you want it to talk to you, the people and jargon that come up, and one example of excellent work. Paste it into your assistant’s custom instructions and you stop re-explaining yourself.',
    chapters: [1, 3],
  },
  {
    question: 'Can I trust the numbers and facts it gives me?',
    answer:
      'Check in proportion to the stakes. A draft only you will see, read normally. Anything client-facing, financial or on the record, verify every claim independently. And it isn’t a calculator: have it write a formula your spreadsheet computes, and never move a number from the middle of its paragraph into a report.',
    chapters: [5, 8],
  },
];
