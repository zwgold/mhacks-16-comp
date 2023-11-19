from processing import GraphRepresentation
import numpy as np 
import regex as re
from collections import Counter


class Crossword():
    def __init__(self, n_seeds: int, word_clues: dict[list[str]], answers: list[str], answer_to_id: dict[str, int]):
        '''
        n_seeds: how many random words to start with 
        '''
        self.n_seeds = n_seeds
        self.word_clues = word_clues
        self.answers = answers
        self.answer_to_id = answer_to_id 
        self.seed_words = np.random.choice(self.answers, self.n_seeds)
        self.graph = GraphRepresentation()


    def get_rand_shared_character(self, word1: str, word2: str) -> tuple[int, int]:
        '''
        Helper function for generate_from_seeds

        Takes in two nodes, sees if there are shared characters
        Returns a random position where there's a shared character

        ARGS:
            word1 = first word
            word2 = second word
        '''
        shared_characters = list(set(word1) & set(word2))
        if len(shared_characters) > 0:
            word1_char_counts = Counter(word1)
            word2_char_counts = Counter(word2)
            shared_character = np.random.choice(shared_characters, 1)[0]

            if word1_char_counts[shared_character] == 1:
                word1_pos = list(word1).index(shared_character)
            else:
                shared_positions = [pos for pos, char in enumerate(list(word1)) if char == shared_character]
                word1_pos = np.random.choice(shared_positions, 1)[0]
                    
            if word2_char_counts[shared_character] == 1:
                word2_pos = list(word2).index(shared_character)
            else:
                shared_positions = [pos for pos, char in enumerate(list(word1)) if char == shared_character]
                word2_pos = np.random.choice(shared_positions, 1)[0]

                return (word1_pos, word2_pos, str(shared_character))
        else:
            return None



    def generate_from_seeds(self) -> None:
        '''
        Function that will generate the graph from the words chosen via seeds
        '''
        for i in range(len(self.seed_words)):
            for j in range(len(self.seed_words)):
                if i != j:
                    # avoid too many connections
                    word1 = self.seed_words[i]
                    word2 = self.seed_words[j]
                    word1_id = self.answer_to_id[word1]
                    word2_id = self.answer_to_id[word2]
                    existing_edges = self.graph.getEdges()
                    if (word1_id, word2_id) in existing_edges or (word2_id, word1_id) in existing_edges:
                        continue

                    res = self.get_rand_shared_character(word1, word2)
                    if res != None:
                        word1_pos, word2_pos, shared_character  = res
                        # print(shared_character, type(shared_character))
                        self.graph.addEdge(word1_id, word2_id, word1_pos, word2_pos, shared_character)



                