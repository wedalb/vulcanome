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
                customdata: data.text,
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

            // 🔥 Remove placeholder once plot is rendered
            const placeholder = document.querySelector("#volcano-plot-container .placeholder-text");
            if (placeholder) placeholder.style.display = "none";

            // 🎯 Handle clicks
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

            // ✅ Hide placeholder text in the boxplot panel
            const boxPlaceholder = document.querySelector("#boxplot-container .placeholder-text");
            if (boxPlaceholder) boxPlaceholder.style.display = "none";
        })
        .catch(error => {
            console.error("Error loading boxplot:", error);
        });
}
function updateGeneDetails(gene) {
    // Show gene details panel
    const panel = document.getElementById("gene-details");
    panel.style.display = "block";

    // Hide the placeholder container
    const placeholderContainer = document.getElementById("gene-info-container");
    if (placeholderContainer) placeholderContainer.style.display = "none";

    // Update gene name
    document.getElementById("gene-name").textContent = gene;

    // Optional placeholders (or real values later)
    document.getElementById("gene-fc").textContent = "...";
    document.getElementById("gene-pvalue").textContent = "...";
    document.getElementById("gene-adjp").textContent = "...";
    document.getElementById("gene-entrez").textContent = "...";
}


function updateGeneDetails(gene) {
    const panel = document.getElementById("gene-details");
    panel.style.display = "block";
    document.getElementById("gene-name").textContent = gene;

    const geneInfoPlaceholder = document.querySelector("#gene-info-container");
    if (geneInfoPlaceholder) geneInfoPlaceholder.style.display = "none";

    // Clear previous publications
    const pubContainer = document.querySelector(".publications");
    pubContainer.innerHTML = `
        <h4>Related Publications</h4>
        <p class="loading">Loading publications...</p>
    `;

    // Fetch actual publications
    fetch(`/api/publications/${gene}`)
        .then(response => response.json())
        .then(data => {
            const pubItems = data.publications || [];
            if (pubItems.length === 0) {
                pubContainer.innerHTML = `
                    <h4>Related Publications</h4>
                    <p>No publications found.</p>
                `;
                return;
            }

            pubContainer.innerHTML = `<h4>Related Publications</h4>`;
            pubItems.forEach(pub => {
                const item = document.createElement("div");
                item.classList.add("publication-item");

                item.innerHTML = `
                    <div class="publication-title">${pub.title}</div>
                    <div class="publication-authors">${pub.authors}</div>
                    <div class="publication-journal">${pub.journal}</div>
                    <a href="${pub.link}" target="_blank" class="publication-link">View on PubMed <i class="fas fa-external-link-alt"></i></a>
                `;
                pubContainer.appendChild(item);
            });
        })
        .catch(err => {
            pubContainer.innerHTML = `<h4>Related Publications</h4><p>Failed to load publications.</p>`;
            console.error("Error fetching publications:", err);
        });

    // (Optional: real values if added)
    document.getElementById("gene-fc").textContent = "...";
    document.getElementById("gene-pvalue").textContent = "...";
    document.getElementById("gene-adjp").textContent = "...";
    document.getElementById("gene-entrez").textContent = "...";
}


