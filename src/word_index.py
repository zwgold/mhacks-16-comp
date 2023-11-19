import pandas as pd 
from collections import defaultdict 

class GraphRepresentation():
    def __init__(self):
        self.id_to_word = {}
        self.word_to_id = {}
        self.num_unique_words = 0 
        self.postings : dict[tuple[int, int, str], list[int]] = defaultdict(list)

    def add_word(self, word: str) -> None:
        if word in self.word_to_id:
            return
        self.word_to_id[word] = self.num_unique_words
        self.id_to_word[self.num_unique_words] = word
        word_len = len(word) 

        for pos, letter in enumerate(word): 
            self.postings[(pos,word_len, letter)].append(self.num_unique_words)
        self.num_unique_words += 1

    def remove_word(self, word: str) -> None: 
        word_id = self.word_to_id.pop(word)
        self.id_to_word.pop(word_id)
        for pos, letter in enumerate(word): 
            self.postings[(pos, len(word), letter)].remove(word_id)

    def find_compatible_words(self, pos: int, letter: str, length: int):
        tup = (pos, length, letter)
        return self.postings[tup]

    @staticmethod
    def create_index(answers) -> "GraphRepresentation":
        for index, answer in answers.items(): 
            
        

def read_dataset(path: str) -> tuple[dict[str, list[str]], list[str], dict[str, int]]:
    df = pd.read_csv(path)
    mask = df['clue'].apply(lambda x: x.isascii()) & df['answer'].apply(lambda x: x.isascii())
    df = df[mask]
    clues = df["clue"].tolist()
    words = df["answer"].tolist()
    #print(clues)
    #print(df[~mask])
    #print(answer)

    word_clues = defaultdict(list)
    for i in range(len(clues)):
        word_clues[words[i].lower()].append(clues[i]) 

    answers = list(word_clues.keys())
    
    answer_to_id = {answer: i for i, answer in enumerate(answers)}
    return word_clues, answers, answer_to_id

