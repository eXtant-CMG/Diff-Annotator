# Diff Annotator

Diff Annotator is an environment for annotating HTML renderings of git diff files. Built with Node.js and Python, it allows users to upload two text files and give the text-comparison a name. After running the files through git diff (using a token-based comparison), [ansi2html.sh](https://github.com/pixelb/scripts/blob/master/scripts/ansi2html.sh), and a Python processing script, the Diff Annotator creates a HTML rendering that is ready to be read, corrected, and annotated, all in the front end.

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
3. After processing, the HTML rendering will be ready to be read, corrected, and annotated in the front end.
4. Make annotations to specific variants, correct or merge them, and add general notes to the document.
5. Advanced users can edit the source code by calling up the HTML of a selection of paragraphs (with a maximum of 5 consecutive paragraphs).