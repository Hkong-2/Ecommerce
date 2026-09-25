import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Cổng này dùng để nhận ping từ UptimeRobot/Cron-job giúp server không bị ngủ
  // Bằng cách gọi vào CSDL (SELECT 1), ta đồng thời giữ Supabase không bị ngưng (Pause)
  @Get('health')
  async checkHealth() {
    const isDbAwake = await this.appService.checkDatabaseHealth();
    return {
      status: 'ok',
      dbStatus: isDbAwake ? 'awake' : 'failed',
      timestamp: new Date().toISOString(),
      message: 'Server and Database are awake!'
    };
  }
}
