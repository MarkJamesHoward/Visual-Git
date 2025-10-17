# https://hub.docker.com/_/microsoft-dotnet
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /myapp

EXPOSE 5078

# copy everything
COPY . /myapp
RUN dotnet restore
RUN dotnet publish -c release -o /app --no-restore

# final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /
COPY --from=build /app ./
ENTRYPOINT ["dotnet", "GitVisualiserAPI.dll"]