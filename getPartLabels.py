# Virtual Environment name: capstone
# getPartLabels.py FUNCTION -- Obtains labels for each image in a file // For now, it sets the bounding box to the whole image. Will change over time.

import os

# Directory to save
directory_path = r"C:\Users\kyvan\Documents\College Documents\2023-2024\Capstone 1\AI\data\2780 (4121715)\labels"

# Number of files to create (0000 to 9999)
num_files = 1891 # MAKE SURE THIS IS ONE MORE THAN THE FINAL ID IN THE IMAGES FOLDER

# Loop to create and write to files
for i in range(num_files):
    # Format the filename as "2780-i.txt" with zero-padding
    filename = os.path.join(directory_path, f"2780-{i:04}.txt")
    
    # Write the content to the file
    with open(filename, 'w') as file:
        file.write("0 0.500000 0.500000 1.000000 1.000000\n") # Bounding box dimensions

print(f"{num_files} .txt files have been created in {directory_path}.")