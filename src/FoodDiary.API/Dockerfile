FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build
WORKDIR /src
COPY ["src/FoodDiary.API/FoodDiary.API.csproj", "src/FoodDiary.API/"]
RUN dotnet restore "src/FoodDiary.API/FoodDiary.API.csproj"
COPY . .
WORKDIR "/src/src/FoodDiary.API"
RUN dotnet build "FoodDiary.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FoodDiary.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FoodDiary.API.dll"]
