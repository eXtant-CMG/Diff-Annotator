const urlParams = new URLSearchParams(window.location.search);
const loc = urlParams.get('loc');

if (loc && loc !== "") {
    const element = document.getElementById(loc);
    if (element) {
        element.scrollIntoView();
    }
}

let combine = urlParams.get('combine');

//EDIT-CHANGE
// Array to store the values of the clicked checkboxes
let checkedValues = [];

document.addEventListener('DOMContentLoaded', () => {
    // Get all the checkboxes with name "edit-source"
    const checkboxes = document.querySelectorAll('input[name="edit-source"]');


    // Get the element with class "edit-source-link"
    const editSourceLink = document.querySelector('.edit-source-link');

    // Variable to keep track of whether the first checkbox has been clicked
    let firstClicked = false;



    // Function to update the display property of the editSourceLink element
    const updateDisplay = () => {
        // Check if any of the checkboxes are checked
        const anyChecked = [...checkboxes].some(checkbox => checkbox.checked);
        // Update the display property of the editSourceLink element
        editSourceLink.style.display = anyChecked ? 'inline' : 'none';
        // Reset firstClicked if no checkboxes are checked
        if (!anyChecked) {
            firstClicked = false;
        }

        editSourceLink.textContent = 'Edit Source Code of ' + checkedValues;
    }

    // Add event listeners to all the checkboxes to call updateDisplay when their checked state changes
    checkboxes.forEach((checkbox, index) => {
        checkbox.addEventListener('change', event => {
            if (!firstClicked && event.target.checked) {
                firstClicked = true;
                checkedValues.push(event.target.value);
            } else if (firstClicked && event.target.checked) {
                const prevCheckbox = checkboxes[index - 1];
                const nextCheckbox = checkboxes[index + 1];
                if (!((prevCheckbox && prevCheckbox.checked) || (nextCheckbox && nextCheckbox.checked))) {
                    event.target.checked = false;
                    alert("Only consecutive paragraphs can be selected.");
                    return;
                } else if (checkedValues.length >= 5) {
                    event.target.checked = false;
                    alert("You can only select up to 5 paragraphs.");
                    return;
                } else {
                    checkedValues.push(event.target.value);
                    checkedValues.sort(function(a, b) {
                      return a - b;
                    });
                    console.log(checkedValues);
                }
            } else if (event.target.checked === false) {
                const index = checkedValues.indexOf(event.target.value);
                if (index > -1) {
                    checkedValues.splice(index, 1);
                }
            }
            updateDisplay();
        });
    });

    // Call updateDisplay initially to set the correct display property
    updateDisplay();
});
//EDIT-CHANGE END

//total word counts
let f1Elements = document.querySelectorAll('span.f1');
let f2Elements = document.querySelectorAll('span.f2');
let f1WordCount = 0;
let f2WordCount = 0;
let invariantWordCount = 0;
for (let i = 0; i < f1Elements.length; i++) {
    let words = f1Elements[i].textContent.trim().split(/\s+/);
    f1WordCount += words.length;
}
for (let i = 0; i < f2Elements.length; i++) {
    let words = f2Elements[i].textContent.trim().split(/\s+/);
    f2WordCount += words.length;
}
let preElementCount = document.querySelector('pre');
if (preElementCount) {
    let preWords = preElementCount.textContent.trim().split(/\s+/);
    invariantWordCount += preWords.length;
}
let divElement = document.createElement('div');
divElement.setAttribute('class', 'stats');
let statsTitle = document.createElement('h4');
statsTitle.textContent = 'STATS';
divElement.appendChild(statsTitle);
let totalDiv = document.createElement('div');
totalDiv.setAttribute('class', 'total');
totalDiv.textContent = `f1: ${f1WordCount} | f2: ${f2WordCount} | inv.: ${invariantWordCount } | f1+: ${f1WordCount + invariantWordCount} | f2+: ${f2WordCount + invariantWordCount} | f1 %: ${(f1WordCount / (invariantWordCount + f1WordCount) * 100).toFixed(2)}% | f2 - f1 = ${f2WordCount - f1WordCount} | f2+ is ${((f2WordCount - f1WordCount) / ((f1WordCount + invariantWordCount) / 100)).toFixed(1)}% longer than f1+`;
divElement.appendChild(totalDiv);
document.body.appendChild(divElement);



function createTable(f1Elements) {
  //table view of apps with 2 readings
  for (let i = 0; i < f1Elements.length; i++) {
    let f1Element = f1Elements[i];
    let f2Element = f1Element.nextElementSibling;
    let createTable = true;
    while (f2Element && !(f2Element.tagName === 'SPAN' && f2Element.classList.contains('f2'))) {
      if (f2Element.nodeType === Node.TEXT_NODE && f2Element.textContent.trim()) {
        createTable = false;
        break;
      }
      f2Element = f2Element.nextElementSibling;
    }
    if (createTable && f2Element && f1Element.closest('.app') && f2Element.closest('.app')) {
      let tableElement = document.createElement('table');
      tableElement.setAttribute('class', 'app-table');
      let row1Element = document.createElement('tr');
      let row2Element = document.createElement('tr');
      let cell1Element = document.createElement('td');
      let cell2Element = document.createElement('td');
      cell1Element.appendChild(f1Element.cloneNode(true));
      cell2Element.appendChild(f2Element.cloneNode(true));
      row1Element.appendChild(cell1Element);
      row2Element.appendChild(cell2Element);
      tableElement.appendChild(row1Element);
      tableElement.appendChild(row2Element);
      f1Element.parentNode.insertBefore(tableElement, f1Element);
      f1Element.remove();
      f2Element.remove();
    }
  }
}

createTable(f1Elements);

let preElement = document.querySelector('pre');
let lines = preElement.innerHTML.split('\n');
preElement.innerHTML = '';
for (let i = 0; i < lines.length; i++) {
    let spanElement = document.createElement('span');
    spanElement.className = 'pnr';
    spanElement.id = 'pnr' + (i + 1);
    spanElement.textContent = i + 1;
    preElement.appendChild(spanElement);
    preElement.insertAdjacentHTML('beforeend', lines[i] + '\n');

    //word counts per paragraph
    let f0Count = 0;
    let f1Count = 0;
    let f2Count = 0;
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = lines[i];
    
    // Count the number of words not in a <span>
    let textContent = tempDiv.textContent;
    let words = textContent.split(/\s+/);
    f0Count += words.length;

    let f1Spans = tempDiv.querySelectorAll('span.f1');
    for (let j = 0; j < f1Spans.length; j++) {
        let spanWords = f1Spans[j].textContent.split(/\s+/);
        f1Count += spanWords.length;
        f0Count -= spanWords.length;
    }

    let f2Spans = tempDiv.querySelectorAll('span.f2');
    for (let j = 0; j < f2Spans.length; j++) {
        let spanWords = f2Spans[j].textContent.split(/\s+/);
        f2Count += spanWords.length;
        f0Count -= spanWords.length;
    }

    let wordCountsSpan = document.createElement('span');
    wordCountsSpan.className = 'wordcounts';
    let f0f1Sum = f0Count + f1Count;
    let f0f2Sum = f0Count + f2Count;
    let sumDiff = ((f0f2Sum - f0f1Sum) / f0f1Sum) * 100;
    
    // EDIT-CHANGE
    // Update the innerHTML to include the new counts
    wordCountsSpan.innerHTML = '<span class="edit-source-checkbox">[<label for="edit-source">Edit</label> <input type="checkbox" name="edit-source" value="' + (i + 1) +'"/>]</span> [inv.:' + f0Count + ' — f1:' + f1Count + ' — f2:' + f2Count + ' (' + sumDiff.toFixed(2) + '%)]';
    // EDIT-CHANGE END

    // Hide the wordCountsSpan by default
    wordCountsSpan.style.display = 'none';

    // Add an event listener to the spanElement to toggle the display of the wordCountsSpan
    spanElement.addEventListener('click', function() {
        if (wordCountsSpan.style.display === 'none') {
            wordCountsSpan.style.display = 'inline';
        } else {
            wordCountsSpan.style.display = 'none';
        }
    });

    preElement.insertBefore(wordCountsSpan, spanElement.nextSibling);

    let newPxDiv = document.createElement('div');
    newPxDiv.className = 'newPxDiv';
    //newPxDiv.style.display = 'none';
    let paragraphNrSpan = document.createElement('span');
    paragraphNrSpan.className = 'paragraphnr';
    paragraphNrSpan.innerHTML = '<a style="color:#ACACAC;text-decoration:none;" href="#pnr' + (i + 1) + '">¶' + (i + 1) + ': </a>';
    let percentageSpan = document.createElement('span');
    percentageSpan.className = 'percentage';
    if (f0f2Sum - f0f1Sum > 10) {
    percentageSpan.innerHTML = '<b>' + (f0f2Sum - f0f1Sum) + '</b>';
    } else {
        percentageSpan.textContent = f0f2Sum - f0f1Sum;
    }
    newPxDiv.appendChild(paragraphNrSpan);
    newPxDiv.appendChild(percentageSpan);
    document.querySelector('div.stats').appendChild(newPxDiv);

}


document.querySelectorAll('span.f1, span.f2').forEach(el => el.style.backgroundColor = '#E8E8E8');

const f1spanElements = document.querySelectorAll('span.app > span.f1');
for (const el of f1spanElements) {
    if (!el.nextElementSibling || el.nextElementSibling.className !== 'f2') {
        el.textContent = ' ' + el.textContent;
    }
}

//EDIT-CHANGE
document.querySelector('.edit-source-link').addEventListener('click', function() {
    fetch('output.html')
        .then(response => response.text())
        .then(data => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(data, 'text/html');
            let preElement = doc.querySelector('pre');
            let lines = preElement.innerHTML.split('\n');

            const editSourceModal = document.createElement('div');
            editSourceModal.classList.add('modal');
            editSourceModal.innerHTML = `
                <div class="modal-content">
                    Edit source code:<br/><br/>
                    <textarea id="edit-source-textarea"></textarea>
                    <button class="modal-button" id="edit-source-button">Edit</button>
                    <button class="modal-button" id="cancel-source-button">Cancel</button>
                    <span style="margin-left:20px;"><b>Warning:</b> there are risks involved in editing the source code!</span>
                </div>
                `;
            let textArea = editSourceModal.querySelector('#edit-source-textarea');
            textArea.value = '';
            checkedValues.forEach(function(checkedValue) {
                let start = parseInt(checkedValue) - 1;
                let end = start + 1;
                let line = lines.slice(start, end).join('\n');
                textArea.value += line + '\n';
            });

            document.body.appendChild(editSourceModal);

            let editButton = editSourceModal.querySelector('#edit-source-button');
            editButton.addEventListener('click', function() {
                editButton.disabled = true;
                editButton.textContent = 'Editing...';
                const dirVar = document.querySelector('.edit-source-link').getAttribute('data-dirVar');
                fetch(`/edit-source?dirVar=${dirVar}&paragraphArray=${checkedValues}&editedText=${encodeURIComponent(editSourceModal.querySelector('#edit-source-textarea').value.trimEnd().replace(/\n/g, '<br/>'))}`)
                    .then(response => response.text())
                    .then(data => console.log(data));
                setTimeout(function() {
                    location.reload();
                }, 1000);
            });

            editSourceModal.querySelector('#cancel-source-button').addEventListener('click', function() {
                editSourceModal.remove();
            });

            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    editSourceModal.remove();
                }
            });
        });
});

//EDIT-CHANGE END


// fetch chapter number
fetch('info.txt')
  .then(response => response.text())
  .then(text => {
    const lines = text.split('\n');
    const firstLine = lines[0];
    const secondLine = lines[1];
    const thirdLine = lines[2];
    const paddingDiv = document.createElement('div');
    paddingDiv.style.height = '60px';
    const newDiv = document.createElement('div');
    newDiv.style.width = '60%';
    newDiv.style.minHeight = '40px';
    newDiv.style.fontWeight = '600';
    newDiv.style.color = 'black';
    newDiv.style.fontSize = 'inherit';
    newDiv.style.padding = '10px';
    const titleSpan = document.createElement('span');
    titleSpan.style.color = 'inherit';
    titleSpan.style.textDecoration = 'none';
    titleSpan.style.fontSize = '1.3em';
    titleSpan.textContent = firstLine.replace(/_/g, ' ');
    newDiv.appendChild(titleSpan);
    //create page title
    const title = document.createElement('title');
    title.textContent = titleSpan.textContent;
    document.head.appendChild(title);

    newDiv.appendChild(document.createElement('br'));
    
    // Create a div with id "status"
    const statusDiv = document.createElement('div');
    statusDiv.setAttribute('id', 'status');

    // Check the value of the third line of info.txt
    if (secondLine === "uncorrected") {
      statusDiv.innerHTML = "Status: <span style='color:red;'>uncorrected</span>";
      statusDiv.style.fontWeight = "normal";
    } else if (secondLine === "corrected") {
      statusDiv.innerHTML = "Status: <span style='color:green;'>corrected</span>";
      statusDiv.style.fontWeight = "normal";
    } else if (secondLine === "in progress") {
      statusDiv.innerHTML = "Status: <span style='color:orange;'>in progress</span>";
      statusDiv.style.fontWeight = "normal";
    }

    // Append the status div to newDiv
    newDiv.appendChild(statusDiv);

    // source files
    const sourcesSpan = document.createElement('span');
    sourcesSpan.classList.add('source-files');
    sourcesSpan.innerHTML = 'Text files: <a href="file1.txt">file1.txt</a> <a href="file2.txt">file2.txt</a>'
    newDiv.appendChild(sourcesSpan);

    // Get the first child of the body element
    const firstChild = document.body.firstChild;

    // Insert paddingDiv as the second child of the body element
    document.body.insertBefore(paddingDiv, firstChild.nextSibling);

    // Insert newDiv after paddingDiv
    document.body.insertBefore(newDiv, paddingDiv.nextSibling);

    const sourceLink = document.querySelector('.edit-source-link');
    sourceLink.setAttribute('data-dirVar', firstLine);

});


// delete or modify apps or add annotations

// up first deleteFunction
const deleteFunction = (id) => {
  let dirVar;
  fetch('info.txt')
    .then(response => response.text())
    .then(text => {
      const lines = text.split('\n');
      dirVar = lines[0];
      if (confirm(`Normalize app "${id}" to f2 in file ${dirVar}?`)) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `/delete-app?dataId=${id}&dirVar=${dirVar}`);
        xhr.send();
        xhr.addEventListener('load', () => {
          //setTimeout(() => {
          //  location.reload();
          //}, 1000);
          const appElement = document.querySelector(`.app#${id}`);
          if (appElement) {
            const f2Element = appElement.querySelector('.f2');
            if (f2Element) {
              appElement.replaceWith(document.createTextNode(f2Element.textContent));
            } else {
              appElement.replaceWith(document.createTextNode(""));
            }
          }
          const modal = document.querySelector('.modal');
          if (modal) {
            modal.remove();
          }
        });
      }
    });
};

//second: a click event listener for all span.app elements
const appSpans = document.querySelectorAll('span.app');
appSpans.forEach(span => {
  span.style.cursor = 'pointer';
});

let currentId = null;

if (combine !== 'yes') {
appSpans.forEach(span => {
  span.addEventListener('click', () => {
    const id = span.id;
    currentId = span.id;
    const modal = document.createElement('div');
    modal.classList.add('modal');


    let f1Text = span.querySelector('.f1') ? span.querySelector('.f1').textContent : '';
    let f2Text = span.querySelector('.f2') ? span.querySelector('.f2').textContent : '';

    let annotationText = '';
    fetch('annotations.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
      .then(annotations => {
        const annotation = annotations.find(annotation => annotation['app-id'] === id);
        if (annotation) {
          annotationText = annotation.text;
        }
        modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-button normalize">Normalize to f2</button>
            <button class="modal-button cancel">X</button>
            <br>
            <span style="color:rgb(0, 56, 40);font-weight:500;">Annotate:</span>
            <input class="modal-text" type="text" value="${annotationText.replace(/"/g, '&quot;')}" style="width:440px;">
            <button style="font-size:1.1rem; background-color: rgb(234, 248, 246); color: rgb(0, 56, 40); padding: 7px; border-radius: 5px; border: 1px solid rgb(0, 56, 40);">Submit</button>
            <br/><br/>
            <span style="color:rgb(0, 56, 40);font-weight:500;">Modify:</span>
            <br/>
            <span style="color:rgb(0, 56, 40);">f1:</span>
            <input class="modal-text" type="text" value="${f1Text.replace(/"/g, '&quot;')}" style="width:500px;">
            <br/>
            <span style="color:rgb(0, 56, 40);">f2:</span>
            <input class="modal-text" type="text" value="${f2Text.replace(/"/g, '&quot;')}" style="width:500px;">
            <button class="modal-button">Update</button>
        </div>
        `;
        const modalContent = modal.querySelector('.modal-content');

        document.body.appendChild(modal);

        const deleteButton = modal.querySelector('button');
        const newDeleteButton = deleteButton.cloneNode(true);
        deleteButton.parentNode.replaceChild(newDeleteButton, deleteButton);
        newDeleteButton.addEventListener('click', () => deleteFunction(currentId));

        //deleteButton.addEventListener('click', () => deleteFunction(id));



        const input = modal.querySelector('input');

        const submitButton = modal.querySelectorAll('button')[2];

        submitButton.addEventListener('click', () => {
          let annotationText = input.value;
          fetch('info.txt')
            .then(response => response.text())
            .then(text => {
              const lines = text.split('\n');
              dirVar = lines[0];
              fetch(`/make-annotation?annotationText=${encodeURIComponent(annotationText)}&dataId=${id}&dirVar=${dirVar}`)
                .then(response => response.text())
                .then(text => console.log(text));
            });
          modal.remove();
          setTimeout(updateAnnotations, 1000);
        });

        const cancelButton = modal.querySelectorAll('button')[1];

        cancelButton.addEventListener('click', () => {
          modal.remove();
        });

        document.addEventListener('keydown', event => {
          if (event.key === 'Escape') {
            modal.remove();
          }
        });

        const updateButton = modal.querySelectorAll('button')[3];

        updateButton.addEventListener('click', () => {
          let f1InputValue = document.querySelectorAll('.modal-content input')[1].value;
          let f2InputValue = document.querySelectorAll('.modal-content input')[2].value;

          fetch('info.txt')
            .then(response => response.text())
            .then(text => {
              const lines = text.split('\n');
              dirVar = lines[0];

              updateApp(id, f1InputValue, f2InputValue, dirVar);
            });

          modal.remove();

          function updateApp(id, f1Text, f2Text, dirVar) {
            fetch(`/update-app?id=${id}&f1Text=${encodeURIComponent(f1Text)}&f2Text=${encodeURIComponent(f2Text)}&dirVar=${dirVar}`)
              .then(response => response.text())
              .then(data => console.log(data));

            const appElement = document.querySelector(`.app#${id}`);
            updateFElement(appElement, 'f1', f1Text);
            updateFElement(appElement, 'f2', f2Text);
            id = null;
          }

            
        function updateFElement(appElement, fType, newText) {
          let fElement = appElement.querySelector(`.${fType}`);
          if (!fElement && newText) {
            fElement = document.createElement('span');
            fElement.classList.add(fType);
            if (fType === 'f1') {
              appElement.insertBefore(fElement, appElement.firstChild);
            } else {
              appElement.insertBefore(fElement, appElement.children[1]);
            }
          }
          if (fElement) {
            if (newText) {
              fElement.textContent = newText;
            } else {
              fElement.remove();
            }
          }
          let newF1Element = appElement.querySelector('.f1');
          if (newF1Element) {
            createTable([newF1Element]);
          }
        }
            


        });
      });
  });
});
}

document.addEventListener('keydown', event => {
    if (event.key === 'Backspace' && event.target.tagName !== 'INPUT'  && event.target.tagName !== 'TEXTAREA') {
        deleteFunction(currentId);
    }
});

// Create a div with class "sideDiv"
const sideDiv = document.createElement('div');
  sideDiv.classList.add('sideDiv');
  // Append sideDiv to the body element
  document.body.appendChild(sideDiv);


// Create a div with class "notes"
const notesDiv = document.createElement('div');
notesDiv.classList.add('notes');


// Create an h5 element with text value "Notes"
const notesTitle = document.createElement('h4');
notesTitle.style.paddingLeft = '10px';
notesTitle.textContent = 'NOTES';
notesTitle.style.color = "#003828";
notesTitle.style.cursor = 'pointer';

// Append the h5 element to notesDiv
notesDiv.appendChild(notesTitle);

// Create a div to hold notesContent, textarea and buttons
const contentDiv = document.createElement('div');
contentDiv.style.display = 'block';
contentDiv.style.paddingLeft = '10px';

// Create a p element and set its innerHTML to the value of thirdLine
const notesContent = document.createElement('p');
fetch('info.txt')
  .then(response => response.text())
  .then(text => {
    const lines = text.split('\n');
    const thirdLine = lines[2];
    if (thirdLine) {
        notesContent.innerHTML = thirdLine;
    }
});    

// Append the p element to contentDiv
contentDiv.appendChild(notesContent);

// Create an EDIT button
const editButton = document.createElement('button');
editButton.textContent = 'Edit';
editButton.style.color = 'rgb(0, 56, 40)';
editButton.style.display = 'inline-block';
editButton.style.border = '1px solid rgb(0, 56, 40)';
editButton.style.borderRadius = '5px';
editButton.style.backgroundColor = 'rgb(212, 246, 241)';
editButton.style.fontSize = '1.1rem';
editButton.style.cursor = 'pointer';
editButton.style.marginRight = '10px';
let textarea;
let isEditState = true;
let intervalId;
let dirVar;
editButton.addEventListener('click', () => {
    if (isEditState) {
        // Hide notesContent
        notesContent.style.display = 'none';
        // Create a textarea element
        textarea = document.createElement('textarea');
        textarea.style.minWidth = '98%';
        textarea.style.minHeight = '320px';
        textarea.style.fontSize = '1.1rem';
        textarea.style.marginBottom = '15px';
        fetch('info.txt')
          .then(response => response.text())
          .then(text => {
                const lines = text.split('\n');
                const thirdLine = lines[2];
                if (thirdLine) {
                    textarea.value = thirdLine.replace(/<br\/>/g, '\n');
            }
        });
        contentDiv.insertBefore(textarea, contentDiv.firstChild);
        editButton.textContent = 'Save';
        // Show CANCEL button
        cancelButton.style.display = 'inline-block';
        isEditState = false;
        
        // Save the value of the textarea element every five seconds
        fetch('info.txt')
            .then(response => response.text())
            .then(text => {
                dirVar = text.split('\n')[0];
                intervalId = setInterval(() => {
                    const textareaValueOneLine = textarea.value.replace(/\n/g, '<br/>');
                    fetch(`/edit-notes?textareaValue=${encodeURIComponent(textareaValueOneLine)}&dirVar=${dirVar}`);
                }, 5000);
            });
    } else {
        clearInterval(intervalId);
        
        // Fetch dirVar from info.txt
        fetch('info.txt')
            .then(response => response.text())
            .then(text => {
                const dirVarValue = text.split('\n')[0];
                // Replace newlines in textarea value with spaces
                const textareaValueOneLine = textarea.value.replace(/\n/g, '<br/>');
                // Send PUT request to /edit-notes with textarea value and dirVar
                fetch(`/edit-notes?textareaValue=${encodeURIComponent(textareaValueOneLine)}&dirVar=${dirVarValue}`)
                    .then(() => {
                        // Reload page after submitting
                        location.reload();
                    });
            });
    }
});




// Append EDIT button to contentDiv
contentDiv.appendChild(editButton);

// Create a CANCEL button
const cancelButton = document.createElement('button');
cancelButton.textContent = 'Cancel';
cancelButton.style.color = 'rgb(0, 56, 40)';
cancelButton.style.border = '1px solid rgb(0, 56, 40)';
cancelButton.style.borderRadius = '5px';
cancelButton.style.backgroundColor = 'rgb(212, 246, 241)';
cancelButton.style.fontSize = '1.1rem'
cancelButton.style.display = 'none';
cancelButton.style.cursor = 'pointer';
cancelButton.addEventListener('click', () => {
    // Show notesContent
    notesContent.style.display = 'block';
    // Remove textarea
    textarea.remove();
    // Change SUBMIT back to EDIT
    editButton.textContent = 'Edit';
    // Hide CANCEL button
    cancelButton.style.display = 'none';
    isEditState = true;
});

// Append CANCEL button to contentDiv
contentDiv.appendChild(cancelButton);

// Append contentDiv to notesDiv
notesDiv.appendChild(contentDiv);

// Toggle show/hide of contentDiv when clicking on notesTitle
notesTitle.addEventListener('click', () => {
    if (contentDiv.style.display === 'none') {
        contentDiv.style.display = 'block';
    } else {
        contentDiv.style.display = 'none';
    }
});

// Append notesDiv to sideDiv
sideDiv.appendChild(notesDiv);



//display annotations

let annotationsCache = [];

function updateAnnotations() {
  fetch('annotations.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response.json();
    })
    .then(annotations => {
      if (JSON.stringify(annotations) !== JSON.stringify(annotationsCache)) {
        annotationsCache = annotations;
        let newDiv = document.querySelector('.annotations-div');
        if (!newDiv) {
          newDiv = document.createElement('div');
          newDiv.classList.add('annotations-div');
          newDiv.style.borderRadius = '10px';
          newDiv.style.backgroundColor = '#eaf8f6';
          newDiv.style.overflow = 'auto';
          newDiv.style.paddingRight = '10px';
          newDiv.style.fontSize = '1.3rem';

          const title = document.createElement('h4');
          title.style.paddingLeft = '20px';
          title.textContent = 'ANNOTATIONS';
          newDiv.appendChild(title);

          const ul = document.createElement('ul');
          ul.classList.add('annotations-list');
          newDiv.appendChild(ul);

          sideDiv.appendChild(newDiv);
          
        }

        const ul = newDiv.querySelector('.annotations-list');
        ul.style.listStyleType = 'none';
        ul.innerHTML = '';

        // Sort the annotations based on the line number
        annotations.sort((a, b) => {
          let appElementA = document.querySelector(`span.app#${a['app-id']}`);
          let lineNumberA;
          if (appElementA) {
            let preElementTextContentA = appElementA.closest('pre').textContent;
            lineNumberA = preElementTextContentA.slice(0, preElementTextContentA.indexOf(appElementA.textContent)).split('\n').length;
          } else {
            lineNumberA = Infinity;
          }
          
          let appElementB = document.querySelector(`span.app#${b['app-id']}`);
          let lineNumberB;
          if (appElementB) {
            let preElementTextContentB = appElementB.closest('pre').textContent;
            lineNumberB = preElementTextContentB.slice(0, preElementTextContentB.indexOf(appElementB.textContent)).split('\n').length;
          } else {
            lineNumberB = Infinity;
          }
          
          return lineNumberA - lineNumberB;
        });

        annotations.forEach(annotation => {
          const li = document.createElement('li');
          li.setAttribute('data-id', annotation['app-id']);
          li.style.cursor = 'pointer';
          
          // Get the line number of the corresponding <span class="app"> element
          let appElement = document.querySelector(`span.app#${annotation['app-id']}`);
          let lineNumber;
          if (appElement) {
            let preElementTextContent = appElement.closest('pre').textContent;
            lineNumber = preElementTextContent.slice(0, preElementTextContent.indexOf(appElement.textContent)).split('\n').length;
            li.innerHTML = `<em>¶${lineNumber}</em> ${annotation.text}`;
          } else {
            li.innerHTML = `${annotation.text}`;
          }

          let emElements = li.querySelectorAll('em');
          emElements.forEach(emElement => {
            emElement.style.fontWeight = '600';
            emElement.style.fontStyle = 'normal';
          });

          let iElements = li.querySelectorAll('i');
          iElements.forEach(iElement => {
            iElement.style.color = '#00AA00';
            iElement.style.fontStyle = 'normal';
          });

          let bElements = li.querySelectorAll('b');
          bElements.forEach(bElement => {
            bElement.style.color = '#AA0000';
            bElement.style.fontWeight = 'normal';
          });

          ul.appendChild(li);
        });
        
        const appSpans = document.querySelectorAll('span.app');
        appSpans.forEach(span => {
          const id = span.id;
          if (annotations.some(annotation => annotation['app-id'] === id)) {
            if (!span.querySelector('.red-star')) {
              const redStar = document.createElement('span');
              redStar.classList.add('red-star');
              redStar.style.color = 'red';
              redStar.textContent = '*';
              span.appendChild(redStar);

              let tooltip;
              if (!redStar._eventListenerAdded) {
                redStar.addEventListener('mouseover', event => {
                  const li = document.querySelector(`.annotations-div li[data-id="${id}"]`);
                  li.style.color = 'red';

                  tooltip = document.createElement('div');
                  tooltip.classList.add('tooltip');
                  tooltip.style.position = 'absolute';
                  tooltip.style.zIndex = '1';
                  tooltip.style.left = `${event.pageX + 10}px`;
                  tooltip.style.top = `${event.pageY}px`;
                  tooltip.style.backgroundColor = 'white';
                  tooltip.style.border = '1px solid black';
                  tooltip.style.maxWidth = '400px';
                  tooltip.style.padding = '5px';
                  tooltip.innerHTML = annotations.find(annotation => annotation['app-id'] === id).text;

                  // Apply the styling of bold to any <em> elements that might occur in the annotation.text
                  let emElements = tooltip.querySelectorAll('em');
                  emElements.forEach(emElement => {
                    emElement.style.fontWeight = '600';
                    emElement.style.fontStyle = 'normal';
                  });

                  // Apply the styling of blue to any <i> elements that might occur in the annotation.text
                  let iElements = tooltip.querySelectorAll('i');
                  iElements.forEach(iElement => {
                    iElement.style.color = '#00AA00';
                    iElement.style.fontStyle = 'normal';
                  });

                  // Apply the styling of red to any <b> elements that might occur in the annotation.text
                  let bElements = tooltip.querySelectorAll('b');
                  bElements.forEach(bElement => {
                    bElement.style.color = '#AA0000';
                    bElement.style.fontWeight = 'normal';
                  });


                  document.body.appendChild(tooltip);
                });

                redStar.addEventListener('mouseout', () => {
                  const li = document.querySelector(`.annotations-div li[data-id="${id}"]`);
                  li.style.color = 'black';

                  if (tooltip) {
                    document.body.removeChild(tooltip);
                    tooltip = null;
                  }
                });

                redStar._eventListenerAdded = true;
              }
            }
          }
        });

      }
    })
    .catch(error => console.error(error));
}

updateAnnotations();
//setInterval(updateAnnotations, 1000);



//highlight app when annotation clicked
document.addEventListener('click', function(event) {
  let li = event.target.closest('li[data-id]');
  if (li) {
    let dataId = li.getAttribute('data-id');
    let span = document.getElementById(dataId);
    if (span) {
      // Check if the element is visible in the viewport
      let rect = span.getBoundingClientRect();
      let isVisible = (rect.top >= 0) && (rect.bottom <= window.innerHeight);
      
      // Only scroll the element into view if it's not already visible
      if (!isVisible) {
        span.scrollIntoView();
        window.scrollBy(0, -60);
      }
      
      span.style.border = '5px red solid';
      setTimeout(function() {
        span.style.border = '0';
      }, 3000);
    }
  }
});

// control scroll, add 60 for header
window.addEventListener('hashchange', function() {
  if (location.hash) {
    window.scrollBy(0, -65);
  }
});


