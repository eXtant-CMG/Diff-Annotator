import sys
import os
from bs4 import BeautifulSoup

id = sys.argv[1]
f1Text = sys.argv[2]
f2Text = sys.argv[3]
dirVar = os.path.join('public', 'data', sys.argv[4])

def updateFElement(app, fType, newText):
    f = app.find("span", {"class": fType})
    if not f and newText:
        f = soup.new_tag('span')
        f['class'] = fType
        if fType == 'f1':
            app.insert(0, f)
        else:
            app.insert(1, f)
    if f:
        if newText:
            f.string = newText
        else:
            f.extract()

with open(f"{dirVar}/output.html", "r") as file:
    soup = BeautifulSoup(file, "html.parser")

app = soup.find("span", {"class": "app", "id": id})
updateFElement(app, 'f1', f1Text)
updateFElement(app, 'f2', f2Text)

# Check if there are no more 'f1' or 'f2' elements in the app span
if not app.find("span", {"class": "f1"}) and not app.find("span", {"class": "f2"}):
    # Delete the app span element
    app.extract()

with open(f"{dirVar}/output.html", "w") as file:
    file.write(str(soup))

print("Update successful")
