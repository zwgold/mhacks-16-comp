import torch
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer, util
from preprocess_wordlist import VALID_CWORD_SOURCES

from tqdm import tqdm

class Querier(): 
    def __init__(self,
                model_name="sentence-transformers/msmarco-MiniLM-L12-cos-v5",
                query_df_path = '../data/embedding_queries.pkl',
                embs_path ='../data/embeddings.numpy.npy', 
                device =None
            ): 
        
        if device is None: 
            if torch.cuda.is_available(): 
                device = 'cuda'
            elif torch.backends.mps.is_available(): 
                device = 'mps'
            else: 
                device = 'cpu'
        self.model = SentenceTransformer(model_name_or_path=model_name,device=device)
        self.query_df = pd.read_pickle(query_df_path)
        self.embeddings = np.load(embs_path)
    
    def gen_seed_words(self,  query:str,  n,    
            lenrange=(10,14),
            device=None,
            sources =set(VALID_CWORD_SOURCES)
            ): 
        queries = self.query_df 
        emb = self.model.encode(query)
        scores = util.dot_score(emb,self.embeddings).flatten().cpu().numpy()
        queries['score'] = scores
        # TODO: PRAY THAT THIS WORKS 

        queries = queries[queries["answer"].apply(lambda x: len(x)).isin(range(lenrange[0],lenrange[1]))]
        if sources is not None: 
            queries = queries[queries.source.isin(sources)]

        queries = queries.sort_values('score',ascending=False).drop_duplicates(subset=['answer'])
        # print(queries)
        return queries.head(n)

    def reweight_wordlist(self,query,wordlist_in_file, wordlist_out_file):
        pass

    def get_clue_for_word(self,word,clues_df,sources = VALID_CWORD_SOURCES):
 
        options = clues_df[clues_df['answer'].apply(lambda x: x.lower()) == word.lower()]
        # print(len(options),word) 

        if sources is not None: 
            options= options[options['source'].isin(sources)]

        # print(options)
        # print(len(options))
        choice = options.sample(n=1)
        # print(choice)
        return choice['clue'].iloc[0]

def encode(queries:pd.DataFrame,
           model_name="sentence-transformers/msmarco-MiniLM-L12-cos-v5",
           lenrange=(0,16),
           device=None,
           suffix= "",
           sources =None ): 
    if device is None and  torch.backends.mps.is_available(): 
        device = 'mps'
    elif device is None and torch.cuda.is_available(): 
        device = 'cuda'
    elif device is None: 
        device = 'cpu'
    
    # Pare down size of documents 
    queries = queries[queries["answer"].apply(lambda x: len(x)).isin(range(lenrange[0],lenrange[1]))]
    if sources is not None: 
        queries = queries[queries.source.isin(sources)]
    queries = queries.reset_index(drop=True)

    # queries = queries.head(1000)
    query_texts = queries.apply(lambda x:x['answer'] ,axis=1)
    model = SentenceTransformer(model_name_or_path=model_name,device=device)

    print('loaded model')
    embeddings = model.encode(sentences=query_texts.to_numpy())
    print('embedded')
    np.save(f'../data/embeddings{suffix}.numpy',embeddings)
    queries.to_csv(f'../data/embedding_queries{suffix}.csv')
    queries.to_pickle(f'../data/embedding_queries{suffix}.pkl')



    
if __name__ == "__main__": 
    df = pd.read_pickle('../data/clues.pd')
    model_name = 'sentence-transformers/msmarco-MiniLM-L12-cos-v5'
    suffix = ''
    print(df)


    encode(df,model_name=model_name,lenrange=(0,15),suffix=suffix)

    querier = Querier(
        model_name=model_name,
        query_df_path=f'../data/embedding_queries{suffix}.pkl',
        embs_path=f'../data/embeddings{suffix}.numpy.npy'
    )
    print(querier.gen_seed_words('fluffy white dog',n=5,lenrange=(10,14)))
    print(querier.get_clue_for_word('test',df))




