import os
import shutil

base_path = "/Users/yudhistherkumar/Downloads/izzatdarParivar-main/app/profile"

# Get all entries in the directory
entries = os.listdir(base_path)
print(f"Current entries: {entries}")

for entry in entries:
    full_path = os.path.join(base_path, entry)
    
    # Keep only the valid ones
    if entry in ["[id]", "create", "edit"]:
        print(f"Keeping valid entry: {entry}")
        continue
    
    print(f"Deleting invalid entry: {entry}")
    if os.path.isdir(full_path):
        shutil.rmtree(full_path)
    else:
        os.remove(full_path)

# Verify [id]/page.tsx exists
page_path = os.path.join(base_path, "[id]", "page.tsx")
if os.path.exists(page_path):
    print(f"Verified: {page_path} exists and is {os.path.getsize(page_path)} bytes")
else:
    print(f"WARNING: {page_path} MISSING!")
