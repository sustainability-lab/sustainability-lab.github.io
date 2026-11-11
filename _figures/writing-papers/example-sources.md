# Where every number in the Writing Papers examples comes from

Notes written while drafting the per-paper examples in `handbook/writing-papers.qmd`, one block per
example slot and paper. Check a number here before changing it on the page.

## title_macro

**Gemello**

<!-- src: title "Gemello: Creating a Detailed Energy Breakdown from just the Monthly Electricity Bill". No numbers. -->

**ThermEval**

<!-- src: title; abstract "ThermEval-B ... ThermEval-D" -->

**JoulesEye**

<!-- src: title "JoulesEye: Energy Expenditure Estimation and Respiration Sensing from Thermal Imagery While Exercising" -->

**GD-MI**

<!-- src: method name "Gradient Descent Mutual Information (GD-MI)", Methodology › GD-MI heading. -->

## intro_goals

**Gemello**

<!-- src: §6 Conclusions "works with whatever data is easily accessible (G2), is able to scale across large number of homes and requires minimal capital expenditure (G3)"; §1 para 5 / abstract "comparable to or better than existing techniques that use sensing infrastructure in each home" (G1). "Metered homes" = the paper's "submetered homes", worded as in the page's abstract ("seven metered homes"). -->

**ThermEval**

<!-- note: the paper states no explicit goals. G1 from §1 "organizing tasks in increasing order of difficulty and targeting
     complementary aspects" and §3.1 (T1 -> T7 as a chain of prerequisites); G2 from §2.2 / §3.3 ("no existing dataset combines
     raw thermal imagery, per-pixel temperature maps ...", ThermEval-D's dense per-pixel temperature matrix) and §2.1 "classification
     and regression tasks with quantitative metrics". -->

**JoulesEye**

<!-- src: §1 para 1 "identify the sensor that promises to be practical and ubiquitous enough that it could be added to a consumer device"; §1 para 4 "Our algorithms work even when the user is cycling or running vigorously"; abstract "significantly better than ... commercial smartwatch-based methods"; abstract "ultra-low-resolution thermal camera that is small enough to fit inside a watch". The paper does not label goals G1-G3; these are the three claims its contributions list (§1) and evaluation (§6.1, §6.2, §6.5) test. -->

**GD-MI**

<!-- src: Introduction para 4 ("trade-off between accuracy and scalability"; "scales independently of grid resolution"; "jointly optimize the full batch ... geographically balanced monitoring networks"); abstract ("runtime is independent of both the number of placements and the size of the search grid"). note: the paper states no explicit goals; these three are its intro claims, relabelled. G2 is argued by design, never timed (see eval_questions note). -->

## bg_why

**Gemello**

<!-- src: §1 para 2 (NILM needs 1-minute data or finer; most smart meters give 15-minute or hourly readings; most of the world has no smart meter) and §1 para 5 (every home has a billing meter giving monthly energy). note: the paper has no separate Background section; this opening is written for one built from the meter facts in §1 and §2. -->

**ThermEval**

<!-- src: §2.3 "Public datasets release thermal images in visualized form ... false-colored thermal images"; §3.2.1 colormaps;
     §3.2.3 colorbar "prerequisite for temperature estimation"; T4-T7 all need the colour-to-temperature mapping. -->

**JoulesEye**

<!-- src: §2 "Background on calorie estimation" (components of TEE, §2.1 measurement methods, §2.2 "Link between Energy Expenditure and Respiration Rate"); §4.7 "We aim to estimate Energy Expenditure (EE) from Respiration Rate (RR)". -->

**GD-MI**

<!-- src: Methodology › Neural Processes ("map ... context to a full posterior predictive distribution"; "coherent predictive variances"); Eq. 4 L_var = expected predictive variance over the target set. -->

## bg_analogy

**Gemello**

<!-- src: §1 para 1 "akin to the itemised bills we get from grocery stores" (the paper's own analogy, extended). -->

**ThermEval**

<!-- src: §3.2.1 "such colormaps preserve the underlying thermal signal, they alter visual appearance"; Appendix C prompt
     "a color bar or temperature scale that visually maps colormap colors to corresponding temperature values". -->

**JoulesEye**

<!-- src: §2.1.5 equation EE = HR × SV × δavO2 × γ; "SV and δavO2 are not constant. They vary according to ... body composition [18], exercise intensity and duration." Stroke volume (SV) plays the part of engine size. The analogy itself is ours, not the paper's. -->

**GD-MI**

<!-- src: analogy only. It encodes Introduction para 3 ("spatial clustering or redundant placements, as they fail to account for interactions among sensors") and Qualitative Analysis ("dense spatial clusters"). -->

## related

**Gemello**

<!-- src: §2 para 1: appliance sensors [26, 16], Viridiscope vibration [32], Jain et al. temperature sensors for AC [25], EMI (Gupta et al.) [20], circuit-level [37], "All these solutions are limited by the need for instrumentation to be deployed in every home"; §1 para 2: "current techniques require high resolution data (1 minute sampling frequency or higher) [39, 11, 4] while most smart meters today only support 15-minute or hourly sample rates", "most of the world does not yet have smart meters"; §2 para 3: "existing approaches ... require a model of each appliance", "it has not yet been demonstrated that these model-based approaches generalize well across homes", models "learned from training data [21, 33]". Citation numbers are the paper's own. Gemello's "one reading a month": abstract/§3. -->

**ThermEval**

<!-- src: §2 para 1 (MME [21], MMBench [42], SEED-Bench [35, 36], MMVet [58, 59]; NaturalBench [37] and ZeroBench [49]
     "adversarial samples and complex reasoning tasks"); §2.1 (Chung et al. [15] "use GPT-4o to generate multiple-choice
     questions ... constrained MCQ format"; RGB-Th-Bench [47] "restricted to binary classification tasks and does not evaluate
     temperature interpretation"; "Unlike prior binary or multiple-choice setups, our benchmark includes both classification
     and regression tasks"); §1 "producing plausible but incorrect answers". Citation numbers are the paper's own. -->

**JoulesEye**

<!-- src: §3.1 IMU/smartwatch respiration fails under motion [11]; §3.1.1 chest belt "oscillatory motion during cycling is at a similar frequency to the respiration rate" [31]; §3.1.2 Eulerian video magnification [77] "inadvertently amplifies this external light"; thermal is "independent of external lighting conditions"; §3.1.3 earables [2] "primarily focused on head movements typical of routine activities"; §3.2 accelerometer equations [5, 47], Apple Watch / Fitbit PPG "notable accuracy differences across brands" [17], ECG "multiple probes placed across various torso areas" [54], thermal optical flow "within confined spaces where a single participant walks or runs" [26, 38]. "Tracks calorie burn more closely": §6.4 Pearson correlation 0.93 (RR vs EE) against 0.78 (HR vs EE). Citation numbers are the paper's own. -->

**GD-MI**

<!-- src: Related Work › Classical Sensor Placement ("MI objective is submodular ... greedy algorithm ... near-optimal ... guarantees"; "cubic time complexity O(N^3)"; "look-ahead computations at each candidate location"; "runtime scales linearly with both the number of candidate sites and the number of placements"); Related Work › Modern Learning-Based Approaches (NPs "trained across a wide distribution of tasks"; ConvGNP, Andersson et al. 2024; "reliance on discrete, sequential selection policies"; "typically non-differentiable, preventing the direct, joint optimization of an entire batch"). Citation numbers are placeholders. -->

## method_intuition

**Gemello**

<!-- src: §1 para 4 "homes in the same geographic region are often very similar ... Gemello uses a different set of matching homes to estimate the energy usage of each individual appliance"; §3 eq. for L_k (average over K neighbours). 107 characters. -->

**ThermEval**

<!-- 101 characters. src: §3.1 (T1 -> T7 ordered as prerequisites); §1 "errors on simpler prerequisite tasks predict
     failures on more complex thermal reasoning tasks". note: ThermEval is a benchmark, so "method" = benchmark design. -->

**JoulesEye**

<!-- src: §4 "periodic increase and decrease of the temperature at the tissues around the nasal cavity ... quantifiable in a thermal video as pixel intensity variations of the nostrils ROI"; §4.7 EE estimated from RR. 109 characters. -->

**GD-MI**

<!-- src: abstract ("treats sensor coordinates as differentiable parameters"); Methodology › GD-MI ("treats the sensor locations themselves as trainable parameters"; Eq. 4 minimises expected predictive variance; Adam updates). 98 characters. -->

## method_steps

**Gemello**

<!-- src: §3 asks these as its own plain questions: Q1/Q3 (which features, and which of them per appliance) → step 1; Q4 (how to select neighbouring homes: K nearest neighbours) → step 2; Q5 (how to estimate the appliance's energy: average over the K homes) → step 3. Lengths 22, 26, 23 characters. -->

**ThermEval**

<!-- 24 / 27 / 25 characters. src: §3.1 and Figure 2: modality (T1-T2), colour bar (T4), thermal reasoning and temperature
     estimation (T5-T7). Counting (T3) is left out of the figure because it is a semantic check, not a link in the chain. -->

**JoulesEye**

<!-- src: §4.5 nostril tracking with CSRT, seeded by RGB landmarks; §4.5/§5.2 mean ROI intensity → respiration signal → respiration rate per 10 s window; §4.7 two TCN models: RR → volume of exhaled air → VO2 → kcal/min. (23, 26, 26 characters.) -->

**GD-MI**

<!-- src: Methodology › GD-MI, in order: (1) Eq. 3, impute Ŷnew as the model's mean prediction given existing sensors; (2) Eq. 4, expected predictive variance over all target points given the augmented context, plus the out-of-region penalty of Eq. 5; (3) Adam gradient step on the coordinates, then snap to the nearest grid point at the end. Lengths 28, 25, 25 characters. -->

## method_toy

**Gemello**

<!-- src: toy numbers are invented (clearly a toy). Method facts: §3 Q4 (K nearest neighbours by distance on selected features), Q5 and the L_k equation (plain average over the K neighbours); Table 3 (lights: top feature Area (1); HVAC: aggregate energy in summer months (.94)). Arithmetic: distances |1500-1400| = 100, |1500-1600| = 100, |1500-3000| = 1500, so K=2 picks the first two; (20+30)/2 = 25. -->

**ThermEval**

<!-- Toy numbers are invented (30-40 °C bar, steps 4 and 6). Arithmetic: (40-30)/10 = 1 °C per step; 30+4 = 34; 30+6 = 36.
     The two failure modes are real: §5.3 "Intern-VL 3 (8B) frequently committed decimal-shift errors (e.g., 33.5 -> 335)";
     §5.5 "MiniCPM and Intern-VL (8B) occasionally ignore thermal inputs entirely and rely on language priors to output values
     around 36-37 °C". The question type is Task 5 "Which person has a hotter nose" (Figure 2); ground truth from the per-pixel
     temperature matrix (§3.3.2) and mean body-part temperatures (§3.2.4). -->

**JoulesEye**

<!-- src: toy numbers are made up. Method facts: §4.5 "We used 10 seconds of this signal (Iavg(t)) to compute a single sample of respiration rate"; §4.7 two phases, RR → volume (v) → VO2; §4.1.1 "kcal/min = (VO2 (ml/kg/min) x body weight (kg) x 5 kcal/L) / 1000". Check: 10 × 60 × 5 / 1000 = 3. -->

**GD-MI**

<!-- note: toy numbers are invented. Arithmetic: 9 − 8(0.25) = 7; 0.25 + 0.05 × 8 = 0.65; 9 − 8(0.65) = 3.8; 0.65 + 0.4 = 1.05 > 1; at x = 1, 1 + 0 = 1 (a sensor at A instead would leave 0 + 9 = 9). Mirrors the real method: minimise total predictive variance (Eq. 4) by gradient steps on the coordinate, keep it on valid ground (out-of-region penalty, Eq. 5), and snap the final position to the nearest grid point ("snapped to the nearest grid point in Xpool"). Also shows the paper's qualitative finding that GD-MI places "sensors away from existing CPCB stations". -->

## method_generic

**Gemello**

<!-- src: §3 Q4 (method, generic K); §4.1 "57 homes", §4.4 "We vary K from 1 to 6" (the paper itself keeps these counts in the evaluation). -->

**ThermEval**

<!-- src: §3.2.5 "T7 further examines robustness to imaging distance ... at distances of 2 ft, 6 ft, and 10 ft"; Table 2 T7. -->

**JoulesEye**

<!-- src: §4.5 nostril tracking with CSRT; §4.2 "FLIR One Pro ... sampling rate of 8.6 frames per second". (The paper itself describes the camera in §4.2, inside its Approach section.) -->

**GD-MI**

<!-- src: Problem Formulation ("deployment budget of k additional sensors"; Xc = existing sensors); Sensor Placement Results ("starting from the existing Central Pollution Control Board (CPCB) sensor locations"; Figure 2 x-axis up to 100 added stations). -->

## eval_questions

**Gemello**

<!-- src: each question is one experiment in the paper. Q1: §4.5 para 1, Figure 3 (FHMM and LBM on 15-minute data vs Gemello on monthly data). Q2: §4.5 last para, Figure 4 (LBM at 15 and 2 minutes). Q3: §4.6.2, Figure 6 (#SH from 7 upwards). Q4: §4.6.1, Figure 5 ("AMI" and "All features"). Q5: §4.6.1, Table 3 (top features per appliance). note: the paper does not open its evaluation with a question list; its subsections (Results, Sensitivity on feature space, Sensitivity on number of submetered homes) map onto these questions. -->

**ThermEval**

<!-- src: §4.1 "We evaluate 25 VLMs"; Q1 = §5.1 (T1, T2); Q2 = §5.3 (T4); Q3 = §5.4 (T5 Double, Single); Q4 = §5.5 (T6, T7);
     Q5 = scale in §5.4 / conclusion "across scales from 0.3B to 235B", prompts in §5.6 (Table 5), fine-tuning in §5.7 (Table 6).
     Counting (T3, §5.2) is not a separate question here. -->

**JoulesEye**

<!-- src: Q1 §6.1 (2.1% RR error against the belt); Q2 §6.2 and Fig. 9 (5.8% vs 37.6%); Q3 §6.5 and Table 4 (32×24 MLX90640 prototype); Q4 Fig. 9 input combinations (HR, RR, RR+HR, RR+HR+T). The paper also studies occlusion (§6.3), body type (Table 3) and window length (§6.6). -->

**GD-MI**

<!-- src: Q1 = Surrogate Model Evaluation and Selection (Tables 1, 2); Q2 = Case Study, Madhya Pradesh ("a geographical scope where the MI approach was computationally feasible", Figure 1); Q3 = Sensor Placement Results across India vs MaxVar and Random (Figure 2) and Methodology › MI ("we evaluate the greedy MI only in a focused regional case study"); Q4 = Qualitative Analysis (Figure 3). Order follows the paper's sections. note: no experiment measures runtime, so G2 is supported only by design and by the fact that greedy MI was run on one state while GD-MI ran on all of India. -->

## setup_scenario

**Gemello**

<!-- src: §4.4 para 1 "Our experimental setup tries to replicate the following real world scenario- we have a small subset of submetered homes and a large number of homes without smart meters." -->

**ThermEval**

<!-- src: §2.3 false-colored images are "the de facto representation"; §4.2 "zero-shot prompting setting using fixed prompt
     templates and without any fine-tuning on thermal data"; Appendix C simple prompts ("Is this a thermal image or an RGB image?"). -->

**JoulesEye**

<!-- src: §4.2 "securely mounted on the handgrip of an ergometer or affixed near the display screen of a treadmill in order to capture thermal video data of the face". -->

**GD-MI**

<!-- src: Dataset and Preprocessing ("This forward-in-time split ... reflects the deployment scenario of learning from historical data to inform future predictions"); Sensor Placement Results ("starting from the existing Central Pollution Control Board (CPCB) sensor locations as the initial context set"). -->

## setup_data

**Gemello**

<!-- src: §4.1 "57 homes contain data for 1 year (2013) across 6 appliances", "homes in Texas, USA", data "collected at 1-minute resolution", house metadata "number of occupants, area of the home and number of rooms"; §4.4 "We use data from 2013", "For all homes, we had aggregate and appliance monthly energy consumption for the 12 months". Table 2 homes per appliance: HVAC 31, Lights 12, Fridge 21, Dryer 32, Dish washer 26, Washing machine 16 (so 12 to 32; column order checked against Table 3's proportions, e.g. dish washer .92 = 24/26, .77 = 20/26). §4.4 FHMM and LBM use 15-minute data; §4.5 / Figure 4 LBM at 2 minutes; §3 Q2 and §4.6.1 15-minute AMI features. §4.6.2 "We chose the starting #SH as 7", "We repeat this procedure 100 times". Test data separation: §4.4 leave-one-out (the test home is never its own neighbour) with nested cross-validation for tuning K and top-N features. -->

**ThermEval**

<!-- src: Table 2. FLIR/LLVIP: T1 10,000 + T2 10,000 + T3 20,000 = 40,000. ThermEval-D colour bars (T4): 2,094 + 4,188 + 1,047
     + 1,047 = 8,376. ThermEval-D T5-T7: (2,267 + 381) + (2,380 + 2,380 + 12,983) + (695 + 426 + 333) = 2,648 + 17,743 + 1,454
     = 21,845. Check: 40,000 + 8,376 + 21,845 = 70,221 = Table 2 total; ThermEval-D share 30,221 matches "over 30,000" (§1
     contribution 2). All sets are test-only for the zero-shot runs; the SFT run in §5.7 uses three stratified folds. -->

**JoulesEye**

<!-- src: Table 2 (54 participants; 41 cycling, 13 running; 24 female); §4.4 "All participants participated in two back-to-back data collection sessions"; §4.4.2 session 1 "three minutes at a high intensity", thermal video + belt; §4.4.3 session 2 "15 minutes", mask + belt + calorimeter; §4.3 Apple Watch heart rate; §6.5 "evaluated our low-resolution thermal system ... on 5 participants ... run on a treadmill at 4 miles per hour for a minute". -->

**GD-MI**

<!-- src: Dataset and Preprocessing (WUSTL monthly surface PM2.5, 0.1° grid, Indian subcontinent lat 5–39°, lon 67–99°, land only; split dates verbatim); Table 1 caption ("validation dataset spanning over 2009 and 2010"); Figure 1 caption ("RMSE on the validation set"); Figure 2 caption ("results on the test set"); Figure 3 is a test-period slice, 2012-02-01. note: the paper gives date ranges, not counts; they are 11, 2 and 8 years of monthly maps if a size column is wanted. -->

## results_heading

**Gemello**

<!-- src: §4.5 para 1 "Gemello can achieve 76% and 69% accuracy on HVAC and fridge, compared to 61% and 39% for FHMM and 56% and 72% for latent bayesian melding"; "five of six": Figure 3 bars, where Gemello's bar is the tallest for HVAC, washing machine, lights, dryer and dish washer, and LBM's for the fridge. The paper's own heading is "4.5 Results". -->

**ThermEval**

<!-- src: Table 4 Task-5 Double: Gemini 3 Pro 0.74, Human 0.84, Random Chance 0.50; §5.4 "the new Gemini 3 Pro achieves an
     accuracy of 0.74 ... below the human benchmark of 0.84". The "before" heading paraphrases the paper's real §5.4 heading. -->

**JoulesEye**

<!-- src: Fig. 9 bars "Apple Watch" 37.6 and "Estimated RR" 5.8; abstract "MAPE of JoulesEye was 5.8% ... MAPE of 37.6%". (§6.2.1 text says 37.5%; the figure, Table 3 and abstract say 37.6%.) The "before" heading echoes the paper's real §6.2 title "Result on Estimating Energy Expenditure". -->

**GD-MI**

<!-- src: Sensor Placement Results ("The performance gain of GD-MI grows with the budget size"; "At a final deployment of 100 new stations, GD-MI achieves an RMSE of approximately 7.1, a 4% relative reduction over MaxVar's 7.4"); Figure 2. Section number 5.4 is a placeholder (the paper's sections are unnumbered). -->

## headline_data

**Gemello**

<!-- src: §4.5 para 1 (HVAC and fridge numbers, "up to 57%"); §4.4 (baselines on 15-minute data, monthly evaluation); §4.3 (metric); Figure 3 bars for ≈ values (FHMM bars for washing machine and dish washer are at or near zero; §4.5 "Many existing techniques are not able to disaggregate these loads at all"); Figure 4 for LBM 2-minute HVAC ≈60. Readings per month derived: 4×24×30 = 2,880; 30×24×30 = 21,600. -->

**ThermEval**

<!-- src: Table 4, Task-5 Double and Single columns, all 25 model rows plus Human and Random Chance. Gemini params are "?" in
     Table 4 ("model weights are not publicly available"), so Gemini 3 Pro cannot sit on the size axis; it needs its own strip.
     Range 0.40-0.66 is from the table (IDEFICS-3 0.40, PaliGemma-2 0.66); the §5.4 text says "0.40 to 0.64", which omits
     PaliGemma-2. Note: on Double, Intern-VL 3 38B (0.64) is the best of its family (8B 0.49, 15B 0.46); the paper's
     "38B lags behind its 8B and 15B variants" refers to Single (0.41 vs 0.53 and 0.40) and only holds against the 8B.
     The clean scale contrast is Qwen A22 235B at 0.48 (below chance) vs Qwen-VL 2.5 8B at 0.60. Param counts follow Table 4;
     §4.1 text gives some different sizes (see header note). -->

**JoulesEye**

<!-- src: Fig. 9 bar values 37.6, 10.2, 12, 5, 5.8, 5.5, 5.2 (pdftotext -layout p. 21); §6.2.1 bullet definitions of True/Estimated HR/RR; §6.2.2 "consumer grade health trackers should not exceed a 10.79% (MAPE)"; Table 4(a) and 4(b); §6.5 "estimates from the watch's heart rate data alone ... which is 12% (Figure 9)". Note: "Estimated RR" is belt RR with noise added to match the 2.1% thermal error (§6.2.2), because the mask hides the nostrils. Table 4(b) gives 5.4% and 5.3% for what Fig. 9 reports as 5.8% and 5.5%. -->

**GD-MI**

<!-- src: Case Study para ("greedy MI heuristic achieves the lowest predictive error (RMSE of 5.6 at k=9)"; GD-MI "RMSE of 5.8"; MaxVar "RMSE of 6.3"); Figure 1 (start ≈ 7.4 and Random ≈ 6.25 read off at 400 dpi; Random's line ends slightly below MaxVar's at k = 9); Figure 1 caption ("interquartile range ... over 5 independent runs"). Sensor Placement Results ("RMSE of approximately 7.1 ... MaxVar's 7.4"); Figure 2 (all other values read off; MaxVar is marginally lower than GD-MI at k = 10; the k = 0 value matches TNP-D's test RMSE of 9.11 in Table 2). Units: the paper gives µg/m³ only for the Table 1 RMSEs. -->

## oracle

**Gemello**

<!-- src: §4.6.1 last para: the Oracle "finds the 'optimal' subset of 'neighbourhood' homes from all possible subsets ... The appliance energy data from these 'optimal' homes is then averaged"; "if we were to find better features for defining similarity between homes, our accuracies would tend towards the accuracy of the 'Oracle'"; Figure 5 caption "upper bound on accuracy ... if the neighbour selection algorithm were perfect". note: the text gives no Oracle number. Read off Figure 5 the Oracle is roughly 93% on HVAC and 92% on the fridge, against Gemello's 76% and 69%; add these only after checking the notebooks. Alternative with text numbers: with 15-minute data, fridge accuracy rises by 5%, and the share of small (<500 W) step changes, the fridge's signature, is among the chosen features in 20 of 21 homes (§4.6.1 para 1). -->

**ThermEval**

<!-- src: §4.2 "to assess the upper bound of achievable performance without architectural modifications, we perform supervised
     fine-tuning (SFT) of Qwen-VL 2.5 (8B)"; Table 6 T5 Single 0.32 -> 0.64 (+0.32), Double 0.60 -> 0.60 (0.00), Human Double
     0.84; §5.7 "semantic comparison performance in T5 remains below human level". note: the paper has no oracle in the
     Kestrel sense; the SFT upper-bound run is the closest analogue. Alternative from Table 5 (prompt ablation): richer prompts
     lift BLIP-2 on T1 FLIR from 0.43 to 0.63 but drop Qwen-VL 2.5 on T5 Double from 0.60 to 0.42, so prompts fix modality
     confusion, not temperature reasoning (§5.6). Use Table 5's cells, not §5.6's "0.53 to 0.76 on T2 (FLIR)", which is T1 LLVIP
     in the table. -->

**JoulesEye**

<!-- src: Fig. 9 "True HR" 10.2, "Estimated RR" 5.8, "True RR" 5; §6.2.1 "best result of 5% ... when ground truth respiration rate was input"; "True HR: This is the heart rate obtained from the indirect calorimeter chest band". -->

**GD-MI**

<!-- src: Methodology › MI ("guaranteed to achieve at least a (1 − 1/e)-approximation"; "strong but computationally expensive baseline"); Case Study (5.6, 5.8, 6.3 at k=9; "closing most of the performance gap with the MI heuristic"). note: the paper has no oracle or ablation; greedy MI serves as the upper reference. (GD-MI closes 0.5 of the 0.7 gap, about 70%; the paper says only "most".) -->

## sensitivity

**Gemello**

<!-- src: §4.6.2 and Figure 6. Answer in the paper: with only 7 submetered homes, ≈69% on HVAC (still 8% better than the state of the art, i.e. FHMM's 61%) and ≈65% on the fridge, 4% below its accuracy with 21 homes. note: Figure 6's fridge point at 7 homes reads nearer 63% than the text's ≈65%; quote the text. -->

**ThermEval**

<!-- src: §3.2.5 / §5.5 Task 7 "robustness to imaging distance ... 2 ft, 6 ft, and 10 ft"; Table 4 Task-7 columns. A second
     real sensitivity question: "does accuracy hold when the same image is recoloured with another colour map?" (Task 2, §5.1). -->

**JoulesEye**

<!-- src: §6.6 and Fig. 14: 60 s 5.5%, 45 s 5.7%, 30 s 6.4%, 15 s 10.1%, 9 s 12.2%, against 12% for Apple Watch HR alone. (Text says 15 s beats heart rate; the Fig. 14 caption says 30 s.) Camera resolution (Table 4) is the other sensitivity the paper runs. -->

**GD-MI**

<!-- src: Sensor Placement Results ("The performance gain of GD-MI grows with the budget size"); Figure 2 x-axis 0, 10, 20, 50, 100 added stations. -->

## limitation

**Gemello**

<!-- src: §5 limitation 1 "Since our approach only uses single reading per month, it can only estimate the monthly energy consumed by individual appliances, and cannot estimate the finer grained power signal ... activity recognition [1], anomaly detection [9, 3] and predicting household occupancy [6]", "We believe that incorporating some of our features in the LBM approach could yield good results". note: the paper gives reasoning, not a measured number, for this limitation. Matches the page abstract's last line ("It gives monthly estimates only"). A sharper alternative is limitation 4: outlier homes, the best targets for feedback, may get wrong predictions because their neighbours do not represent them. -->

**ThermEval**

<!-- src: §5.7 "absolute temperature estimates still deviate by 1-2 °C in T6 and T7 ... error margins that are unacceptable for
     safety-critical applications such as fever screening or industrial monitoring" and "the need for future VLM pretraining to
     explicitly incorporate physical sensor modalities rather than relying solely on RGB-centric representations"; Table 6 T6
     Region 2.85 -> 2.60. The paper's own §6 Limitations lists model coverage, the LLM parser, and the focus on primitives rather
     than compositional reasoning; the one above comes from §5.7 and the conclusion because it has numbers and a way forward. -->

**JoulesEye**

<!-- src: §6.5 "MAPE of estimating respiration rate is 8.1%. This high error arose because we were not able to achieve a high frame rate ... The current frame rate is 3 frames per second"; "energy expenditure estimate of 15.4% ... higher compared to ... heart rate data alone ... 12% ... reduces the error to 10.1%"; Table 4(a) 2.1% vs 8.1%; §7 "engineering challenges to obtain higher frame rate remains an unsolved problem". -->

**GD-MI**

<!-- src: Discussion para 2 ("sensitivity of gradient descent to initialization, which can lead to convergence at suboptimal local minima. This could be mitigated by running multiple optimizations with different seeds or by initializing from a fast heuristic placement"); Figure 1 caption (IQR over 5 independent runs); Figure 2 caption ("min-max range of results over 5 random initializations"). note: the paper does not quantify how often runs get stuck. -->

## active_voice

**Gemello**

<!-- src: §4.5 "sparsely used appliances such as dryer and washing machine show poor accuracy" (FHMM), Figure 3 FHMM dryer bar ≈11%; §4.1 "57 homes"; abstract "we propose a more scalable solution called Gemello"; §3 and Table 3 (lights: Area (1)). -->

**ThermEval**

<!-- src: §5.1 "complex colormaps such as Summer and Spring induce larger failures"; §4.1 "We evaluate 25 VLMs"; §4.2.1
     "we therefore use a language-only LLM (Gemini 2.5 models) to parse and standardize VLM outputs ... without access to the
     input image". -->

**JoulesEye**

<!-- src: §1 "EE estimation by wearables can be wrong by over 40% [9, 21, 25, 59]"; Table 2 n = 54; §4.5 CSRT tracks the nostril region. -->

**GD-MI**

<!-- src: Qualitative Analysis ("it creates dense spatial clusters"); Dataset and Preprocessing (Indian subcontinent PM2.5); Methodology › GD-MI ("updated iteratively using the Adam optimizer"). -->

## passive_ok

**Gemello**

<!-- src: §4.1 "Submetered and household aggregate power data was collected at 1-minute resolution." -->

**ThermEval**

<!-- src: Appendix A "All imagery was captured using the TOPDON TC001 Plus thermal camera". -->

**JoulesEye**

<!-- src: §4.4.1 "We collected data in an air-conditioned room which had a temperature of 76 degrees Fahrenheit"; "data collection was held during winter months of December-January". -->

**GD-MI**

<!-- src: Dataset and Preprocessing ("WUSTL at a 0.1° spatial resolution. This dataset integrates satellite aerosol optical depth (AOD) retrievals, chemical transport model outputs, and ground-based monitoring observations"). -->

## emphasis

**Gemello**

<!-- src: §1 para 2 "1 minute sampling frequency or higher"; abstract "only the monthly energy bill"; §1 para 4 "The key to success is the ability to define 'similarity' on a per-appliance basis". -->

**ThermEval**

<!-- src: §5.3 "while basic detection is common, several models still fail to reliably interpret the numerical temperature
     scales"; abstract "thermal images encode physical temperature rather than color or texture". -->

**JoulesEye**

<!-- src: §3.1.1 "the oscillatory motion during cycling is at a similar frequency to the respiration rate"; Fig. 3 belt reports 5.4 breaths/min vs thermal 22.2 vs ground truth 20.0. -->

**GD-MI**

<!-- src: Related Work › Classical ("look-ahead computations at each candidate location"); Introduction para 4 ("avoids evaluating every candidate site and scales independently of grid resolution"; "we jointly optimize the full batch of new placements"). -->

## filler_number

**Gemello**

<!-- src: the vague phrase is the paper's own (abstract, §1 para 5, Figure 3 caption). Numbers: §4.5 para 1. -->

**ThermEval**

<!-- src: §5.4 uses this exact phrase: "this remains significantly below the human benchmark of 0.84" (no test reported);
     Table 4 Task-5 Double, Gemini 3 Pro 0.74 vs Human 0.84. -->

**JoulesEye**

<!-- src: abstract "MAPE of JoulesEye was 5.8%, which is significantly better than the MAPE of 37.6%"; Fig. 9. The paper reports no statistical test for this comparison. -->

**GD-MI**

<!-- src: Sensor Placement Results ("RMSE of approximately 7.1, a 4% relative reduction over MaxVar's 7.4"). note: the page's row already has the left cell; use only the right cell there. -->

## one_word

**Gemello**

<!-- src: the published paper uses all five: "submetered homes" (§3, §4.6.2), "train homes" (Figure 1), "instrumented homes" (§1 para 5), "'neighbourhood' homes" (§3, §4.6.1), "metered" as on the page. A real example of term drift. -->

**ThermEval**

<!-- src: the paper itself uses all of these for one thing: "colorbar" (§3.2.3, §5.3), "color bar or temperature scale"
     (Appendix C prompts), "visual legends and ... numeric scales" (§4.1). -->

**JoulesEye**

<!-- src: the paper uses all four: "energy expenditure (EE)" (§1), "calorie burn" (abstract), "Caloric Expenditure Estimate" (Fig. 9 axis), "estimates energy expenditure or VO2" (§6.2.1). VO2 is a different quantity (ml/kg/min), converted to kcal/min in §4.1.1. -->

**GD-MI**

<!-- src: the paper itself does this: Methodology ("we employ Neural Processes (NP) as our predictive model"), Surrogate Model Benchmarking ("adopt TNP-D as the surrogate model"), Surrogate model Evaluation ("selection of a robust surrogate model"). It likewise mixes sensors / stations / placements for the same thing (abstract "number of placements", Figure 2 axis "Number of Added Stations", text "sensor budget"). -->

## caption

**Gemello**

<!-- src: Figure 3 (paper caption: "Gemello achieves Energy Accuracy that is comparable to or better than the baseline approaches across all appliances"); Gemello's bar is tallest for 5 of 6 appliances; §4.3 "we also calculate the standard error to show the variation in energy accuracy across homes"; §4.5 fridge 69% vs 72% for LBM. -->

**ThermEval**

<!-- src: Figure 2 (panels T1&T2 modality identification, T3 human counting, T4 colorbar interpretation, T5 thermal reasoning,
     T6&T7 temperature estimation, each with an example question, e.g. "Which person has a hotter nose in this image");
     §1 "organizing tasks in increasing order of difficulty". The paper's real caption is closer to the "before". -->

**JoulesEye**

<!-- src: Fig. 9 bars: RR inputs 5, 5.8, 5.5, 5.2; HR inputs 10.2, 12; Apple Watch 37.6. Ground truth: indirect calorimeter (§4.1.1). -->

**GD-MI**

<!-- src: Figure 1 and its caption ("RMSE on the validation set as a function of the number of new stations deployed"; "While MI achieves the lowest error, our GD-MI method is highly competitive"; "shaded regions for the stochastic methods (GD-MI and Random) represent the interquartile range (25th to 75th percentile) over 5 independent runs"); Case Study (Madhya Pradesh; CPCB stations as initial context; k=9 values 5.6 / 5.8 / 6.3). note: the title is pinned to k = 9 on purpose; at smaller budgets the lines cross (from the plot, Random is below GD-MI at k = 4), so the paper's "consistently outperforms" is too strong. -->

## table

**Gemello**

<!-- src: §4.5 para 1 (76/69, 61/39, 56/72); §4.4 (FHMM and LBM run on 15-minute data; Gemello on monthly energy plus static household features). note: the paper has no results table (Tables 1–3 are features, homes per appliance and top features); this table is built from the numbers stated in §4.5. The other four appliances appear only as bars in Figure 3, so they are left out rather than filled with read-off values. -->

**ThermEval**

<!-- src: Table 4 rows Qwen A22 (Double 0.48, Single 0.34, Marker 3.72, Region 3.40), Intern-VL 3 38B (0.64, 0.41, 3.63, 2.59),
     Qwen-VL 2.5 8B (0.60, 0.32, 2.88, 2.85), Qwen-VL 2.5 (SFT) (0.60, 0.64, 2.40, 2.60), Gemini 3 Pro (0.74, 0.61, 1.86, 1.47),
     Human (0.84, 0.54, 2.73, 2.04), Random Chance (0.50, 0.167). Coords column left out because Human is "–" there (no empty
     headline cells). Shaded row = the paper's own fine-tuned model (§5.7), the nearest thing a benchmark has to "ours".
     Honest extras the table shows: the fine-tuned model beats people at ranking body parts (0.64 vs 0.54), and Gemini 3 Pro's
     estimation error is lower than the human annotators' (1.47 vs 2.04 °C region); §5.4 "some closed-source models approach or
     exceed human performance on specific subtasks". Q3/Q4 labels follow the eval_questions slot. -->

**JoulesEye**

<!-- src: Table 3 rows "Error (Apple Watch)" 37.6% / 29.7% / 51.8% and "Error (JoulesEye) with RR" 5.8% / 5.2% / 6.9%; columns "All Participants", "Participants With Normal BMI", "Participants With Overweight BMI". note: Table 3 tests only G2, so there is one goal group, not two; the paper's tables do not place breathing error (G1) and calorie error (G2) side by side for the same methods. -->

**GD-MI**

<!-- src: Table 1 (validation, 2009–2010: NLL and RMSE, all rows; the ± std is dropped, NLL ± is 0.00 everywhere, RMSE ± is 0.04–0.09); Table 2 (test: NLL and RMSE, all rows); Surrogate model Evaluation ("4.90 vs. 5.16 µg/m3"; "adopt TNP-D as the surrogate model"); Dataset (split dates). note: the column groups name what the surrogate must provide, not G1–G3, because this table chooses the model rather than testing the placement goals. On test, TabPFN (0.39) and the GP (0.42) have lower NLL than TNP-D (0.51); the caption says so by scoping "best-calibrated" to validation. -->

## paragraph_fig

**Gemello**

<!-- src: bridge and next_lead shortened from the page's Introduction ("So can we get a breakdown without installing anything in the home?" / "Yes, if we borrow it from similar homes that are already metered."). Lead: abstract line 2 / §1 para 2 "they require hardware to be installed in each home". note: the page's Gemello lead example is the context paragraph ("Buildings use more than 30% of the world's energy..."); the bridge closes the prior-art paragraph instead, so the lead here is that paragraph's lead. If the figure must reuse the page lead, use "Buildings use over 30% of the world's energy." (45 chars). Lengths: 54, 54, 56 characters. -->

**ThermEval**

<!-- 48 / 57 / 48 characters. Shortened from the page's ThermEval introduction blocks: lead "We do not know whether
     vision-language models can read a thermal image."; bridge "So can a model trained on ordinary photos read temperature
     at all?"; next lead "To answer this, we break thermal understanding into seven tasks, from easy to hard." -->

**JoulesEye**

<!-- src: §1 "EE estimation by wearables can be wrong by over 40% [9, 21, 25, 59]"; §1 "A reason for inaccuracy ... is the sole reliance on heart rate data"; §4 breathing visible as nostril temperature change. Lead shortened from the page's intro lead, and softened from "often by more than 40%", which the paper does not say. (54, 28, 52 characters.) -->

**GD-MI**

<!-- src: Introduction para 2 ("population exceeding 1.4 billion ... only around 500 official monitoring stations"); Introduction para 3 ("MI-based acquisition requires a look-ahead evaluation at each candidate site ... runtime scale linearly with the number of candidates"). Shortened from the page's existing lead and bridge; lengths 52, 60 and 59 characters. -->
