import numpy as np 
import requests

def get_possible_maps(n_per_len:dict[int,int],symmetry=0):
    params = n_per_len
    params.update({"symmetry": symmetry})
    with requests.session() as s: 
        res = s.get('https://www.crosserville.com/search/gridSearch', params=params)
    resp_dict = res.json()
    return decode_maps(resp_dict['results'])

def decode_maps(resp_dict:list[dict[str,str]]) -> list[np.ndarray]:
    """ 
    reads in json response and returns a list of numpy 2d arrays for each element
    """
    grids = []
    for grid in resp_dict: 
        ncols, nrows = (int(grid['ncols']),grid['nrows'])
        grid_str = grid['grid']
        grid_np = np.full((nrows,ncols),'!')
        for i, elt in enumerate(grid_str):
            grid_np[i // ncols, i % ncols] = ('.' if elt == '?' else "#") # "." for space, "#' for wall
        grids.append(grid_np)
        assert(not np.any(grid_np == '!')) # Ensure that every spot is filled 
    return grids 
