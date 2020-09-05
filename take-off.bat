cd database
start mongod --dbpath=data
cd ..\backend
start run_server.bat
start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" https://localhost:3443/