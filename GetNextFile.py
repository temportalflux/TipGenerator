import sys
import os
import re
import json
import random
import io
import win32clipboard
from PIL import Image

def send_to_clipboard(clip_type, data):
	win32clipboard.OpenClipboard()
	win32clipboard.EmptyClipboard()
	win32clipboard.SetClipboardData(clip_type, data)
	win32clipboard.CloseClipboard()

def sendImageToClipboard(filepath):
	image = Image.open(filepath)
	output = io.BytesIO()
	image.convert("RGB").save(output, "BMP")
	data = output.getvalue()[14:]
	output.close()
	send_to_clipboard(win32clipboard.CF_DIB, data)

args = sys.argv

databaseFile = 'db.json'
databaseSchema = {
	"touchedRecently": []
}
fileDirectory = "./Files"

def buildFileList(directory):
	files = {}
	cwd = os.getcwd()
	os.chdir(directory)
	for filename in os.listdir("."):
		match = re.search(r'([0-9]+).*', filename)
		if match:
			index = int(match.group(1))
			files[index] = {
				"filename": filename,
				"descriptor": index
			}
	os.chdir(cwd)
	return files

fileList = buildFileList(fileDirectory)

if not os.path.exists(databaseFile):
	with open(databaseFile, 'a+') as jsonDB:
		jsonDB.write(json.dumps(databaseSchema, indent=4, sort_keys=True))

database = {}
with open(databaseFile, 'r') as jsonDB:
	database = json.load(jsonDB)

def diffListEnsureNonEmpty(listA, listB):
	diff = [key for key in listA if key not in listB]
	if not diff:
		del listB[:]
		return diffListEnsureNonEmpty(listA, listB)
	diff.sort()
	return diff

untouched = diffListEnsureNonEmpty(fileList.keys(), database['touchedRecently'])

chosen = random.choice(untouched)

database['touchedRecently'].append(chosen)
database['touchedRecently'].sort()

chosenFilePath = os.path.join(fileDirectory, fileList[chosen]["filename"])
sendImageToClipboard(chosenFilePath)

print("File {} has been copied to clipboard".format(fileList[chosen]["filename"]))

with open(databaseFile, 'w+') as jsonDB:
	jsonDB.write(json.dumps(database, indent=4, sort_keys=True))