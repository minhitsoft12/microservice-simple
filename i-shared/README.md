# @dym-vietnam/internal-shared

Shared TypeScript definitions for DYM Vietnam microservices. This package contains common enums, interfaces, and constants used across the microservice architecture.

## Table of Contents

- [Installation](#installation)
- [Development](#development)
- [Structure](#structure)
- [Publishing](#publishing)
- [Usage](#usage)
- [Available Exports](#available-exports)

## Installation

Since this package is published to GitHub Packages registry, you'll need to authenticate with GitHub to install it:

1. Create a GitHub personal access token with `read:packages` scope
2. Configure npm to use GitHub Packages:

```bash
# Add this to your .npmrc file
@dym-vietnam:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

3. Install the package:

```bash
npm install @dym-vietnam/internal-shared
```

## Development

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Building

To build the package:

```bash
npm run build
```

This will compile TypeScript files from the `src` directory into JavaScript in the `dist` directory.

### Project Structure

All source files should be placed in the `src` directory. The build process will compile these files and generate the necessary type definitions.

## Structure

```
src/
├── constants/    # Service constants and TCP message definitions
├── enums/        # Enumeration types
├── interfaces/   # TypeScript interfaces
└── index.ts      # Main entry point for exports
```

## Publishing

This package is published to GitHub Packages. To publish a new version:

1. Update the version in `package.json`
2. Make sure you have the necessary permissions to publish to the GitHub organization
3. Authenticate with GitHub Packages:

```bash
# You need to have a GitHub personal access token with write:packages scope
npm login --registry=https://npm.pkg.github.com
```

4. Publish the package:

```bash
npm publish
```

### Publishing a New Version

To publish a new version with semantic versioning:

```bash
# For a patch release (bug fixes)
npm version patch

# For a minor release (new features, backward compatible)
npm version minor

# For a major release (breaking changes)
npm version major
```

The `postversion` script will automatically push the new version tag to GitHub.

## Usage

Import the shared components in your microservices:

```typescript
// Import specific components
import { SERVICE_NAMES } from '@dym-vietnam/internal-shared';
import { User } from '@dym-vietnam/internal-shared';
import { Permissions, RoleType } from '@dym-vietnam/internal-shared';

// Or import everything
import * as shared from '@dym-vietnam/internal-shared';
```

## Available Exports

### Constants

- `SERVICE_NAMES` - Service identifiers
- `UserServiceTCPMessages` - TCP message patterns for the User service

### Enums

- `BaseStatusEnum` - Base status values (ACTIVE, INACTIVE)
- `EmployeeTypeEnum` - Employee types (FULL_TIME, PART_TIME, INTERN)
- `EmployeeStatusEnum` - Employee statuses (TERMINATED, PERMANENT, PROBATION)
- `WorkTypeEnum` - Work types (REMOTE, ONSITE, HYBRID)
- `GenderEnum` - Gender options (MALE, FEMALE, OTHER)
- `MaritalStatusEnum` - Marital status options
- `UserStatusEnum` - User status options (includes BaseStatusEnum + ONBOARDING)
- `Roles` - User role types (ADMIN, MANAGER, LEADER, MEMBER)
- `Permissions` - Available permission types
- `RoleStatusEnum` - Role status options
- `PermissionStatusEnum` - Permission status options

### Interfaces

- `User` - User entity interface

### Types

- `EmployeeTypeEnumType`
- `EmployeeStatusEnumType`
- `WorkTypeEnumType`
- `GenderEnumType`
- `MaritalStatusEnumType`
- `UserStatusEnumType`
- `RoleStatusEnumType`
- `PermissionStatusEnumType`
- `PermissionType`
- `RoleType`
- `BaseStatusEnumType`

## Environment Variables

When using this package with DYM Vietnam services, the following environment variables are typically required:

```
AUTH_SERVICE_HOST=localhost
AUTH_SERVICE_PORT=4000

USER_SERVICE_HOST=localhost
USER_SERVICE_PORT=4001

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
```

## License

ISC