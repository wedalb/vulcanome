document.addEventListener("DOMContentLoaded", function () {
    loadVolcanoPlot();
});

function loadVolcanoPlot() {
    fetch("/api/volcano-data")
        .then(response => response.json())
        .then(data => {
            const volcanoTrace = {
                x: data.x,
                y: data.y,
                text: data.text,
                customdata: data.text,  // store gene name
                mode: "markers",
                type: "scatter",
                marker: {
                    color: data.x.map((fc, i) => {
                        const isSignificant = data.y[i] > -Math.log10(0.05);
                        if (!isSignificant) return "gray";
                        return fc > 0 ? "crimson" : "royalblue";
                    }),
                    size: 8
                },
                hovertemplate: "<b>%{text}</b><br>log2FC: %{x}<br>-log10(p): %{y}<extra></extra>"
            };

            const volcanoLayout = {
                title: "Volcano Plot",
                xaxis: { title: "log2 Fold Change" },
                yaxis: { title: "-log10 Adjusted P-value" },
                margin: { t: 40 },
                plot_bgcolor: "#1e1e1e",
                paper_bgcolor: "#1e1e1e",
                font: { color: "#eee" }
            };

            Plotly.newPlot("volcano-plot-container", [volcanoTrace], volcanoLayout);

            // Handle clicks
            document.getElementById("volcano-plot-container").on('plotly_click', function (eventData) {
                const gene = eventData.points[0].customdata;
                console.log("Clicked gene:", gene);
                updateGeneDetails(gene);
                fetchBoxplot(gene);
            });
        })
        .catch(error => {
            console.error("Error loading volcano data:", error);
        });
}

function fetchBoxplot(gene) {
    fetch(`/api/boxplot/${gene}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error(data.error);
                return;
            }

            const traceYoung = {
                y: data.young,
                name: "Young",
                type: "box",
                boxpoints: "all",
                jitter: 0.3,
                pointpos: -1.8,
                marker: { color: "#66bb6a" }
            };

            const traceOld = {
                y: data.old,
                name: "Old",
                type: "box",
                boxpoints: "all",
                jitter: 0.3,
                pointpos: 1.8,
                marker: { color: "#ef5350" }
            };

            const boxLayout = {
                title: `Protein Concentration: ${gene}`,
                yaxis: { title: "Expression Level" },
                margin: { t: 40 },
                plot_bgcolor: "#1e1e1e",
                paper_bgcolor: "#1e1e1e",
                font: { color: "#eee" }
            };

            Plotly.react("boxplot-container", [traceYoung, traceOld], boxLayout);
        })
        .catch(error => {
            console.error("Error loading boxplot:", error);
        });
}

function updateGeneDetails(gene) {
    const panel = document.getElementById("gene-details");
    panel.style.display = "block";
    document.getElementById("gene-name").textContent = gene;

    // Optional: set placeholders or integrate with MyGene.info
    document.getElementById("gene-fc").textContent = "...";
    document.getElementById("gene-pvalue").textContent = "...";
    document.getElementById("gene-adjp").textContent = "...";
    document.getElementById("gene-entrez").textContent = "...";
}
