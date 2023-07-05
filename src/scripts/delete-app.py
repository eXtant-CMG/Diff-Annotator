import sys
import os
from bs4 import BeautifulSoup, NavigableString

data_id = sys.argv[1]
dirVar = os.path.join('public', 'data', sys.argv[2], 'output.html')

with open(dirVar, 'r') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')
    app_span = soup.find('span', {'class': 'app', 'id': data_id})
    if app_span:
        f2_span = app_span.find('span', class_='f2')
        if f2_span:
            app_span.replace_with(NavigableString(f2_span.text))
        else:
            app_span.replace_with(NavigableString(""))

with open(dirVar, 'w') as f:
    f.write(str(soup))

