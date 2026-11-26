# Cellular Biology

An interactive 3D atlas of human cell biology, with links to radiology and clinical practice, by jefrix software. Open a module from the home screen, use Previous and Next (or the arrow keys) to follow its chapters, or share a chapter URL such as `#krebs` or `#blood/rbc`. Every lesson also works in text mode if the 3D viewer cannot start.

## Modules

**Cell mechanisms**

| Module | File | Chapters |
|---|---|---|
| Energy | `modules/energy.js` | Cell city, fuel, glycolysis, link reaction, Krebs cycle, electron transport chain, ATP ledger (with a red-cell prediction exercise), Krebs control points and the pentose phosphate pathway (with G6PD deficiency), the Warburg effect and FDG-PET |
| Protein factory | `modules/protein.js` | Chromatin, epigenetic marks and beta-cell transcription factors at the INS promoter, then human insulin from gene and mRNA through the ribosome, ER, Golgi and granule to export |
| Recycling & cleanup | `modules/cleanup.js` | Intake, lysosome, proteasome, autophagy, peroxisome, storage diseases |
| Membranes & transport | `modules/transport.js` | Passive crossing routes, red cell osmosis, the sodium–potassium pump, channels versus carriers (with saturation kinetics), secondary active transport (SGLT1/SGLT2, NCX), polarized epithelia and tight junctions |
| Division & radiation | `modules/division.js` | Cell cycle, mitosis, DNA damage and repair, cell fate, apoptosis versus necrosis, survival curves, fractionation and dose |
| Cytoskeleton | `modules/cytoskeleton.js` | Actin, microtubules (dynamic instability, taxane and colchicine effects) and intermediate filaments; kinesin, dynein and myosin V stepping on ATP; a neutrophil rolling, crawling and squeezing out of a vessel |
| Signal transduction | `modules/signaling.js` | GPCRs with Gs, Gi and cholera toxin driving adenylyl cyclase, cAMP, PKA and phosphodiesterase; receptor tyrosine kinase dimerization and the RAS–RAF–MEK–ERK cascade (with oncogenic RAS and a KRAS G12C inhibitor); PLCβ, IP₃ and DAG, calcium puffs, waves and sparks, calmodulin and SERCA |
| Cell junctions | `modules/junctions.js` | Claudin and occludin tight junctions as gate and fence (sealed, leaky claudin-2, lost); E-cadherin adherens belts and desmosomes with keratin under shear and in pemphigus; connexin gap junctions open and closed |
| Lipid & cholesterol | `modules/lipids.js` | LDL receptor uptake, SREBP-2 feedback, statins, PCSK9 inhibitors and familial hypercholesterolemia; fatty streak to stable and vulnerable plaque with coronary calcium scoring and CT angiography; StAR and CYP11A1 making pregnenolone for cortisol, aldosterone and sex steroids (with StAR deficiency) |
| Mitochondrial dynamics | `modules/mitochondria.js` | DRP1 fission at ER contacts and MFN1/2 and OPA1 fusion; superoxide leak at complexes I and III, SOD2, glutathione peroxidase and NADPH recharging (balanced, overwhelmed, low NADPH); PINK1/Parkin mitophagy in healthy, depolarized and PINK1/Parkin-deficient mitochondria |
| Stem cells | `modules/stem.js` | The potency ladder (totipotent, pluripotent, multipotent, differentiated), asymmetric versus symmetric division in a niche and the LGR5⁺ intestinal crypt; how one genome makes different cells with signaling cues, master transcription factors (MyoD, ASCL1, GATA1), bivalent and Polycomb-silenced chromatin on Waddington’s landscape; the bone marrow HSC niche, the hematopoiesis tree, Yamanaka (OSKM) iPSC reprogramming and its risks, and red versus yellow marrow on T1 MRI with diffuse marrow uptake after G-CSF on FDG-PET |

**Cells in tissues**

| Module | File | Chapters |
|---|---|---|
| Neural cells | `modules/neural.js` | Neurons and glia, resting potential, a live Hodgkin–Huxley spike, myelin, synapse, integration, axonal transport, stroke and MS imaging |
| Muscle cells | `modules/muscle.js` | Excitation–contraction, muscle architecture, fiber types, three muscle tissues, the cardiac pacemaker (funny current, AV delay, His–Purkinje, connexin-43 gap junctions) with a live modeled ECG and a heart-rate switch |
| Blood | `modules/blood.js` | A to-scale line-up of the red cell, five white cell types and platelets (each card has a deep link such as `#blood/plt`), then platelets and clotting: megakaryocytes, primary and secondary hemostasis, CT and CT angiography |
| Hormones & endocrine | `modules/hormones.js` | Gland map, receptor routes, endocrine vs exocrine pancreas, islet, beta cell release, muscle GLUT4 response, fuel balance, diabetes, FDG-PET preparation, sex-hormone patterns, feedback loops |
| Nephron cells | `modules/nephron.js` | Filtration, proximal tubule glucose recovery, loop of Henle, collecting duct hormones |
| Reproductive cells | `modules/reproduction.js` | Gametes, meiosis, fertilization, early cleavage |
| Hepatocyte | `modules/hepatocyte.js` | Fed vs fasted glycogen storage and gluconeogenesis, the urea cycle (with OTC deficiency), CYP450 Phase I/II drug metabolism, fatty liver on CT and the liver as the Deauville reference on FDG-PET |
| Bone cells | `modules/bone.js` | Osteoclast, osteoblast and osteocyte remodeling under RANKL/OPG control, trabecular loss with DEXA T-scores, lytic vs sclerotic lesions on X-ray |
| Cancer biology | `modules/cancer.js` | Oncogenes (RAS, MYC) and tumor suppressors (p53, RB) at the cell cycle checkpoints, angiogenesis and the metastatic cascade, FDG-avid tumors with necrotic cores on PET, CT and PET/CT |
| Immune activation | `modules/immune.js` | MHC class I to CD8⁺ and class II to CD4⁺ T cells, complement opsonization, membrane attack and acute inflammation, antibodies and cytotoxic T-cell killing |
| Blood–brain barrier | `modules/bbb.js` | The neurovascular unit (endothelium, tight junctions, pericytes, astrocyte endfeet), diffusion, GLUT1 and P-glycoprotein efflux, gadolinium leakage on MRI in stroke, tumor and MS |
| Enterocyte | `modules/enterocyte.js` | Brush border and SGLT1/GLUT2 glucose uptake, fat absorption into chylomicrons and lacteals, the portal vein and first-pass metabolism by route of dosing |

The module list, glass slides (11 in Cell mechanisms, 12 in Cells in tissues) and chapter order live in the `MANIFEST` in `shared/core.js`, with each slide's specimen drawing in `MOTIFS` and prep label in `SLIDE_PREP`. The tissue and cross-cutting mechanism modules added last build their scenes with `sceneKit()` in `shared/core.js`, a small toolkit of materials, primitives, labeled stages and looping particle streams. A module can list `pills` to give its slide deep links instead of one link per chapter, as Blood does.

## Run locally

From the repository root, start any static file server and open the page:

```
python -m http.server 8000      # or: npm start
```

Then open http://localhost:8000/. The viewer loads Three.js 0.147 and OrbitControls from a CDN (the global build for the scenes, plus an import map so the ES-module GLTF loader used for anatomy models resolves `three`). Opening `index.html` directly from disk will not work, because modules are loaded on demand.

## Test

Requires Node.js 18 or later. No dependencies need to be installed.

```
node check-chapters.cjs         # or: npm test
```

The check loads `shared/core.js` and every module in a minimal text-mode browser stub. It confirms that each module registers exactly the chapters listed in `MANIFEST`, that every chapter route opens with no duplicates, that the bench shows 23 slides (11 + 12) with their slide numbers, prep labels, motifs and a distinct color token each, that every in-app link points at a real chapter and the promised cross-links are present, that chapter text uses US spelling, and that the ATP-ledger, red-cell osmosis and every lesson switch caption (including all switches in the six tissue modules, the four cross-cutting mechanism modules, the stem cell module and the pacemaker chapter) respond correctly. It does not render WebGL, so also open changed chapters in a browser.

## Add a chapter

1. In the relevant file under `modules/`, add a chapter alongside its siblings with a unique ID, short name, location, title, legend, and HTML function. Keep reading material and activities usable without the 3D scene. For a text and diagram chapter, set `panelOnly: true` and supply an empty legend.
2. In that module's build function, follow an adjacent chapter's setup for the scene, camera pose, and animation behavior. For a segmented choice that both the panel and the scene read, use `lessonSeg(key, label, options)` in the HTML, read `LESSON[key]` in the scene, and register caption updates with `whenLesson(key, fn)` (all in `shared/core.js`).
3. Add the chapter ID in the same position in the module's `MANIFEST` entry in `shared/core.js`. Update its home-card outline as needed. Shared layout and styles live in `index.html` and `shared/core.css`.
4. End each chapter with a sources line and a short note on what the scene simplifies.
5. Run `node check-chapters.cjs`. Open the new chapter directly by its hash and check the transitions on both sides of it.

House style: US English spelling (hemoglobin, center, tumor, signaling), SI units with US conventional units where clinicians use them (mg/dL alongside mmol/L).

## License and attribution

The lesson text, code and original illustrations are licensed under **CC BY-NC 4.0** (see `LICENSE`). Commercial use is not permitted.

Adapted material:

- Dalton, R. and Young, E., *Fundamentals of Cell Biology*, Oregon State University, https://open.oregonstate.education/cellbiology, **CC BY-NC 4.0**. Summarized and adapted in the Protein factory (ch. 3–4), Recycling & cleanup (ch. 4) and Division & radiation (ch. 8) modules, with credit in each chapter's sources line.

When you deploy changes to `shared/`, bump the `?v=` query on the three `shared/` files in `index.html` and `ASSET_VERSION` in `shared/core.js` (which versions the module files) so returning visitors do not mix a cached old script with new HTML.

Loaded at run time and credited in the module that uses them (not redistributed in this repository):

- [Three.js](https://threejs.org) 0.147, MIT License.
- [Open Anatomy 3D](https://github.com/MervinR07/open-anatomy-3d) body models, CC BY 4.0, adapted from BodyParts3D © The Database Center for Life Science, the HuBMAP Human Reference Atlas, and MakeHuman (CC0).
- Supplemental gland meshes from Z-Anatomy via [Anatomy Explorer](https://github.com/ArianArsenal/anatomy-explorer), CC BY-SA 4.0, derived from BodyParts3D.
- Google Fonts: Bricolage Grotesque, IBM Plex Sans and IBM Plex Mono, SIL Open Font License.

Molecular data embedded in the modules comes from PubChem (credit PubChem; see NCBI policy) and the RCSB Protein Data Bank (CC0). Individual papers, guidelines and textbooks are cited at the end of each chapter.

Reference textbooks used during research are kept outside the repository. See `REFERENCES.md`.

For learning, not diagnosis or treatment.
