r"""Each example paper's results table, twice: as a first draft might set it, and organised.

Both versions hold the same values. The draft is a plain structure, so make_latex_examples.py can
fix it one step at a time; the organised version is LaTeX, and is also the snippet on the page.
Sources: Gemello §4.5; ThermEval Table 4; JoulesEye Figure 9 and §6.2.1; GD-MI Tables 1 and 2.
Kestrel is invented.
"""

DRAFTS = {
    "gemello": {
        "header": ["Fridge", "Method", "HVAC", "Data used"],
        "rows": [
            ["69%", "Gemello (proposed approach)", "76%", "monthly bill"],
            ["39.0%", "FHMM", "61%", "15 min data"],
            ["72%", "LBM", "56.0%", "15-minute power"],
        ],
    },
    "thermeval": {
        "header": ["Model", "Region", "Two people", "Marker", "Body parts"],
        "rows": [
            ["Gemini 3 Pro", "1.47 °C", "0.74", "1.86 °C", "0.61"],
            ["Intern-VL 3 (38B)", "2.59 °C", "0.640", "3.63 °C", "0.41"],
            ["People", "2.04 °C", "0.84", "2.73 °C", "0.54"],
            ["Qwen A22", "3.4 °C", "0.48", "3.72 °C", "0.340"],
            ["Qwen-VL 2.5 (8B)", "2.85 °C", "0.6", "2.88 °C", "0.32"],
            ["Qwen-VL 2.5 SFT", "2.6 °C", "0.60", "2.4 °C", "0.64"],
        ],
    },
    "jouleseye": {
        "header": ["Input", "MAPE"],
        "rows": [
            ["True HR", "10.2%"],
            ["Estimated HR", "12%"],
            ["True RR", "5%"],
            ["Estimated RR", "5.80%"],
            ["Est. RR + HR", "5.5 %"],
            ["Est RR, HR \\& T", "5.2%"],
            ["Apple watch", "37.6%"],
        ],
    },
    "gdmi": {
        "header": ["Model", "RMSE (test)", "NLL (val)", "RMSE (val)", "NLL (test)"],
        "rows": [
            ["CANP", "14.48", "-0.19", "6.15", "0.82"],
            ["CNP", "24.99", "0.48", "11.460", "0.98"],
            ["ConvCNP", "10.78", "-.27", "5.28", "0.590"],
            ["ConvGNP", "12.25", "-0.30", "5.31", "1.04"],
            ["GP", "10.31", "-0.19", "5.16", "0.42"],
            ["Random Forest", "15.37", "-0.11", "6.55", "2.43"],
            ["TabPFN", "11.23", "-0.37", "5.09", "0.39"],
            ["TNP-D", "9.11", "-0.44", "4.9", "0.51"],
        ],
    },
    "kestrel": {
        "header": ["Method", "Calls/species", "Unseen phones", "Seen phones"],
        "rows": [
            ["CNN", "200", "48%", "54%"],
            ["CNN+aug", "200", "50.0%", "57%"],
            ["Denoise + CNN", "200", "52%", "60%"],
            ["Domain adapt.", "100", "56%", "58.0%"],
            ["Few-shot proto.", "5", "45%", "49%"],
            ["Kestrel (ours)", "5", "79%", "83%"],
            ["Transformer (FT)", "100", "55%", "61%"],
        ],
    },
}

FINALS = {
    "gemello": r"""\begin{table}[t]
  \caption{\textbf{From the monthly bill alone, \method is the most accurate on HVAC.}
    Energy accuracy (\%, higher is better) and what each method needs from every home.
    LBM is best on the fridge. Best in \textbf{bold}.}
  \label{tab:main}
  \begin{tabular}{lllrr}
    \toprule
    & \multicolumn{2}{c}{Needs from each home} & \multicolumn{2}{c}{Accuracy (\%)} \\
    \cmidrule(lr){2-3}\cmidrule(lr){4-5}
    Method & Meter & Read & HVAC & Fridge \\
    \midrule
    FHMM & Smart meter & Every 15 min & 61 & 39 \\
    LBM  & Smart meter & Every 15 min & 56 & \textbf{72} \\
    \midrule
    \rowcolor{gray!12} \method (ours) & Billing meter & Once a month & \textbf{76} & 69 \\
    \bottomrule
  \end{tabular}
\end{table}
""",
    "thermeval": r"""\begin{table}[t]
  \caption{\textbf{No model matches people at telling who is hotter, and size does not help.}
    Task 5 accuracy (higher is better; chance is 0.50 and 0.17) and Task 6 error in $^\circ$C
    (lower is better). Open models are sorted by size; people are a reference. Best model in \textbf{bold}.}
  \label{tab:reasoning}
  \begin{tabular}{lrrrrr}
    \toprule
    & & \multicolumn{2}{c}{Who is hotter? (acc.)} & \multicolumn{2}{c}{How hot? ($^\circ$C)} \\
    \cmidrule(lr){3-4}\cmidrule(lr){5-6}
    Model & Params & Two people & Body parts & Marker & Region \\
    \midrule
    \multicolumn{6}{l}{\textit{Open, zero-shot}} \\
    Qwen-VL 2.5  & 8B   & 0.60 & 0.32 & 2.88 & 2.85 \\
    Intern-VL 3  & 38B  & 0.64 & 0.41 & 3.63 & 2.59 \\
    Qwen A22     & 235B & 0.48 & 0.34 & 3.72 & 3.40 \\
    \multicolumn{6}{l}{\textit{Fine-tuned on \method}} \\
    \rowcolor{gray!12} Qwen-VL 2.5 & 8B & 0.60 & \textbf{0.64} & 2.40 & 2.60 \\
    \multicolumn{6}{l}{\textit{Closed}} \\
    Gemini 3 Pro & n/a  & \textbf{0.74} & 0.61 & \textbf{1.86} & \textbf{1.47} \\
    \midrule
    People       &      & 0.84 & 0.54 & 2.73 & 2.04 \\
    \bottomrule
  \end{tabular}
\end{table}
""",
    "jouleseye": r"""\begin{table}[t]
  \caption{\textbf{Every input that includes breathing keeps the calorie error under 6\%.}
    Mean absolute percentage error (MAPE, \%, lower is better) against an indirect calorimeter,
    54 participants. The camera's breathing rate is simulated from a chest belt plus the camera's
    measured error. Reference rows use the calorimeter's own signals.}
  \label{tab:inputs}
  \begin{tabular}{llr}
    \toprule
    Input & Source & MAPE (\%) \\
    \midrule
    \multicolumn{3}{l}{\textit{Heart rate, as watches use}} \\
    Watch's own calorie estimate      & Apple Watch & 37.6 \\
    Heart rate                        & Apple Watch & 12.0 \\
    \multicolumn{3}{l}{\textit{Breathing, as \method uses}} \\
    \rowcolor{gray!12} Breathing                     & Camera (simulated) & 5.8 \\
    Breathing + heart rate            & Camera, watch & 5.5 \\
    Breathing + heart rate + temperature & Camera, watch & \textbf{5.2} \\
    \midrule
    \multicolumn{3}{l}{\textit{Reference: the calorimeter's own signals}} \\
    Heart rate                        & Chest band  & 10.2 \\
    Breathing                         & Calorimeter & 5.0 \\
    \bottomrule
  \end{tabular}
\end{table}
""",
    "gdmi": r"""\begin{table}[t]
  \caption{\textbf{TNP-D predicts PM2.5 most accurately, so GD-MI uses it.}
    RMSE ($\mu$g/m$^3$) and negative log-likelihood (NLL) on held-out years; lower is better for both.
    We choose on validation (2009--10) and also show test (2011--18). Models are grouped by family
    and sorted by validation RMSE. Best in \textbf{bold}.}
  \label{tab:surrogate}
  \begin{tabular}{lrrrr}
    \toprule
    & \multicolumn{2}{c}{Accurate? RMSE} & \multicolumn{2}{c}{Calibrated? NLL} \\
    \cmidrule(lr){2-3}\cmidrule(lr){4-5}
    Model & Val. & Test & Val. & Test \\
    \midrule
    \multicolumn{5}{l}{\textit{Neural processes}} \\
    \rowcolor{gray!12} TNP-D (chosen) & \textbf{4.90} & \textbf{9.11} & \textbf{$-$0.44} & 0.51 \\
    ConvCNP          & 5.28  & 10.78 & $-$0.27 & 0.59 \\
    ConvGNP          & 5.31  & 12.25 & $-$0.30 & 1.04 \\
    CANP             & 6.15  & 14.48 & $-$0.19 & 0.82 \\
    CNP              & 11.46 & 24.99 & 0.48    & 0.98 \\
    \multicolumn{5}{l}{\textit{Other models}} \\
    TabPFN           & 5.09  & 11.23 & $-$0.37 & \textbf{0.39} \\
    Gaussian process & 5.16  & 10.31 & $-$0.19 & 0.42 \\
    Random forest    & 6.55  & 15.37 & $-$0.11 & 2.43 \\
    \bottomrule
  \end{tabular}
\end{table}
""",
    "kestrel": r"""\begin{table}[t]
  \caption{\textbf{Kestrel is the most accurate method on phone audio, with the fewest labels.}
    Accuracy (\%, higher is better) on seen and unseen phone models, and labelled calls needed
    per species (lower is better). Methods are grouped by how many labels they need. Best in \textbf{bold}.}
  \label{tab:main}
  \begin{tabular}{lrrr}
    \toprule
    & \multicolumn{2}{c}{G1: accurate? (\%)} & G2: few labels? \\
    \cmidrule(lr){2-3}\cmidrule(lr){4-4}
    Method & Seen phones & Unseen phones & Calls / species \\
    \midrule
    \multicolumn{4}{l}{\textit{Need a hundred calls or more}} \\
    Supervised CNN          & 54 & 48 & 200 \\
    CNN + augmentation      & 57 & 50 & 200 \\
    Denoising + CNN         & 60 & 52 & 200 \\
    Domain adaptation       & 58 & 56 & 100 \\
    Fine-tuned transformer  & 61 & 55 & 100 \\
    \multicolumn{4}{l}{\textit{Need a few calls}} \\
    Few-shot prototypes     & 49 & 45 & \textbf{5} \\
    \rowcolor{gray!12} \method (ours) & \textbf{83} & \textbf{79} & \textbf{5} \\
    \bottomrule
  \end{tabular}
\end{table}
""",
}
