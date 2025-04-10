import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';
import axios from 'axios';
import { SERVICE_NAMES } from "@shared/constants/service-names.constant";

@Injectable()
export class ProxyService {
    constructor(
        @Inject(SERVICE_NAMES.AUTH_SERVICE) private authService: ClientProxy,
        @Inject(SERVICE_NAMES.USER_SERVICE) private userService: any,
        @Inject(SERVICE_NAMES.ASM_SERVICE) private equipmentService: ClientProxy,
    ) {}

    async forwardToService(serviceName: string, req: Request, res: Response) {
        try {
            const path = req.path.replace(new RegExp(`^/${serviceName.split('_')[0].toLowerCase()}`), '');
            const method = req.method.toLowerCase();
            const body = req.body;
            const headers = req.headers;

            // Special case for USER_SERVICE as it's using HTTP
            if (serviceName === SERVICE_NAMES.USER_SERVICE) {
                const userServiceUrl = this.userService.url;
                try {
                    const response = await axios({
                        method,
                        url: `${userServiceUrl}${path}`,
                        data: body,
                        headers: {
                            ...headers,
                            'content-type': 'application/json',
                        },
                    });

                    return res.status(response.status).json(response.data);
                } catch (error) {
                    if (error.response) {
                        return res.status(error.response.status).json(error.response.data);
                    }
                    throw error;
                }
            }

            // For all other microservices using TCP communication
            const service = this[serviceName.charAt(0).toLowerCase() + serviceName.slice(1)];

            // Add user info from JWT to the request for service context
            if (req.user) {
                body.user = req.user;
            }

            const response = await lastValueFrom(
                service.send({ path, method }, { body, headers })
            );

            return res.status(HttpStatus.OK).json(response);
        } catch (error) {
            throw new HttpException(
                error.message || 'Service communication error',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
