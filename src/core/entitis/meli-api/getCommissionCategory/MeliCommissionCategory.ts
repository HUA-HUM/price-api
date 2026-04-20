export interface MeliCommissionCategoryEntity {
  percentage: number;
  fixedFee: number | null;
  grossAmount: number | null;
  totalPercentage?: number | null;
  financingAddOnFee?: number | null;
}
