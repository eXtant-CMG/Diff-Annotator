// server.js
const express = require('express');
const { exec } = require('child_process');
const { execSync } = require('child_process');
const { spawnSync } = require('child_process');
const { spawn } = require('child_process');
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


// python detection helper function
function detectPythonCommand() {
  const python3Check = spawnSync('python3', ['--version'], { encoding: 'utf-8' });
  if (!python3Check.error && python3Check.status === 0) {
    console.log('Using python3');
    return 'python3';
  }

  const pythonCheck = spawnSync('python', ['--version'], { encoding: 'utf-8' });
  if (!pythonCheck.error && pythonCheck.status === 0) {
    console.log('Using python');
    return 'python';
  }

  throw new Error('Python is not installed or not available in the PATH.');
}

// Declare pythonCommand at the global scope
let pythonCommand;

try {
  // Detect the appropriate Python command
  pythonCommand = detectPythonCommand();
  console.log(`Detected Python command: ${pythonCommand}`);
} catch (error) {
  console.error(error.message);
  process.exit(1); // Exit the application with an error code
}


//Template for using Spawn

function runScript(scriptPath, args, callback) {
  const process = spawn(pythonCommand, [scriptPath, ...args]);

  process.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  process.on('close', (code) => {
    if (code !== 0) {
      console.error(`Script exited with code ${code}`);
    }
    if (callback) callback(code);
  });
}

app.get('/delete-app', (req, res) => {
  const dataId = req.query.dataId;
  const dirVar = req.query.dirVar;
const scriptPath = path.join(__dirname, 'scripts', 'delete-app.py');
  
  runScript(scriptPath, [dataId, dirVar], () => {
    res.send('Script executed');
  });
});

app.get('/update-app', (req, res) => {
  const id = req.query.id;
  const f1Text = req.query.f1Text;
  const f2Text = req.query.f2Text;
  const dirVar = req.query.dirVar;
  const scriptPath = path.join(__dirname, 'scripts', 'update-app.py');

  runScript(scriptPath, [id, f1Text, f2Text, dirVar], () => {
    res.send('Script executed');
  });
});


app.get('/search', (req, res) => {
  const searchString = req.query.searchString;
  const scriptPath = path.join(__dirname, 'scripts', 'search.py');

  runScript(scriptPath, [searchString], () => {
    setTimeout(() => {
      res.redirect(path.resolve(__dirname, '..', 'public/search.html'));
    }, 1500);
  });
});

app.get('/make-annotation', (req, res) => {
  const scriptPath = path.join(__dirname, 'scripts', 'make-annotation.py');
  const annotationText = req.query.annotationText.replace(/"/g, '\\"'); // Escape quotes
  const dataId = req.query.dataId;
  const dirVar = req.query.dirVar;

  runScript(scriptPath, [annotationText, dataId, dirVar], () => {
    res.send('Script executed');
  });
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
  const scriptPath = path.join(__dirname, 'scripts', 'edit-notes.py');

  runScript(scriptPath, [textareaValue, dirVar], () => {
    res.send('Script executed');
  });
});

app.get('/edit-source', (req, res) => {
  const dirVar = req.query.dirVar;
  let paragraphArray = req.query.paragraphArray;
  paragraphArray = decodeURIComponent(paragraphArray).split(',').map(Number).join(',');
  let editedText = req.query.editedText.trimEnd();
  const scriptPath = path.join(__dirname, 'scripts', 'edit-source.py');

  runScript(scriptPath, [paragraphArray, dirVar, editedText], () => {
    res.send('Script executed');
  });
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

try {
  const gitDiffProcess = spawnSync('git', [
    'diff',
    '--color-words',
    '--no-index',
    file1Path,
    file2Path
  ], {
    encoding: 'utf-8', // Ensure output is a readable string
    stdio: ['ignore', 'pipe', 'pipe'] // Ignore stdin, pipe stdout and stderr
  });

  if (gitDiffProcess.error) {
    console.error('Error running git diff:', gitDiffProcess.error);
    throw gitDiffProcess.error;
  }

  if (gitDiffProcess.status === 1) {
    console.log('Differences were found between the files.');
  } else if (gitDiffProcess.status !== 0) {
    console.error(`git diff failed with status code: ${gitDiffProcess.status}`);
    console.error('stderr:', gitDiffProcess.stderr);
    throw new Error('git diff failed');
  }

  // Write the output to the file
  fs.writeFileSync(outputTxt, gitDiffProcess.stdout);
} catch (error) {
  console.error('An error occurred during git diff execution:', error);
  return res.status(500).send('An error occurred during git diff execution.');
}


try {
  // Run the Python script using spawnSync
  const outputTxtEscaped = outputTxt.replace(/ /g, '\\ ');
  const processInputScript = path.join(__dirname, 'scripts', 'process-input.py');
  const processInputScriptEscaped = processInputScript.replace(/ /g, '\\ ');
  const pythonProcess = spawnSync(pythonCommand, [processInputScriptEscaped, outputTxtEscaped], {
    shell: true,
    stdio: 'inherit'
  });

  if (pythonProcess.error) {
    console.error('Error running Python script:', pythonProcess.error);
    throw pythonProcess.error;
  }

  if (pythonProcess.status !== 0) {
    console.error(`Python script failed with status code: ${pythonProcess.status}`);
    throw new Error('Python script failed');
  }
  console.log('process-input.py stdout:', pythonProcess.stdout);
} catch (error) {
  console.error('An error occurred during Python script execution:', error);
  return res.status(500).send('An error occurred during Python script execution.');
}


// Delete the outputTxt file
try {
  fs.unlinkSync(outputTxt);
} catch (error) {
  console.error('Failed to delete outputTxt file:', error);
}

// Ensure the directory exists
try {
  fs.mkdirSync(sceneDir, { recursive: true });
} catch (error) {
  console.error('Failed to create directory:', error);
  return res.status(500).send('Failed to create necessary directories.');
}

// Write the info.txt file
try {
  let infoPath = path.join(sceneDir, 'info.txt');
  let infoContent = `${diffName}\nuncorrected`;
  fs.writeFileSync(infoPath, infoContent);
} catch (error) {
  console.error('Failed to write info.txt:', error);
  return res.status(500).send('Failed to write info.txt.');
}

// Write the annotations.json file
try {
  let annotationsPath = path.join(sceneDir, 'annotations.json');
  fs.writeFileSync(annotationsPath, '[]');
} catch (error) {
  console.error('Failed to write annotations.json:', error);
  return res.status(500).send('Failed to write annotations.json.');
}

// Send the response
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
