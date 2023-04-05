export interface HydraCollection<T = any> extends HydraId, HydraType{
  '@context': string;
  'hydra:totalItems': number;
  'hydra:member': T[];
  'hydra:view': {
    '@id': string;
    '@type': string;
  };
}

export interface HydraError extends HydraType{
  '@context': string;
  'hydra:description': string;
  'hydra:title': string;
  trace: HydraErrorTrace[]
}

export interface HydraErrorTrace {
  args: string[];
  class: string;
  file: string;
  line: number;
  namespace: string;
  short_class: string;
  type: string;
}

export interface HydraId {
  '@id'?: string;
}

export interface HydraType {
  '@type'?: string;
}
