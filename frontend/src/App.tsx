import {useState} from "react";
import Viewer from "./Viewer";

type Tab="overview"|"viewer"|"review"|"evaluation"|"method"|"limitations";
const tabs:{id:Tab;name:string;short:string}[]=[
 {id:"overview",name:"Overview",short:"01"},
 {id:"viewer",name:"MRI & Segmentation",short:"02"},
 {id:"review",name:"3D Review",short:"03"},
 {id:"evaluation",name:"Evaluation",short:"04"},
 {id:"method",name:"Methodology",short:"05"},
 {id:"limitations",name:"Limitations",short:"06"}
];
const base=import.meta.env.BASE_URL;
const fig=(n:string)=>base+"research-figures/"+n;

function Metric({v,l,n}:{v:string;l:string;n:string}){
 return <article className="metric-line"><span className="metric-label">{l}</span><strong>{v}</strong><span className="metric-note">{n}</span></article>;
}
function Figure({src,title,desc,wide=false}:{src:string;title:string;desc:string;wide?:boolean}){
 return <figure className={wide?"research-figure research-figure-wide":"research-figure"}>
  <div className="research-image"><img src={src} alt={title}/></div>
  <figcaption><span className="figure-index">FIG. / RESEARCH RECORD</span><b>{title}</b><span>{desc}</span></figcaption>
 </figure>;
}
function ChapterTitle({number,eyebrow,title,description}:{number:string;eyebrow:string;title:string;description:string}){
 return <div className="chapter-title"><span className="chapter-number">{number}</span><div><small>{eyebrow}</small><h2>{title}</h2><p>{description}</p></div></div>;
}

export default function App(){
 const [tab,setTab]=useState<Tab>("overview");
 const [ink,setInk]=useState(false);
 const [menu,setMenu]=useState(false);
 const go=(next:Tab)=>{
  setTab(next);
  window.location.hash=next;
  window.scrollTo({top:0,behavior:"smooth"});
  setMenu(false);
 };
 const active=tabs.find(t=>t.id===tab);

 return <div className={ink?"shell ink":"shell"}>
  <header className="masthead">
   <a className="wordmark" href="#overview" onClick={e=>{e.preventDefault();go("overview");}}>
    <span className="wordmark-symbol" aria-hidden="true">N</span>
    <span className="wordmark-name">NEURO<span>/</span>LAB<small>BIOMEDICAL IMAGING RESEARCH</small></span>
   </a>
   <div className="masthead-center"><span>RESEARCH DOSSIER</span><b>01 — BRAIN TUMOUR MRI</b></div>
   <div className="masthead-actions">
    <span className="prototype-mark"><i/> EDUCATIONAL PROTOTYPE</span>
    <button className="theme-toggle" onClick={()=>setInk(!ink)} aria-label="Toggle dark theme">{ink?"Paper view":"Ink view"}</button>
    <button className="menu-toggle" onClick={()=>setMenu(!menu)} aria-expanded={menu} aria-label="Toggle chapter navigation">{menu?"Close":"Chapters"} <span>{menu?"−":"+"}</span></button>
   </div>
  </header>
  <nav className={menu?"chapter-nav chapter-nav-open":"chapter-nav"} aria-label="Research chapters">
   <div className="nav-intro">CONTENTS <span>06 CHAPTERS</span></div>
   {tabs.map(t=><button key={t.id} className={tab===t.id?"chapter-link active":"chapter-link"} onClick={()=>go(t.id)} aria-current={tab===t.id?"page":undefined}>
    <span>{t.short}</span>{t.name}
   </button>)}
   <a className="repo-link" href="https://github.com/ghada-59/Brain-tumour-model" target="_blank" rel="noreferrer">SOURCE REPOSITORY ↗</a>
  </nav>

  <main>
   <div className="page-context"><span>NEURO-ONCOLOGY / COMPUTATIONAL IMAGING</span><span>{active?.short} / {active?.name.toUpperCase()}</span></div>
   <div className="content">
    {tab==="overview"&&<>
     <section className="editorial-hero">
      <div className="hero-copy">
       <span className="eyebrow"><i/> A RESEARCH WORKSTATION · 2026</span>
       <p className="hero-overline">FROM MRI VOLUMES<br/>TO SEGMENTATION EVIDENCE</p>
       <h1>Brain tumour<br/><em>segmentation.</em></h1>
       <p className="hero-description">A closer look at a four-sequence brain MRI workflow, a slice-wise 2D U-Net and the visual evidence behind its research baseline.</p>
       <button className="text-action" onClick={()=>go("viewer")}>Enter the MRI workspace <span>↗</span></button>
       <div className="hero-footnote"><span>01 / STUDY SCOPE</span><span>MSD · TASK01 BRAINTUMOUR</span></div>
      </div>
      <figure className="hero-image">
       <img src={fig("overlays_good_typical_difficult.png")} alt="Research comparison of reference annotations and model segmentation on three brain MRI cases"/>
       <figcaption><span>VISUAL ABSTRACT / 01</span><b>Reference annotation & model output</b><small>Committed research figure · qualitative comparison</small></figcaption>
       <span className="image-index">WT / TC / ET</span>
      </figure>
     </section>

     <section className="research-intro">
      <div><span className="section-overline">THE PROJECT IN BRIEF</span><h2>One study.<br/><em>Clearly bounded.</em></h2></div>
      <p>This interface is a research record, not a diagnostic product. It brings the committed MRI figures, historical evaluation and methodology into one place while keeping the limits of the experiment visible.</p>
     </section>

     <section className="evidence-section">
      <ChapterTitle number="01" eyebrow="EXPERIMENT SNAPSHOT / HISTORICAL" title="What the starter run reported" description="Mean Dice on the original five-patient held-out test set. The dashboard does not rerun training or evaluation."/>
      <div className="metrics-ledger">
       <Metric v="0.813 ± 0.057" l="WT / WHOLE TUMOUR" n="Mean Dice · n = 5 test patients"/>
       <Metric v="0.777 ± 0.065" l="TC / TUMOUR CORE" n="Mean Dice · n = 5 test patients"/>
       <Metric v="0.754 ± 0.033" l="ET / ENHANCING TUMOUR" n="Mean Dice · n = 5 test patients"/>
       <Metric v="30 / 484" l="LABELLED CASES USED" n="21 train · 4 validation · 5 test"/>
      </div>
      <div className="evidence-note"><span>!</span><p><b>Read these numbers in context.</b> Historical starter-run results only: 30 labelled cases, 15 epochs on CPU and five test patients. They are exploratory overlap measurements—not evidence of clinical accuracy, safety or generalisation.</p></div>
     </section>

     <section className="evidence-section">
      <ChapterTitle number="02" eyebrow="THE RESEARCH RECORD" title="Evidence, not decoration" description="Figures committed with the project are reproduced as they were recorded. No new performance claims are generated by this interface."/>
      <div className="figure-pair">
       <Figure src={fig("training_curves.png")} title="Training dynamics" desc="Recorded training and validation curves from the historical starter run."/>
       <Figure src={fig("test_dice_per_patient.png")} title="Patient-level test Dice" desc="Per-patient whole-tumour, tumour-core and enhancing-tumour overlap."/>
      </div>
      <div className="inline-callout"><span>VISUAL REVIEW</span><p>Browse the qualitative overlays and 3D label animations in the <button onClick={()=>go("review")}>3D review chapter ↗</button>.</p></div>
     </section>

     <section className="evidence-section pipeline-section">
      <ChapterTitle number="03" eyebrow="METHOD AT A GLANCE" title="A slice-wise workflow" description="The model processes one axial slice at a time; 3D is used for visual review, not as the network architecture."/>
      <div className="pipeline">
       {[["01","MRI input","FLAIR · T1w · T1gd · T2w"],["02","Patient split","21 train / 4 validation / 5 test"],["03","2D U-Net","MONAI / PyTorch · axial slices"],["04","Region metrics","WT · TC · ET evaluated separately"],["05","Visual review","Linked planes · 3D mask display"]].map(([n,t,d],i)=><article className="pipeline-step" key={n}><span>{n}</span><div><b>{t}</b><small>{d}</small></div>{i<4&&<i aria-hidden="true">→</i>}</article>)}
      </div>
     </section>
    </>}

    {tab==="viewer"&&<>
     <ChapterTitle number="04" eyebrow="INTERACTIVE RESEARCH TOOL" title="MRI & segmentation" description="The original linked-plane and Three.js viewer is preserved. Published NIfTI case volumes are not included in this portfolio preview."/>
     <Viewer/>
    </>}

    {tab==="review"&&<>
     <ChapterTitle number="05" eyebrow="VISUAL EVIDENCE / COMMITTED FIGURES" title="3D review" description="Rotating label visualizations and axial comparisons from the historical run. These figures do not imply a 3D neural network."/>
     <div className="review-lead"><Figure src={fig("BRATS_367_3d_rotation.gif")} title="BRATS_367 / 3D label comparison" desc="Reference and model mask shell · historical visualization" wide/></div>
     <div className="figure-pair review-pair">
      <Figure src={fig("BRATS_215_3d_rotation.gif")} title="BRATS_215 / 3D label comparison" desc="Typical example · historical visualization"/>
      <Figure src={fig("BRATS_360_3d_rotation.gif")} title="BRATS_360 / 3D label comparison" desc="Lowest whole-tumour Dice among the shown cases"/>
      <Figure src={fig("BRATS_367_slices.gif")} title="BRATS_367 / axial slices" desc="Reference annotation versus model prediction"/>
      <Figure src={fig("BRATS_215_slices.gif")} title="BRATS_215 / axial slices" desc="Reference annotation versus model prediction"/>
     </div>
    </>}

    {tab==="evaluation"&&<>
     <ChapterTitle number="06" eyebrow="MODEL PERFORMANCE / HISTORICAL" title="Evaluation evidence" description="A transparent view of the original starter-run baseline. These values are not reproduced by the dashboard build."/>
     <div className="evaluation-band"><span>TEST COHORT</span><b>5 patients</b><span>FROM A 30-CASE STARTER SPLIT</span><b>21 / 4 / 5</b></div>
     <div className="metrics-ledger evaluation-ledger">
      <Metric v="0.813 ± 0.057" l="WT / WHOLE TUMOUR" n="Mean Dice"/>
      <Metric v="0.777 ± 0.065" l="TC / TUMOUR CORE" n="Mean Dice"/>
      <Metric v="0.754 ± 0.033" l="ET / ENHANCING TUMOUR" n="Mean Dice"/>
     </div>
     <div className="evidence-note"><span>!</span><p><b>Evaluation caveat.</b> Validation Dice was pooled across sampled 2D slices; test Dice was calculated per patient over complete volumes. These are not directly comparable. The original test patients have already been examined.</p></div>
     <div className="figure-pair evaluation-figures">
      <Figure src={fig("test_dice_per_patient.png")} title="Per-patient test Dice" desc="Five-patient historical evaluation."/>
      <Figure src={fig("training_curves.png")} title="Training and validation curves" desc="15-epoch CPU starter run."/>
      <Figure src={fig("overlays_good_typical_difficult.png")} title="Qualitative model overlays" desc="Good, typical and difficult examples." wide/>
     </div>
    </>}

    {tab==="method"&&<>
     <ChapterTitle number="07" eyebrow="TECHNICAL RECORD" title="Methodology" description="The documented pipeline, from four MRI sequences to region-wise overlap evaluation."/>
     <div className="method-layout">
      <aside className="method-aside"><span>MODEL PROFILE</span><b>2D U-Net</b><small>MONAI / PyTorch</small><hr/><span>INPUT</span><b>4 MRI sequences</b><small>FLAIR · T1w · T1gd · T2w</small><hr/><span>DATA SPLIT</span><b>21 / 4 / 5</b><small>Patient-level · 30 labelled cases</small></aside>
      <div className="method-list">
       {[["01","MRI preparation","Four-channel input assembled from FLAIR, T1w, T1gd and T2w sequences."],["02","Patient-level partition","The starter experiment used 30 labelled patients: 21 training, four validation and five test patients."],["03","2D segmentation","A from-scratch U-Net processes individual axial slices. It is not a volumetric 3D network."],["04","Nested tumour regions","Whole tumour (labels 1/2/3), tumour core (2/3) and enhancing tumour (3) are evaluated separately."],["05","Evaluation and review","Dice overlap is calculated on the historical test cohort; committed animations visualize reference and predicted masks."]].map(([n,t,d])=><article key={n}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div></article>)}
      </div>
     </div>
    </>}

    {tab==="limitations"&&<>
     <ChapterTitle number="08" eyebrow="SCIENTIFIC TRANSPARENCY" title="Limitations & scope" description="A useful research prototype is explicit about what the current evidence cannot establish."/>
     <div className="scope-intro"><span>BOUNDARIES OF THE STUDY</span><p>The reported Dice values measure overlap with research annotations. They do not measure diagnostic accuracy, tumour delineation safety or clinical usefulness.</p></div>
     <div className="limits-list">
      {[["Small evaluation cohort","30 of 484 labelled patients were used in the starter run, including only four validation and five test patients."],["2D architecture","The U-Net processes axial slices independently. The 3D viewer visualizes predicted masks but adds no volumetric context to the model."],["Validation / test mismatch","Validation Dice was pooled across sampled 2D slices; test Dice was computed per patient over full volumes."],["Test-set reuse","The original five test patients have already been evaluated and visualized. They must not be reused for tuning while described as an untouched test set."],["No external or clinical validation","No independent site/scanner cohort, prospective study, radiologist workflow validation or clinical benefit assessment has been performed."],["Public viewer data","Exported NIfTI volumes are not part of this public preview. The committed research figures and animations remain available."]] .map(([t,d],i)=><article key={t}><span>0{i+1}</span><div><h3>{t}</h3><p>{d}</p></div></article>)}
     </div>
    </>}
   </div>

   <footer className="site-footer">
    <div className="footer-brand">NEURO<span>/</span>LAB <small>BIOMEDICAL IMAGING RESEARCH</small></div>
    <p>Brain Tumour MRI Segmentation<br/>Educational research software · Not a medical device</p>
    <a href="https://github.com/ghada-59/Brain-tumour-model" target="_blank" rel="noreferrer">SOURCE CODE ↗</a>
   </footer>
  </main>
 </div>;
}
