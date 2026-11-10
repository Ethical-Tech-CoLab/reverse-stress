# Resilience Atlas: public teaching edition

## [Explore the live Resilience Atlas](https://ethical-tech-colab.github.io/reverse-stress/)

An interactive, browser-based guide to supply chain resilience, reverse stress testing, and evidence-based recovery decisions. No installation or account is required.

**The central idea:** start with an outcome that must not fail, work backward to identify disruptions that could cause that failure, then test whether proposed recovery actions actually help. Reverse stress testing complements forward scenario testing; it does not predict which disruption will happen.

This atlas is for learners, researchers, and teams exploring these methods. **It is teaching material, not a validated operational tool or an established best-practice standard.**

## Start here

1. Read the [teaching brief](https://ethical-tech-colab.github.io/reverse-stress/#brief) for the essentials and discussion questions.
2. Explore the [concept atlas](https://ethical-tech-colab.github.io/reverse-stress/#concepts) to distinguish resilience, robustness, recovery, and failure thresholds.
3. Try the [reverse stress lab](https://ethical-tech-colab.github.io/reverse-stress/#lab) to see how assumptions change a synthetic example. Its outputs are not calibrated risk scores.
4. Follow the [source library](https://ethical-tech-colab.github.io/reverse-stress/#sources) to examine the evidence and its limits, then use the [co-engineering guidance](https://ethical-tech-colab.github.io/reverse-stress/#engineering) to frame a scoped pilot.

## What you can do

- **Teaching brief:** read an opening explanation, six core distinctions, and ten discussion questions; collect pinned concepts and learner notes; export or print your brief.
- **Search:** press `/` or `Ctrl+K` to search concepts and public research / teaching summaries. Enter opens the first result.
- **Source notes:** follow citations to editorial paraphrases at source-reference anchors, not full source text. Public DOI links are supplied where available.
- **Concept atlas:** explore 35 connected concepts, pin essentials, and practice active recall.
- **Reverse stress lab:** vary a synthetic single-layer normal-model example. It is not a production solver, forecast, or calibrated risk score.

The app uses no external AI or tracking and does not upload your notes. Notes stay in the same browser and origin; they do not sync across devices or between the live site and a local copy. Exports include whatever you type, so review them before sharing. The public edition does not import earlier private briefing notes; those remain untouched in their old browser storage.

## Understanding the teaching scenario

The scenario uses role labels rather than organization identities: **High Tech** is the technology partner, **SI** is the systems integrator and operational decision owner, and **ISV** is the independent software vendor providing analytical methods. **Supplier Knowledge Graph** means the dependency-mapping concept, not a verified product capability.

Scenario personnel are described by responsibility, not by name. Real research authors retain scholarly credit in the bibliography. The scenario is illustrative, not a confirmed partnership, product capability, or staffing commitment.

## Further research and work to do

The following is a **proposed roadmap**, not implemented functionality or a claim that the techniques are ready for production. The goal is to turn teaching examples into reproducible, independently challenged practices for building and running resilience analyses.

| Priority | Research or implementation work | Evidence needed before operational use |
|---|---|---|
| 1. Define the decision | Choose one critical service or output. Specify its owner, units, unacceptable shortfall, time horizon, and feasible interventions. | An agreed decision charter with measurable failure and recovery criteria, constraints, and explicit exclusions. |
| 2. Establish data provenance | Build a versioned dependency graph with capacities, inventories, lead times, substitution limits, and recovery times. Record data rights, freshness, missing links, and uncertainty. | A documented schema, provenance trail, quality checks, and sensitivity analysis for missing or stale data; no assumption that an incomplete graph is complete. |
| 3. Reproduce the methods | Reproduce an openly accessible study with legally usable data and a versioned implementation. Keep the financial, interbank, and supply-chain formulations distinct. | Documented equations, assumptions, solver settings, reference outputs, and independent reproduction. Resolve the S05 version gap before treating its revised results as a benchmark. |
| 4. Challenge model assumptions | Compare the lab's normal-model illustration with correlated disruptions, heavy tails, nonlinear dependencies, multi-layer networks, and time-dependent recovery where supported by evidence. | Tests showing which assumptions change failure scenarios or intervention rankings, with uncertainty ranges and stated validity limits. A plausible failure path is not a calibrated probability. |
| 5. Build a benchmark and test harness | Create small synthetic networks with known outcomes and permissioned historical cases. Compare reverse testing with forward simulation, simple heuristics, and a no-intervention baseline. | Feasibility and constraint checks, solver convergence checks, reproducible scenarios, and out-of-sample evaluation where data permit. Track missed failures, false alarms, runtime, recovery time, and service shortfall. |
| 6. Evaluate recovery decisions | Compare interventions under budget, staffing, timing, and supplier constraints. Make stakeholder objectives and multi-criteria weights explicit. | Sensitivity and robustness results across plausible models and weights. Separate simulated improvements from evidence of real-world causal benefit. |
| 7. Run a bounded pilot | Start in shadow mode: analysts review recommendations without automatically changing operations. Assign a decision owner and run a tabletop recovery exercise. | Pre-agreed acceptance and stop criteria, human approval, escalation and rollback procedures, and an after-action review against observed outcomes. |
| 8. Establish operating practice | Version data, models, scenarios, and decisions; monitor data freshness, model drift, and solver failures. Set review cadence, access controls, incident handling, and retirement criteria. | A maintained runbook, audit trail, periodic recovery drills, and independent model review. Promote practices only after repeated evaluation across relevant settings. |

Use the source library as a research starting point: **NIST cyber-resiliency guidance** for dependency and recovery questions, **NASA model-credibility guidance** for model evaluation, the **multi-criteria analysis manual** for transparent tradeoffs, and the **causal-inference textbook** for distinguishing intervention effects from associations. These resources inform the work; they do not certify this atlas or transfer findings automatically to a new setting.

Useful contributions include reproducible benchmark cases, data-validation rules, documented negative results, assumption-sensitivity experiments, and pilot runbook templates. Each should state the decision it supports, its evidence basis, how to reproduce it, and where it must not be used. Use synthetic or explicitly authorized data; do not contribute private source documents or operationally sensitive supplier information.

## Attribution and evidence boundaries

The starting collection contributes six manuscript / publication entries representing five research works, plus five anonymized teaching adaptations. Ten additional public resources extend that foundation: a National Research Council consensus report, NIST cyber-resiliency guidance, firm-level network research, an automotive risk-exposure case, network viability research, interbank reverse testing, NASA model-credibility guidance, a government multi-criteria manual, the cited financial RST method, and an open causal-inference textbook.

The [source library](https://ethical-tech-colab.github.io/reverse-stress/#sources) provides six question-led reading paths, direct public reading links, full titles and authors, dates, evidence types, access notes, plain-language takeaways, and limitations. Filter by research / guidance, resources beyond the folder, starting material, or teaching notes. References are also attached to concepts, the overview, lab, cases, engineering guidance, discussion questions, and exports.

Public links and records were checked on **9 November 2026** using official publications, author / institutional repositories, PubMed Central, and DOI metadata. Some links provide full text; others provide a verified public abstract or official scope. These distinctions are explicit. Verification means checking the linked record and stated evidence basis, not independently replicating a study or guaranteeing future availability.

The revised S05 manuscript is the main copper-case reference. Its 5%, 25%, and 50% thresholds must not be merged with the explainer's older 20% middle threshold. An open related preprint is available as [arXiv:2511.07289v2](https://arxiv.org/abs/2511.07289v2), but the exact revised S05 text and its "in press" status were **not** publicly matched. The related preprint does not verify the revised country rankings or final journal publication. S06's published issue is January 2021, with online publication in August 2020; its linked preprint uses a slightly different title.

Summaries, examples, and diagrams are editorial synthesis. Research author names and public DOI links are retained for attribution, not to identify the teaching scenario's participants. The source notes are paraphrases, not quotations or reproductions. Page, paragraph, and slide labels preserve provenance but do not imply that the public notes are transcripts or independently accessible private evidence.

Private originals, original filenames, correspondence, contact details, biographies, full-text extracts, and the old extraction utilities are not part of the public distribution. Existing private copies remain unchanged and Git-ignored. The local server denies `sources.js`, `source-text`, and all original-document routes. Do not force-add ignored research or publish the checkout through an unrestricted static server.

## For contributors

The site uses plain HTML, CSS, and JavaScript. Runtime and build code use only built-in Node.js modules; Playwright is needed only for browser tests.

- `npm test`: public source coverage, citation anchors, aliases, scholarly credit, source-download boundaries, and script parsing.
- `npm run build`: create the allowlisted public distribution.
- `npm ci`, then `npm run test:browser`: install development-only Playwright and run interaction checks using the Edge browser. The suite covers public-source search, all source readers, notes isolation, exports / printing, deep links, offline use, and responsive layouts.

The `Deploy GitHub Pages` workflow builds and publishes **only `dist`** on pushes to `main`, or when run manually from GitHub Actions. Pages settings must use **GitHub Actions** as the deployment source. The build copies an explicit allowlist and rejects unexpected existing output files; never publish the checkout root.
