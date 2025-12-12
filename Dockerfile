# Multi-stage build for VPM Package Listing

# Stage 1: Build the listing
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder

# Set up the workspace like GitHub Actions
WORKDIR /github/workspace

# Install git
RUN apt-get update && apt-get install -y git

# Copy source files
COPY source.json .
COPY Website/ Website/

# Clone the package-list-action repo into ci subdirectory
RUN git clone https://github.com/vrchat-community/package-list-action.git ci

# Run the build - matching GitHub Actions exactly
# The build will look for source.json in /github/workspace (where we are)
# And output to /github/workspace/Website
RUN cd ci && \
    chmod +x build.sh && \
    ./build.sh BuildMultiPackageListing \
    --root /github/workspace/ci \
    --list-publish-directory /github/workspace/Website

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built website from builder
COPY --from=builder /github/workspace/Website /usr/share/nginx/html

# Copy source.json for client-side VPM listing (fallback if build doesn't work)
COPY source.json /usr/share/nginx/html/source.json

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
