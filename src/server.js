// server.js
const express = require('express');
const { exec } = require('child_process');
const { execSync } = require('child_process');
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const stream = require('stream');
const app = express();
const upload = multer({ dest: 'uploads/' });
const port = 3000;


// Serve static files from the specified directory
app.use(express.static(path.resolve(__dirname, '..', 'public')));

app.get('*.html', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', req.path));
});

app.get('*.css', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', req.path));
});

app.get('*.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.resolve(__dirname, '..', 'public', req.path));
});

app.get('*.js', (req, res) => {
  const filePath = path.resolve(__dirname, '..', 'public', req.path);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(404).send('File not found');
    } else {
      res.setHeader('Content-Type', 'application/javascript');
      res.send(data);
    }
  });
});

app.get('*.txt', (req, res) => {
  const filePath = path.resolve(__dirname, '..', 'public', req.path);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(404).send('File not found');
    } else {
      res.setHeader('Content-Type', 'text/plain');
      res.send(data);
    }
  });
});

app.get('*.jpg', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', req.path));
});

app.get('*.jpeg', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', req.path));
});


app.get('/delete-app', (req, res) => {
  const dataId = req.query.dataId;
  const dirVar = req.query.dirVar;
  exec(`python ${path.join(__dirname, 'scripts', 'delete-app.py')} ${dataId} ${dirVar}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
  res.send('Script executed');
});

app.get('/update-app', (req, res) => {
  const id = req.query.id;
  const f1Text = req.query.f1Text;
  const f2Text = req.query.f2Text;
  const dirVar = req.query.dirVar;

  exec(`python ${path.join(__dirname, 'scripts', 'update-app.py')} ${id} "${f1Text.replace(/"/g, '\\"')}" "${f2Text.replace(/"/g, '\\"')}" ${dirVar}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
  res.send('Script executed');
});


app.get('/search', (req, res) => {
  const searchString = req.query.searchString;
  exec(`python ${path.join(__dirname, 'scripts', 'search.py')} "${searchString}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
  setTimeout(() => {
    res.redirect(path.resolve(__dirname, '..', 'public/search.html'));
  }, 1500);
});

app.get('/make-annotation', (req, res) => {
  const annotationText = req.query.annotationText;
  const dataId = req.query.dataId;
  const dirVar = req.query.dirVar;
  exec(`python ${path.join(__dirname, 'scripts', 'make-annotation.py')} "${annotationText.replace(/"/g, '\\"')}" ${dataId} ${dirVar}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
  res.send('Script executed');
});

app.get('/api/diffs', (req, res) => {
  const scenesPath = path.resolve(__dirname, '..', 'public', 'data');
  const directories = fs.readdirSync(scenesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const diffs = directories.map(dir => {
    const info = fs.readFileSync(path.join(scenesPath, dir, 'info.txt'), 'utf-8').split('\n');
    const diffNr = info[0];
    const dirVar = info[0];
    const diffTitle = info[0].split('-').slice(1).join(' ').trim();
    const status = info[1];
    return { diffNr, dirVar, diffTitle, status };
  });

  res.json(diffs);
});


app.get('/edit-notes', (req, res) => {
  const textareaValue = req.query.textareaValue;
  const dirVar = req.query.dirVar;
  exec(`python ${path.join(__dirname, 'scripts', 'edit-notes.py')} "${textareaValue.replace(/"/g, '\\"')}" ${dirVar}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
  res.send('Script executed');
});

app.get('/edit-source', (req, res) => {
  const dirVar = req.query.dirVar;
  let paragraphArray = req.query.paragraphArray;
  paragraphArray = decodeURIComponent(paragraphArray).split(',').map(Number).join(',');
  let editedText = req.query.editedText.trimEnd();
  exec(`python ${path.join(__dirname, 'scripts', 'edit-source.py')} "${paragraphArray}" ${dirVar} "${editedText.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
  res.send('Script executed');
});

app.post('/upload', upload.array('files', 2), (req, res) => {
  let diffName = req.body.diffName;
  if (!diffName) {
    res.status(400).send('<span class="notification">Please specify a diff name.</span>');
    return;
  }

  // Replace spaces with underscores
  diffName = diffName.replace(/\s+/g, '_');
  // Replace invalid characters with underscores
  diffName = diffName.replace(/[\\/:*?"<>|]/g, '_');

  let files = req.files;
  if (files.length !== 2) {
    res.status(400).send('<span class="notification">Please upload exactly two files.</span>');
    return;
  }

  // Check for file size
  const MAX_SIZE = 100000; // maximum number of characters allowed
  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    let stats = fs.statSync(file.path);
    let fileSizeInBytes = stats.size;
    if (fileSizeInBytes > MAX_SIZE) {
      res.status(400).send(`<span class="notification">File ${i + 1} is too large. Maximum size allowed is ${MAX_SIZE} characters.</span>`);
      return;
    }
  }

  let sceneDir = path.resolve(__dirname, '..', 'public', 'data', diffName)
  
  // Check if directory with diffName already exists
  if (fs.existsSync(sceneDir)) {
    res.status(400).send(`<span class="notification">A diff with the name "${diffName}" already exists.</span>`);
    return;
  }
  
  fs.mkdirSync(sceneDir, { recursive: true });
  
  let file1Path = path.join(sceneDir, 'file1.txt');
  let file2Path = path.join(sceneDir, 'file2.txt');
  fs.copyFileSync(files[0].path, file1Path);
  fs.copyFileSync(files[1].path, file2Path);

  let outputTxt = path.join(sceneDir, 'output.txt');
  let outputPath = path.join(sceneDir, 'output.html');

  // try the git diff
  try {
    execSync(`git diff --color-words --no-index ${file1Path} ${file2Path} > ${outputTxt}`);
  } catch (error) {
    if (error.status === 1) {
      console.log('Differences were found between the files.');
    } else {
      console.error('An error occurred:', error);
    }
  }

  // Read the ANSI text from the output file
  const ansiText = fs.readFileSync(outputTxt, 'utf-8');

const pythonProcess = spawnSync('python', ['-c', `
from ansi2html import Ansi2HTMLConverter
conv = Ansi2HTMLConverter()
ansi = """${ansiText}"""
html = conv.convert(ansi)
print(html)
`], { stdio: 'pipe' });

  // Get the HTML output from the Python script
  const htmlOutput = pythonProcess.stdout.toString();

  // Write the HTML output to the output file
  fs.writeFileSync(outputPath, htmlOutput);
  
  // Added instruction to run ${outputPath} through the python/process-input.py script
  execSync(`python ${path.join(__dirname, 'scripts', 'process-input.py')} ${outputPath}`);

  // Delete the outputTxt file
  fs.unlinkSync(outputTxt);

  let infoPath = path.join(sceneDir, 'info.txt');
  let infoContent = `${diffName}\nuncorrected`;
  fs.writeFileSync(infoPath, infoContent);

  let annotationsPath = path.join(sceneDir, 'annotations.json');
  fs.writeFileSync(annotationsPath, '[]');

  res.send(`<span class="notification">Diff <a href="${outputPath}">${diffName}</a> created.</span>`);
});




app.delete('/delete-diff/:diffNr', (req, res) => {
    const diffNr = req.params.diffNr;
    const diffPath = path.resolve(__dirname, '..', 'public', 'data', diffNr);
    if (fs.existsSync(diffPath)) {
        fs.rmSync(diffPath, { recursive: true });
        res.sendStatus(200);
    } else {
        res.status(404).send(`Diff ${diffNr} not found`);
    }
});



app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
