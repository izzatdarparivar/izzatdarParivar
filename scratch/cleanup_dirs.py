import os
import shutil

base_path = "/Users/yudhistherkumar/Downloads/izzatdarParivar-main/app/profile"

# Folders to remove
bad_folders = ["[id", "]", "[id/", "[id/page.tsx"]

for folder in os.listdir(base_path):
    full_path = os.path.join(base_path, folder)
    if folder in ["[id", "]", "[id/", "[id/page.tsx"]:
        print(f"Removing bad folder: {folder}")
        if os.path.isdir(full_path):
            shutil.rmtree(full_path)
        else:
            os.remove(full_path)

# Ensure [id] exists correctly
id_path = os.path.join(base_path, "[id]")
if not os.path.exists(id_path):
    os.makedirs(id_path)
    print("Created correct [id] folder")
else:
    print("[id] folder already exists")
