from flask import Blueprint, render_template

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return render_template('index.html')

@main.route('/documentation')
def documentation():
    return render_template('documentation.html')
@main.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')


@main.route('/about')
def about():
    return render_template('about.html')
