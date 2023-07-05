import sys
import os

def update_info_txt(textareaValue, dirVar):
    # Read info.txt
    with open(f'{dirVar}/info.txt', 'r') as f:
        lines = f.readlines()
    # Check if there is a third line
    if len(lines) >= 3:
        # Replace the contents of the third line with textareaValue
        lines[2] = textareaValue
    else:
        # Add a third line with textareaValue
        lines.append('\n' + textareaValue)
    # Write updated lines to info.txt
    with open(f'{dirVar}/info.txt', 'w') as f:
        f.writelines(lines)

if __name__ == '__main__':
    textareaValue = sys.argv[1]
    dirVar = os.path.join('public', 'data', sys.argv[2])
    update_info_txt(textareaValue, dirVar)