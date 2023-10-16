# Virtual Environment name: capstone
# getPartImages.py FUNCTION -- Obtains ~1800 images of a given part from every angle 

# https://trevorsandy.github.io/lpub3d/assets/docs/ldview/Help.html
# LDView64 "C:\Users\kyvan\Documents\College Documents\2023-2024\Capstone 1\AI\New Part Models\2780 (4121715)\2780.dat" -DefaultLatitude=0 -DefaultLongitude=0 -SaveSnapshot="2780-0001.png"
# LDView64 "C:\Users\kyvan\Documents\College Documents\2023-2024\Capstone 1\AI\New Part Models\2780 (4121715)\2780.dat" -DefaultLatitude=0 -DefaultLongitude=0 -SaveDir="C:\Users\kyvan\Documents\College Documents\2023-2024\Capstone 1\AI\New Part Models\2780 (4121715)" -SaveSnapshot="2780-0001.png"

# CURRENT SAVE COMMAND 
# LDView64 "C:\Users\kyvan\Documents\College Documents\2023-2024\Capstone 1\AI\New Part Models\2780 (4121715)\2780.dat" -DefaultLatitude=0 -DefaultLongitude=0 -SaveSnapshot="C:\Users\kyvan\Documents\College Documents\2023-2024\Capstone 1\AI\New Part Models\2780 (4121715)\2780-0001.png"

import subprocess

# Path to LDView executable
ldview_path = "LDView64"

# Path to your LDraw file
ldraw_file = r"C:\Users\kyvan\Documents\College Documents\2023-2024\Capstone 1\AI\New Part Models\2780 (4121715)\2780.dat"

# Path to save snapshots
output_dir = r"C:\Users\kyvan\Documents\College Documents\2023-2024\Capstone 1\AI\New Part Models\2780 (4121715)\images"

# Loop through DefaultLatitude values from 0 to 90 (increasing by 3 each time)
count = 0
for i in range(0, 91, 3):
    for j in range(0, 181, 3):
        ldview_command = [
            ldview_path,
            ldraw_file,
            f"-DefaultLatitude={i}",
            f"-DefaultLongitude={j}",
            f"-SaveSnapshot={output_dir}\\2780-{count:04d}.png"  # Use {i:04d} to format the number with leading zeros
        ]
        count = count+1
        # Execute the LDView command
        subprocess.run(ldview_command)

    

print("Snapshot generation complete.")
