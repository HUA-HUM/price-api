export interface TaxCategory {
  id: number;
  id_mla: string;
  categoria_arancelaria: string;
  die: number;
  te: number;
  iva: number;
  derechos: number;
  composicion_conf_automeli_iva: number;
  composicion_conf_automeli_imp2: number;
  composicion_conf_automeli_imp3: number;
  compuesto: number | null;
  codigo_categoria_automeli: string;
}
