import sys
import json
import os
import html

# Decode any escaped characters in input
annotationText = sys.argv[1].encode('utf-8').decode('unicode_escape')
# print(f"Raw annotation text received: {sys.argv[1]}")
# print(f"Double-decoded annotation text: {annotationText}")

dataId = sys.argv[2]
dirVar = os.path.join('public', 'data', sys.argv[3])

# Load existing annotations
with open(os.path.join(dirVar, 'annotations.json'), 'r') as f:
    annotations = json.load(f)

found = False
for annotation in annotations:
    if annotation['app-id'] == dataId:
        if annotationText == "":
            annotations.remove(annotation)
        else:
            annotation['text'] = annotationText
        found = True
        break

# Add new annotation if not found
if not found and annotationText != "":
    annotations.append({"app-id": dataId, "text": annotationText})

# Write updated annotations back to the file
with open(os.path.join(dirVar, 'annotations.json'), 'w') as f:
    json.dump(annotations, f, indent=4, ensure_ascii=False)
