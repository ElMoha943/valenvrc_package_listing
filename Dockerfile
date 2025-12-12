# Multi-stage build for VPM Package Listing

# Stage 1: Build the listing
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder

# Set up the workspace
WORKDIR /github/workspace

# Install git
RUN apt-get update && apt-get install -y git

# Copy source files
COPY source.json ./source.json
COPY Website/ ./Website/
COPY data/ ./data/

# Prepare data files for Website
RUN mkdir -p ./Website/data && \
    cp data/products.json Website/data/ && \
    cp data/site-config.json Website/data/ && \
    cp data/portfolio.json Website/data/

# Clone the package-list-action repo
RUN git clone https://github.com/vrchat-community/package-list-action.git ci

# Run the build matching the working GitHub Actions config
RUN cd ci && \
    chmod +x build.sh && \
    ./build.sh BuildMultiPackageListing \
    --root /github/workspace/ci \
    --list-publish-directory /github/workspace/Website

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built website from builder
COPY --from=builder /github/workspace/Website /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
