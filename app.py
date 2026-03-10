import json
import os
from flask import Flask, render_template, request, jsonify

app = Flask(__name__,
    template_folder='frontend-ui',   
    static_folder='frontend-ui',
    static_url_path=''      
)

DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'data.json')

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    ALL_FILMS = json.load(f)


@app.route('/')
def index():
    return render_template('index.html')  


@app.route('/api/films')
def api_films():
    return jsonify(ALL_FILMS)


@app.route('/film/<int:film_id>')
def film_detail(film_id):
    if film_id < 0 or film_id >= len(ALL_FILMS):
        return "Film not found", 404
    film = ALL_FILMS[film_id]
    return render_template('details.html', film=film)  


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
    return jsonify(results)


if __name__ == '__main__':
    app.run(debug=True)