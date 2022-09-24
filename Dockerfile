FROM mcr.microsoft.com/dotnet/sdk:6.0 AS backend
WORKDIR /app
COPY . .
RUN dotnet publish -c Release -o publish src/FoodDiary.API/FoodDiary.API.csproj

FROM node:16.16.0-alpine AS frontend
WORKDIR /app
COPY src/FoodDiary.API/frontend .
RUN yarn install
ENV PATH="./node_modules/.bin:$PATH"
RUN yarn build

FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY --from=backend app/publish .
COPY --from=frontend app/build frontend/build
EXPOSE 80
ENV Logging__Console__FormatterName=Simple
ENTRYPOINT ["dotnet", "FoodDiary.API.dll"]
