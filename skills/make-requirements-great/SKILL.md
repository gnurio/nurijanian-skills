---
name: make-requirements-great
description: Review existing requirements or convert raw context into requirements that meet 18 quality characteristics (unambiguous, clear, cohesive, consistent, conformant, current, modifiable, traceable, relevant, unique, categorised, complete, correct, concise, testable, implementation-independent, owned, feasible). Use whenever the user mentions requirements, PRDs, specs, user stories, acceptance criteria, requirements review, requirements audit, BRD, FRD, requirements quality, requirements catalogue, requirements traceability, "are my requirements any good", "turn this into requirements", "make these requirements better", or shares meeting notes, interview transcripts, stakeholder input, or feature ideas that need to be formalised. Trigger even when the user does not use the word "requirement" if the artifact they share is functionally a requirement (e.g., "the system should let users export to PDF", "we need a way for admins to revoke access").
---

# Make Requirements Great

Requirements decide what gets built. Bad requirements waste engineering time, generate disputes between analysts, developers and stakeholders, and at worst cause the wrong thing to be built. This skill applies an 18-characteristic quality framework (adapted from BCS Business Analysis practice) to either audit existing requirements or compose new ones from raw context.

## Inputs

Two input modes. Detect which applies before doing anything else.

**Mode A — Review.** Input is one or more existing requirements. Audit them against the 18 characteristics. Return a defect log and rewrites.

**Mode B — Author.** Input is raw context — notes, transcripts, threads, pitches, problem statements. Extract requirements and write them so they meet the 18 characteristics from the start.

Mixed input: extract requirements from the loose context, then audit the union as one set.

Do not impose a format the user did not ask for. Match whatever format the requirements already use, or whatever format the user requests. If the user offers no preference, write each requirement as a single sentence and only add structure when a characteristic (Owner, Source, Acceptance criteria) demands it.

## Level of abstraction — read this before applying any characteristic

Requirements live at different altitudes. Confusing the altitudes is the most common failure mode of a quality review and produces exactly the wrong kind of feedback — demanding solution-level precision from a high-level statement, or accepting business-level vagueness in a solution-level statement.

Three common levels (names vary by methodology; what matters is the distinction):

- **Business / strategic.** Why the work exists. The outcome the organisation wants. Owned by the sponsor. Example: "The organisation shall reduce preference-related customer complaints by 40% within twelve months."
- **Stakeholder / user.** What a stakeholder needs the system to do for them, expressed at the level of intent. Owned by the affected stakeholder group. Example: "Customers shall be able to update their communication preferences from any product surface and have those preferences respected everywhere."
- **Solution / functional.** How the system behaves. Owned by the delivery team. Example: "The Preference Service shall propagate writes to all subscribed channels within 5 seconds at the 95th percentile."

A high-level requirement is **not a defective low-level requirement**. It is a deliberate, valid artefact whose job is to capture intent and scope before design choices are made. Forcing it to specify latencies, conflict rules, and outage behaviour is premature decomposition — it prematurely commits to design assumptions, makes the requirement harder to revisit, and often answers questions the wrong stakeholder is being asked.

### Detect the level before auditing

Cues a requirement is **business-level**: talks about outcomes, KPIs, business goals, organisational change. Does not name a system component.

Cues a requirement is **stakeholder-level**: talks about a class of user, the value or capability they want, the consistency or quality property they expect. Names systems or domains in conceptual terms ("any surface", "all channels") rather than nominating implementations. Sentences tend to start "Users shall be able to…", "The organisation shall provide…", "Customers shall experience…".

Cues a requirement is **solution-level**: names specific components, latencies, percentiles, error codes, screens, fields, APIs, data types. Sentences tend to start "The {named subsystem} shall…".

If the input is ambiguous about level, ask the user which level they intend before reviewing. Do not silently default to solution-level — that is the trap that produces the over-decomposition complaint.

### How the 18 characteristics shift by level

The characteristics are universal; the evidence that satisfies them changes.

- **Unambiguous.** Business: two sponsors agree on what outcome is targeted. Stakeholder: two users from the affected group agree on the capability described. Solution: two engineers agree on what to build. A stakeholder requirement using phrases like "any surface" or "all channels" is not ambiguous at its level — the *resolution* of those terms is a downstream task, and listing them is a design output, not a precondition.
- **Testable.** Business: the outcome metric exists and can be measured (KPI, survey, incident count). Stakeholder: an acceptance test could in principle be written once design exists (e.g., "a customer updates preferences in Domain A; the change is visible to Channel B"). Solution: a concrete test can be written today with concrete inputs and expected outputs. Do not reject a stakeholder requirement for failing the solution-level testability bar.
- **Implementation-independent.** Strictest at business and stakeholder levels. Looser at solution level (where naming components is the *point*).
- **Complete.** Business: the outcome statement leaves no major business goal unaddressed. Stakeholder: the capability covers the user's whole journey (happy path, key alternatives, key failure cases at the level of the user's experience, not the system's internals). Solution: every data field, error path, and edge case is enumerated. A stakeholder requirement does not have to spell out the conflict-resolution algorithm; it has to say *that consistency is required*. The algorithm is a solution-level question.
- **Cohesive.** A single high-level requirement may legitimately bundle what later becomes several solution-level requirements, provided the bundled items express **one user intent**. Splitting is appropriate when the bundled items serve different stakeholders or different intents, not merely because they will later decompose into multiple solution requirements.
- **Feasible.** Business level: directionally achievable. Stakeholder level: no obvious blocker. Solution level: deliverable inside specific constraints (budget, time, team).
- **Owned, Relevant, Traceable, Categorised, Unique, Consistent, Conformant, Current, Modifiable, Concise, Correct, Clear and understandable.** Apply at every level with the same logic; the difference is mainly that the *audience* changes (sponsor for business-level, stakeholder for user-level, delivery team for solution-level).

### Handling open questions at high levels

When auditing a high-level requirement, the things you would have flagged as "missing detail" at solution level become **deferred design decisions**, not defects. Surface them in a separate list — "Decisions to be taken during decomposition" — rather than in the defect log. This preserves the value of the high-level requirement (it captures intent) while still recording what needs to be resolved later.

A defect at high level is something that breaks the requirement *at that level*: a genuine ambiguity in the intent, a real contradiction, a missing stakeholder, an unowned outcome. It is not "you didn't specify the latency".

### Default to not decomposing

When in doubt, audit the requirement at the level it was written. Do not produce a split into N solution-level requirements unless (a) the user asked, (b) the original was genuinely compound at its own level (two intents fused, not one intent that will later expand into many), or (c) the level itself is wrong and the user has confirmed they wanted solution-level. Offering an aggressive split for a stakeholder-level requirement teaches the user that the skill cannot read intent — and it imposes design commitments that should remain open.

## How to apply the 18 characteristics

Each characteristic below has the same three parts:

- **Test.** The mechanical check that decides pass/fail. Apply it; do not gut-feel it.
- **Bad / Good.** Concrete examples of the failure mode and the fix.
- **Decision logic.** What to do when the test is ambiguous.

Per-item characteristics (1–9) apply to each requirement individually. Set-level characteristics (10–18) apply to the catalogue as a whole — they cannot be evaluated by looking at one requirement in isolation.

---

### 1. Unambiguous

**Test.** Ask: "Can two competent readers, working independently, arrive at different interpretations of what must be built?" If yes, it is ambiguous. A faster mechanical screen: scan for the **weasel word list** — *appropriate, suitable, adequate, reasonable, user-friendly, intuitive, efficient, fast, slow, robust, scalable, secure, modern, simple, easy, seamless, flexible, optimised, high-quality, sufficient, normal, typical, standard, as needed, where applicable, if necessary, etc., and/or, may, might, could.* Each one is a flag, not an automatic fail — quantify it or remove it.

**Bad.** "The system shall respond to user requests in a reasonable time."
- "Reasonable" = whose definition? 100ms? 5s? 30s?

**Good.** "The system shall return a search results page within 2 seconds at the 95th percentile under a load of 1,000 concurrent users."

**Bad.** "Reports should be available to managers and other relevant staff."
- "Relevant" is a hidden access-control rule with no definition.

**Good.** "Users in the roles {Manager, RegionalDirector, Auditor} shall be able to open the Sales Report. All other roles shall be denied access."

**Decision logic.** If you can quantify it, quantify it. If you cannot quantify it because the stakeholder has not decided, *do not invent a number* — write the requirement as best you can and add an open question: "Pending decision: target latency."

---

### 2. Clear and understandable

**Test.** Read the requirement to a person from each stakeholder group it concerns (business user, developer, tester, ops, regulator). If any of them needs a translator, it fails. Mechanical proxy: (a) is every domain term defined somewhere in the catalogue glossary? (b) is every acronym expanded on first use? (c) is the sentence parseable in one pass without re-reading?

**Bad.** "The CDP shall enrich identified visitors via the RTCDP via the AEP pipeline using the configured FPID-to-ECID stitching rule."
- A business user has no entry point. The reader who knows the acronyms still has to mentally compile the sentence.

**Good.** "When an identified visitor is recognised, the Customer Data Platform shall attach all known profile attributes to the visitor's session, using the configured identity-stitching rule (see Glossary: Identity Stitching) to merge anonymous and known IDs."

**Decision logic.** Clarity is not the same as dumbing down. Keep the technical precision; add the connecting tissue (definitions, expansions, brief context) so non-experts can follow.

---

### 3. Concise

**Test.** Try to delete words. If removing them does not change meaning, the requirement was bloated. Sentence-level red flags: "in order to" (→ "to"), "it should be noted that", "the purpose of this requirement is to", "be able to" (often deletable), restatements of the obvious.

**Bad.** "It is required that the system, in order to support the user's workflow, shall be able to provide the user with the ability to export the report to a PDF file format when the user chooses to do so."

**Good.** "Users shall be able to export the report to PDF."

**Decision logic.** Conciseness is subordinate to precision. If trimming a word loses a constraint, keep the word. The goal is the shortest expression that preserves every constraint, not the shortest expression full stop.

---

### 4. Correct

**Test.** Correct = every other characteristic on this list passes for this requirement. There is no separate correctness check; treat it as the sign-off gate. A requirement is correct when (a) the per-item characteristics all pass, (b) it does not break any set-level characteristic, and (c) the owning stakeholder has confirmed it represents the actual business need.

**Decision logic.** If you find yourself wanting to mark something "correct except for X", it is not correct. Fix X.

---

### 5. Testable

**Test.** Write the test that would prove the requirement is met. If you cannot, the requirement is not testable. The test must be (a) specific (what exactly is being checked), (b) objective (two independent testers reach the same verdict), (c) measurable (the pass condition is a value, not a feeling).

**Bad.** "The system shall be intuitive."
- What is the test? Ask users if it's intuitive? On what scale? With what task?

**Better but still bad.** "The system shall be intuitive — new users should be able to complete onboarding without help."
- Closer. But "without help" is still untestable — what counts as help? What % of users?

**Good.** "80% of users in a moderated usability study (n≥20, no prior exposure) shall complete the onboarding flow without requesting assistance from the moderator, where the flow is defined as Steps 1–5 in the onboarding spec."

**Bad.** "Performance shall be acceptable."

**Good.** "The dashboard initial render shall complete within 1.5 seconds on a mid-tier laptop (defined: Intel i5-12450H, 16GB RAM, Chrome stable) over a 10 Mbps connection, measured as Largest Contentful Paint."

**Decision logic.** If acceptance criteria depend on subjective judgement (UX quality, "feels right"), convert the subjective property into an objective proxy: task-completion rate, time-on-task, SUS score, error rate. If no proxy is achievable, the requirement is research, not engineering — mark it so.

---

### 6. Implementation-independent

**Test.** Scan for named tech, named UI controls, named data structures, named vendors. For each occurrence, ask: "Is this dictated by an external constraint (regulation, mandated integration, fixed contract) or is this a guess at the design?" If it is a guess, strip it and restate as behaviour.

**Bad.** "The system shall use a Redis cache to store session data for 30 minutes."
- Redis is a design decision. The actual requirement is the behaviour.

**Good.** "Authenticated user sessions shall remain valid without re-authentication for 30 minutes of inactivity."

**Bad.** "Users shall click the 'Submit' button to save the form."
- Locks the UI to a button labelled 'Submit'. Restricts redesign.

**Good.** "Users shall be able to commit the form's contents to persistent storage."

**Allowed exception.** "The system shall expose a REST API conforming to the OpenAPI 3.1 specification" — when the interface itself is the requirement (because an external consumer depends on it), naming the technology is legitimate. Label the exception explicitly: `# constraint: external interface fixed`.

**Decision logic.** When in doubt, ask: "If we changed the implementation tomorrow, would this requirement still describe what the business needs?" If yes, it's implementation-independent. If no, rewrite.

---

### 7. Owned

**Test.** A named individual (not "the team", not "product", not "TBD") is on the hook to: (a) confirm the requirement is correct, (b) sign off on the delivered solution against it, (c) resolve disputes if interpretation diverges. If the owner field is blank, the requirement fails.

**Bad.** "Owner: Product team" / "Owner: TBD" / no owner field at all.

**Good.** "Owner: Priya Shah, Director of Revenue Operations."

**Decision logic.** If no owner can be identified, this is itself the most important finding — surface it. Unowned requirements drift, get reinterpreted mid-build, and produce blame storms at launch. Do not invent an owner; flag the gap.

---

### 8. Relevant

**Test.** Two checks. (a) Scope: does this requirement fall inside the agreed project scope? (b) Value: does it materially advance the business need stated in the project's purpose? A requirement can be in scope but still irrelevant — those are noise.

**Bad (out of scope).** Project scope is "checkout redesign". Requirement: "The system shall send a birthday email to each customer." → Scope creep, flag.

**Bad (in scope, no value).** Project scope is "checkout redesign". Requirement: "The checkout page shall have a footer." → Not advancing the stated business need; either tie it to a need or drop it.

**Good.** Project scope is "checkout redesign for cart-abandonment reduction". Requirement: "The checkout shall display the total cost including tax and shipping before the user is asked for payment details." → Directly serves the cart-abandonment goal.

**Decision logic.** Trace every requirement to a line in the business case or problem statement. If you cannot, either the requirement is irrelevant or the business case is incomplete — both are findings worth surfacing.

---

### 9. Feasible

**Test.** For each requirement ask: can this be delivered within the known constraints — budget, time, team skills, technology, legal? Feasibility is contextual: a requirement that is trivial for one team is impossible for another.

**Bad.** "The system shall predict customer churn with 99.9% accuracy two years in advance." → Outside the state of the art.

**Bad.** "Launch the redesigned checkout in three weeks across all 14 regional sites with regulatory sign-off in each region." → Regulatory sign-off alone exceeds the timeline.

**Good.** "Launch the redesigned checkout in the UK market by Q3, with the regulatory review scheduled to complete by week 8."

**Decision logic.** When feasibility is uncertain, mark the requirement as "feasibility-pending" and list what would need to be true for it to be feasible (a spike, a hire, a budget increase, a regulatory waiver). Do not silently accept infeasible requirements — they will fail loudly later.

---

### 10. Unique (set-level)

**Test.** Across the catalogue, look for requirements that say the same thing in different words. Quick screen: sort the verb + object pair from each requirement; near-duplicates jump out. Also look for requirements where one is a strict subset of another.

**Bad.** REQ-014: "Users shall be able to export reports to PDF." / REQ-027: "The system shall provide PDF export functionality for reports." → Same requirement, two IDs. If they drift, one will be missed.

**Good.** Keep one (the better-written one), reference it where the other appeared, and add a cross-reference rather than a duplicate.

**Decision logic.** True duplicates: merge. Near-duplicates with subtle differences: either merge after harmonising the difference, or rewrite both so the distinction is explicit.

---

### 11. Cohesive (set-level + per-item)

**Test.** Per-item: each requirement is about one thing. Compound-requirement smell: the word "and", "as well as", "in addition to", a semicolon, or a bullet list inside the statement. Set-level: every requirement contributes to the stated purpose and scope; orphan requirements that wander into unrelated territory fail.

**Bad (compound).** "The system shall authenticate users via SSO and log all login attempts and send an alert to security if more than five failed attempts occur within ten minutes."
- Three requirements pretending to be one. Splitting reveals that the third has its own owner, its own test, and its own priority.

**Good.** Split into:
- REQ-A: "The system shall authenticate users via SSO."
- REQ-B: "The system shall record an entry in the audit log for every login attempt, successful or failed."
- REQ-C: "The system shall raise a security alert when a single user account incurs five or more failed login attempts within a 10-minute window."

**Decision logic.** If a requirement has more than one verb-phrase target, split. If after splitting an individual requirement no longer serves the project purpose, drop it.

---

### 12. Consistent (set-level)

**Test.** Three sub-checks.

**12a. Internal consistency.** No requirement contradicts itself.
- Bad: "The report shall be available to all users; access to the report shall require Manager-level permission."
- Good: Pick one and rewrite. If both are real constraints, the requirement was actually two — split.

**12b. Mutual consistency.** No two requirements contradict each other.
- Bad: REQ-031 "Sessions expire after 30 minutes of inactivity." / REQ-052 "Sessions remain active until the browser closes."
- Good: Reconcile with the owner. Document the winner; the loser becomes a deliberate change of intent, dated and signed off.

**12c. Terminology consistency.** Every concept has one name and one definition across the catalogue.
- Bad: "user", "customer", "account holder", "end user", "subscriber" all referring to the same person.
- Good: Define the canonical term ("customer") in the glossary and replace the variants.

**Decision logic.** Build a one-page glossary as a by-product of the review. If two terms have overlapping but not identical meaning, do not merge — define both and explain when each applies.

---

### 13. Conformant (set-level)

**Test.** Does each requirement follow whatever template, style, or standard the project has agreed on? If no standard exists, conformance reduces to internal consistency of presentation (same fields, same order, same tone, same level of detail).

**Bad.** Half the requirements written as "The system shall…", half written as user stories "As a user I want…", half written as one-line bullet points. Reviewers waste time reorienting.

**Good.** Pick one form. Apply it everywhere. Document the chosen standard at the top of the catalogue.

**Decision logic.** Conformance is the cheapest characteristic to fix and the highest-ROI for reviewers. If a standard exists, enforce it. If none exists, propose one based on the dominant style in the input and surface it as a recommendation.

---

### 14. Current (set-level)

**Test.** Every requirement is dated. Every requirement is versioned. Anything older than the last scope change is suspect. Quick screen: ask the owner of each section "is this still what you want?" — if they hesitate, the requirement may be stale.

**Bad.** A requirement copy-pasted from a previous project, referencing a product line that has since been discontinued.

**Bad.** A requirement that pre-dates a known scope reduction and has not been re-evaluated against the new scope.

**Good.** Each requirement carries a "last reviewed" date and the name of the reviewer. Changes are logged.

**Decision logic.** Mark anything that pre-dates the most recent agreed scope baseline as "stale-review-required" and surface the list — do not silently drop, but do not silently keep either.

---

### 15. Modifiable (set-level)

**Test.** Pick a plausible change ("we're cutting region X", "we're adding GDPR compliance"). Trace every requirement that would need to change. If the trace is hard — requirements are scattered, IDs are unstable, cross-references rely on section numbers — modifiability fails.

**Good signs.** Stable IDs (REQ-AUTH-001 not "Requirement 14"). Logical grouping by area. Version control with diffs. Cross-references use IDs, not "see section 3.2.1 above".

**Bad signs.** IDs that shift when the doc is re-ordered. Requirements about the same area scattered across the document. No version history.

**Decision logic.** Modifiability is a structural property of the catalogue, not of individual requirements. Findings here recommend structural changes (renumber, regroup, version-control) rather than rewrites.

---

### 16. Traceable (set-level)

**Test.** For each requirement, can you answer both questions: (a) "Where did this come from?" — a source document, interview, regulation, ticket; (b) "Where does this go?" — design artefact, code module, test case. If either link is missing, traceability fails.

**Bad.** REQ-041 exists. No one remembers why. The original interview note has been deleted. There is no test that explicitly covers it.

**Good.** REQ-041 has Source: "Interview, Priya Shah, 2026-03-12, transcript line 87" and Verified-by: "Test case TC-AUTH-019".

**Decision logic.** Untraceable requirements are candidates for deletion — but do not delete until the owner confirms. Surface them; let the owner decide.

---

### 17. Categorised (set-level)

**Test.** Is the catalogue partitioned by requirement type? Common types: functional, non-functional (performance, security, usability, reliability, scalability, maintainability), business, user, interface, data, regulatory, constraint. Run the type list as a checklist. Categories with zero requirements are suspects — either the system genuinely has no requirements of that type, or the category was overlooked.

**Bad.** A 200-line catalogue with no non-functional requirements at all. Almost certainly an omission, since every real system has performance, security, and reliability constraints.

**Good.** Each requirement tagged with its type; the catalogue's table of contents reflects the type breakdown; missing categories have been actively reviewed and dismissed with reasoning.

**Decision logic.** For each missing-or-thin category, ask the owner "is this really empty?" Do not invent requirements to fill empty categories, but do flag the gap.

---

### 18. Complete (set-level)

**Test.** Completeness is the hardest to verify because absences are invisible. Use multiple techniques:

- **Category checklist.** From characteristic 17 — run every standard category and ask "is this addressed?"
- **CRUD check.** For each data entity in the system, are Create / Read / Update / Delete operations all covered, or explicitly excluded?
- **Lifecycle check.** For each user role and each entity, is there coverage for onboarding, normal use, error states, edge cases, and offboarding?
- **Multiple reviewers.** A single reviewer almost never catches all omissions; rotate the catalogue past at least two more pairs of eyes.

**Bad.** Requirements describe how users create accounts but never describe how accounts are deleted, or how data is exported on deletion (potential regulatory issue).

**Good.** Each entity has a documented lifecycle. Each user role has a documented entry, normal, and exit path. Error and edge cases are explicit ("when the upstream service is unavailable, the system shall…").

**Decision logic.** A completeness report should list the gaps found and the techniques applied. Acknowledge that completeness is never fully provable — but show the work.

---

## Anti-patterns to flag aggressively

Common defects worth a named callout in the log:

- **Solution-as-requirement.** Names a tech or UI control. Fix by restating as behaviour. (Violates: Implementation-independent.)
- **Compound requirement.** Joins multiple behaviours with "and". Fix by splitting. (Violates: Cohesive, often Testable.)
- **Weasel modifiers.** Unquantified adjectives. Fix by quantifying or striking. (Violates: Unambiguous, Testable.)
- **Implicit actor.** "Reports shall be generated." By whom? Make subject explicit. (Violates: Unambiguous, sometimes Testable.)
- **Untestable statement.** No objective pass/fail. Fix with measurable criteria. (Violates: Testable.)
- **Terminology drift.** Same concept named multiple ways. Fix with glossary. (Violates: Consistent.)
- **Stealth scope creep.** Quietly assumes an out-of-scope feature. Flag. (Violates: Relevant.)
- **Orphan.** No traceable source. Either find the source or remove. (Violates: Traceable.)

## Output

Three artefacts:

1. **Cleaned requirements** — rewrites of the inputs (or, in Author mode, the extracted requirements), in whatever format the user has indicated or already uses.
2. **Defect log** — grouped by requirement so the reader fixing REQ-007 sees everything wrong with REQ-007 in one place. Only list characteristics that failed, not ones that passed. End the log with the set-level findings.
3. **Open questions** — anything blocking Correctness that needs a stakeholder answer. Open questions are more valuable than guesses dressed as requirements.

## Quick-pass mode

If the user signals they want fast triage rather than full audit (phrases like "just glance at these", "quick check", "what jumps out", "spot the worst ones"), skip the full log. Surface the three or four highest-impact defects, name the characteristic each violates, and offer one rewrite per top defect. Match depth to the user's stated ask.
