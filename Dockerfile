# Build:  docker build -t pdfpecker-web .
# Run with a memory limit, so a hostile document cannot take memory from the rest of the host. The app sizes its
# conversion slots to the limit and refuses documents that would exceed it:
#   docker run -p 8080:8080 --memory 2g --pids-limit 200 --read-only pdfpecker-web
# Behind a reverse proxy or CDN, pass its addresses so rate limits apply per visitor: -e TrustedProxies=10.0.0.0/8
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY PdfPecker.Web.csproj .
# The NuGet cache mount keeps downloaded packages between builds on the same machine, so a changed csproj does not
# download PdfPecker again unless its version changed. Publish needs the same mount to find the restored packages.
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages dotnet restore
COPY Program.cs .
COPY wwwroot/ wwwroot/
ARG VERSION=0.1.0
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet publish -c Release --no-restore -p:Version=$VERSION -o /app

# Chiseled: Ubuntu without a shell or package manager, only what .NET needs, so there is little to attack.
# The floating 10.0 tags pick up .NET and OS security patches on every build.
FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080 \
    DOTNET_EnableDiagnostics=0
EXPOSE 8080
USER app
ENTRYPOINT ["dotnet", "PdfPecker.Web.dll"]
