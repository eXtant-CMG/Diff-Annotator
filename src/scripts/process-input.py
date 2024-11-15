import os
import sys
from lxml import etree
from bs4 import BeautifulSoup, NavigableString
import random
import re

def ansi_to_html(ansi_text):
    # Replace ANSI escape sequences with HTML tags
    html_text = re.sub(r'\x1b\[31m', '<span class="ansi31">', ansi_text)
    html_text = re.sub(r'\x1b\[32m', '<span class="ansi32">', html_text)
    html_text = re.sub(r'\x1b\[1m', '<span class="ansi1">', html_text)
    html_text = re.sub(r'\x1b\[36m', '<span class="ansi36">', html_text)
    html_text = re.sub(r'\x1b\[m', '</span>', html_text)
    
    html_text = '<html><head></head><body><pre>' + html_text + '</pre></body></html>'

    return html_text

def has_class(elem, class_name):
    return elem.tag == 'span' and 'class' in elem.attrib and class_name in elem.attrib['class']

def preprocess_html(html_text):
    
    soup = BeautifulSoup(html_text, 'html.parser')

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

    return html


def first_function(html_text):
    parser = etree.HTMLParser()
    root = etree.fromstring(html_text, parser)
    for f1 in root.xpath('//span[contains(@class, "f1")]'):
        f2 = f1.getnext()
        while f2 is not None and f2.tag is etree.Comment:
            f2 = f2.getnext()
        if f2 is not None and 'f2' in f2.get('class', '') and (f1.tail is None or not f1.tail.strip()):
            app = etree.Element('span')
            app.attrib['class'] = 'app'
            app.attrib['id'] = f'app-{id(app) % 10000}'
            f1.addprevious(app)
            app.append(f1)
            app.append(f2)
            if f2.tail is not None:
                app.tail = f2.tail
                f2.tail = None
    return etree.tostring(root, pretty_print=True).decode()

def second_function(html_text):
    soup = BeautifulSoup(html_text, 'html.parser')

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


    return str(soup)

def third_function(html_text):
    soup = BeautifulSoup(html_text, 'html.parser')

    app_spans = soup.find_all('span', class_='app')
    ids = [app_span.get('id') for app_span in app_spans if app_span.get('id')]  # Only valid IDs

    for app_span in app_spans:
        current_id = app_span.get('id')
        if not current_id:  # Handle missing ID
            new_id = f'z-{random.choice("abcdefghijklmnopqrstuvwxyz")}{random.randint(10, 99)}'
        else:
            new_id = current_id

        # Ensure uniqueness
        while ids.count(new_id) > 1 or new_id in ids:
            new_id = f'z-{random.choice("abcdefghijklmnopqrstuvwxyz")}{random.randint(10, 99)}'
        app_span['id'] = new_id
        ids.append(new_id)

    return str(soup)

def fourth_function(html_text, output_file):
    new_text = html_text.replace('\n</span></span>', '</span></span>\n')
    
    # Save the result to disk
    with open(output_file, 'w') as f:
        f.write(new_text)


if __name__ == '__main__':
    file_location = sys.argv[1]
    output_file = file_location.replace('output.txt', 'output.html')
    
    # Read the ANSI text from the file
    with open(file_location, 'r') as file:
        ansi_text = file.read()
    
    # Convert ANSI text to HTML
    html_text = ansi_to_html(ansi_text)
    
    # Pass the HTML text to the other functions
    html_text = preprocess_html(html_text)
    html_text = first_function(html_text)
    html_text = second_function(html_text)
    html_text = third_function(html_text)
    fourth_function(html_text, output_file)

