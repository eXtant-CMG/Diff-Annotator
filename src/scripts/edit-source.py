import sys
import os
from bs4 import BeautifulSoup, NavigableString

paragraphArray = sys.argv[1]
dirVar = os.path.join('public', 'data', sys.argv[2])
editedText = sys.argv[3]

# Convert paragraphArray from a string to a list of integers
paragraphArray = [int(x) for x in paragraphArray.split(",")]

# Open the HTML file
with open(f"{dirVar}/output.html", "r") as f:
    soup = BeautifulSoup(f, "html.parser")

# Find the <pre> element
pre_element = soup.find("pre")

# Get the contents of the <pre> element as a list of strings and tags
pre_contents = list(pre_element.children)

# Split the contents on '\n' while preserving tags
pre_lines = []
current_line = []
for item in pre_contents:
    if isinstance(item, NavigableString):
        lines = item.split("\n")
        current_line.append(lines[0])
        for line in lines[1:]:
            pre_lines.append(current_line)
            current_line = [line]
    else:
        current_line.append(item)
pre_lines.append(current_line)

# Remove the lines of which the (position + 1) equals the integers in paragraphArray
pre_lines = [line for i, line in enumerate(pre_lines) if i not in paragraphArray]

# Parse editedText as HTML and replace <br/> elements with newlines
editedText_soup = BeautifulSoup(editedText, "html.parser")
for br in editedText_soup.find_all("br"):
    br.replace_with("\n")
editedText_lines = list(editedText_soup.children)

# Insert editedText in place of the first removed line
pre_lines.insert(paragraphArray[0], editedText_lines)

# Flatten the list of lists and add newlines back in
pre_lines_flat = []
for i, line in enumerate(pre_lines):
    pre_lines_flat.extend(line)
    if i < len(pre_lines)-1:
        pre_lines_flat.append(NavigableString("\n"))

# Update the contents of the <pre> element
pre_element.clear()
pre_element.extend(pre_lines_flat)

# Save the modified HTML back to the file
with open(f"{dirVar}/output.html", "w") as f:
    f.write(str(soup))