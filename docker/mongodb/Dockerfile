FROM alpine:3.9

ENV TERM=linux

RUN apk add --no-cache bash mongodb

# Create data directory
RUN mkdir -p /data/db && \
    chown -R daemon:daemon /data/db

# MongoDB configuration
COPY mongod.conf /etc/mongod.conf

# MongoDB runs on port 27017
EXPOSE 27017

# Set volume for data
VOLUME ["/data/db"]

# Set working directory
WORKDIR /data

# Switch to non-root user for security
USER daemon

# Start MongoDB
CMD ["mongod", "--config", "/etc/mongod.conf"]

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=30s \
  CMD mongosh --eval "db.adminCommand('ping')" || exit 1