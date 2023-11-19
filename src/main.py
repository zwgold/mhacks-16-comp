from processing import * 
from crossword import *


if __name__ == "__main__":
    word_clues, answers, answer_to_id = read_dataset("../data/small_clues.csv")
    crossword = Crossword(20, word_clues, answers, answer_to_id)
    
    crossword.generate_from_seeds()