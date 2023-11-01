# Virtual Environment name: capstone
# getPartImages.py FUNCTION -- Obtains ~1800 images of a given part from every angle

# https://trevorsandy.github.io/lpub3d/assets/docs/ldview/Help.html

import subprocess
import os

# Define your part number and part name as variables
part_number = "2780"
part_name = "4121715"
part_color = "0x333333" # black 0x333333 | red 
orientation = 1

# Path to LDView application bundle on a Mac
ldview_app_path = "LDView.app/Contents/MacOS/LDView"

# Path to your LDraw file
ldraw_file = f"/Users/kyvang/Documents/Capstone/data/{part_number} ({part_name})/{part_number}.dat"

# Path to save snapshots
output_dir = f"/Users/kyvang/Documents/Capstone/data/{part_number} ({part_name})/images"

# Create the output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# Loop through DefaultLatitude values from 0 to 90 (increasing by 10 each time)
count = 0

if orientation == 1: 
    for i in range(0, 181, 10):
        ldview_command = [
            ldview_app_path,
            ldraw_file,
            f"-DefaultColor3={part_color}", 
            f"-DefaultLatitude=90",
            f"-DefaultLongitude={i}",
            f"-SaveAlpha=True",
            f"-SaveSnapshot={output_dir}/{part_number}-{count:04d}.png"
        ]
        count += 1
        # Execute the LDView command
        subprocess.run(ldview_command)
elif orientation == 2: 
    for i in range(0, 91, 10):
        ldview_command = [
            ldview_app_path,
            ldraw_file,
            f"-DefaultColor3={part_color}", 
            f"-DefaultLatitude={i}",
            f"-DefaultLongitude=180",
            f"-SaveSnapshot={output_dir}/{part_number}-{count:04d}.png"
        ]
        count += 1
        # Execute the LDView command
        subprocess.run(ldview_command)

print("Snapshot generation complete.")
