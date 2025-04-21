import {Module} from '@nestjs/common';
import {DeviceAssignmentsController} from "@/modules/device-assignments/device-assignments.controller";
import {DeviceAssignmentsService} from "@/modules/device-assignments/device-assignments.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {DeviceAssignment} from "@/modules/device-assignments/entities/device-assignment.entity";
import {DeviceTransaction} from "@/modules/device-transactions/entities/device-transaction.entity";

@Module({
  imports: [TypeOrmModule.forFeature([DeviceAssignment, DeviceTransaction])],
  controllers: [DeviceAssignmentsController],
  providers: [DeviceAssignmentsService]
})
export class DeviceAssignmentsModule {
}
