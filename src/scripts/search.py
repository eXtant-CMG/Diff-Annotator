import os
import sys
from bs4 import BeautifulSoup
import re

searchString = sys.argv[1].lower()
searchResults = []

if "+" in searchString:
    searchStrings = searchString.split("+")
    for subdir, dirs, files in os.walk('.'):
        for file in files:
            if file in ["output.html", "info.txt", "annotations.json"]:
                with open(os.path.join(subdir, file), 'r') as f:
                    content = f.read().lower()
                    if file == "annotations.json":
                        content = re.sub('<[^<]+?>', '', content)
                    indices = []
                    for string in searchStrings:
                        index = content.find(string)
                        while index != -1:
                            indices.append(index)
                            index = content.find(string, index + len(string))
                    indices.sort()
                    for i in range(len(indices) - 1):
                        if indices[i + 1] - indices[i] <= 200:
                            start = max(0, indices[i] - 100)
                            end = min(len(content), indices[i + 1] + 100)
                            resultLocation = subdir + "/" + file
                            resultMatch = content[start:indices[i]] + "<span style='text-decoration:underline;'>" + content[indices[i]:indices[i+1]] + "</span>" + content[indices[i+1]:end]
                            searchResults.append((resultLocation, resultMatch))

else:
    for subdir, dirs, files in os.walk('.'):
        for file in files:
            if file in ["output.html", "info.txt", "annotations.json"]:
                with open(os.path.join(subdir, file), 'r') as f:
                    content = f.read().lower()
                    if file == "annotations.json":
                        content = re.sub('<[^<]+?>', '', content)
                    index = content.find(searchString)
                    while index != -1:
                        start = max(0, index - 100)
                        end = min(len(content), index + len(searchString) + 100)
                        resultLocation = subdir + "/" + file
                        resultMatch = content[start:index] + "<span style='color:red;'>" + searchString + "</span>" + content[index + len(searchString):end]
                        searchResults.append((resultLocation, resultMatch))
                        index = content.find(searchString, index + len(searchString))

#script_dir = os.path.dirname(os.path.abspath(__file__))
search_html_path = os.path.join('public', 'search.html')

with open(search_html_path, 'r') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')
    searchresults_div = soup.find('div', {'id': 'searchresults'})
    searchresults_div.clear()
    ol = soup.new_tag('ol')
    for result in sorted(searchResults, key=lambda x: x[0]):
        li = soup.new_tag('li')
        a_tag = soup.new_tag('a')
        href_value = "data/" + result[0].split('/')[3] + "/output.html#"
        pp_id_match_1 = re.search(r'pp" id="(.*?)"', result[1])
        pp_id_match_2 = re.search(r'pp-id": "(.*?)"', result[1])
        if pp_id_match_1:
            href_value += pp_id_match_1.group(1)
        elif pp_id_match_2:
            href_value += pp_id_match_2.group(1)
        a_tag['href'] = href_value
        a_tag.string = result[0].split('/')[3].replace('_', ' ') + ': '
        li.append(a_tag)
        li.append(soup.new_tag('br'))
        li.append(BeautifulSoup(result[1], 'html.parser'))
        ol.append(li)
    searchresults_div.append(ol)

with open(search_html_path, 'w') as f:
    f.write(str(soup))
