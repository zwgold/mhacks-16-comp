"""
Util for generating and manipulating the wordlist, and cluelist 

This takes care of preliminary preprocessing and other useful data util functions. 

"""
import pandas as pd
from collections import defaultdict
from tqdm import tqdm 

# valid_sources = ['newyorker','nytimes','cru_cryptics','bigdave','natpostcryptic']
VALID_CWORD_SOURCES = ['nytimes','newyorker','thebrowser','bigdave44']

def load_clues_df(clueslist_path:str ):
    df = pd.read_csv(clueslist_path)
    df['clue'] = df['clue'].apply(lambda x: str(x).lower())
    df['answer'] = df['answer'].apply(lambda x: str(x).lower())
    mask = df['clue'].apply(lambda x: str(x).isascii()) & df['answer'].apply(lambda x: str(x).isascii())
    df = df[mask]
    df['answer'] = df['answer']
    clues = df["clue"].tolist()
    answer = df["answer"].tolist()

    word_clues = defaultdict(list)
    for i in range(len(clues)):
        word_clues[answer[i].lower()].append(clues[i]) 

    return df, word_clues 

def filter_wordlist(clueslist_path:str, wordlist_path:str,filtered_path, min_score=10,filter_df = True): 
    clues_df, word_clues = load_clues_df(clueslist_path=clueslist_path)
    # clues_df = clues_df[clues_df.source.isin(VALID_CWORD_SOURCES)]
    filtered_words = set()
    n_min_score =0
    n_clue_filtered = 0 
    print(clues_df)
    with open(wordlist_path,'r') as infile: 
        with open(filtered_path,'w') as outfile: 
            for line in tqdm(infile.readlines()):
                word,scoretext = line.split(';')
                if int(scoretext) < min_score: 
                    n_min_score += 1 
                    continue 
                if word.lower() in word_clues: 
                    outfile.write(line)
                    if filter_df: 
                        filtered_words.add(word.lower())
                else: 
                    n_clue_filtered += 1
    print(f'filtered {n_min_score + n_clue_filtered} words from list ({n_min_score} by score, {n_clue_filtered} by clue)')
    if filter_df: 
        filtered_df =clues_df[clues_df['answer'].apply(lambda x: x.lower()).isin(filtered_words)]
        print(filtered_df)
        filtered_df.to_pickle('../data/clues.pd') 
        filtered_df.to_csv('../data/clues.csv') 

        return filtered_df


if __name__ == "__main__":
    clues = filter_wordlist('../data/clues.csv','../data/spreadthewordlist.dict','../data/filtered_wordlist_2.dict')
    print(clues)
                
    