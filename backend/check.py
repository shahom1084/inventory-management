import requests

url = "https://www.fast2sms.com/dev/bulkV2"

payload = "message=This%20is%20a%20test%20message&language=english&route=q&numbers=9999999999,8888888888,7777777777"
headers = {
    'authorization': "c9vIWihamAYHMJRD6KPwVZ2jN0lQq54F7XyCrEBnLdGpuzbOsUDzykC7VftFRMbocATxajPYSZprlNBi",
    'Content-Type': "application/x-www-form-urlencoded",
    'Cache-Control': "no-cache",
    }

response = requests.request("POST", url, data=payload, headers=headers)

print(response.text)