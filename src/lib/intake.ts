// The intake on /mariposa: the questions' fixed choices and the server's
// checks on what comes back. Shared by the page (components/Mariposa/Intake)
// and the prognosis function (netlify/functions/prognosis.mts), so it stays
// free of the DOM and of dependencies.

export const SECTORS = [
  'Agency or studio',
  'Professional services',
  'Shop or e-commerce',
  'Hospitality or food',
  'Health or wellness',
  'Property',
  'Education or training',
  'Logistics',
  'Finance',
  'Media or creative',
  'Software',
  'Nonprofit',
  'Something else',
] as const;

export const TEAM_SIZES = ['Just me', '2–10', '11–50', '51–200', 'Over 200'] as const;

export const TOOLS = [
  'Google Workspace',
  'Microsoft 365',
  'Slack',
  'WhatsApp',
  'Notion',
  'HubSpot',
  'Salesforce',
  'QuickBooks or Xero',
  'Shopify',
  'Airtable',
  'Spreadsheets',
  'Zapier or Make',
] as const;

export const WISHES = [
  'Answering inquiries',
  'Following up leads',
  'Scheduling',
  'Invoices and payments',
  'Reports',
  'Onboarding clients',
  'Customer support',
  'Content and social posts',
  'Hiring admin',
  'Data entry',
] as const;

export const HOURS = ['Under 5', '5–10', '10–20', '20–40', 'Over 40'] as const;

export const TRIED = [
  'Nothing yet',
  'ChatGPT or Claude, on my own',
  'My team uses AI tools',
  'Automations, like Zapier or Make',
  'Something built for us',
] as const;

export type Answers = {
  name: string;
  business: string;
  website: string;
  sector: string;
  sectorOther: string;
  team: string;
  tools: string[];
  toolsOther: string;
  problem: string;
  wishes: string[];
  wishesOther: string;
  hours: string;
  tried: string[];
  goal: string;
};

export const EMPTY_ANSWERS: Answers = {
  name: '',
  business: '',
  website: '',
  sector: '',
  sectorOther: '',
  team: '',
  tools: [],
  toolsOther: '',
  problem: '',
  wishes: [],
  wishesOther: '',
  hours: '',
  tried: [],
  goal: '',
};

// Character limits for the typed answers. The form uses them as maxLength.
export const LIMITS = {
  name: 120,
  business: 120,
  website: 300,
  sectorOther: 80,
  toolsOther: 300,
  problem: 1500,
  wishesOther: 600,
  goal: 800,
} as const;

type TextField = keyof typeof LIMITS;
const REQUIRED_TEXT: ReadonlySet<TextField> = new Set(['name', 'business', 'problem']);

const CHOICES = {
  sector: SECTORS,
  team: TEAM_SIZES,
  hours: HOURS,
} as const;
const MULTI = { tools: TOOLS, wishes: WISHES, tried: TRIED } as const;

export type IntakeError = { field: keyof Answers };

// Checks a submitted intake and returns it cleaned, or the first field that's
// wrong. Unknown keys are dropped.
export const checkAnswers = (body: unknown): Answers | IntakeError => {
  if (!body || typeof body !== 'object') return { field: 'name' };
  const input = body as Record<string, unknown>;
  const out = { ...EMPTY_ANSWERS, tools: [], wishes: [], tried: [] } as Answers;

  for (const field of Object.keys(LIMITS) as TextField[]) {
    const raw = input[field];
    const value = typeof raw === 'string' ? raw.trim() : '';
    if ((!value && REQUIRED_TEXT.has(field)) || value.length > LIMITS[field]) {
      return { field };
    }
    out[field] = value;
  }

  for (const field of Object.keys(CHOICES) as (keyof typeof CHOICES)[]) {
    const value = input[field];
    const allowed: readonly string[] = CHOICES[field];
    if (typeof value !== 'string' || !allowed.includes(value)) return { field };
    out[field] = value;
  }
  if (out.sector === 'Something else' && !out.sectorOther) {
    return { field: 'sectorOther' };
  }

  for (const field of Object.keys(MULTI) as (keyof typeof MULTI)[]) {
    const value = input[field];
    const allowed: readonly string[] = MULTI[field];
    if (value === undefined) continue;
    if (
      !Array.isArray(value) ||
      value.length > allowed.length ||
      value.some((item) => typeof item !== 'string' || !allowed.includes(item))
    ) {
      return { field };
    }
    out[field] = [...new Set(value as string[])];
  }
  if (out.tried.length === 0) return { field: 'tried' };

  return out;
};

// The answers as labelled plain text: for the prompt, and for Temi's email.
export const answersAsText = (a: Answers) => {
  const list = (items: string[], other: string) =>
    [...items, other].filter(Boolean).join('; ') || 'None given';
  const rows: [string, string][] = [
    ['Name', a.name],
    ['Business', a.business],
    ['Website', a.website || 'None given'],
    ['What the business does', a.sector === 'Something else' ? a.sectorOther : a.sector],
    ['Team size', a.team],
    ['Tools they use', list(a.tools, a.toolsOther)],
    ['The biggest problem right now', a.problem],
    ['What they wish ran by itself', list(a.wishes, a.wishesOther)],
    ['Hours a week it costs them', a.hours],
    ['What they’ve tried with AI', a.tried.join('; ')],
    ['What 90 days from now should look like', a.goal || 'Not given'],
  ];
  return rows;
};
