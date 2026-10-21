# nuget-seed

CI copies the NuGet packages it has already restored here before it builds the Docker image, so the image's
`dotnet restore` finds PdfPecker in its package folder instead of downloading it from nuget.org again. Every download
on nuget.org counts towards PdfPecker's public download number, and a CI runner's Docker cache starts empty each time.

Locally the folder holds only this file, which `.dockerignore` keeps out of the image, and the build restores as
before. Everything else here is ignored by Git.
