import { Injectable, Inject, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, firstValueFrom, timeout, catchError } from 'rxjs';
import { User, UserServiceTCPMessages } from "@dym-vietnam/internal-shared";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly requestTimeout: number;

  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
    private configService: ConfigService,
  ) {
    this.requestTimeout = this.configService.get('USER_SERVICE_TIMEOUT', 5000);
  }

  async onModuleInit() {
    try {
      await this.userServiceClient.connect();
      this.logger.log('Successfully connected to User Service');
    } catch (error) {
      this.logger.error(`Failed to connect to User Service: ${error.message}`);
    }
  }

  async findOne(userId: string): Promise<User> {
    const pattern = { cmd: 'findOneUser' };
    const payload = { userId };

    try {
      const observable: Observable<User> = this.userServiceClient.send<User>(`${UserServiceTCPMessages.UPDATE_PROFILE}.${userId}`, {})
        .pipe(
          timeout(this.requestTimeout),
          catchError(error => {
            this.logger.error(`Error fetching user ${userId}: ${error.message}`);
            throw new ServiceUnavailableException('User service is currently unavailable');
          })
        );

      return await firstValueFrom(observable);
    } catch (error) {
      this.logger.error(`Failed to get user with ID ${userId}: ${error.message}`);
      throw error;
    }
  }

  async findByTeam(teamId: string): Promise<User[]> {
    const pattern = { cmd: 'findUsersByTeam' };
    const payload = { teamId };

    try {
      const observable: Observable<User[]> = this.userServiceClient.send<User[]>(pattern, payload)
        .pipe(
          timeout(this.requestTimeout),
          catchError(error => {
            this.logger.error(`Error fetching users for team ${teamId}: ${error.message}`);
            throw new ServiceUnavailableException('User service is currently unavailable');
          })
        );

      return await firstValueFrom(observable);
    } catch (error) {
      this.logger.error(`Failed to get users for team ${teamId}: ${error.message}`);
      throw error;
    }
  }

  async findByRole(roleId: string): Promise<User[]> {
    const pattern = { cmd: 'findUsersByRole' };
    const payload = { roleId };

    try {
      const observable: Observable<User[]> = this.userServiceClient.send<User[]>(pattern, payload)
        .pipe(
          timeout(this.requestTimeout),
          catchError(error => {
            this.logger.error(`Error fetching users for role ${roleId}: ${error.message}`);
            throw new ServiceUnavailableException('User service is currently unavailable');
          })
        );

      return await firstValueFrom(observable);
    } catch (error) {
      this.logger.error(`Failed to get users for role ${roleId}: ${error.message}`);
      throw error;
    }
  }

  async findAllActive(): Promise<User[]> {
    const pattern = { cmd: 'findAllActiveUsers' };

    try {
      const observable: Observable<User[]> = this.userServiceClient.send<User[]>(pattern, {})
        .pipe(
          timeout(this.requestTimeout),
          catchError(error => {
            this.logger.error(`Error fetching all active users: ${error.message}`);
            throw new ServiceUnavailableException('User service is currently unavailable');
          })
        );

      return await firstValueFrom(observable);
    } catch (error) {
      this.logger.error(`Failed to get all active users: ${error.message}`);
      throw error;
    }
  }
}