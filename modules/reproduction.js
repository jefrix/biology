(() => {
  const chapters = [
    {id:'gametes', short:'Sperm and oocyte', title:'Two cells built for different roles',
      html:()=>`<p class="lede">A sperm delivers a set of chromosomes. An oocyte supplies another set and the cytoplasm, organelles, and stored molecules that support early development.</p>
      <div class="lesson-pair gamete-pair"><section><h3>Sperm</h3><div class="sperm-model" aria-hidden="true"><i></i></div><dl><dt>Head</dt><dd>Compact nucleus and an acrosome involved in reaching the oocyte membrane.</dd><dt>Midpiece and tail</dt><dd>Mitochondria in the midpiece contribute energy. The flagellum propels the cell.</dd></dl></section>
      <section><h3>Secondary oocyte</h3><div class="oocyte-model" aria-hidden="true"></div><dl><dt>Zona pellucida</dt><dd>A surrounding glycoprotein coat.</dd><dt>Cytoplasm</dt><dd>Contains organelles and stored molecules. The ovulated cell is paused in meiosis II.</dd></dl></section></div>
      <p>The silhouettes show shape and relative bulk schematically.</p>`},
    {id:'human-meiosis', short:'Meiosis', title:'Two divisions reduce the chromosome set',
      html:()=>`<p class="lede">Before meiosis, the cell copies its DNA. Two successive divisions then separate chromosome partners and sister chromatids.</p>
      <ol class="lesson-sequence chromosome-stages">
      <li><strong>Before meiosis I</strong><div class="chromosomes"><i>X</i><i>X</i></div>One pair of duplicated homologs is shown. Homologs can exchange matching DNA segments during crossing over.</li>
      <li><strong>After meiosis I</strong><div class="chromosomes"><span><i>X</i></span><span><i>X</i></span></div>Homologs separate. Each product has 23 chromosomes, each with two sister chromatids.</li>
      <li><strong>After meiosis II</strong><div class="chromosomes sister-products"><span><i>Ⅰ</i></span><span><i>Ⅰ</i></span><span><i>Ⅰ</i></span><span><i>Ⅰ</i></span></div>Sister chromatids separate. A completed gamete has 23 single-chromatid chromosomes.</li></ol>
      <p>One primary spermatocyte yields four spermatids. Oocyte divisions are unequal. Most cytoplasm stays in one cell, and the other chromosome sets go into small polar bodies. The secondary oocyte normally completes meiosis II after sperm entry.</p>
      <p><a href="#mitosis">Compare with mitosis</a> · <a href="https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis">OpenStax · Meiosis</a></p>`},
    {id:'fertilization', short:'Fertilization', title:'From membrane fusion to the first cell division',
      html:()=>`<p class="lede">Follow the changes in the oocyte after a sperm reaches it. Open each step to see what changes and why it matters.</p>
      <div class="lesson-flow"><span>Approach</span><span>Membrane fusion</span><span>Egg activation</span><span>First cleavage</span></div>
      <details open><summary>Approach and fusion</summary><p>A sperm that has undergone capacitation passes through surrounding cells and the zona pellucida. Its membrane fuses with the oocyte membrane.</p></details>
      <details><summary>Egg activation</summary><p>Calcium signals trigger the release of cortical granules. Changes to the zona pellucida help prevent additional sperm from entering. The oocyte completes meiosis II.</p></details>
      <details><summary>Two chromosome sets</summary><p>Maternal and paternal pronuclei form. The two sets of chromosomes participate in the first mitotic division after the pronuclear envelopes break down.</p></details>
      <details><summary>First cleavage</summary><p>The zygote divides into two cells. Early cleavage divides the original cytoplasm into progressively smaller cells.</p></details>
      <p><a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/28-1-fertilization">OpenStax · Fertilization</a></p>`},
  ].map(chapter=>({...chapter,where:'Human reproductive cells',panelOnly:true,legend:[]}));
  CellCity.register('reproduction',{chapters});
})();
