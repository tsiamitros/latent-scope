# latent-scope
A lens formed by the embeddings of a model, illuminated by data points and housed by an interactive web interface 


# Repository overview
This repository is currently meant to run locally, as it has several pieces that use the file system to coordinate functionality.

## data
The data directory is where you will put your datasets, and where the scripts and app will store the output of their processes along with the associated metadata. The web app will look at the contents of this folder using a specific directory structure.

## client
A React app that provides the interface for operating the scope and running the various scripts 
```bash
cd client
npm install
npm run dev
```

## Python setup
The following directories depend on a virtual env

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## notebooks
There are some example notebooks for preparing data from CSV format into the input.parquet format that latent scope expects for a dataset. 
* [dvs-survey](notebooks/dvs-survey.ipynb)
* [dadabase](notebooks/dadabase.ipynb)

## scripts
Python scripts that can be run via CLI or via the web interface (through the server). The scripts assume a certain directory structure in the data folder.  
See below for more detailed instructions on using the scripts


## python_server
A python server that provides access to the data as well as on-demand nearest neighbor search and simple queries into larger datasets
```bash
cd python_server
python server.py
```

# Directory structure

Each dataset in data will have its own directory
<pre>
├── data/
|   ├── dataset1/
|   |   ├── input.parquet                       # you provide this file
|   |   ├── embeddings/
|   |   |   ├── e5-small-v2.npy                 # from embed-*.py, embedding vectors
|   |   |   ├── UAE-Large-V1.npy                # files are named after the model
|   |   ├── umaps/
|   |   |   ├── umap-001.parquet                # from umap.py, x,y coordinates
|   |   |   ├── umap-001.json                   # from umap.py, params used
|   |   |   ├── umap-001.png                    # from umap.py, thumbnail of plot
|   |   |   ├── umap-002....                    # subsequent runs increment
|   |   ├── clusters/
|   |   |   ├── clusters-001.parquet            # from clusters.py, cluster labels
|   |   |   ├── clusters-001.json               # from clusters.py, params used
|   |   |   ├── clusters-001.png                # from clusters.py, thumbnail of plot
|   |   |   ├── clusters-...                    # from clusters.py, thumbnail of plot
|   |   ├── slides/
|   |   |   ├── slides-001.parquet              # from slides.py, cluster labels
|   |   |   ├── slides-001.json                 # from slides.py, cluster labels
|   |   |   ├── slides-...                      # from slides.py, thumbnail of plot
|   |   ├── tags/
|   |   |   ├── ❤️.indices                       # tagged by UI, powered by server.py
|   |   |   ├── ...                             # can have arbitrary named tags
|   |   ├── jobs/
|   |   |   ├──  8980️-12345...json              # created when job is run via web UI
</pre>

# Scripts
The scripts should be run in order once you have an `input.parquet` file in your folder. Alternatively the Setup page in the web UI will run these scripts via API calls to the server for you.

## csv2parquet.py
A simple utility to convert a csv file into a parquet file. It will write the output parquet file into the proper folder given by the dataset name.

```bash
#python csv2parquet.py <csv_file> <dataset_name>
python csv2parquet.py dadjokes.csv database-curated
```

## 1. embed-local.py 
Take the text from the input and embed it. Default is to use `BAAI/bge-small-en-v1.5` locally via HuggingFace transformers.

```bash
# python embed.py <dataset_name> <text_column>
python embed-local.py dadabase-curated joke intfloat/e5-small-v2
```

## 1-a. embed-openai.py
Use OpenAI's embedding with your OpenAI API Key to quickly embed a dataset

```bash
# python embed.py <dataset_name> <text_column>
python embed-openai.py dadabase-curated joke
```


## 2. umapper.py
Map the embeddings from high-dimensional space to 2D with UMAP. Will generate a thumbnail of the scatterplot.
```bash
# python umapper.py <dataset_name> <neighbors> <min_dist>
python umapper.py dadabase-curated 50 0.1
```


## 3. clusters.py
Cluster the UMAP points using HDBSCAN. This will label each point with a cluster label
```bash
# python cluster.py <dataset_name> <umap_name> <samples> <min-samples>
slides.py dadabase-curated cluster-005 5 3
```

## 4. slides.py
Create a datastructure that allows us to annotate clusters
```bash
# python cluster.py <dataset_name> <cluster_name>
cluster.py dadabase-curated cluster-005
```


## Optional 1D scripts
There are `umap-1d.py` and `cluster-1d.py` which will create 1-dimensional umaps and clustering. This can be useful for ordering the data in a list.

## TODO: Higher-dimensional clustering
Ideally we can run umaps (and then subsequent HDBSCAN) on arbitrary dimensions. This would allow for creating clusters in high dimensions but still visualizing them overlaid on the 2D umaps.