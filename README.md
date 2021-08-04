## SourceLocatorWebApp
## Docker build command

docker build -t sourcelocatorwebapp .

## Docker Run command

docker run -d -it -p 4200:80/tcp --name sourcelocatorwebapp sourcelocatorwebapp:latest
