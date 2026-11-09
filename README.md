# Resilience Atlas: public teaching edition

An interactive teaching research document about supply chain resilience, reverse stress testing, and evidence-based recovery decisions.

## Teaching scenario

The scenario uses role labels rather than organization identities:

- **High Tech:** technology partner.
- **SI:** systems integrator and operational decision owner.
- **ISV:** independent software vendor providing analytical methods.
- **Supplier Knowledge Graph:** the dependency-mapping concept.

Scenario personnel are described by responsibility, not by name. Real research authors retain scholarly credit in the bibliography. The scenario is illustrative, not a confirmed partnership, product capability, or staffing commitment.

## Open and publish

- Open [index.html](./index.html) directly in a modern browser, or run `npm start` and visit `http://127.0.0.1:4173`.
- [Start-Atlas.ps1](./Start-Atlas.ps1) opens the local preview. The server binds to loopback only.
- Run `npm run build` to create the self-contained public site in `dist`. Publish **only `dist`**, not the checkout root. The build copies an explicit allowlist and rejects unexpected existing output files rather than silently publishing them.
- No installation, API keys, source documents, external AI, tracking, or network assets are needed to run or build the teaching site.
- Preparing the public edition does not deploy it, push a commit, or change the repository's visibility.

## Study features

- **Teaching brief:** an opening explanation, six core distinctions, ten discussion questions, pinned concepts, learner notes, and export / print.
- **Search:** press `/` or `Ctrl+K` to search concepts and public research / teaching summaries. Enter opens the first result.
- **Source notes:** citations open original editorial paraphrases at source-reference anchors, not full source text. Public DOI links are supplied where available.
- **Concept atlas:** explore 35 connected concepts, pin essentials, and practice active recall.
- **Reverse stress lab:** vary a synthetic single-layer normal-model example. It is not a production solver, forecast, or calibrated risk score.

Notes stay in the same browser and origin; exports include whatever the learner types. Review those notes before sharing. The public edition uses a new storage key and does not import earlier private briefing notes. Earlier notes remain untouched in their old browser storage.

## Attribution and evidence boundaries

The starting collection contributes six manuscript / publication entries representing five research works, plus five anonymized teaching adaptations. Ten additional public resources extend that foundation: a National Research Council consensus report, NIST cyber-resiliency guidance, firm-level network research, an automotive risk-exposure case, network viability research, interbank reverse testing, NASA model-credibility guidance, a government multi-criteria manual, the cited financial RST method, and an open causal-inference textbook.

The [source library](./index.html#sources) provides six question-led reading paths, direct public reading links, full titles and authors, dates, evidence types, access notes, plain-language takeaways, and limitations. Filter by research / guidance, resources beyond the folder, starting material, or teaching notes. References are also attached to concepts, the overview, lab, cases, engineering guidance, discussion questions, and exports.

Public links and records were checked on **9 November 2026** using official publications, author / institutional repositories, PubMed Central, and DOI metadata. Some links provide full text; others provide a verified public abstract or official scope. These distinctions are explicit. Verification means checking the linked record and stated evidence basis, not independently replicating a study or guaranteeing future availability.

The revised S05 manuscript is the main copper-case reference. Its 5%, 25%, and 50% thresholds must not be merged with the explainer's older 20% middle threshold. An open related preprint is available as [arXiv:2511.07289v2](https://arxiv.org/abs/2511.07289v2), but the exact revised S05 text and its "in press" status were **not** publicly matched. The related preprint does not verify the revised country rankings or final journal publication. S06's published issue is January 2021, with online publication in August 2020; its linked preprint uses a slightly different title.

Summaries, examples, and diagrams are editorial synthesis. Research author names and public DOI links are retained for attribution, not to identify the teaching scenario's participants. The source notes are paraphrases, not quotations or reproductions. Page, paragraph, and slide labels preserve provenance but do not imply that the public notes are transcripts or independently accessible private evidence.

Private originals, original filenames, correspondence, contact details, biographies, full-text extracts, and the old extraction utilities are not part of the public distribution. Existing private copies remain unchanged and Git-ignored. The local server denies `sources.js`, `source-text`, and all original-document routes. Do not force-add ignored research or publish the checkout through an unrestricted static server.

## Verify

- `npm test`: public source coverage, citation anchors, aliases, scholarly credit, source-download boundaries, and script parsing.
- `npm run build`: create the allowlisted public distribution.
- `npm ci`, then `npm run test:browser`: install development-only Playwright and run interaction checks using the Edge browser. The suite covers public-source search, all source readers, notes isolation, exports / printing, deep links, offline use, and responsive layouts.

All runtime and build dependencies are built into Node.js; Playwright is needed only for browser tests.
