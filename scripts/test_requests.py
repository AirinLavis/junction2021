import requests
import json

url = "https://api.miro.com/v2/boards/o9J_lhrJgtU%3D/tags?limit=50&offset=0"

headers = {
    "Accept": "application/json",
    "Authorization": "Bearer kd03LcLI2W0jaotIxTSrQyqeKq8"
}

response = requests.request("GET", url, headers=headers)
converted = json.loads(response.text)
for x in converted["data"]:
    x["id"] = str(x["id"])
print(json.dumps(converted["data"]))

# f = open("tags.txt", "w")
# f.write(json.dumps(converted["data"]))
# f.close()