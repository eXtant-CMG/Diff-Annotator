# Diff Annotator

Diff Annotator is a lightweight environment for annotating text-comparisons of two plain text files. It makes use of Node.js, Python, and `git diff`. After running the text files through a pipeline of `git diff` (using a token-based comparison) and a Python processing script, the Diff Annotator creates a HTML rendering that is ready to be read, corrected, and annotated, all in the front end.

## Features
- Upload two text files for comparison
- Give the text-comparison a name
- Annotate specific variants
- Correct or merge variants
- Add general notes to the document
- Edit the source code by calling up the HTML of a selection of paragraphs (with a maximum of 5 consecutive paragraphs)

## Dependencies
- [Git Diff](https://git-scm.com/downloads)
- [Python 3](https://www.python.org/downloads/)
- [BeautifulSoup4](https://pypi.org/project/beautifulsoup4/) (`pip install beautifulsoup4`)
- [lxml](https://pypi.org/project/lxml/) (`pip install lxml`)
- [Node.js](https://nodejs.dev/en/download/)

## Installation
1. Install Git Diff from the link above.
2. Install Python 3 from the link above.
3. Install BeautifulSoup4 and lxml by running `pip install beautifulsoup4` and `pip install lxml`.
4. Install Node.js from the link above.
5. From the root folder run the command `npm install` to install node modules
5. Start the server with the command `npm start`
6. Surf to `http://localhost:3000/index.html`

## Usage
1. Click "+ DIFF" to upload two text files for comparison.
2. Give the text-comparison a name.
3. After processing, the text-comparison can be accessed from the list on the home page and is ready to be read, corrected, and annotated.
4. Make annotations to specific variants, correct or merge them, and add general notes to the document.
5. Advanced users can edit the source code by calling up the HTML of a selection of paragraphs (with a maximum of 5 consecutive paragraphs).