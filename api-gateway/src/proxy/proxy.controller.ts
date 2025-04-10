import { Controller, All, Req, Res, Inject, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
import { Public } from '../decorators/public.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import {SERVICE_NAMES} from "@shared/constants/service-names.constant";

@Controller()
export class ProxyController {
    constructor(private readonly proxyService: ProxyService) {}

    // Public routes (no auth required)
    @Public()
    @All('auth/*')
    async authProxy(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardToService(SERVICE_NAMES.AUTH_SERVICE, req, res);
    }

    // Secured routes
    @All('users/*')
    async usersProxy(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardToService(SERVICE_NAMES.AUTH_SERVICE, req, res);
    }

    @UseGuards(RolesGuard)
    @Roles('it', 'admin')
    @All('equipment/*')
    async equipmentProxy(@Req() req: Request, @Res() res: Response) {
        return this.proxyService.forwardToService('EQUIPMENT_SERVICE', req, res);
    }
}