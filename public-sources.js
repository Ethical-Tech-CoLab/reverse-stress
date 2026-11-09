/* Editorial paraphrases of starting material and verified public resources. No source files are reproduced. */
window.RESEARCH_SOURCES = [
  {
    id: "S01",
    sections: [
      { label: "para. 4", text: "Teaching scenario: combine an ISV's resilience method with High Tech engineering and an SI-selected operational problem. This describes a learning exercise, not a confirmed collaboration." },
      { label: "para. 9", text: "Distinguish recovery capacity built into a network from support provided by external actors. The vaccine-to-industrial comparison is an analogy to test, not evidence that an intervention already works for the SI." },
      { label: "para. 12", text: "A tiered exercise can begin with scoping, progress to quantitative stress tests and investment comparisons, and only then consider simulation or an assistant. Timelines and product maturity must not be inferred from this teaching sequence." },
      { label: "para. 36", text: "Multi-criteria decision analysis makes competing objectives explicit, including cost, resilience, efficiency, safety, and policy requirements. Criteria and weights require accountable stakeholder judgment." },
      { label: "para. 40", text: "Before using supplier, part, and logistics records, establish data permissions, access controls, retention, and the required processing boundary. A cloud architecture does not establish compliance by itself." },
      { label: "para. 41", text: "An engineering exercise should compare reproducible forward and reverse tests and evaluate the results against known historical disruptions. More compute does not substitute for validation." },
      { label: "para. 42", text: "An assistant could explain approved model outputs and evidence. This is a proposed decision-support interface, not an implemented product or an autonomous authority for sourcing decisions." },
      { label: "para. 46", text: "Measure node counts, edge counts, tiers, scenario counts, memory, and end-to-end runtime at the intended data granularity before making scale claims." },
      { label: "para. 47", text: "Clarify the current platform, integration interfaces, hosting, intellectual property, licensing, and engineering ownership. Treat each as a discovery question rather than an assumed capability." },
      { label: "para. 49", text: "Choose one program, material path, or part family and name the protected function, measurable loss threshold, time horizon, and SI decision owner." },
      { label: "para. 50", text: "A useful scoping outcome is one bounded use case with an operational owner, an authorized data path, an engineering counterpart, and an agreed next evaluation step." }
    ]
  },
  {
    id: "S02",
    sections: [
      { label: "para. 12", text: "Causal reasoning is a discovery discipline: state the intervention question and challenge whether the evidence supports an effect rather than a correlation." },
      { label: "para. 18", text: "Probabilistic review should examine dependency assumptions, conditional inference, uncertainty, and what the reported weights actually represent." },
      { label: "para. 24", text: "Fault experiments should be measurable and repeatable, with a defined baseline and controlled interpretation of model outputs." },
      { label: "para. 30", text: "Observability should let reviewers trace an inferred cascade to its input data, assumptions, and intermediate steps." },
      { label: "para. 36", text: "An applied engineering owner can receive the scientific formulation and translate it into a bounded prototype and validation plan. This role is illustrative, not a staffing assignment." },
      { label: "para. 40", text: "Begin with focused scientific review of the causal, statistical, experimental, and observability foundations. Establish the quality bar before committing to a platform." },
      { label: "para. 42", text: "Evaluate whether a Supplier Knowledge Graph can represent the chosen dependencies and edge histories, then define the interface and handoff to engineering. Compatibility is not assumed." },
      { label: "para. 44", text: "A prototype should ingest an authorized example, run reverse tests, trace candidate cascades, and compare the operational value of feasible interventions." },
      { label: "para. 46", text: "Proceed beyond discovery only with credible science, a practical architecture, a funding and ownership path, and a defensible link between specified outcomes, inferred configurations, and measurable intervention value." }
    ]
  },
  {
    id: "S03",
    sections: [
      { label: "para. 71", text: "RST asks how an assumed shortfall could be allocated upstream under the statistical model. Shipment variability and co-movement affect that allocation. The inference is conditional: it does not estimate how likely the shortfall is to occur." },
      { label: "para. 103", text: "A synthetic single-layer example can illustrate a central solution using absolute-volume covariance. Such an example differs from a research run's preprocessing, weighting, and scenario sampling and must not be presented as reported evidence." },
      { label: "para. 104", text: "A large, steady supplier may contribute less to a model's central shortfall than smaller suppliers with volatile, correlated flows. Shared upstream dependencies are a reason to investigate that pattern, not a causal conclusion from correlation alone." },
      { label: "para. 106", text: "Version caution: this explainer discusses 5%, 20%, and 50% loss thresholds and older case numbers. The revised manuscript uses a 25% middle threshold. Do not mix the versions or treat the explainer's longer-horizon framing as the revised case definition." },
      { label: "para. 133", text: "Teaching hypothesis: a Supplier Knowledge Graph could supply a dependency topology and support forward experiments. Whether any particular implementation has those capabilities requires independent verification." },
      { label: "para. 138", text: "A graph alone is insufficient for covariance-based inference. Edges also need quantities over time, obtained from authorized trade, order, receipt, or comparable transaction histories." },
      { label: "para. 155", text: "Proposed learning loop: define a protected outcome, map dependencies and history, run reverse tests at meaningful thresholds, inspect configurations, forward-test feasible responses, then review and update." },
      { label: "para. 157", text: "An outcome specification needs a protected node, an unacceptable shortfall, and a time horizon tied to a real operational consequence. Teaching examples are not actual program commitments." },
      { label: "para. 197", text: "Ask how the team defines resilience, selects failure thresholds, and connects those thresholds to customer or mission consequences." },
      { label: "para. 198", text: "Ask whether the method has been tested on firm-level networks and what cadence, history length, and coverage each edge requires." },
      { label: "para. 199", text: "Ask how multi-input production, qualified substitutes, inventory, by-products, and recycling affect applicability. The simplified research network does not settle those questions." },
      { label: "para. 200", text: "Ask how supplier weights and covariance windows are chosen and whether contributor rankings remain stable when those choices change." },
      { label: "para. 202", text: "Ask for held-out historical disruption tests that use only data available before the loss being explained. Avoid validation leakage from later observations." },
      { label: "para. 204", text: "Clarify model ownership, product boundaries, licensing, and integration responsibilities before deciding whether to build, partner, or integrate." },
      { label: "para. 224", text: "Back-propagation here means rerunning a supplier-loss inference upstream through material tiers. It is not neural-network training and does not imply that an LLM performs the scientific calculation." }
    ]
  },
  {
    id: "S04",
    sections: [
      { label: "p. 1", text: "The earlier supplied manuscript describes inverse loss inference in a layered supply network and illustrates it with US copper-wire imports. Its abstract highlights Canada, Chile, and Mexico; these version-specific findings must not be merged with the revised manuscript." },
      { label: "Public abstract", text: "The public arXiv v2 record describes starting with a specified disruption at one entity and inferring contributing changes across a multilayer supply network. Its copper-wire example highlights Canada, Chile, and Mexico. The public preprint establishes a research lineage; it does not verify the differently titled supplied revision's publication status or rankings." }
    ]
  },
  {
    id: "S05",
    sections: [
      { label: "p. 1", text: "The revised manuscript presents a reverse stress-testing method that starts with an end-user loss and infers plausible upstream changes. Its copper-case abstract highlights Canada, Chile, and Zambia, with some contributors changing by severity." },
      { label: "p. 2", text: "Forward testing applies an analyst-selected shock and evaluates impact. Reverse testing instead starts from an undesirable outcome and searches for plausible contributing configurations. Both approaches remain limited by their models and data." },
      { label: "p. 4", text: "The five-step framework constructs a layered network, solves a single-layer reverse test, propagates inferred losses upstream, generates alternatives while controlling scenario growth, and aggregates the outputs. The case targets 5%, 25%, and 50% reductions in US copper-wire receipts." },
      { label: "p. 7", text: "Central scenarios identify upstream contributors at multiple material tiers. The US itself appears at intermediate stages, and the Democratic Republic of the Congo is prominent in modeled ore losses despite not being among the top five ore exporters. Volatility and dependencies matter alongside volume." },
      { label: "p. 8", text: "Sampled loss distributions and central point estimates can emphasize different entities. Their rankings should not be treated as interchangeable or as a definitive list of future failures." },
      { label: "p. 9", text: "Supply-chain illumination and risk-category scores reveal exposure, while reverse testing asks which joint conditions make a specified loss possible. This is an analytical extension, not a replacement for basic supplier management." },
      { label: "p. 10", text: "Several small and medium contributors can align into a systemic loss; contributors may differ across severity thresholds. The model assumes multivariate normal changes centered at zero and that transaction history encodes the relevant dependencies. New geopolitical or operational regimes can challenge those assumptions." },
      { label: "p. 11", text: "The authors propose rigorous historical back-testing, input sensitivity analysis, and forward testing of reverse-inferred shocks as further validation. The model is a companion to subject-matter judgment. Its network construction simplifies production into ordinal material transformations." },
      { label: "p. 12", text: "For each receiving node, historical supplier flows define a covariance matrix. Under the assumed normal model, the central loss configuration is proportional to covariance row sums, subject to a fixed target loss. Alternatives follow principal directions, and inferred losses are propagated upstream, combining converging paths and clustering similar configurations." },
      { label: "p. 13", text: "Scenario combinations are approximated to control computation. Inferred losses are unconstrained and may exceed historical mean trade volumes, so they are not automatically physically feasible. Densities normalized over generated scenarios are not calibrated continuous event probabilities; smoothed distributions summarize model-relative contributions conditional on a loss." },
      { label: "p. 14", text: "The copper example uses UN Comtrade records from January 2018 through December 2024 for ore, unrefined copper, refined copper, and wire, with each country–good pair represented separately. It tests 5%, 25%, and 50% reductions in average monthly receipts using q = 0.5. Recycling, added materials, and by-products are simplified away." }
    ]
  },
  {
    id: "S06",
    sections: [
      { label: "p. 5", text: "Proposed distinctions: adaptability changes the system to regain fitness; agility is response speed; reliability means operating within acceptable bounds; resilience means recovering critical functions and adapting after disruption. These are complementary goals, not interchangeable labels." },
      { label: "p. 6", text: "The mathematical framing distinguishes acceptable performance over time from recovery per disruptive event. A reliability measure depends on both system variability and the chosen tolerance bounds; a recovery measure also needs a time component." },
      { label: "p. 7", text: "Resistance limits functional damage under pressure; robustness withstands pressure without functional damage. Security concerns protections, safety concerns harmful outcomes, and the paper's sustainability framing concerns the outside resources needed to maintain performance." },
      { label: "p. 8", text: "The paper's nine proposed concepts have different roles. Adaptability and agility can support recovery; recovery can improve reliability by reducing time outside tolerance. Resilience complements prevention and protection but does not prove that damage will be avoided." }
    ]
  },
  {
    id: "S07",
    sections: [
      { label: "p. 1", text: "The 2020 review adds 94 studies from 2017–2019 to an earlier review of 47 studies. It identifies gaps in measurable resilience, unknown-threat treatment, and connections to transportation and command-and-control networks." },
      { label: "p. 13", text: "Within the 94-paper historical sample, 22% provide an explicitly defined resilience measure, 26% use proxies, and 52% do not propose a measure or are mainly qualitative. These percentages do not describe the entire field or its current state." },
      { label: "p. 16", text: "The review calls for clearer definitions, measurable system-level models, and attention to connected transportation, communication, and command-and-control systems. It recommends matching analytical sophistication to problem complexity through a tiered approach." }
    ]
  },
  {
    id: "S08",
    sections: [
      { label: "p. 1", text: "The vaccine commentary argues that efficiency-oriented supply chains and component-level risk controls do not by themselves establish recovery from systemic disruption. Planning, absorption, recovery, and adaptation require network-level attention." },
      { label: "p. 2", text: "Resilience-by-design builds recovery into a network through qualified alternatives, interchangeable materials, buffers, and plans. Resilience-by-intervention provides external support such as stockpiles, emergency funding, transport, or regulatory action. Operation Warp Speed illustrates external portfolio support; transfer to another sector remains an analogy to validate." }
    ]
  },
  {
    id: "S09",
    sections: [
      { label: "p. 1", text: "Successful nanotechnology and vaccine innovation can coexist with brittle manufacturing and distribution dependencies. Technical success in a product does not guarantee that its supporting supply network can scale or recover." },
      { label: "p. 3", text: "Network science and resilience analytics complement safety and risk controls. Multi-criteria decision analysis can help organize competing priorities, but explicit judgment and appropriate sector constraints remain necessary." },
      { label: "p. 4", text: "The review recommends standard terminology, network science with richer data, and explicit trade-off analysis. Models should include associated workforce, logistics, governance, and social dependencies, balancing resilience with efficiency, sustainability, equity, health, and environmental goals. Its risk–resilience comparison emphasizes recovery over time." }
    ]
  },
  {
    id: "S10",
    sections: [
      { label: "slide 3", text: "Scientific role: challenge assumptions, select meaningful performance measures, and design tests that distinguish plausible patterns from validated decision evidence." },
      { label: "slide 4", text: "Strategy and governance role: identify decision value, define stakeholder objectives, and assign responsibility for model use and intervention approval." },
      { label: "slide 5", text: "Methods and operations role: map dependencies, explain the analytics, and translate results into feasible operational questions and investment choices." },
      { label: "slide 6", text: "Platform role: connect authorized data, model interfaces, reproducible execution, observability, and usable decision-support workflows." },
      { label: "slide 8", text: "Teaching roles are not personal biographies or confirmed staffing. Retain scholarly author credit separately from an anonymized account of who might fill an implementation role." }
    ]
  },
  {
    id: "S11",
    sections: [
      { label: "p. 2", text: "Different functional lenses emphasize supplier visibility, risk controls, cyber dependencies, strategic sourcing, or recovery analytics. A complete discussion distinguishes those lenses rather than labeling all of them resilience." },
      { label: "p. 3", text: "A teaching continuum runs from reactive supplier performance management through proactive risk management to adaptive recovery analytics. Identify critical functions, examine dependencies, test loss configurations, and compare recovery options. This is not a validated maturity-scoring instrument." }
    ]
  },
  {
    id: "S12",
    sections: [
      { label: "Summary", text: "The National Research Council's 2012 consensus report treats resilience as preparing and planning for adverse events, absorbing impacts, recovering, and adapting. This provides a public foundation for a lifecycle definition instead of equating resilience with prevention or one immediate-loss number." },
      { label: "Shared responsibility", text: "Resilience involves public, private, community, and institutional decisions as well as assets. Agree on the protected function, responsibilities, and recovery priorities before selecting metrics. This is a national and community framework, not validation of a supply-chain algorithm." }
    ]
  },
  {
    id: "S13",
    sections: [
      { label: "Definition", text: "NIST defines cyber resiliency through anticipating, withstanding, recovering from, and adapting to adverse conditions affecting systems that depend on cyber resources. The purpose is to sustain mission or business objectives in a contested cyber environment, not merely to prevent every compromise." },
      { label: "Engineering scope", text: "The systems-engineering context helps connect physical supply functions to the data, communications, and control systems needed for them to work and recover. Citing this guidance does not certify a cloud architecture or prove that a physical supplier-loss model is accurate." }
    ]
  },
  {
    id: "S14",
    sections: [
      { label: "Abstract", text: "Diem and colleagues construct a national firm-level production network from transaction data and simulate production effects of firm failures. Network position adds information that firm size alone cannot explain. Their reported systemic-impact values are conditional model results, not losses observed in a historical disruption." },
      { label: "Production network", text: "The production representation distinguishes essential from non-essential inputs and connects supplier availability to feasible output. It illustrates why an implementation needs more than a graph of company names: product roles and production assumptions affect how a loss propagates. This model is not the copper RST algorithm." }
    ]
  },
  {
    id: "S15",
    sections: [
      { label: "Abstract", text: "The publicly available MIT record describes an automotive risk-exposure model developed during a three-year industry engagement. It first assesses how a disruption at different points affects operations and postpones estimating particular hazard probabilities until impact is understood. The authors report using the model to reveal exposures and compare mitigation and contingency options. The public abstract does not establish that the approach transfers unchanged to every sector." }
    ]
  },
  {
    id: "S16",
    sections: [
      { label: "Abstract", text: "Ivanov and Dolgui describe intertwined supply networks as connected supply chains that collectively provide goods and services. A position paper and illustrative dynamic model motivate studying system-wide survivability, not just resilience of a single focal chain." },
      { label: "Viability", text: "The viability perspective asks whether the broader network can continue providing essential services while organizations and relationships change. It broadens the decision boundary but is not evidence that any particular redesign, redundancy, or adaptation is optimal." }
    ]
  },
  {
    id: "S17",
    sections: [
      { label: "Abstract", text: "Grigat and Caccioli reverse financial contagion dynamics to find a small external shock that would produce a chosen systemic loss in an interbank model. Their study illustrates outcome-first reasoning in a network different from a physical production system." },
      { label: "Objective", text: "This reverse test minimizes the size of an initiating shock. A most-likely-configuration method instead optimizes likelihood under statistical assumptions. Both begin with an outcome, but their objectives and results are not interchangeable; neither automatically estimates an unconditional probability of the target event." }
    ]
  },
  {
    id: "S18",
    sections: [
      { label: "Scope", text: "NASA-STD-7009B establishes common practices for developing, accepting, and using models and simulations, with acceptance criteria defined for the program or project. Its official scope emphasizes model credibility across development and use. In this teaching scenario, use that principle to agree on evidence, intended decisions, and acceptance criteria before judging a prototype successful. Specific supply-chain tests remain a separate teaching design." }
    ]
  },
  {
    id: "S19",
    sections: [
      { label: "Appraisal", text: "The UK government's multi-criteria analysis manual supports appraising policy and other decisions against multiple objectives. Use it to make the criteria and judgment behind option comparisons explicit, rather than treating a weighted score as objective truth. It is decision-method guidance, not empirical proof that a particular supply intervention will improve recovery." }
    ]
  },
  {
    id: "S20",
    sections: [
      { label: "Research summary", text: "EDHEC's public summary of Kopeliovich and colleagues' financial paper describes fixing a loss level, selecting the most likely scenario producing it, and using principal components to construct different alternatives with the same loss. The supplied supply-chain revision cites this financial method. Transferring the formulation requires testing physical flows, production constraints, and whether the statistical assumptions fit the new system." }
    ]
  },
  {
    id: "S21",
    sections: [
      { label: "Methods", text: "Hernán and Robins provide a freely accessible methods book organized from causal inference without models through modeling and longitudinal data. It is a useful next step when moving from an association-based loss configuration to a claim about an intervention. Specify what would be changed, the comparison, and the identifying assumptions; the existence of correlated supplier flows alone does not establish the effect of replacing a supplier." }
    ]
  }
];
