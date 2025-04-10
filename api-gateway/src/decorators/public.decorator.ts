import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// src/proxy.controller.ts
import { Controller, All, Req, Res, Inject, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
import { Public } from './decorators/public.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller()
export class ProxyController {
    constructor(private readonly proxyService: ProxyService) {}

    // Public routes (no auth required)
    @Public()
    @All('auth/*')
    async authProxy(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardToService('AUTH_SERVICE', req, res);
    }

    // Secured routes
    @All('users/*')
    async usersProxy(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardToService('USER_SERVICE', req, res);
    }

    @UseGuards(RolesGuard)
    @Roles('hr', 'admin')
    @All('hr/*')
    async hrProxy(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardToService('HR_SERVICE', req, res);
    }

    @UseGuards(RolesGuard)
    @Roles('it', 'admin')
    @All('equipment/*')
    async equipmentProxy(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardToService('EQUIPMENT_SERVICE', req, res);
    }

    @All('tasks/*')
    async tasksProxy(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardToService('TASK_SERVICE', req, res);
    }
}
