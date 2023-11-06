import os
import pandas as pd


def all_lines():
    # Directory where your .xyz files are stored
    input_directory = 'data/DMV1000'
    output_file = 'data/relief.csv'

    # Get a list of .xyz files
    xyz_files = [f for f in os.listdir(input_directory) if f.endswith('.XYZ')]

    # An empty list to store the data DataFrames
    data_frames = []

    # Loop through the files and read them into DataFrames
    for file_name in xyz_files:
        file_path = os.path.join(input_directory, file_name)
        # Assuming space-separated values, adjust delimiter as necessary
        data = pd.read_csv(file_path, delim_whitespace=True, header=None, names=['X', 'Y', 'Z'])
        data_frames.append(data)

    # Concatenate all the DataFrames into one
    all_data = pd.concat(data_frames, ignore_index=True)

    # Now all the data is combined into a single DataFrame, you can export it to CSV
    all_data.to_csv(output_file, index=False)

    # Convert the DataFrame to JSON and write to a file
    output_json = 'data/relief.json'
    all_data.to_json(output_json, orient='records')


def every_tenth_line():

    # Directory where your .xyz files are stored
    input_directory = 'data/DMV1000'
    output_csv = 'data/relief_10.csv'

    # Get a list of .xyz files
    xyz_files = [f for f in os.listdir(input_directory) if f.endswith('.XYZ')]

    # An empty list to store the data DataFrames
    data_frames = []

    # Loop through the files and read them into DataFrames
    for file_name in xyz_files:
        file_path = os.path.join(input_directory, file_name)
        try:
            # Assuming space-separated values, adjust delimiter as necessary
            data = pd.read_csv(file_path, delim_whitespace=True, header=None, names=['X', 'Y', 'Z'])
            # Take every tenth row
            data_thinned = data.iloc[::10, :]
            data_frames.append(data_thinned)
        except pd.errors.ParserError as e:
            print(f"Error reading {file_name}: {e}")

    # Concatenate all the DataFrames into one
    all_data = pd.concat(data_frames, ignore_index=True)

    # Convert the DataFrame to JSON and write to a file
    all_data.to_csv(output_csv, index=False)

def random_n_points(n=10):
    import os
    import pandas as pd

    # Directory where your .xyz files are stored
    input_directory = 'data/DMV1000'
    output_csv = 'data/relief_random_{}.csv'.format(n)

    # Get a list of .xyz files
    xyz_files = [f for f in os.listdir(input_directory) if f.endswith('.XYZ')]

    # An empty list to store the data DataFrames
    data_frames = []

    # Loop through the files and read them into DataFrames
    for file_name in xyz_files:
        file_path = os.path.join(input_directory, file_name)
        try:
            # Assuming space-separated values, adjust delimiter as necessary
            data = pd.read_csv(file_path, delim_whitespace=True, header=None, names=['X', 'Y', 'Z'])
            
            # Sample 500 random rows, if the file is smaller, take the length of the file
            sample_size = min(n, len(data))
            data_sampled = data.sample(n=sample_size)
            
            data_frames.append(data_sampled)
        except pd.errors.ParserError as e:
            print(f"Error reading {file_name}: {e}")

    # Concatenate all the DataFrames into one
    all_data = pd.concat(data_frames, ignore_index=True)

    # Convert the DataFrame to JSON and write to a file
    all_data.to_csv(output_csv, index=False)
    all_data.to_json(output_csv.replace('.csv', '.json'), orient='records')


random_n_points(1)