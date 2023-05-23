import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Controller()
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @MessagePattern('createSupplier')
  create(@Payload() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @MessagePattern('findAllSupplier')
  findAll() {
    return this.supplierService.findAll();
  }

  @MessagePattern('findOneSupplier')
  findOne(@Payload() id: number) {
    return this.supplierService.findOne(id);
  }

  @MessagePattern('updateSupplier')
  update(@Payload() updateSupplierDto: UpdateSupplierDto) {
    return this.supplierService.update(updateSupplierDto.id, updateSupplierDto);
  }

  @MessagePattern('removeSupplier')
  remove(@Payload() id: number) {
    return this.supplierService.remove(id);
  }
}
