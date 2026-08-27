# Blog post ideas

A parking place for posts worth writing, so a topic that arrives mid-task
doesn't get lost in a PR thread.

**This file is not part of the site.** It lives outside `src/`, nothing imports
it, and it never reaches `dist/`. When the blog section actually exists — the
README's "coming next" is a static JSON file following the `site.json` pattern —
posts move there. This stays a scratchpad.

Each entry records *why* it is worth writing, not a draft. If an entry can't say
what it argues, it isn't ready to write.

---

## 1. Redefining the SDLC around agentic engineering

**Status:** wanted first.

The actual experience of rebuilding a delivery cycle around AI-assisted
development at Videocation, with the numbers attached — what happened to cycle
time, and what else moved with it: review, planning, estimation, onboarding, the
shape of a normal working day.

Worth writing because most writing on this topic is either vendor material or
speculation. This one has a real before and after, in a company that had to keep
shipping throughout. The site already claims the redesign (`site.json` →
`timeline`, the Videocation entry) but never says what it cost or what it
returned.

Things it should be honest about: what got worse or noisier, what had to be
unlearned, and which parts of the workflow AI did not improve.

## 2. What "best practices" actually means for a web application

**Status:** wanted second.

The distinction that came out of reviewing the site's own copy (issue #6): there
is no such thing as "best practices" as one category to be for or against.
Observability, reliability, testing at whatever level the risk justifies, fast
and reversible deploys, code review, product metrics, analytics and runtime error
reporting are essential — they are how you find out you were wrong. Chasing the
right abstraction, or the perfect structure nobody will ever read, is not the
same activity and should not inherit the same justification.

The test worth arguing: **who will feel it?** Users feel fewer incidents and
faster fixes. The team feels deploy confidence. Nobody feels an elegant class
hierarchy. That criterion is what separates the two piles.

Worth writing because the site currently gives a hiring manager a lot of
ship-fast signal and almost no reliability signal. It correctly declines to
worship code structure, but it never says what it *does* insist on. This post is
where that gets said properly — which is also the reason not to try to cram it
into the site's copy.
