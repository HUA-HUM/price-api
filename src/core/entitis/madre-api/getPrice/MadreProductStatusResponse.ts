import { MadreProductStatusDto } from './dto/MadreProductStatusDto';

export interface MadreProductsStatusBulkResponse {
  items: MadreProductStatusDto[];
  total: number;
}
