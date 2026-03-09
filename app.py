# For Flask app
import json
import os
from flask import Flask, render_template, request
from flask import send_from_directory
app = Flask(__name__)

# Load film data once at startup
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'oscar_films.json')

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    ALL_FILMS = json.load(f)

@app.route('/data/<path:filename>')
def data_files(filename):
    return send_from_directory('data', filename)

@app.route('/')
def index():
    return render_template('index.html', films=ALL_FILMS)


@app.route('/film/<int:film_id>')
def film_detail(film_id):
    if film_id < 0 or film_id >= len(ALL_FILMS):
        return "Film not found", 404
    film = ALL_FILMS[film_id]
    return render_template('detail.html', film=film)


@app.route('/search')
def search():
    query = request.args.get('q', '').lower().strip()
    year_filter = request.args.get('year', '').strip()

    results = ALL_FILMS

    if query:
        results = [f for f in results if
                   query in f.get('title', '').lower() or
                   query in f.get('director', '').lower() or
                   query in f.get('starring', '').lower()]

    if year_filter:
        results = [f for f in results if f.get('year') == year_filter]

    return render_template('index.html', films=results, query=query, year_filter=year_filter)


if __name__ == '__main__':
    app.run(debug=True)