from bs4 import BeautifulSoup
import numpy as np
from collections import Counter



class Scraper():
    def __init__(self, source: str, dim: int):
        with open(source) as f:
            self.soup =  BeautifulSoup(f, 'html.parser')
            self.dim = dim

    def get_grids(self) -> list:
        '''
        parses html file to reconstruct crossword layouts

        returns all the grids in the file, each with dimensions 
        self.dim x self.dim

        a 1 means it is a playable cell, a 0 means the cell is
        blocked out
        '''
        crossword_grids = []
        classes = []
        grids = self.soup.find_all('svg', class_ = 'svgGrid')

        for grid in grids:
            crossword_grid = []
            rects = grid.find_all('rect')
            for rect in rects:
                rect_class = rect['class'][0]
                classes.append(rect_class)
                if rect_class == 'default': 
                    crossword_grid.append(1)
                elif rect_class == 'block':
                    crossword_grid.append(0)
            
            crossword_grid = np.array(crossword_grid)
            crossword_grid = crossword_grid.reshape((self.dim, self.dim))
            crossword_grids.append(crossword_grid)
            print(crossword_grid)

        return crossword_grids


def main():
    scrapper = Scraper("../data/Crosserville Grid Search.html", 15)
    scrapper.get_grids()

if __name__ == "__main__":
    main()