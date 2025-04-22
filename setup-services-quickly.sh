#!/bin/bash

################################ Common feature ################################
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Print heading
print_heading() {
  echo -e "\n${GREEN}==== $1 ====${NC}\n"
}

# Check if docker is installed
check_docker() {
  print_heading "Checking Docker Installation"
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
  else
    echo -e "${GREEN}Docker is installed!${NC}"
  fi

  # Check if docker compose is installed
  if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
  else
    echo -e "${GREEN}Docker Compose is installed!${NC}"
  fi
}

# Check if Node.js is installed (for local development)
check_node() {
  print_heading "Checking Node.js Installation"
  if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. It's recommended for local development.${NC}"
  else
    echo -e "${GREEN}Node.js $(node -v) is installed!${NC}"

    # Check npm
    if ! command -v npm &> /dev/null; then
      echo -e "${YELLOW}npm is not installed. It's recommended for local development.${NC}"
    else
      echo -e "${GREEN}npm $(npm -v) is installed!${NC}"
    fi
  fi
}

################################ .npmrc file generation ################################
generate_npmrc_file() {
  print_heading "Generating .npmrc File"

  # Check if .npmrc file already exists
  if [ -f .npmrc ]; then
    echo -e "${YELLOW}.npmrc file already exists.${NC}"
    read -p "Do you want to overwrite it? (y/n): " overwrite
    if [[ $overwrite != "y" && $overwrite != "Y" ]]; then
      echo -e "${GREEN}Keeping existing .npmrc file.${NC}"
      return
    fi
  fi

  echo -e "${YELLOW}Please provide values for your npm configuration:${NC}"
  echo -e "(Press Enter to use default values shown in brackets)"
  echo ""

  # NPM registry configuration
  read -p "NPM Registry Scope (e.g., @your-org) [@dym-vietnam]: " NPM_SCOPE
  NPM_SCOPE=${NPM_SCOPE:-@dym-vietnam}

  read -p "NPM Registry URL [https://npm.pkg.github.com]: " NPM_REGISTRY_URL
  NPM_REGISTRY_URL=${NPM_REGISTRY_URL:-https://npm.pkg.github.com}

  # Ask for GitHub token
  echo -e "\n${YELLOW}GitHub Authentication Token:${NC}"
  echo -e "(Required for accessing private packages from GitHub registry)"
  read -p "GitHub Token: " GITHUB_TOKEN

  # Verify token is provided
  if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${YELLOW}WARNING: No GitHub token provided. You may have issues accessing private packages.${NC}"
    read -p "Continue without token? (y/n) [n]: " CONTINUE_WITHOUT_TOKEN
    CONTINUE_WITHOUT_TOKEN=${CONTINUE_WITHOUT_TOKEN:-n}

    if [[ $CONTINUE_WITHOUT_TOKEN != "y" && $CONTINUE_WITHOUT_TOKEN != "Y" ]]; then
      echo -e "${RED}Aborting .npmrc generation. Please provide a token.${NC}"
      return
    fi
  fi

  # Create .npmrc file
  cat > .npmrc << EOF
${NPM_SCOPE}:registry=${NPM_REGISTRY_URL}
//${NPM_REGISTRY_URL#https://}/:_authToken=${GITHUB_TOKEN}
EOF

  echo -e "\n${GREEN}.npmrc file generated successfully!${NC}"
  echo -e "File location: $(pwd)/.npmrc"

  # Ask if user wants to review the .npmrc file
  read -p "Do you want to review the .npmrc file? (y/n) [n]: " REVIEW_NPMRC
  REVIEW_NPMRC=${REVIEW_NPMRC:-n}

  if [[ $REVIEW_NPMRC == "y" || $REVIEW_NPMRC == "Y" ]]; then
    echo -e "\n${GREEN}--- .npmrc File Content ---${NC}"
    cat .npmrc
    echo ""
  fi

  echo -e "${GREEN}Copying file .npmrc into services folder (i-user-service, i-api-gateway, i-asm-be)${NC}"
  cp -f .npmrc ./i-user-service && cp -f .npmrc ./i-api-gateway && cp -f .npmrc ./i-asm-be
  echo -e "File location: $(pwd)/[service_folder]/.npmrc"
}

################################ Environment file generation ################################
generate_env_file() {
  print_heading "Generating .env File"

  # Check if .env file already exists
  if [ -f .env ]; then
    echo -e "${YELLOW}.env file already exists.${NC}"
    read -p "Do you want to overwrite it? (y/n): " overwrite
    if [[ $overwrite != "y" && $overwrite != "Y" ]]; then
      echo -e "${GREEN}Keeping existing .env file.${NC}"
      return
    fi
  fi

  echo -e "${YELLOW}Please provide values for your environment configuration:${NC}"
  echo -e "(Press Enter to use default values shown in brackets)"
  echo ""

  # Environment configuration
  read -p "NODE_ENV [development]: " NODE_ENV
  NODE_ENV=${NODE_ENV:-development}

  # API Gateway configuration
  echo -e "\n${GREEN}--- API Gateway Configuration ---${NC}"
  read -p "API Gateway Host [api-gateway]: " API_GATEWAY_HOST
  API_GATEWAY_HOST=${API_GATEWAY_HOST:-api-gateway}

  read -p "API Gateway Port [4000]: " API_GATEWAY_PORT
  API_GATEWAY_PORT=${API_GATEWAY_PORT:-4000}

  # Ask if user wants to generate random JWT secrets or provide custom ones
  echo -e "\n${YELLOW}JWT Secrets:${NC}"
  read -p "Generate random JWT secrets? (y/n) [y]: " RANDOM_JWT
  RANDOM_JWT=${RANDOM_JWT:-y}

  if [[ $RANDOM_JWT == "y" || $RANDOM_JWT == "Y" ]]; then
    JWT_ACCESS_SECRET=$(openssl rand -hex 32)
    JWT_REFRESH_SECRET=$(openssl rand -hex 32)
    echo -e "${GREEN}Random JWT secrets generated!${NC}"
  else
    read -p "JWT Access Secret: " JWT_ACCESS_SECRET
    read -p "JWT Refresh Secret: " JWT_REFRESH_SECRET

    # Check if secrets were provided
    if [ -z "$JWT_ACCESS_SECRET" ] || [ -z "$JWT_REFRESH_SECRET" ]; then
      echo -e "${YELLOW}Using randomly generated secrets for empty values...${NC}"
      [ -z "$JWT_ACCESS_SECRET" ] && JWT_ACCESS_SECRET=$(openssl rand -hex 32)
      [ -z "$JWT_REFRESH_SECRET" ] && JWT_REFRESH_SECRET=$(openssl rand -hex 32)
    fi
  fi

  read -p "JWT Access Token Expiration [1h]: " JWT_ACCESS_EXPIRATION
  JWT_ACCESS_EXPIRATION=${JWT_ACCESS_EXPIRATION:-1h}

  read -p "JWT Refresh Token Expiration [7d]: " JWT_REFRESH_EXPIRATION
  JWT_REFRESH_EXPIRATION=${JWT_REFRESH_EXPIRATION:-7d}

  # User Service configuration
  echo -e "\n${GREEN}--- User Service Configuration ---${NC}"
  read -p "User Service Host [user-service]: " USER_SERVICE_HOST
  USER_SERVICE_HOST=${USER_SERVICE_HOST:-user-service}

  read -p "User Service Port [4001]: " USER_SERVICE_PORT
  USER_SERVICE_PORT=${USER_SERVICE_PORT:-4001}

  # MongoDB configuration
  echo -e "\n${GREEN}--- MongoDB Configuration ---${NC}"
  read -p "MongoDB URI [mongodb://user-service_database:27017/userdb]: " USER_SERVICE_MONGODB_URI
  USER_SERVICE_MONGODB_URI=${USER_SERVICE_MONGODB_URI:-mongodb://user-service_database:27017/userdb}

  # ASM Service configuration
  echo -e "\n${GREEN}--- ASM Service Configuration ---${NC}"
  read -p "ASM Service Host [asm-service]: " ASM_SERVICE_HOST
  ASM_SERVICE_HOST=${ASM_SERVICE_HOST:-asm-service}

  read -p "ASM Service Port [4002]: " ASM_SERVICE_PORT
  ASM_SERVICE_PORT=${ASM_SERVICE_PORT:-4002}

  # MySQL configuration for ASM Service
  echo -e "\n${GREEN}--- MySQL Configuration for ASM Service ---${NC}"
  read -p "MySQL Host [asm-service_database]: " ASM_SERVICE_DB
  ASM_SERVICE_DB=${ASM_SERVICE_DB:-asm-service_database}

  read -p "MySQL Port [3306]: " ASM_SERVICE_DB_PORT
  ASM_SERVICE_DB_PORT=${ASM_SERVICE_DB_PORT:-3306}

  read -p "MySQL Database Name [asm-service]: " ASM_SERVICE_DB_NAME
  ASM_SERVICE_DB_NAME=${ASM_SERVICE_DB_NAME:-asm-service}

  read -p "MySQL Username [asm-service]: " ASM_SERVICE_DB_USER
  ASM_SERVICE_DB_USER=${ASM_SERVICE_DB_USER:-asm-service}

  read -p "MySQL Password [Dym@2025]: " ASM_SERVICE_DB_PASSWORD
  ASM_SERVICE_DB_PASSWORD=${ASM_SERVICE_DB_PASSWORD:-Dym@2025}

  # CORS configuration
  echo -e "\n${GREEN}--- CORS Configuration ---${NC}"
  read -p "CORS Origins (comma-separated, or * for all) [*]: " CORS_ORIGINS
  CORS_ORIGINS=${CORS_ORIGINS:-"*"}

  # Create .env file
  cat > .env << EOF
# Environment Configuration
NODE_ENV=${NODE_ENV}

# API Gateway Configuration
API_GATEWAY_HOST=${API_GATEWAY_HOST}
API_GATEWAY_PORT=${API_GATEWAY_PORT}
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_ACCESS_EXPIRATION=${JWT_ACCESS_EXPIRATION}
JWT_REFRESH_EXPIRATION=${JWT_REFRESH_EXPIRATION}

# User Service Configuration
USER_SERVICE_HOST=${USER_SERVICE_HOST}
USER_SERVICE_PORT=${USER_SERVICE_PORT}
USER_SERVICE_MONGODB_URI=${USER_SERVICE_MONGODB_URI}

# ASM Service Configuration
ASM_SERVICE_HOST=${ASM_SERVICE_HOST}
ASM_SERVICE_PORT=${ASM_SERVICE_PORT}
ASM_SERVICE_DB=${ASM_SERVICE_DB}
ASM_SERVICE_DB_PORT=${ASM_SERVICE_DB_PORT}
ASM_SERVICE_DB_NAME=${ASM_SERVICE_DB_NAME}
ASM_SERVICE_DB_USER=${ASM_SERVICE_DB_USER}
ASM_SERVICE_DB_PASSWORD=${ASM_SERVICE_DB_PASSWORD}

# CORS Configuration
CORS_ORIGINS="${CORS_ORIGINS}"
EOF

  echo -e "\n${GREEN}.env file generated successfully!${NC}"
  echo -e "File location: $(pwd)/.env"

  # Ask if user wants to review the .env file
  read -p "Do you want to review the .env file? (y/n) [n]: " REVIEW_ENV
  REVIEW_ENV=${REVIEW_ENV:-n}

  if [[ $REVIEW_ENV == "y" || $REVIEW_ENV == "Y" ]]; then
    echo -e "\n${GREEN}--- .env File Content ---${NC}"
    cat .env
    echo ""
  fi
}

################################ Development mode ################################
run_dev_mode() {
  print_heading "Starting Services in Development Mode"

  echo "Building and starting services with Docker Compose..."
  docker compose -f docker-compose.yml up --build -d

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Services started successfully!${NC}"
    echo -e "API Gateway is running at: ${YELLOW}http://localhost:${API_GATEWAY_PORT:-4000}${NC}"
    echo -e "User Service is running at: ${YELLOW}http://localhost:${USER_SERVICE_PORT:-4001}${NC}"
    echo -e "ASM Service is running at: ${YELLOW}http://localhost:${ASM_SERVICE_PORT:-4002}${NC}"
    echo -e "MongoDB is running at: ${YELLOW}${USER_SERVICE_MONGODB_URI:-mongodb://localhost:27017}${NC}"
    echo -e "MySQL is running at: ${YELLOW}${ASM_SERVICE_DB:-localhost}:${ASM_SERVICE_DB_PORT:-3306}${NC}"
  else
    echo -e "${RED}Failed to start services. Check Docker Compose logs.${NC}"
    exit 1
  fi
}

################################ Production mode ################################
# Initialize Docker Swarm
init_swarm() {
  print_heading "Initializing Docker Swarm"

  # Check if already in swarm mode
  SWARM_STATUS=$(docker info --format '{{.Swarm.LocalNodeState}}')

  if [ "$SWARM_STATUS" == "active" ]; then
    echo -e "${YELLOW}Swarm already initialized!${NC}"
  else
    echo "Initializing Docker Swarm..."
    docker swarm init --advertise-addr $(hostname -i) || true
    echo -e "${GREEN}Docker Swarm initialized!${NC}"
  fi
}

# Deploy stack to swarm
deploy_swarm() {
  print_heading "Deploying to Docker Swarm"

  echo "Building services..."
  docker compose -f docker-stack.yml build

  echo "Deploying stack to swarm..."
  docker stack deploy -c docker-stack.yml microservices

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Stack deployed successfully!${NC}"
    echo -e "API Gateway is running at: ${YELLOW}http://localhost:${API_GATEWAY_PORT:-4000}${NC}"
    echo -e "User Service is accessible within the swarm network${NC}"
    echo -e "ASM Service is accessible within the swarm network${NC}"
    echo -e "MongoDB is running at: ${YELLOW}${USER_SERVICE_MONGODB_URI:-mongodb://localhost:27017}${NC}"
    echo -e "MySQL is running at: ${YELLOW}${ASM_SERVICE_DB:-localhost}:${ASM_SERVICE_DB_PORT:-3306}${NC}"
  else
    echo -e "${RED}Failed to deploy stack. Check swarm logs.${NC}"
    exit 1
  fi
}

################################ Execute Script ################################
main() {
  print_heading "Microservices Setup Script"

  # Run checks
  check_docker
  check_node

  # Ask which files to generate
  echo -e "\n${YELLOW}Select configuration files to generate:${NC}"
  read -p "Generate .env file? (y/n) [y]: " GEN_ENV
  GEN_ENV=${GEN_ENV:-y}

  read -p "Generate .npmrc file? (y/n) [y]: " GEN_NPMRC
  GEN_NPMRC=${GEN_NPMRC:-y}

  # Generate configuration files
  [[ $GEN_ENV == "y" || $GEN_ENV == "Y" ]] && generate_env_file
  [[ $GEN_NPMRC == "y" || $GEN_NPMRC == "Y" ]] && generate_npmrc_file

  # Ask user for deployment mode
  echo -e "\n${YELLOW}Select deployment mode:${NC}"
  echo "1) Development mode (docker compose)"
  echo "2) Production mode (docker swarm) [Developing...]"
  echo "3) Exit"

  read -p "Enter your choice (1-3): " choice

  case $choice in
    1)
      run_dev_mode
      ;;
    2)
      init_swarm
      deploy_swarm
      ;;
    3)
      echo -e "${GREEN}Exiting...${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid choice. Exiting...${NC}"
      exit 1
      ;;
  esac

  echo -e "\n${GREEN}Setup completed successfully!${NC}"
}

main