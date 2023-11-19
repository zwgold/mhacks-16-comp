import torch
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer, util
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
            sources =set(['times_xwd_times', 'cru_cryptics','newyorker', 'thebrowser', 'leoedit', 'nytimes'])
            ): 
        queries = self.query_df 
        emb = self.model.encode(query)
        scores = util.dot_score(emb,self.embeddings).flatten().cpu().numpy()
        queries['score'] = scores
        # TODO: PRAY THAT THIS WORKS 

        queries = queries[queries["answer"].apply(lambda x: len(x)).isin(range(lenrange[0],lenrange[1]))]
        if sources is not None: 
            queries = queries[queries.source.isin(sources)]

        queries = queries.sort_values('score',ascending=False)
        print(queries)
        return queries.head(n)

def encode(queries:pd.DataFrame,
           model_name="sentence-transformers/msmarco-MiniLM-L12-cos-v5",
           lenrange=(8,14),
           device=None,
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
    query_texts = queries.apply(lambda x:x['answer']  + ": " + '('.join(x['clue'].split('(')[:-1]),axis=1)
    model = SentenceTransformer(model_name_or_path=model_name,device=device)

    print('loaded model')
    embeddings = model.encode(sentences=query_texts.to_numpy())
    print('embedded')
    np.save('../data/embeddings.numpy',embeddings)
    queries.to_csv('../data/embedding_queries.csv')
    queries.to_pickle('../data/embedding_queries.pkl')

    
if __name__ == "__main__": 
    df = pd.read_pickle('../data/clues.pd')
    encode(df,lenrange=(10,14))

    querier = Querier()
    print(querier.get_queries('fluffy white dog',n=5))



