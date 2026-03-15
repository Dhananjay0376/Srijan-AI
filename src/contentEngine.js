const DEFAULT_THEME_STAGES = [
  "awareness and foundation",
  "education and deeper value",
  "proof, case studies, and community",
  "conversion, launch, and reinforcement",
];

const DEFAULT_SIMILARITY_THRESHOLD = {
  instagram: 0.72,
  youtube: 0.76,
  linkedin: 0.78,
  twitter: 0.7,
  default: 0.74,
};

const DEFAULT_FORMATS = ["Reel", "Carousel", "Story", "Static Post", "Thread", "Video", "Text Post"];
const DEFAULT_OBJECTIVES = ["Awareness", "Education", "Engagement", "Community", "Conversion"];

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s]|_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalizeText(value).split(" ").filter(Boolean);
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function jaccardSimilarity(a, b) {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (!setA.size || !setB.size) return 0;
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }
  return intersection / (setA.size + setB.size - intersection);
}

function bigramSimilarity(a, b) {
  const bigrams = (value) => {
    const text = normalizeText(value).replace(/\s+/g, " ");
    const result = [];
    for (let i = 0; i < text.length - 1; i += 1) {
      result.push(text.slice(i, i + 2));
    }
    return new Set(result);
  };
  const setA = bigrams(a);
  const setB = bigrams(b);
  if (!setA.size || !setB.size) return 0;
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }
  return intersection / (setA.size + setB.size - intersection);
}

function semanticSimilarity(a, b) {
  return Math.max(jaccardSimilarity(a, b), bigramSimilarity(a, b));
}

function computeFingerprint(item) {
  return {
    title: normalizeText(item.title),
    hook: normalizeText(item.hook),
    topic: normalizeText(item.topic),
    combined: normalizeText([item.pillar, item.topic, item.hook, item.title].join(" | ")),
  };
}

function getThreshold(platform) {
  return DEFAULT_SIMILARITY_THRESHOLD[platform] || DEFAULT_SIMILARITY_THRESHOLD.default;
}

function makeMemoryKey(creatorId, platform) {
  return `${creatorId}::${platform}`;
}

function makeSeriesId(creatorId, platform, niche) {
  return `series-${slugify(creatorId)}-${platform}-${slugify(niche)}`;
}

function makeSeriesName(niche) {
  return `${niche} Content Series`;
}

function planItems(plan) {
  return plan?.content_items || plan?.posts || [];
}

function approvedItems(plan) {
  return planItems(plan).filter((item) => ["confirmed", "generated"].includes(item.status));
}

function getPlatformHistory(plans, creatorId, platform) {
  return [...(plans || [])]
    .filter((plan) => plan.creator_id === creatorId && plan.platform === platform)
    .sort((a, b) => String(a.month).localeCompare(String(b.month)));
}

function getSeriesHistory(plans, creatorId, platform, niche) {
  const seriesId = makeSeriesId(creatorId, platform, niche);
  return [...(plans || [])]
    .filter((plan) => (plan.series_id || makeSeriesId(plan.creator_id, plan.platform, plan.niche)) === seriesId)
    .sort((a, b) => String(a.month).localeCompare(String(b.month)));
}

function getRecentHistoryItems(history) {
  const flattened = history.flatMap((plan) => approvedItems(plan).map((item) => ({ item, plan })));
  return flattened.slice(-500);
}

function inferPillars(niche) {
  const key = slugify(niche);
  const defaults = {
    exam: ["Study systems", "Mindset", "Revision", "Exam strategy"],
    motivation: ["Mindset", "Habits", "Resilience", "Execution"],
    startup: ["Founder lessons", "Growth", "Fundraising", "Product"],
    astrology: ["Daily guidance", "Planetary shifts", "Remedies", "Signs"],
    finance: ["Saving", "Investing", "Risk", "Money habits"],
    fitness: ["Training", "Nutrition", "Recovery", "Consistency"],
    cooking: ["Recipes", "Kitchen systems", "Budget meals", "Technique"],
    "self-discipline": ["Routine", "Focus", "Habit design", "Consistency"],
    fashion: ["Styling", "Wardrobe systems", "Occasion wear", "Affordable finds"],
    tech: ["Tools", "Workflows", "Career growth", "Automation"],
  };
  return defaults[key] || ["Education", "Execution", "Mindset", "Community"];
}

function inferAudienceProfile(niche, platform, language) {
  return `${language} speaking ${platform} audience interested in ${niche}, practical takeaways, and culturally relevant examples`;
}

function inferToneProfile(tone, language) {
  return `${tone} voice in ${language} with crisp hooks, creator-led framing, and direct audience address`;
}

function determineCampaignArc(sequenceNumber) {
  return DEFAULT_THEME_STAGES[(Math.max(sequenceNumber, 1) - 1) % DEFAULT_THEME_STAGES.length];
}

function buildTheme({
  niche,
  platform,
  sequenceNumber,
  previousTheme,
  continuitySummary,
}) {
  const stage = determineCampaignArc(sequenceNumber);
  const base = previousTheme
    ? `Advance "${previousTheme}" into ${stage}`
    : `${stage} for ${niche}`;
  const continuitySeed = continuitySummary ? ` while preserving ${continuitySummary}` : "";
  return `${base} on ${platform}${continuitySeed}`.replace(/\s+/g, " ").trim();
}

function buildContinuitySummary({ history, memory, targetMonth }) {
  if (!history.length) {
    return `Initial month for ${targetMonth}. Establish pillars, cadence, tone, and audience fit from the creator brief.`;
  }
  const lastPlan = history[history.length - 1];
  const angles = unique(
    planItems(lastPlan)
      .map((item) => item.audience_angle || item.topic || item.title)
      .slice(0, 6)
  );
  return [
    `Continuing from ${lastPlan.month} with theme "${lastPlan.month_theme}".`,
    `Keep cadence at ${memory.posting_cadence?.posts_per_month || "planned"} posts using ${memory.posting_cadence?.distribution_mode || "the existing"} schedule.`,
    `Persist tone "${memory.tone_profile}" and audience "${memory.audience_profile}".`,
    angles.length ? `Recent angles: ${angles.join("; ")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildContentGaps(history, memory) {
  const recentTopics = new Set(
    history.flatMap((plan) => planItems(plan).map((item) => normalizeText(item.topic))).filter(Boolean)
  );
  return memory.content_pillars.filter((pillar) => !recentTopics.has(normalizeText(pillar))).slice(0, 3);
}

function buildCreatorBriefPayload({
  creatorId,
  platform,
  creatorBrief,
  memory,
  history,
  targetMonth,
  mode,
}) {
  const sequenceNumber = mode === "continuation_generation"
    ? Math.max(memory.month_sequence_number + 1, history.length + 1)
    : Math.max(memory.month_sequence_number, history.length, 0) + 1;
  const continuitySummary = buildContinuitySummary({ history, memory, targetMonth });
  const monthTheme = buildTheme({
    niche: creatorBrief.niche,
    platform,
    sequenceNumber,
    previousTheme: memory.current_month_theme,
    continuitySummary: history.length ? "strategic continuity with fresh angles" : "",
  });
  return {
    creatorId,
    platform,
    targetMonth,
    mode,
    sequenceNumber,
    continuitySummary,
    monthTheme,
    contentGaps: buildContentGaps(history, memory),
  };
}

function parseJsonResponse(text) {
  const clean = String(text || "").replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    const firstObject = clean.indexOf("{");
    const lastObject = clean.lastIndexOf("}");
    if (firstObject !== -1 && lastObject !== -1 && lastObject > firstObject) {
      return JSON.parse(clean.slice(firstObject, lastObject + 1));
    }
    const firstArray = clean.indexOf("[");
    const lastArray = clean.lastIndexOf("]");
    if (firstArray !== -1 && lastArray !== -1 && lastArray > firstArray) {
      return JSON.parse(clean.slice(firstArray, lastArray + 1));
    }
    throw new Error("Unable to parse JSON response");
  }
}

async function requestStructuredItems({
  requestAI,
  creatorBrief,
  platform,
  postingCadence,
  targetMonth,
  continuityBrief,
  monthTheme,
  itemCount,
  blockedExamples,
}) {
  const buildRequest = (strict = false) => ({
    max_tokens: strict ? 1400 : 2200,
    system: `You are a content strategy engine. Return ONLY valid JSON with keys: month_theme, continuity_summary, generation_notes, content_items.

Generate exactly ${itemCount} content_items for ${platform}.
Each content item must include these keys:
- pillar
- topic
- hook
- title
- format
- objective
- audience_angle

Rules:
- Preserve 60-80% continuity with prior strategy.
- Introduce 20-40% fresh angles or subthemes.
- Keep the voice aligned to the creator brief.
- Avoid duplicates and avoid reusing blocked titles/hooks/topics.
- Do not output markdown.
${strict ? "- Output compact JSON only. No commentary before or after the JSON object." : "- Keep titles and hooks specific, practical, and distinct from each other."}`,
    messages: [{
      role: "user",
      content: JSON.stringify({
        creator_brief: creatorBrief,
        platform,
        posting_cadence: postingCadence,
        target_month: targetMonth,
        continuity_brief: continuityBrief,
        month_theme: monthTheme,
        blocked_examples: blockedExamples,
        required_item_count: itemCount,
      }),
    }],
  });

  let parsed;
  try {
    parsed = parseJsonResponse(await requestAI(buildRequest(false)));
  } catch {
    parsed = parseJsonResponse(await requestAI(buildRequest(true)));
  }
  if (!Array.isArray(parsed.content_items) || parsed.content_items.length === 0) {
    throw new Error("Invalid structured plan response");
  }
  return parsed;
}

function buildFallbackItems({
  creatorBrief,
  postingCadence,
  monthTheme,
  itemCount,
  blockedExamples,
}) {
  const pillars = creatorBrief.content_pillars?.length ? creatorBrief.content_pillars : inferPillars(creatorBrief.niche);
  const titles = (creatorBrief.sample_titles || []).length
    ? creatorBrief.sample_titles
    : [
        `${creatorBrief.niche}: the mistake keeping most people stuck`,
        `A better system for ${creatorBrief.niche} consistency`,
        `What changed after I simplified my ${creatorBrief.niche} workflow`,
        `The overlooked shift behind better ${creatorBrief.niche} results`,
        `How to make ${creatorBrief.niche} feel easier without lowering standards`,
      ];
  const blocked = new Set(blockedExamples.map((value) => normalizeText(value)));
  const items = [];
  let cursor = 0;
  while (items.length < itemCount) {
    const pillar = pillars[items.length % pillars.length];
    const baseTitle = titles[cursor % titles.length];
    const title = `${baseTitle} (${items.length + 1})`;
    cursor += 1;
    if (blocked.has(normalizeText(title))) continue;
    items.push({
      pillar,
      topic: `${pillar} for ${monthTheme}`,
      hook: `Start here: ${pillar} is the lever most creators underuse.`,
      title,
      format: DEFAULT_FORMATS[items.length % DEFAULT_FORMATS.length],
      objective: DEFAULT_OBJECTIVES[items.length % DEFAULT_OBJECTIVES.length],
      audience_angle: `${creatorBrief.audience_profile || inferAudienceProfile(creatorBrief.niche, creatorBrief.platform, creatorBrief.language)} with a ${postingCadence} cadence`,
    });
  }
  return {
    month_theme: monthTheme,
    continuity_summary: `Fallback continuity plan for ${monthTheme}.`,
    generation_notes: "Fallback generation used because AI planning was unavailable.",
    content_items: items,
  };
}

function evaluateItemAgainstExisting(item, existingFingerprints, platform) {
  const threshold = getThreshold(platform);
  const candidate = computeFingerprint(item);
  for (const existing of existingFingerprints) {
    if (candidate.title && candidate.title === existing.fingerprint.title) {
      return { blocked: true, reason: "exact_title", matchedItem: existing };
    }
    if (candidate.title && candidate.title === existing.fingerprint.title) {
      return { blocked: true, reason: "normalized_title", matchedItem: existing };
    }
    const titleSimilarity = semanticSimilarity(candidate.title, existing.fingerprint.title);
    const hookSimilarity = semanticSimilarity(candidate.hook, existing.fingerprint.hook);
    const topicSimilarity = semanticSimilarity(candidate.topic, existing.fingerprint.topic);
    const angleSimilarity = semanticSimilarity(candidate.combined, existing.fingerprint.combined);
    const maxSimilarity = Math.max(titleSimilarity, hookSimilarity, topicSimilarity, angleSimilarity);
    if (maxSimilarity >= threshold) {
      return {
        blocked: true,
        reason: "near_duplicate",
        similarity: Number(maxSimilarity.toFixed(2)),
        matchedItem: existing,
      };
    }
  }
  return { blocked: false };
}

function dedupePlanItems(items, history, platform) {
  const existingFingerprints = history.map(({ item, plan }) => ({
    plan_id: plan.plan_id,
    month: plan.month,
    title: item.title,
    fingerprint: item.generation_fingerprint || computeFingerprint(item),
  }));
  const accepted = [];
  const blocked = [];
  for (const item of items) {
    const result = evaluateItemAgainstExisting(item, [
      ...existingFingerprints,
      ...accepted.map((acceptedItem) => ({
        plan_id: "current",
        month: "current",
        title: acceptedItem.title,
        fingerprint: acceptedItem.generation_fingerprint || computeFingerprint(acceptedItem),
      })),
    ], platform);
    if (result.blocked) {
      blocked.push({ item, ...result });
    } else {
      accepted.push({ ...item, generation_fingerprint: computeFingerprint(item) });
    }
  }
  return {
    accepted,
    blocked,
  };
}

function ensurePlanCoverage({
  accepted,
  originalItems,
  creatorBrief,
  monthTheme,
  blockedExamples,
  itemCount,
}) {
  const normalizedAcceptedTitles = new Set(
    accepted.map((item) => normalizeText(item.title))
  );
  const recovered = [...accepted];

  for (const item of originalItems) {
    if (recovered.length >= itemCount) break;
    const normalizedTitle = normalizeText(item.title);
    if (normalizedAcceptedTitles.has(normalizedTitle)) continue;
    recovered.push({
      ...item,
      generation_fingerprint: item.generation_fingerprint || computeFingerprint(item),
      dedupe_relaxed: true,
    });
    normalizedAcceptedTitles.add(normalizedTitle);
  }

  if (recovered.length < itemCount) {
    const filler = buildFallbackItems({
      creatorBrief,
      postingCadence: creatorBrief.posting_cadence?.distribution_mode || "daily",
      monthTheme,
      itemCount: itemCount * 2,
      blockedExamples,
    }).content_items;

    for (const item of filler) {
      if (recovered.length >= itemCount) break;
      const normalizedTitle = normalizeText(item.title);
      if (normalizedAcceptedTitles.has(normalizedTitle)) continue;
      recovered.push({
        ...item,
        id: `item-${Date.now()}-fill-${recovered.length}`,
        status: "pending",
        generatedPost: null,
        generation_fingerprint: computeFingerprint(item),
        dedupe_relaxed: true,
      });
      normalizedAcceptedTitles.add(normalizedTitle);
    }
  }

  return recovered.slice(0, itemCount);
}

function nextMonthString(month) {
  const [year, part] = String(month).split("-").map(Number);
  const date = new Date(year, part - 1, 1);
  date.setMonth(date.getMonth() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function makeDateSlots(month, count, distributionMode, distributeDates) {
  const [year, monthNumber] = String(month).split("-").map(Number);
  const days = distributeDates(year, monthNumber, count, distributionMode);
  return days.map((day) => ({
    day,
    date_or_slot: `${month}-${String(day).padStart(2, "0")}`,
  }));
}

function coerceCreatorBrief(brief) {
  return {
    niche: brief.niche,
    platform: brief.platform,
    language: brief.language,
    tone: brief.tone,
    posting_cadence: brief.posting_cadence,
    content_pillars: brief.content_pillars?.length ? brief.content_pillars : inferPillars(brief.niche),
    tone_profile: brief.tone_profile || inferToneProfile(brief.tone, brief.language),
    audience_profile: brief.audience_profile || inferAudienceProfile(brief.niche, brief.platform, brief.language),
    campaign_arc: brief.campaign_arc || determineCampaignArc(1),
    sample_titles: brief.sample_titles || [],
  };
}

function buildInitialMemory(creatorId, platform, creatorBrief) {
  const brief = coerceCreatorBrief(creatorBrief);
  return {
    creator_id: creatorId,
    platform,
    series_id: makeSeriesId(creatorId, platform, brief.niche),
    series_name: makeSeriesName(brief.niche),
    content_pillars: brief.content_pillars,
    used_titles: [],
    used_hooks: [],
    used_topics: [],
    posting_cadence: brief.posting_cadence,
    current_month_theme: "",
    theme_history: [],
    tone_profile: brief.tone_profile,
    audience_profile: brief.audience_profile,
    campaign_arc: brief.campaign_arc,
    month_sequence_number: 0,
    last_generated_month: null,
    continuity_summary: "",
    similarity_threshold: getThreshold(platform),
  };
}

function rebuildMemoryFromPlans(memory, history) {
  const approved = history.flatMap((plan) => approvedItems(plan));
  const lastPlan = history[history.length - 1];
  return {
    ...memory,
    used_titles: unique(approved.map((item) => item.title)),
    used_hooks: unique(approved.map((item) => item.hook)),
    used_topics: unique(approved.map((item) => item.topic)),
    current_month_theme: lastPlan?.month_theme || memory.current_month_theme,
    theme_history: unique(history.map((plan) => plan.month_theme).filter(Boolean)).slice(-12),
    campaign_arc: lastPlan?.campaign_arc || memory.campaign_arc,
    month_sequence_number: history.length,
    last_generated_month: lastPlan?.month || memory.last_generated_month,
    continuity_summary: lastPlan?.continuity_summary || memory.continuity_summary,
  };
}

async function generatePlan({
  creatorId,
  platform,
  creatorBrief,
  targetMonth,
  mode,
  plans,
  memories,
  requestAI,
  distributeDates,
}) {
  const brief = coerceCreatorBrief(creatorBrief);
  const history = getPlatformHistory(plans, creatorId, platform);
  const seriesHistory = getSeriesHistory(plans, creatorId, platform, brief.niche);
  const memoryKey = makeMemoryKey(creatorId, platform);
  const existingMemory = memories[memoryKey] || buildInitialMemory(creatorId, platform, brief);
  const memory = rebuildMemoryFromPlans({ ...existingMemory, posting_cadence: brief.posting_cadence }, history);
  const payload = buildCreatorBriefPayload({
    creatorId,
    platform,
    creatorBrief: brief,
    memory,
    history,
    targetMonth,
    mode,
  });
  const itemCount = Number(brief.posting_cadence.posts_per_month || 12);
  const blockedExamples = unique([
    ...memory.used_titles.slice(-500),
    ...memory.used_hooks.slice(-500),
    ...memory.used_topics.slice(-500),
  ]).slice(-80);

  let generated;
  try {
    generated = await requestStructuredItems({
      requestAI,
      creatorBrief: brief,
      platform,
      postingCadence: brief.posting_cadence,
      targetMonth,
      continuityBrief: payload.continuitySummary,
      monthTheme: payload.monthTheme,
      itemCount,
      blockedExamples,
    });
  } catch (error) {
    generated = buildFallbackItems({
      creatorBrief: brief,
      postingCadence: brief.posting_cadence.distribution_mode,
      monthTheme: payload.monthTheme,
      itemCount,
      blockedExamples,
    });
    generated.generation_notes = `${generated.generation_notes} ${error.message}`;
  }

  let contentItems = generated.content_items.slice(0, itemCount).map((item, index) => ({
    id: `item-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    pillar: item.pillar || brief.content_pillars[index % brief.content_pillars.length],
    topic: item.topic || `${brief.content_pillars[index % brief.content_pillars.length]} angle`,
    hook: item.hook || `New angle on ${brief.niche}`,
    title: item.title || `Untitled ${index + 1}`,
    format: item.format || DEFAULT_FORMATS[index % DEFAULT_FORMATS.length],
    objective: item.objective || DEFAULT_OBJECTIVES[index % DEFAULT_OBJECTIVES.length],
    audience_angle: item.audience_angle || brief.audience_profile,
    status: "pending",
    generatedPost: null,
  }));

  const historyItems = getRecentHistoryItems(history);
  const dedupeAttempts = [];
  let pass = dedupePlanItems(contentItems, historyItems, platform);
  dedupeAttempts.push({ blocked: pass.blocked.length });
  if (pass.blocked.length) {
    const fallbackPool = buildFallbackItems({
      creatorBrief: brief,
      postingCadence: brief.posting_cadence.distribution_mode,
      monthTheme: payload.monthTheme,
      itemCount: pass.blocked.length * 2,
      blockedExamples,
    }).content_items;
    const regenerated = [];
    for (let i = 0; i < pass.blocked.length; i += 1) {
      const candidate = fallbackPool[i] || fallbackPool[fallbackPool.length - 1];
      regenerated.push({
        ...candidate,
        id: `item-${Date.now()}-regen-${i}`,
        status: "pending",
        generatedPost: null,
      });
    }
    contentItems = [...pass.accepted, ...regenerated].slice(0, itemCount);
    pass = dedupePlanItems(contentItems, historyItems, platform);
    dedupeAttempts.push({ blocked: pass.blocked.length });
  }

  const coveredItems = ensurePlanCoverage({
    accepted: pass.accepted,
    originalItems: contentItems,
    creatorBrief: brief,
    monthTheme: generated.month_theme || payload.monthTheme,
    blockedExamples,
    itemCount,
  });

  const slots = makeDateSlots(targetMonth, coveredItems.length, brief.posting_cadence.distribution_mode, distributeDates);
  const finalItems = coveredItems.slice(0, slots.length).map((item, index) => ({
    ...item,
    ...slots[index],
    generation_fingerprint: item.generation_fingerprint || computeFingerprint(item),
  }));

  const previousTheme = history[history.length - 1]?.month_theme || null;
  const continuityFromPlanId = history[history.length - 1]?.plan_id || null;
  const seriesId = makeSeriesId(creatorId, platform, brief.niche);
  const seriesName = makeSeriesName(brief.niche);
  const seriesSequenceNumber = seriesHistory.length + 1;
  const plan = {
    id: `plan-${Date.now()}`,
    plan_id: `plan-${Date.now()}`,
    creator_id: creatorId,
    platform,
    series_id: seriesId,
    series_name: seriesName,
    series_sequence_number: seriesSequenceNumber,
    niche: brief.niche,
    language: brief.language,
    tone: brief.tone,
    month: targetMonth,
    month_theme: generated.month_theme || payload.monthTheme,
    continuity_from_plan_id: continuityFromPlanId,
    posting_cadence: brief.posting_cadence,
    campaign_arc: determineCampaignArc(payload.sequenceNumber),
    content_items: finalItems,
    posts: finalItems,
    continuity_summary: generated.continuity_summary || payload.continuitySummary,
    generation_notes: generated.generation_notes || "",
    dedupe_report: {
      blocked_count: pass.blocked.length,
      blocked_reasons: pass.blocked.map((item) => item.reason),
      attempts: dedupeAttempts,
      threshold: getThreshold(platform),
      previous_theme: previousTheme,
      relaxed_fill_count: Math.max(0, finalItems.length - pass.accepted.length),
    },
    generation_mode: mode,
    createdAt: new Date().toISOString(),
  };

  const updatedHistory = [...history, plan];
  const updatedMemory = rebuildMemoryFromPlans({
    ...memory,
    posting_cadence: brief.posting_cadence,
    tone_profile: brief.tone_profile,
    audience_profile: brief.audience_profile,
    content_pillars: brief.content_pillars,
    series_id: seriesId,
    series_name: seriesName,
    current_month_theme: plan.month_theme,
    continuity_summary: plan.continuity_summary,
    campaign_arc: plan.campaign_arc,
  }, updatedHistory);

  return { plan, memory: updatedMemory };
}

export async function createInitialMonthlyPlan({
  creatorId,
  platform,
  creatorBrief,
  plans,
  memories,
  requestAI,
  distributeDates,
}) {
  return generatePlan({
    creatorId,
    platform,
    creatorBrief,
    targetMonth: creatorBrief.targetMonth,
    mode: "initial_month_generation",
    plans,
    memories,
    requestAI,
    distributeDates,
  });
}

export async function continueMonthlyPlan({
  creatorId,
  platform,
  targetMonth,
  creatorBrief,
  plans,
  memories,
  requestAI,
  distributeDates,
}) {
  return generatePlan({
    creatorId,
    platform,
    creatorBrief,
    targetMonth,
    mode: "continuation_generation",
    plans,
    memories,
    requestAI,
    distributeDates,
  });
}

export function getContentMemory(creatorId, platform, memories) {
  return memories[makeMemoryKey(creatorId, platform)] || null;
}

export function getMonthlyPlanHistory(creatorId, platform, plans) {
  return getPlatformHistory(plans, creatorId, platform);
}

export function overrideMemoryState(creatorId, platform, patch, memories) {
  const key = makeMemoryKey(creatorId, platform);
  return {
    ...memories,
    [key]: {
      ...(memories[key] || {}),
      ...patch,
      creator_id: creatorId,
      platform,
    },
  };
}

export function rebuildMemories(plans, memories) {
  const next = { ...(memories || {}) };
  const groups = new Map();
  for (const plan of plans || []) {
    const key = makeMemoryKey(plan.creator_id, plan.platform);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(plan);
  }
  for (const [key, history] of groups.entries()) {
    const latest = history[history.length - 1];
    const seed = next[key] || buildInitialMemory(latest.creator_id, latest.platform, latest);
    next[key] = rebuildMemoryFromPlans(seed, history.sort((a, b) => String(a.month).localeCompare(String(b.month))));
  }
  return next;
}

export function nextContinuationMonth(creatorId, platform, plans) {
  const history = getPlatformHistory(plans, creatorId, platform);
  const lastPlan = history[history.length - 1];
  return lastPlan ? nextMonthString(lastPlan.month) : null;
}

export function summarizeHistoryForPlatform(creatorId, platform, plans, memories) {
  const history = getPlatformHistory(plans, creatorId, platform);
  const memory = getContentMemory(creatorId, platform, memories);
  return {
    history,
    memory,
    nextMonth: history.length ? nextMonthString(history[history.length - 1].month) : null,
  };
}
