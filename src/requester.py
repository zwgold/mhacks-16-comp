import requests
import numpy as np 

# targ_url = "www.crosserville.com/search/grid_search"

def get_possible_maps(n_per_len:dict[int,int],symmetry=0):
    params = n_per_len
    params.update({"symmetry": symmetry})
    with requests.session() as s: 
        res = s.get('https://www.crosserville.com/search/gridSearch',params=params)
        print(res)
    resp_dict = res.json()
    # print(resp_dict)
    # print(resp_dict['numResults']['count'], len(resp_dict['results']))
    return decode_maps(resp_dict['results'])

def decode_maps(resp_dict:list[dict[str,str]]) -> list[np.ndarray]:
    """ 
    reads in json response and returns a list of numpy 2d arrays for each element
    """
    grids = []
    for grid in resp_dict: 
        ncols, nrows = (int(grid['ncols']),grid['nrows'])
        grid_str = grid['grid']
        grid_np = np.full((nrows,ncols),-1)
        for i, elt in enumerate(grid_str):
            grid_np[i // ncols, i % ncols] = (1 if elt == '?' else 0)
        grids.append(grid_np)
    return grids 


if __name__ == "__main__": 
    maps = get_possible_maps({14:3, 11:2})
    print(len(maps))
    if len(maps) > 0: 
        print(maps[0])
    
