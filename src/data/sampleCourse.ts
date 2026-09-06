import type { Module, ModuleDomain } from '@/types/crescented';

interface SampleSection {
  title: string;
  content: string;
  plug_and_plays: { title: string; type: string; content: string }[];
}

interface SampleModule {
  title: string;
  domain: ModuleDomain;
  description: string;
  summary: string;
  sections: SampleSection[];
  action_steps: string[];
}

export const SAMPLE_TUTOR_ANSWER = `Good question — here is the short version.

Start with the smallest version of your idea that a real person can react to. A one page description, a rough sketch, or a simple landing page is enough. The goal is not to look finished, it is to get an honest reaction before you spend real time or money.

Then talk to five people who look like your future customer. Ask what they do today about the problem, what it costs them, and what they have already tried. Listen for frustration, not compliments.

Action Steps:
1. Write your idea in three sentences: who it is for, the problem, and your fix.
2. Book five short conversations with people in that group this week.
3. Note the exact words they use about the problem and reuse them in your copy.`;

export const SAMPLE_TOOL_OUTPUT = `Here is a worked example you can adapt.

Positioning
Your offer is clearest when it names one audience and one outcome. Pick the narrowest audience you can still get excited about, then describe the result they get in plain language.

What to keep
1. One sentence that names the audience and the outcome.
2. Three proof points: something you have done, something you can show, something a customer said.
3. One clear next step for the reader.

What to cut
Anything that describes features before the reader understands the result. Anything that could be said by a competitor word for word.

Action Steps:
1. Rewrite your headline as "I help [audience] to [outcome]".
2. Replace one feature line with a concrete result or number.
3. End the page with a single call to action, not three.`;

const SAMPLE_MODULES: SampleModule[] = [
  {
    title: 'Idea Discovery',
    domain: 'business_foundations',
    description:
      'Turn a vague interest into a specific, testable business idea. You will define who you serve, the problem you solve, and why you are the person to solve it.',
    summary: 'Shape a rough interest into one clear, testable idea.',
    sections: [
      {
        title: 'Finding the problem worth solving',
        content:
          'Most first ideas describe a product before they describe a problem. Flip the order. Write down three groups of people you understand well: a hobby you share, a job you have done, a community you belong to. For each group, list the moments where things go wrong, take too long, or cost too much. Those moments are problems, and problems are what people pay to remove.\n\nA problem is worth solving when it is frequent, expensive or annoying enough that people already try to fix it themselves. Look for the workarounds: spreadsheets, group chats, sticky notes, paying someone informally. Workarounds are proof of demand. If nobody has bothered to work around it, the problem is probably not painful yet.\n\nPick the one problem you can describe in a single sentence without using the word "platform".',
        plug_and_plays: [
          {
            title: 'Problem Selection Worksheet',
            type: 'worksheet',
            content:
              'GROUP OF PEOPLE I UNDERSTAND:\n____________________________\n\nTHREE MOMENTS THAT GO WRONG FOR THEM:\n1. ____________________________\n2. ____________________________\n3. ____________________________\n\nWHAT THEY DO TODAY INSTEAD (workarounds):\n____________________________\n\nHOW OFTEN IT HAPPENS: daily / weekly / monthly\nWHAT IT COSTS THEM (time or money): ____________________________\n\nMY ONE SENTENCE PROBLEM STATEMENT:\n[Audience] struggles to ____________________ because ____________________.',
          },
        ],
      },
      {
        title: 'Writing your idea in one sentence',
        content:
          'Your idea needs a sentence you can say out loud without notes. Use this shape: I help [specific audience] to [clear outcome] by [simple method]. The specific audience is not "small businesses"; it is "independent hairdressers who rent a chair". The clear outcome is not "growth"; it is "fill empty midweek slots".\n\nSay the sentence to three people who do not know your idea. If they ask "so what does it actually do?", the sentence is still too abstract. Rewrite it until they respond with a question about the details instead of a question about the concept.\n\nThis sentence becomes your homepage headline, your intro at events, and the filter for every feature decision you make later.',
        plug_and_plays: [
          {
            title: 'One Sentence Idea Template',
            type: 'template',
            content:
              'DRAFT 1:\nI help ____________________ to ____________________ by ____________________.\n\nDRAFT 2 (narrower audience):\nI help ____________________ to ____________________ by ____________________.\n\nDRAFT 3 (sharper outcome):\nI help ____________________ to ____________________ by ____________________.\n\nTEST IT:\nPerson 1 reaction: ____________________\nPerson 2 reaction: ____________________\nPerson 3 reaction: ____________________\n\nFINAL SENTENCE:\n____________________________',
          },
        ],
      },
      {
        title: 'Checking your unfair advantage',
        content:
          'You do not need a patent or a famous co-founder, but you do need something that makes you a believable person to solve this problem. That can be access to the audience, a skill you already have, hard-won experience, or simply the willingness to do unglamorous work others avoid.\n\nWrite down what you have: people you can reach today, tools you can already use, and knowledge you would have to teach someone else. Then be honest about what is missing. Missing pieces are not a reason to stop; they are your first list of things to learn or borrow.\n\nIdeas fail more often from lack of access to customers than from lack of ideas. If you cannot name ten people you could contact this week, that is the first gap to close.',
        plug_and_plays: [
          {
            title: 'Advantage And Gap Checklist',
            type: 'checklist',
            content:
              'WHAT I ALREADY HAVE\n[ ] Direct access to people with this problem\n[ ] Relevant hands-on experience\n[ ] A skill that saves me paying someone\n[ ] Time each week I can protect\n[ ] A small budget I can lose without harm\n\nWHAT IS MISSING\n[ ] ____________________\n[ ] ____________________\n\nTEN PEOPLE I COULD CONTACT THIS WEEK\n1. ______  2. ______  3. ______  4. ______  5. ______\n6. ______  7. ______  8. ______  9. ______  10. ______',
          },
        ],
      },
    ],
    action_steps: [
      'Write your one sentence idea and say it out loud to three people.',
      'List the workarounds your audience uses today.',
      'Name ten people you could contact about this problem this week.',
    ],
  },
  {
    title: 'Market Validation',
    domain: 'customer_success',
    description:
      'Test the idea with real people before you build. You will run short customer conversations and a simple demand test that gives you evidence instead of opinions.',
    summary: 'Get real evidence that people want this before you build it.',
    sections: [
      {
        title: 'Running conversations that tell the truth',
        content:
          'Never ask "would you use this?" People are polite, and polite answers are useless. Ask about the past instead: "When did this last happen to you? What did you do? What did that cost you? What have you already tried?" Past behaviour predicts future spending; opinions do not.\n\nKeep the conversation to fifteen minutes and take notes in their words, not yours. You are listening for three things: the trigger moment, the current workaround, and the cost of the problem. When five people describe the same trigger in similar words, you have found something real.\n\nEnd every conversation with one question: "Who else should I talk to?" That single question is how five conversations become twenty.',
        plug_and_plays: [
          {
            title: 'Customer Interview Script',
            type: 'script',
            content:
              'INTRO (30 seconds)\n"I am researching how people deal with ____________. I am not selling anything, I just want to understand your experience. Fifteen minutes okay?"\n\nQUESTIONS\n1. When did this last happen to you?\n2. Walk me through what you did.\n3. What did that cost you in time or money?\n4. What have you tried before? Why did you stop?\n5. If it were solved tomorrow, what would change for you?\n6. Who else should I talk to?\n\nNOTES (their words, not mine)\n____________________________\n\nSIGNAL: strong pain / mild pain / no pain',
          },
        ],
      },
      {
        title: 'Designing a small demand test',
        content:
          'A demand test asks people to give up something small: an email address, a deposit, a slot in their calendar, a pre-order. Interest is free; commitment is evidence. Your test should take days, not months.\n\nSimple versions that work: a one page description with a signup button, a manual service you deliver by hand for three customers, a paid pilot at a low price, or a waiting list with a clear promise. The point is not scale, it is signal. Ten committed people beat a thousand page views.\n\nDecide your pass mark before you run the test. Write down the number that would make you continue, and the number that would make you change direction. Deciding after the fact is how people talk themselves into weak results.',
        plug_and_plays: [
          {
            title: 'Demand Test Planner',
            type: 'worksheet',
            content:
              'WHAT I AM TESTING:\n____________________________\n\nTHE ASK (what someone gives up):\n[ ] Email  [ ] Calendar slot  [ ] Deposit  [ ] Pre-order  [ ] Paid pilot\n\nHOW I WILL REACH 30 PEOPLE:\n____________________________\n\nRUN DATES: from ______ to ______\n\nPASS MARK (decided in advance):\nContinue if at least ______ people ____________________\nChange direction if fewer than ______ people ____________________\n\nRESULT:\n____________________________\nDECISION: continue / adjust / drop',
          },
        ],
      },
      {
        title: 'Reading the signals honestly',
        content:
          'Validation is rarely a clean yes or no. Sort what you heard into three buckets: strong pain with willingness to pay, real pain but no budget, and mild curiosity. Only the first bucket is a business today; the second is a business once the cost is lower; the third is noise.\n\nWatch for the two classic traps. The first is the friendly sample, where everyone you asked already likes you. The second is the wrong buyer, where the person with the problem is not the person who pays. Both produce encouraging notes and no revenue.\n\nWrite a one paragraph summary of what you now believe and what you still do not know. That paragraph is the input for your business model in the next module.',
        plug_and_plays: [
          {
            title: 'Validation Summary Template',
            type: 'template',
            content:
              'PEOPLE SPOKEN TO: ______\nSTRONG PAIN + WILLING TO PAY: ______\nREAL PAIN, NO BUDGET: ______\nCURIOUS ONLY: ______\n\nTHE PHRASE I HEARD MOST OFTEN:\n"____________________________"\n\nWHAT I NOW BELIEVE:\n____________________________\n\nWHAT I STILL DO NOT KNOW:\n____________________________\n\nWHO ACTUALLY PAYS:\n____________________________',
          },
        ],
      },
    ],
    action_steps: [
      'Run five interviews using the script and record the exact words people use.',
      'Set a pass mark, then run one small demand test this week.',
      'Write a one paragraph summary of what you believe and what is still unknown.',
    ],
  },
  {
    title: 'Business Model',
    domain: 'running_a_business',
    description:
      'Decide how the business makes money and whether the numbers work. You will set a price, map your costs, and find your break-even point.',
    summary: 'Turn the idea into numbers that actually add up.',
    sections: [
      {
        title: 'Choosing how you get paid',
        content:
          'There are fewer revenue models than it seems: one-off sale, recurring subscription, usage-based fee, commission on a transaction, and service billed by time. Your choice should follow how the customer experiences value. Ongoing value invites a subscription; a one-time outcome invites a one-off price.\n\nPick one model to start. Two revenue models before your first ten customers usually means neither gets tested properly. You can add a second later once the first one works.\n\nWrite down the moment money changes hands and what the customer has received by then. If the customer pays before they feel any value, expect resistance and plan a small first step they can say yes to easily.',
        plug_and_plays: [
          {
            title: 'Revenue Model Decision Tree',
            type: 'decision_tree',
            content:
              'Does the customer get value repeatedly over time?\n  YES -> Is usage steady? YES -> Subscription. NO -> Usage-based fee.\n  NO  -> Continue.\n\nAm I connecting two parties who transact?\n  YES -> Commission per transaction.\n  NO  -> Continue.\n\nIs the value delivered mainly by my own hours?\n  YES -> Service billed by project (not by hour, if you can avoid it).\n  NO  -> One-off product sale.\n\nMY CHOICE: ____________________\nMONEY CHANGES HANDS WHEN: ____________________\nWHAT THEY HAVE RECEIVED BY THEN: ____________________',
          },
        ],
      },
      {
        title: 'Setting a first price without guessing',
        content:
          'Price from value and alternatives, not from your costs. Ask what the problem currently costs your customer, and what they pay today for the workaround. Your price sits between the cost of the problem and the cost of the next best option.\n\nStart higher than feels comfortable. A price that is too low attracts the customers who complain most, and it hides whether people truly value the outcome. If nobody hesitates, your price is too low; if everybody hesitates, it is too high or the outcome is unclear.\n\nOffer one price and one option at first. Three tiers before you know your customer is decoration. Keep a written note of every price objection you hear; those notes are how you learn to sell.',
        plug_and_plays: [
          {
            title: 'Pricing Calculator Worksheet',
            type: 'calculator',
            content:
              'COST OF THE PROBLEM TO THE CUSTOMER (per month): ______\nWHAT THEY PAY TODAY FOR A WORKAROUND: ______\nNEXT BEST ALTERNATIVE PRICE: ______\n\nMY PRICE: ______\nREASON IN ONE LINE: ____________________\n\nMY DIRECT COST PER CUSTOMER: ______\nGROSS MARGIN = PRICE - DIRECT COST = ______\n\nOBJECTIONS HEARD:\n1. ____________________\n2. ____________________',
          },
        ],
      },
      {
        title: 'Costs, margin and break-even',
        content:
          'Split costs in two. Direct costs happen per customer: materials, payment fees, delivery, the hours you personally spend. Fixed costs happen anyway: software, rent, insurance. Price minus direct cost is your margin, and margin is what pays your fixed costs.\n\nBreak-even is fixed costs divided by margin per customer. If your fixed costs are 400 a month and your margin is 40, you need ten customers a month before you earn anything. Write that number on a wall. It converts a vague ambition into a target you can plan around.\n\nCheck the number for realism against your validation results. If break-even needs more customers than you can plausibly reach in six months, change the price, cut fixed costs, or change the model.',
        plug_and_plays: [
          {
            title: 'Break-Even Worksheet',
            type: 'calculator',
            content:
              'FIXED COSTS PER MONTH\nSoftware: ______\nSubscriptions: ______\nOther: ______\nTOTAL FIXED: ______\n\nPER CUSTOMER\nPrice: ______\nDirect costs: ______\nMARGIN: ______\n\nBREAK-EVEN CUSTOMERS = TOTAL FIXED / MARGIN = ______\n\nCAN I REALISTICALLY REACH THAT IN 6 MONTHS? yes / no\nIF NO, WHAT CHANGES: price / costs / model',
          },
        ],
      },
    ],
    action_steps: [
      'Choose one revenue model and write down when money changes hands.',
      'Set a first price using the value and alternatives, not your costs.',
      'Calculate your break-even customer count and sanity check it.',
    ],
  },
  {
    title: 'Launch Preparation',
    domain: 'other_topics',
    description:
      'Get ready to put the offer in front of people. You will define the smallest sellable version, prepare the essentials, and plan a launch week you can actually execute.',
    summary: 'Prepare a small, real launch instead of a perfect one.',
    sections: [
      {
        title: 'Defining the smallest sellable version',
        content:
          'The smallest sellable version is the least you can deliver that still solves the problem well enough to charge for. Everything else is a later decision. Write two lists: what is in, and what is deliberately out for now. The second list is what protects your launch date.\n\nManual is fine. Delivering by hand, in a call, or through a spreadsheet teaches you more than automation, and it can be built in days. Automate only the steps you have repeated enough times to be bored by.\n\nSet a launch date before you feel ready. A date creates the constraint that forces the scope down; without one, scope expands to fill the available anxiety.',
        plug_and_plays: [
          {
            title: 'Scope In / Out Worksheet',
            type: 'worksheet',
            content:
              'THE PROMISE I AM MAKING:\n____________________________\n\nIN FOR LAUNCH (max 5)\n1. ______  2. ______  3. ______  4. ______  5. ______\n\nDELIBERATELY OUT FOR NOW\n1. ______  2. ______  3. ______\n\nWHAT I WILL DO MANUALLY AT FIRST:\n____________________________\n\nLAUNCH DATE: ______',
          },
        ],
      },
      {
        title: 'The essentials, and nothing more',
        content:
          'Before launch you need a way for people to understand the offer, a way to say yes, and a way to pay. Usually that means one page, one contact route, and one payment link. A logo, a brand palette, and a mission statement can wait.\n\nWrite the page in your customer\'s words, taken from your interview notes. Lead with the outcome, follow with how it works in three steps, then proof, then one call to action. Read it aloud; anything you would not say out loud should be cut.\n\nDo the boring admin early: register what you must, keep business money separate, and keep a simple record of income and expenses from day one. It takes an hour now and saves a weekend later.',
        plug_and_plays: [
          {
            title: 'Pre-Launch Checklist',
            type: 'checklist',
            content:
              'THE OFFER\n[ ] One page that leads with the outcome\n[ ] Three step explanation of how it works\n[ ] One clear call to action\n[ ] Price visible or a clear reason it is not\n\nGETTING PAID\n[ ] Payment method tested with a real transaction\n[ ] Refund or cancellation line written down\n\nADMIN\n[ ] Business money kept separate from personal\n[ ] Simple income and expense record started\n[ ] Privacy note if collecting personal data\n\nSUPPORT\n[ ] One contact route that reaches me quickly',
          },
        ],
      },
      {
        title: 'Planning a launch week you can execute',
        content:
          'A launch is not one announcement, it is a week of small, direct actions. Warm contacts first: the people from your interviews, your ten-person list, communities you already belong to. Personal messages outperform public posts at this stage by a wide margin.\n\nPlan the week day by day with a named action and a number. Monday: message ten interview contacts. Tuesday: post in two communities. Wednesday: follow up with everyone who replied. Follow-up is where most first sales come from, and it is the step people skip.\n\nDecide in advance how you will measure the week: conversations started, offers made, and sales closed. Traffic is not a launch metric when your goal is your first ten customers.',
        plug_and_plays: [
          {
            title: 'Launch Week Plan',
            type: 'template',
            content:
              'GOAL FOR THE WEEK: ______ conversations, ______ offers, ______ sales\n\nMON: ____________________ (number: ____)\nTUE: ____________________ (number: ____)\nWED: follow up with everyone who replied\nTHU: ____________________ (number: ____)\nFRI: ____________________ (number: ____)\n\nMY MESSAGE TEMPLATE\n"Hi ______, you mentioned ______ when we spoke. I have put together ______ that handles it. Worth a look?"\n\nEND OF WEEK REVIEW\nWhat worked: ____________________\nWhat I will drop: ____________________',
          },
        ],
      },
    ],
    action_steps: [
      'Write your in/out list and pick a launch date this month.',
      'Publish one page and test a real payment end to end.',
      'Plan your launch week with a named action and a number for each day.',
    ],
  },
  {
    title: 'Growth Foundations',
    domain: 'personal_development',
    description:
      'Build the habits that keep the business moving after launch: a channel you repeat, numbers you review weekly, and a way to protect your own energy.',
    summary: 'Build repeatable habits so progress continues after launch.',
    sections: [
      {
        title: 'Picking one channel and repeating it',
        content:
          'Growth early on comes from doing one thing often, not five things once. Choose the channel where your customers already gather and where you can show up weekly without dread: direct outreach, one community, one content format, or referrals from existing customers.\n\nCommit to eight weeks. Under eight weeks you cannot tell the difference between a bad channel and a slow start. Track one number per week so the decision at the end is based on evidence rather than mood.\n\nReferrals deserve a deliberate ask. After you deliver a good result, ask directly: "Who else has this problem?" It is the cheapest channel you have and the one most often left to chance.',
        plug_and_plays: [
          {
            title: 'Channel Commitment Worksheet',
            type: 'worksheet',
            content:
              'MY ONE CHANNEL FOR THE NEXT 8 WEEKS:\n____________________________\n\nWHY MY CUSTOMERS ARE THERE:\n____________________________\n\nWEEKLY ACTION I WILL REPEAT:\n____________________________\n\nTHE ONE NUMBER I TRACK: ____________________\n\nWEEK: 1__ 2__ 3__ 4__ 5__ 6__ 7__ 8__\n\nDECISION AT WEEK 8: keep / change',
          },
        ],
      },
      {
        title: 'A weekly review that takes twenty minutes',
        content:
          'Momentum comes from a short, fixed review rather than constant checking. Once a week, look at four numbers: conversations started, offers made, sales, and money in the account. Then answer two questions: what moved, and what is the single most useful thing to do next week.\n\nKeep it in one place and keep it boring. A single page or spreadsheet you actually open beats a dashboard you admire once. If a number is hard to collect, simplify it until it is easy, because an approximate number reviewed weekly beats a precise number reviewed never.\n\nWrite one line of decision each week. Over three months that becomes a record of your reasoning, and it is the fastest way to spot the patterns you keep repeating.',
        plug_and_plays: [
          {
            title: 'Weekly Review Template',
            type: 'template',
            content:
              'WEEK OF: ______\n\nNUMBERS\nConversations started: ______\nOffers made: ______\nSales: ______\nMoney in account: ______\n\nWHAT MOVED THIS WEEK:\n____________________________\n\nWHAT DID NOT WORK:\n____________________________\n\nTHE ONE THING FOR NEXT WEEK:\n____________________________',
          },
        ],
      },
      {
        title: 'Protecting the person doing the work',
        content:
          'The most common reason small businesses stall is not competition, it is the founder running out of energy. Treat your capacity as a business asset. Decide the hours you will work on this, and the hours you will not, and write both down.\n\nBatch similar work: outreach in one block, delivery in another, admin once a week. Switching between selling and building all day costs more than either task alone. Protect one block a week for thinking, with no messages open.\n\nDefine what "enough" looks like for the next quarter: a revenue number, a customer count, or simply shipping consistently. Without a definition, every result feels like a shortfall, and that is what makes people quit something that was working.',
        plug_and_plays: [
          {
            title: 'Capacity And Boundaries Worksheet',
            type: 'reflection',
            content:
              'HOURS PER WEEK I WILL WORK ON THIS: ______\nDAYS OR HOURS THAT ARE OFF LIMITS: ____________________\n\nMY BLOCKS\nOutreach: ____________________\nDelivery: ____________________\nAdmin: ____________________\nThinking (no messages): ____________________\n\nWHAT "ENOUGH" LOOKS LIKE THIS QUARTER:\n____________________________\n\nEARLY WARNING SIGNS I AM OVERDOING IT:\n____________________________',
          },
        ],
      },
    ],
    action_steps: [
      'Pick one channel and commit to a weekly action for eight weeks.',
      'Put a twenty minute weekly review in your calendar and run it once.',
      'Write down your working hours and what "enough" means this quarter.',
    ],
  },
];

/** Build the bundled sample course as Module records (no backend involved). */
export function buildSampleModules(userId: string): Module[] {
  const now = Date.now();
  return SAMPLE_MODULES.map((m, index) => ({
    id: `sample-module-${index + 1}`,
    user_id: userId,
    title: m.title,
    domain: m.domain,
    description: m.description,
    summary: m.summary,
    content: {
      sections: m.sections.map((s) => ({
        title: s.title,
        content: s.content,
        plug_and_plays: s.plug_and_plays as never,
      })),
      action_steps: m.action_steps,
    },
    progress: { sectionsCompleted: [], plugAndPlayCompleted: [] },
    created_at: new Date(now + index * 1000).toISOString(),
  })) as Module[];
}

export const SAMPLE_MODULE_COUNT = SAMPLE_MODULES.length;
