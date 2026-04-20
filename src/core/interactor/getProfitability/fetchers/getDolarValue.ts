import { Inject, Injectable } from '@nestjs/common';
import {
  GET_DOLAR_REPOSITORY,
} from 'src/core/adapters/getDolar/IGetDolarRepository';
import type { IGetDolarRepository } from 'src/core/adapters/getDolar/IGetDolarRepository';
import { DolarEntity } from 'src/core/entitis/getDolar/DolarEntity';

@Injectable()
export class GetDolarValueInteractor {
  constructor(
    @Inject(GET_DOLAR_REPOSITORY)
    private readonly repository: IGetDolarRepository,
  ) {}

  async execute(): Promise<DolarEntity> {
    return this.repository.getOfficial();
  }
}
