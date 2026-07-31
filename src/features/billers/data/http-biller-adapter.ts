import type { Biller } from "@/features/billers/types";

export type ApiBiller = {
  readonly slug: string;
  readonly biller_name: string;
};

export type ApiBillerListResponse = {
  readonly data: {
    readonly billers: ApiBiller[];
  };
};

export type ApiCreateBillerResponse = {
  readonly data: {
    readonly biller: ApiBiller;
  };
};

export type ApiUpdateBillerResponse = ApiCreateBillerResponse;

export function mapBiller(apiBiller: ApiBiller): Biller {
  return {
    name: apiBiller.biller_name,
    slug: apiBiller.slug,
  };
}

export function mapBillerList(response: ApiBillerListResponse): Biller[] {
  return response.data.billers.map(mapBiller);
}

export function mapCreatedBiller(response: ApiCreateBillerResponse): Biller {
  return mapBiller(response.data.biller);
}

export function mapUpdatedBiller(response: ApiUpdateBillerResponse): Biller {
  return mapBiller(response.data.biller);
}
