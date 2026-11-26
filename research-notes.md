# Expansion research (25 Nov 2026)

Not committed or pushed. "Checked" means the source page or API was read in this session.

Reference textbook PDFs are kept outside the repository. See [REFERENCES.md](REFERENCES.md) for where they are and how they may be used.

## Data we can use

| Source | What it gives | License | Checked |
|---|---|---|---|
| [PubChem PUG-REST](https://pubchem.ncbi.nlm.nih.gov/docs/programmatic-access) | Computed 3D conformers (SDF, 2–10 KB each) | US government content is public domain, but [NCBI policy](https://www.ncbi.nlm.nih.gov/home/about/policies/) says some PubChem material may carry holders' rights. Credit PubChem. Limit 5 requests/s | Policy read; downloads tested |
| [RCSB PDB](https://www.rcsb.org/pages/policies) | Experimental protein structures | CC0; crediting the authors is encouraged | Policy via search; IDs via API |
| [Goodsell molecular landscapes](https://pdb101.rcsb.org/sci-art/goodsell-gallery) | Paintings of cells at molecular detail | CC BY 4.0, credit each one | Yes |
| [WikiPathways WP78, TCA cycle](https://www.wikipathways.org/pathways/WP78.html) | Human pathway as GPML or JSON | CC0 | Yes |
| [Reactome](https://reactome.org/license) | Pathway data and API; illustrations | Data CC0; illustrations CC BY 4.0 | Yes |
| [NIH 3D 3DPX-000299](https://3d.nih.gov/entries/3DPX-000299) | Mitochondria and ER from dual-beam electron microscopy | CC BY 4.0. Cell type and file formats not confirmed | Yes |
| [SwissBioPics](https://www.swissbiopics.org/help) | Cell SVGs with organelles tagged | CC BY 4.0 | Search only |
| [NIH BioArt](https://bioart.niaid.nih.gov) | Organelle illustrations, SVG | Varies per item | Search only |

### PubChem 3D (name lookup)

- Available: D-glucose 5793, pyruvate 107735, citrate 31348, isocitrate 1198, alpha-ketoglutarate 164533, succinate 160419, fumarate 5460307, L-malate 5459792, oxaloacetate 970, ATP 5957, NADH 439153, FDG 170049.
- No 3D record returned: acetyl-CoA, succinyl-CoA, FADH2.
- Check each record's protonation state and stereochemistry before showing it. The isocitrate name lookup may not return the natural stereoisomer.

### PDB entries (title confirmed by API; structures not inspected)

| Role | ID | Note |
|---|---|---|
| ATP synthase | 8H9S, 8H9T | Human, states 1 and 2; about 39k atoms |
| Respiratory supercomplex I1 III2 IV1 | 5XTH | Human; about 116k atoms, needs simplifying |
| Cytochrome c oxidase | 5Z62 | Human |
| GLUT1 | 4PYP | Human |
| GLUT3 with glucose | 4ZW9 | Human |
| Hexokinase I | 1DGK | Mutant monomer, with glucose and ADP |
| Pyruvate dehydrogenase E1 | 1NI4 | E1 only, not the whole complex |
| Citrate synthase | 5UZR | Human |
| Isocitrate dehydrogenase (IDH3) | 6L59 | Alpha-gamma heterodimer only |
| 2-oxoglutarate dehydrogenase E1 | 7WGR | E1 only |
| Succinyl-CoA synthetase | 6WCV | GTP-specific |
| Succinate dehydrogenase | 8DYD, 8DYE | Assembly intermediates, not working Complex II |
| Fumarase | 5UPP | Human |
| Malate dehydrogenase 2 | 2DFD, 4WLF | Human mitochondrial |
| Aconitase (mitochondrial, ACO2) | none found | UniProt Q99798 search returned nothing. 2B3X/2B3Y are the cytosolic protein |

## Projects for inspiration

| Project | Worth borrowing | Reuse |
|---|---|---|
| [cclank/cell-architecture-studio](https://github.com/cclank/cell-architecture-studio) (1,759 stars) | Several cell types, compare mode, quizzes, flashcards | **Code MIT. Do not assume the models are.** Its NIH animal cell (3DPX-015797) and neuron (3DPX-015796) are CC BY-NC-SA 4.0. Plant and white-cell GLBs are listed only as user-provided files. The bacteria model's license was not checked |
| [ajitesh-eng/krebscycle](https://github.com/ajitesh-eng/krebscycle) | Per-turn / per-glucose toggle, free-energy values, regulation, quiz (from README) | Apache-2.0. Verify any biochemistry values independently |
| [IlmunIslam/mitochondria-3d](https://github.com/IlmunIslam/mitochondria-3d) | Separate membrane and matrix meshes for cutaways | MIT. FBX and Blender files; accuracy not inspected |
| [CellVerse Ultra](https://discourse.threejs.org/t/17-billion-triangles-in-a-browser-how-i-built-cellverse-ultra-a-living-interactive-3d-cell-in-one-week/92778) | Layer toggles, cell-type presets, depth-aware cytosol effect, two-pass membrane transparency | No source shared; ideas only. No respiration modeled |
| [Mol*](https://github.com/molstar/molstar) | Full structure viewer for a "see the real protein" panel | MIT per GitHub. Large library |
| [cellPACK](https://github.com/mesoscope/cellpack) | Molecular crowding layouts, generated offline | MIT per GitHub |
| [Allen Cell visual guide](https://allencell.org/visual-guide-tutorial.html), "The Inner Life of the Cell" | Visual storytelling | Inspiration only; reuse terms not checked |

## Suggested order

1. **Real molecules in the Krebs chapter.** Embed PubChem coordinates as ball-and-stick models. Then follow labeled carbons: the two CO2 released in a turn are not the two carbons that just arrived as acetyl.
2. **Deeper Krebs card.** Regulation, free-energy change, per-glucose toggle, clinical links, quiz.
3. **Radiology chapter.** FDG uptake, normal PET distribution, fasting and insulin effects, Warburg effect. Needs its own sourcing.
4. **"See the real protein" views.** Start with ATP synthase and GLUT1. Pre-simplify the files rather than loading raw atoms.
5. **EM-derived mitochondrion.** Compare the NIH mitochondria/ER model with our schematic one, after checking format and size.
