#!/usr/bin/env python3
from crossword import *
from processing import * 
from requester import *
from scraper import *
from query import Querier

from blacksquare import *
from collections import Counter

import numpy as np
import random
import subprocess


if __name__ == "__main__":
    querier = Querier()
    genWords = querier.gen_seed_words("my dog mitsy", n=3)["answer"]
    desired_counts = Counter(len(word) for word in genWords)
    maps = get_possible_maps(desired_counts)
    print(len(maps))
    if len(maps) > 0:
        random.shuffle(maps)
        mp = maps[0]
        old_mp = mp

        for word in genWords:
            addedToRow = False
            # IDEA: DO ALL STUFF, GENERATE UNTIL FILLABLE
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

                    if len(word) == lenOfAttempt:
                        l = 0
                        for k in range(i, j):
                            mp[idx][k] = word[l]
                            l += 1
                            addedToRow = True
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

                        if len(word) == lenOfAttempt:
                            l = 0
                            for k in range(i, j):
                                mp[k][idx] = word[l]
                                l += 1
                                addedToCol = True
                            i = len(col)
                        else:
                            i = j + 1

        print(mp)
        with open("temp.txt", 'w') as fp:
            for row in mp:
                for elt in row:
                    # write each item on a new line
                    fp.write("%s" % elt)
                fp.write("\n")
            fp.close()

    

    with open('out-file.txt', 'w') as f:
        print('running ingrid')
        subprocess.run(["ingrid_core", "--wordlist", "../data/filtered_wordlist.dict", "temp.txt"], stdout=f)
        print('done generating crossword')

    matrixRep = []
    with open('out-file.txt', 'r') as reopen:
        lines = reopen.readlines()
        for line in lines:
            newTempList = list(line)
            matrixRep.append(newTempList[:-1])
    matrixRep = np.array(matrixRep)
    across, down = get_words_across_down(matrixRep)


    filled = []
    for i in range(len(matrixRep)):
        for j in range(len(matrixRep[0])):
            if matrixRep[i][j] == '#':
                filled.append((i, j))

    xw = Crossword(num_rows=len(matrixRep), num_cols=len(matrixRep[0]))
    for i in filled:
        xw[i] = BLACK
    
    unfilled_words = list(xw.iterwords())

    complete = np.hstack((across, down))

    # get clues from this list


    xw.to_pdf('puzzle.pdf')
    for i in range(len(unfilled_words)):
        direction = unfilled_words[i]._direction
        number = unfilled_words[i]._number
        xw[direction, number] = complete[i]
    
    xw.to_pdf('solution.pdf')
    
    # seed_cands = gen_seed_cands
    
    # word_clues, answers, answer_to_id = read_dataset("../data/small_clues.csv")
    # crossword = Crossword(20, word_clues, answers, answer_to_id)
    # crossword.generate_from_seeds()