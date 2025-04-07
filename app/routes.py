import pandas as pd
import numpy as np
from flask import Blueprint, jsonify, current_app, render_template
import os

# Define the Flask Blueprint for main routes
main = Blueprint('main', __name__)


@main.route('/')
def home():
    """
    Render the home page of the application.

    Returns:
        HTML: Rendered 'index.html' template.
    """
    return render_template('index.html')


@main.route('/documentation')
def documentation():
    """
    Render the documentation page.

    Returns:
        HTML: Rendered 'documentation.html' template.
    """
    return render_template('documentation.html')


@main.route('/dashboard')
def dashboard():
    """
    Render the dashboard page.

    Returns:
        HTML: Rendered 'dashboard.html' template.
    """
    return render_template('dashboard.html')


@main.route('/about')
def about():
    """
    Render the about page.

    Returns:
        HTML: Rendered 'about.html' template.
    """
    return render_template('about.html')



@main.route('/api/volcano-data')
def get_volcano_data():
    """
    API endpoint to load volcano plot data from the 'S4B limma results' sheet.
    Uses logFC and -log10(adj.P.Val), with gene names from EntrezGeneSymbol.
    Returns:
        JSON: Keys 'x', 'y', 'text' for Plotly plotting.
    """
    try:
        file_path = os.path.join(current_app.root_path, 'data', 'NIHMS1635539-supplement-1635539_Sup_tab_4.xlsx')

        # Load headers from the 3rd row (index 2)
        df_raw = pd.read_excel(file_path, sheet_name='S4B limma results', header=None, skiprows=2)
        df_raw.columns = df_raw.iloc[0]  # use the third row as header
        df = df_raw[1:]  # skip the header row itself

        df = df[['logFC', 'adj.P.Val', 'EntrezGeneSymbol']].dropna()
        df['logFC'] = pd.to_numeric(df['logFC'], errors='coerce')
        df['adj.P.Val'] = pd.to_numeric(df['adj.P.Val'], errors='coerce')
        df['-log10_adj_pval'] = -np.log10(df['adj.P.Val'])

        data = {
            'x': df['logFC'].tolist(),
            'y': df['-log10_adj_pval'].tolist(),
            'text': df['EntrezGeneSymbol'].astype(str).tolist()
        }

        return jsonify(data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@main.route('/api/boxplot/<gene_name>')
def get_boxplot_data(gene_name):
    """
    API endpoint to return expression boxplot data for a given gene from the 'S4A values' sheet.
    Separates values into Young (YD) and Old (OD) donor groups based on column name substrings.

    Args:
        gene_name (str): Name of the gene to extract expression data for.

    Returns:
        JSON: Dict with 'young' and 'old' keys, each mapping to a list of values.
    """
    try:
        file_path = os.path.join(current_app.root_path, 'data', 'NIHMS1635539-supplement-1635539_Sup_tab_4.xlsx')

        # Load headers from 3rd row (index 2)
        df_raw = pd.read_excel(file_path, sheet_name='S4A values', header=None, skiprows=2)
        df_raw.columns = df_raw.iloc[0]  # use the third row as header
        df = df_raw[1:]  # skip the header row itself

        # Match gene by EntrezGeneSymbol (case insensitive)
        df['EntrezGeneSymbol'] = df['EntrezGeneSymbol'].astype(str)
        gene_row = df[df['EntrezGeneSymbol'].str.lower() == gene_name.lower()]
        if gene_row.empty:
            return jsonify({'error': f'Gene "{gene_name}" not found.'}), 404

        gene_row = gene_row.iloc[0]

        # Collect OD and YD values from appropriate columns
        old_values = []
        young_values = []

        for col, val in gene_row.items():
            if isinstance(col, str):
                if 'OD' in col:
                    old_values.append(val)
                elif 'YD' in col:
                    young_values.append(val)

        return jsonify({
            'gene': gene_name,
            'young': young_values,
            'old': old_values
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
