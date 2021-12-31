FROM node:12.16.1 as react-build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json ./
COPY yarn.lock ./
RUN yarn install --prefer-offline
RUN yarn add react-scripts@4.0.1 -g
COPY . ./
RUN yarn build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=react-build /app/build /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
