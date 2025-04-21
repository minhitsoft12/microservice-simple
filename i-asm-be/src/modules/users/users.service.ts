import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {User} from "@dym-vietnam/internal-shared";

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  async findOne(userId: string): Promise<User> {
    const pattern = { cmd: 'findOneUser' };
    const payload = { userId };

    const observable: Observable<User> = this.userServiceClient.send<User>(pattern, payload);
    return firstValueFrom(observable);
  }

  async findByTeam(teamId: string): Promise<User[]> {
    const pattern = { cmd: 'findUsersByTeam' };
    const payload = { teamId };

    const observable: Observable<User[]> = this.userServiceClient.send<User[]>(pattern, payload);
    return firstValueFrom(observable);
  }

  async findByRole(roleId: string): Promise<User[]> {
    const pattern = { cmd: 'findUsersByRole' };
    const payload = { roleId };

    const observable: Observable<User[]> = this.userServiceClient.send<User[]>(pattern, payload);
    return firstValueFrom(observable);
  }

  async findAllActive(): Promise<User[]> {
    const pattern = { cmd: 'findAllActiveUsers' };

    const observable: Observable<User[]> = this.userServiceClient.send<User[]>(pattern, {});
    return firstValueFrom(observable);
  }
}