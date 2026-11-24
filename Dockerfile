FROM mcr.microsoft.com/dotnet/sdk:8.0 AS listing
WORKDIR /github/workspace

RUN apt-get update && apt-get install -y git
RUN git clone https://github.com/vrchat-community/package-list-action.git ci
COPY source.json ./source.json
COPY Website/index.html Website/app.js ./Website/
WORKDIR /github/workspace/ci
RUN bash build.sh BuildMultiPackageListing \
    --root /github/workspace/ci \
    --package-listing-source-folder /github/workspace \
    --list-publish-directory /github/workspace/build/vpm

FROM python:3.12-slim AS website
WORKDIR /site
COPY build_site.py source.json ./
COPY Website/ ./Website/
COPY data/ ./data/
COPY --from=listing /github/workspace/build/vpm/index.json ./build/vpm/index.json
RUN python build_site.py --vpm-index build/vpm/index.json

FROM nginx:alpine
COPY --from=website /site/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
