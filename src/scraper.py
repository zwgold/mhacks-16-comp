from bs4 import BeautifulSoup
import numpy as np
from collections import Counter
from numpy import array



class Scraper():
    def __init__(self, source: str, dim: int):
        '''
        helper class to scrape crossword layouts
        from crosserville.com

        ARGS:
            source = html file to scrape from 
        '''
        with open(source) as f:
            self.soup =  BeautifulSoup(f, 'html.parser')
            self.dim = dim

    def get_grids(self) -> list[array]:
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

        return crossword_grids



class Grid():
    def __init__(self, grid: array, dim: int):
        self.grid = grid
        self.dim = dim

    def get_grid_capacity(self) -> list[str]:
        # across / down--> list of tuples (start pos, len of word)
        across = []
        down = []
        for i in range(self.dim):
            row = self.grid[i, :]
            col = self.grid[:, i]

            i = 0
            while i < len(row): 
                run = 1
                if row[i] == 0: 
                    i += 1
                    continue

                # If it's not a 0, must be a one, now we count forward
                j = i + 1
                while j < len(row) and row[i] == row[j]:
                    j += 1
                
                run = j - i
                across.append((i, run, ))
                i = j + 1

            i = 0
            while i < len(col): 
                run = 1
                if col[i] == 0: 
                    i += 1
                    continue

                # If it's not a 0, must be a one, now we count forward
                j = i + 1
                while j < len(col) and col[i] == col[j]:
                    j += 1
                
                run = j - i
                down.append((i, run))
                i = j + 1

        self.across_capacity = across 
        self.down_capacity = down

        across_lengths = [l for _, l in across]
        down_lengths = [l for _, l in down]

        self.across_lengths = Counter(across_lengths)
        self.down_lengths = Counter(down_lengths)
        return (across, down)


def get_words_across_down(matrixRep) -> tuple[list[str], list[str]]:
    across = []
    down = []

    # Across
    for idx, row in enumerate(matrixRep):
        i = 0
        while i < len(row):
            # Initial Case: Not a word
            if row[i] == '#':
                i += 1
                continue
            
            temp = row[i]
            
            j = i + 1
            while j < len(row) and row[j] != '#':
                temp += row[j]
                j += 1
            
            #across.append((temp, (idx, i)))
            across.append(temp)
            i = j + 1

    # Down
    for idx, col in enumerate(np.transpose(matrixRep)):
        i = 0
        while i < len(col):
            # Initial Case: Not a word
            if col[i] == '#':
                i += 1
                continue
            
            temp = col[i]
            
            j = i + 1
            while j < len(col) and col[j] != '#':
                temp += col[j]
                j += 1
            
            down.append((temp, (i, idx)))
            i = j + 1
    down.sort(key = lambda x: x[1][0]*100 + x[1][1])
    down = [word for (word, _) in down]
    return (across, down)

def main():
    # scrapper = Scraper("../data/Crosserville Grid Search.html", 15)
    # grids = scrapper.get_grids()

    test_array = np.array([[0, 1, 0], [1, 1, 1], [1, 1, 0]])
    g = Grid(test_array, 3)
    g.get_grid_capacity()

    print(g.across_lengths)
    print(g.down_lengths)

if __name__ == "__main__":
    main()