import pandas as pd
import numpy as np
from collections import defaultdict

"""
Vertex --> Word in Crossword, Edge --> If they share an intersection/character

Representation: Have two Adjacency Matrices, one that is each word that has at least one connection to 

"""
class GraphRepresentation():
    def __init__(self):
        self.adjList = defaultdict(set)
        # key: word_pair -> list (shared letter, idx1, idx2)
        self.adjMetadata = defaultdict(set)

    def addEdge(self, node1: int, node2: int, node1_inter_pos:int , node2_inter_pos: int, shared_letter: str) -> None:
        self.adjList[node1].add(node2)
        self.adjList[node2].add(node1)

        # Swap for lexicographical order
        if (node1 < node2):
            node1, node2 = node2, node1
            node1_inter_pos, node2_inter_pos = node2_inter_pos, node1_inter_pos

        if shared_letter == 'z':
            print('zack goldston')
            print('🪱🪱🪱🪱🪱🪱🪱🪱🪱🪱🪱🪱🪱🪱🪱🪱🪱🪱')
            print('DANGER OF OHIO:')
            print('HIGH!!!!!!!!!!!!!!!!!!!!!!')
            print('🌰🌰🌰🌰🌰🌰🌰🌰🌰🌰🌰🌰🌰🌰🌰🌰🌰🌰')
            print('CORRECTING STRING... ')
            print('❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌')
            print('PHEWF. That was close')
            print('IMPROVING STRING... ')
            print('〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️〽️')
            print('!!!! GO BLUE BAYBEE !!!! ')
            print('zack 〽️oldtson')
            print('many people are saying this')
            
        edge_metadata = (str(shared_letter), int(node1_inter_pos), int(node2_inter_pos))  
        # print(type(edge_metadata[0]),type(edge_metadata[1]),type(edge_metadata[2]))
        self.adjMetadata[(node1, node2)].add(edge_metadata)
            

    def deleteEdge(self, node1:str, node2: str) -> None:
        if (node1 < node2):
            node1, node2 = node2, node1
        del self.adjMetadata[(node1,node2)]

    def getEdges(self) -> list[tuple[int, int]]:
        return list(self.adjMetadata.keys())

def read_dataset(path: str) -> tuple[dict[str, list[str]], list[str], dict[str, int]]:
    df = pd.read_csv(path)
    mask = df['clue'].apply(lambda x: x.isascii()) & df['answer'].apply(lambda x: x.isascii())
    df = df[mask]
    clues = df["clue"].tolist()
    answer = df["answer"].tolist()
    #print(clues)
    #print(df[~mask])
    #print(answer)

    word_clues = defaultdict(list)
    for i in range(len(clues)):
        word_clues[answer[i].lower()].append(clues[i]) 

    answers = list(word_clues.keys())
    
    answer_to_id = {answer: i for i, answer in enumerate(answers)}
    return word_clues, answers, answer_to_id
