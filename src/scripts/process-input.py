import os
import sys
from lxml import etree
from bs4 import BeautifulSoup, NavigableString
import random

def has_class(elem, class_name):
    return elem.tag == 'span' and 'class' in elem.attrib and class_name in elem.attrib['class']

def preprocess_html(file_location):
    with open(file_location, 'r') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    # Replace <span class="ansi31"> with <span class="f1">
    for span in soup.find_all('span', class_='ansi31'):
        span['class'] = 'f1'

    # Replace <span class="ansi32"> with <span class="f2">
    for span in soup.find_all('span', class_='ansi32'):
        span['class'] = 'f2'

    # Remove <span class="ansi1"> and <span class="ansi36"> elements
    for span in soup.find_all('span', class_=['ansi1', 'ansi36']):
        span.decompose()

    # Remove empty lines
    html = str(soup).splitlines()
    html = [line for line in html if line.strip() != '']
    html = '\n'.join(html)

    with open(file_location, 'w') as f:
        f.write(html)


def first_function(file_location):
    parser = etree.HTMLParser()
    tree = etree.parse(file_location, parser)
    root = tree.getroot()
    for f1 in root.xpath('//span[contains(@class, "f1")]'):
        f2 = f1.getnext()
        while f2 is not None and f2.tag is etree.Comment:
            f2 = f2.getnext()
        if f2 is not None and has_class(f2, 'f2') and (f1.tail is None or not f1.tail.strip()):
            app = etree.Element('span')
            app.attrib['class'] = 'app'
            app.attrib['id'] = f'app-{id(app) % 10000}'
            f1.addprevious(app)
            app.append(f1)
            app.append(f2)
            if f2.tail is not None:
                app.tail = f2.tail
                f2.tail = None
    tree.write(file_location, pretty_print=True)

def second_function(file_location):
    with open(file_location, 'r') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    # Added instruction to replace the <style> element in the file
    style = soup.style
    if style:
        style.decompose()
    new_style = soup.new_tag('style', type='text/css')
    new_style.string = 'pre { white-space: pre-wrap; } .f1 {color:#AA0000;} .f2 {color:#00AA00;}'
    soup.head.append(new_style)

    for span in soup.find_all('span', {'class': ['bold', 'f6']}):
        previous = span.previous_sibling
        if previous and isinstance(previous, NavigableString) and previous.strip() == '':
            previous.extract()
        span.decompose()

    spans = soup.find_all('span', {'class': ['f1', 'f2']})
    for span in spans:
        span.string.replace_with(str(span.string).replace('\n', '<br/>'))
        if span.find_parents('span', {'class': 'app'}):
            continue
        new_span = soup.new_tag('span', **{'class': 'app'})
        new_span['id'] = f'z-{id(new_span) % 10000}'
        span.wrap(new_span)

    script_tag = soup.new_tag('script', src='/assets/js/diff-annotator.js')
    soup.body.append(script_tag)

    link_tag = soup.new_tag('link', href='/assets/css/style.css', type='TEXT/CSS', rel='STYLESHEET')
    soup.head.append(link_tag)

    # Create a new header tag
    header = soup.new_tag('header')
    header['style'] = 'position: fixed; width: 100%; display: block;'

    # Create a new 'a' tag with class 'edit-source-link'
    editSourceLink = soup.new_tag('a')
    editSourceLink['class'] = 'edit-source-link'
    editSourceLink.string = 'Edit Source Code'

    # Append the editSourceLink to the header
    header.append(editSourceLink)

    # Create a new 'a' tag with href attribute
    diffAnnotatorLink = soup.new_tag('a', href='../../index.html')
    diffAnnotatorLink['style'] = 'color: inherit; text-decoration: none;'
    diffAnnotatorLink.string = 'Diff Annotator'

    # Append the diffAnnotatorLink to the header
    header.append(diffAnnotatorLink)

    # Insert the header as the first child of the body
    soup.body.insert(0, header)


    with open(file_location, 'w') as f:
        f.write(str(soup))

def third_function(file_location):
    with open(file_location, 'r') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    app_spans = soup.find_all('span', class_='app')
    ids = [app_span.get('id') for app_span in app_spans]
    for app_span in app_spans:
        while ids.count(app_span.get('id')) > 1:
            new_id = app_span.get('id') + random.choice('abcdefghijklmnopqrstuvwxyz') + str(random.randint(10, 99))
            app_span['id'] = new_id
            ids.append(new_id)

    with open(file_location, 'w') as f:
        f.write(str(soup))

def fourth_function(file_location):
    with open(file_location, 'r') as f:
        text = f.read()
    new_text = text.replace('\n</span></span>', '</span></span>\n')
    with open(file_location, 'w') as f:
        f.write(new_text)

if __name__ == '__main__':
    file_location = sys.argv[1]
    preprocess_html(file_location)
    first_function(file_location)
    second_function(file_location)
    third_function(file_location)
    fourth_function(file_location)
