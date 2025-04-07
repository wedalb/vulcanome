from flask import Flask, render_template


def create_app():
    app = Flask(__name__)

    from .routes import main
    app.register_blueprint(main)

    # Custom error handler
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template("404.html"), 404

    return app
