@echo off
echo Building DealFuze server with fixed server implementation...

echo Copying simple-server-fixed.ts to simple-server.ts...
copy /Y src\simple-server-fixed.ts src\simple-server.ts

echo Building the server...
call npm run build

echo Build completed!
