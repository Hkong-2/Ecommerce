import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface GhnResponse<T> {
  data: T;
}

interface GhnProvince {
  ProvinceID: number;
  ProvinceName: string;
}

interface GhnDistrict {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
}

interface GhnWard {
  WardCode: string;
  DistrictID: number;
  WardName: string;
}

@Injectable()
export class ShippingService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getProvinces() {
    const response = await firstValueFrom(
      this.httpService.get<GhnResponse<GhnProvince[]>>(
        `${this.getBaseUrl()}/master-data/province`,
        { headers: this.getTokenHeaders() },
      ),
    );

    return response.data.data.map((province) => ({
      id: province.ProvinceID,
      name: province.ProvinceName,
    }));
  }

  async getDistricts(provinceId: number) {
    const response = await firstValueFrom(
      this.httpService.post<GhnResponse<GhnDistrict[]>>(
        `${this.getBaseUrl()}/master-data/district`,
        { province_id: provinceId },
        { headers: this.getTokenHeaders() },
      ),
    );

    return response.data.data.map((district) => ({
      id: district.DistrictID,
      provinceId: district.ProvinceID,
      name: district.DistrictName,
    }));
  }

  async getWards(districtId: number) {
    const response = await firstValueFrom(
      this.httpService.post<GhnResponse<GhnWard[]>>(
        `${this.getBaseUrl()}/master-data/ward`,
        { district_id: districtId },
        { headers: this.getTokenHeaders() },
      ),
    );

    return response.data.data.map((ward) => ({
      code: String(ward.WardCode),
      districtId: ward.DistrictID,
      name: ward.WardName,
    }));
  }

  private getBaseUrl() {
    const configuredBaseUrl = this.configService.get<string>('GHN_BASE_URL');
    if (configuredBaseUrl) {
      return configuredBaseUrl.replace(/\/$/, '');
    }

    const legacyFeeUrl = this.configService.get<string>('GHN_API_URL');
    if (legacyFeeUrl) {
      return legacyFeeUrl
        .replace(/\/v2\/shipping-order\/fee\/?$/, '')
        .replace(/\/$/, '');
    }

    return 'https://online-gateway.ghn.vn/shiip/public-api';
  }

  private getTokenHeaders() {
    const token = this.configService.get<string>('GHN_API_TOKEN');
    if (!token) {
      throw new InternalServerErrorException('Chưa cấu hình GHN_API_TOKEN');
    }

    return {
      Token: token,
      token,
      'Content-Type': 'application/json',
    };
  }
}
