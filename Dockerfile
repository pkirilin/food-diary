FROM mcr.microsoft.com/dotnet/sdk:6.0 AS backend
WORKDIR /app
COPY src/backend .
RUN dotnet publish -c Release -o publish src/FoodDiary.API/FoodDiary.API.csproj

FROM node:18.16.0-alpine AS frontend
WORKDIR /app
COPY src/frontend .
RUN yarn install
RUN yarn build

FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY --from=backend app/publish .
COPY --from=frontend app/dist frontend/dist
EXPOSE 80
ENV Logging__Console__FormatterName=Simple
ENTRYPOINT ["dotnet", "FoodDiary.API.dll"]
