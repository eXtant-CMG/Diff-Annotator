import sys
import json
import os

annotationText = sys.argv[1]
dataId = sys.argv[2]
dirVar = os.path.join('public', 'data', sys.argv[3])

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

if not found and annotationText != "":
    annotations.append({"app-id": dataId, "text": annotationText})

with open(os.path.join(dirVar, 'annotations.json'), 'w') as f:
    json.dump(annotations, f, indent=4)