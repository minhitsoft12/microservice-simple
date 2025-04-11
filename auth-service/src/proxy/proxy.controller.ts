import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProxyService } from './proxy.service';
import { CreateProxyDto } from './dto/create-proxy.dto';
import { UpdateProxyDto } from './dto/update-proxy.dto';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @MessagePattern('createProxy')
  create(@Payload() createProxyDto: CreateProxyDto) {
    return this.proxyService.create(createProxyDto);
  }

  @MessagePattern('findAllProxy')
  findAll() {
    return this.proxyService.findAll();
  }

  @MessagePattern('findOneProxy')
  findOne(@Payload() id: number) {
    return this.proxyService.findOne(id);
  }

  @MessagePattern('updateProxy')
  update(@Payload() updateProxyDto: UpdateProxyDto) {
    return this.proxyService.update(updateProxyDto.id, updateProxyDto);
  }

  @MessagePattern('removeProxy')
  remove(@Payload() id: number) {
    return this.proxyService.remove(id);
  }
}
