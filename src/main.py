#!/usr/bin/env python3
from crossword import *
from processing import * 
from requester import *
from scraper import *
from theme import Querier
import sys

from blacksquare import *

from collections import Counter

import json
import numpy as np
import random
import subprocess

def insert_words(maps, seedlist, ntries=4):
    # seed list == seed words
    for n_words in range(len(seedlist), 1, -1): 
        for mp in maps:
            for _ in range(ntries): 
                random.shuffle(seedlist)
                wordlist = seedlist[:n_words]
                mp = np.copy(mp)

                across_locs = []
                down_locs = []
                lengths = [len(word) for word in wordlist]

                # get slots
                for word in lengths:
                    addedToRow = False
                    for idx, row in enumerate(mp):
                        i = 0
                        # If we have added it in a row, don't continuing!
                        if addedToRow:
                            break
                        while i < len(row):
                            # Initial Case: Not a word
                            if row[i] == '#':
                                i += 1
                                continue
                            
                            j = i + 1
                            while j < len(row) and (row[j] == '.'):
                                j += 1
                            
                            lenOfAttempt = j - i
                            if word == lenOfAttempt:
                                across_locs.append((idx, (i, j)))
                                i = len(row)
                            else:
                                i = j + 1
                    # Try to add via column
                    if not addedToRow:
                        addedToCol = False
                        for idx, col in enumerate(np.transpose(mp)):
                            i = 0
                            # If we have added it in a row, don't continuing!
                            if addedToCol:
                                break
                            while i < len(col):
                                # Initial Case: Not a word
                                if col[i] == '#':
                                    i += 1
                                    continue
                                
                                j = i + 1
                                while j < len(col) and (col[j] == '.'):
                                    j += 1
                                
                                lenOfAttempt = j - i
                                if word == lenOfAttempt:
                                    down_locs.append((idx, (i, j)))
                                    i = len(col)
                                else:
                                    i = j + 1
                
                # fill in the words 
                success = True 
                for word in wordlist: 
                    inserted = False 
                    for row, (stcol, encol) in across_locs: 
                        if  np.all(mp[row,stcol:encol] == '.') and encol-stcol == len(word): 
                            # print(word)
                            mp[row,stcol:encol] = word
                            for i in range(len(word)): 
                                mp[row,stcol+i] = word[i]
                            inserted=True
                            break
                    if not inserted: 
                        for col, (strow, enrow) in down_locs: 
                            if  np.all(mp[strow:enrow,col] == '.') and enrow-strow == len(word):
                                # print(word)
                                
                                for i in range(len(word)): 
                                    mp[strow+i,col] = word[i]
                                print(mp)
                                inserted=True
                                break
                    if not inserted: 
                        success = False
                        break
                if success: 
                    print('built map')
                    # print(mp)
                    return mp

    # otherwise return an empty map
    print('inserting failed')
    return maps[0]
                    

def make_crossword(query,querier,clues_df,n=3,print_output:bool=True):
    genWords = querier.gen_seed_words(query,n=n)["answer"].to_numpy()
    desired_counts = Counter(len(word) for word in genWords)
    
    if print_output: 
        print("Using Key Words")
        for word in genWords: 
            print(word)

    has_maps = 0
    iterations = 10
    i = 0
    while has_maps == 0:
        maps = get_possible_maps(desired_counts)
        has_maps = len(maps)
        i += 1
        if i == iterations:
            exit()
    
    random.shuffle(maps)
    # try putting in our words 
    
    mp = insert_words(maps,genWords)

    with open("temp.txt", 'w') as fp:
        for row in mp:
            for elt in row:
                # write each item on a new line
                fp.write("%s" % elt)
            fp.write("\n")
        fp.close()

    
    with open('out-file.txt', 'w') as f:
        print('running ingrid')
        subprocess.run(["ingrid_core", "--wordlist", "../data/filtered_wordlist_2.dict", "temp.txt"], stdout=f)
        print('done generating crossword')

    matrixRep = []
    with open('out-file.txt', 'r') as reopen:
        lines = reopen.readlines()
        for line in lines:
            newTempList = list(line)
            matrixRep.append(newTempList[:-1])
    matrixRep = np.array(matrixRep)
    across, down = get_words_across_down(matrixRep)

    if len(matrixRep) == 0: 
        return None 

    # Construct JSON
    # print('building clueslist')
    jsonList = []
    for word, pos in across:
        tempDict = {}
        x, y = pos
        tempDict["clue"] = querier.get_clue_for_word(word, clues_df,sources=None)
        tempDict["answer"] = word.upper()
        tempDict["direction"] = "across"
        tempDict["x"] = y
        tempDict["y"] = x
        jsonList.append(tempDict)

    for word, pos in down:
        tempDict = {}
        x, y = pos
        tempDict["clue"] = querier.get_clue_for_word(word, clues_df,sources=None)
        tempDict["answer"] = word.upper()
        tempDict["direction"] = "down"
        tempDict["x"] = y
        tempDict["y"] = x
        jsonList.append(tempDict)

    # print('Done building clueslist')

    y = json.dumps(jsonList)
    with open("../website/main/data/custom.json", "w") as outfile:
        outfile.write(y)

    
    filled = []
    for i in range(len(matrixRep)):
        for j in range(len(matrixRep[0])):
            if matrixRep[i][j] == '#':
                filled.append((i, j))
    
    xw = Crossword(num_rows=len(matrixRep), num_cols=len(matrixRep[0]))
    for i in filled:
        xw[i] = BLACK
    
    unfilled_words = list(xw.iterwords())

    across = [word for word, _ in across]
    down = [word for word, _ in down]
    complete = np.hstack((across, down))

    # get clues from this list
    xw.to_pdf('puzzle.pdf')
    for i in range(len(unfilled_words)):
        direction = unfilled_words[i]._direction
        number = unfilled_words[i]._number
        xw[direction, number] = complete[i]
    
    xw.to_pdf('solution.pdf')
    xw.pprint()
    return xw


def main():
    import warnings
    warnings.filterwarnings("ignore")
    import logging 
    logging.disable(logging.WARNING)
    TOKENIZERS_PARALLELISM=True
    querier = Querier()
    clues_df = pd.read_pickle('../data/clues.pd')

    print_output = True 
    for i in range(4):
        res = make_crossword(sys.argv[1],querier,clues_df,n=3,print_output=False)
        if res is not None: 
            return 


if __name__ == "__main__":
    main()