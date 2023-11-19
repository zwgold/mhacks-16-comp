'''
This is the FastAPI start index. Currently it has 4 paths

1. GET / -> Fetches the test bench HTML file. Used by browsers
2. POST /search -> This is the main search API which is responsible for perform the search across the index
3. GET /cache/:query/page/:page -> This path is meant to be a cached response for pagination purposes.
'''
# importing external modules

import pandas as pd 
from theme import Querier
from main import make_crossword

from flask import Flask, request, jsonify

if __name__ == '__main__':
    app = Flask(__name__)
    app.run(debug=True, port=8000)
    querier = Querier()
    clues_df = pd.read_pickle('../data/clues.pd')



@app.route()
def create():
    data = request.get_json()
    print(data)
    make_crossword(data['search'])

    return jsonify({'message': 'Data received', 'data': data}), 200






