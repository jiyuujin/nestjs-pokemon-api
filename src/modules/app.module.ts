import { CacheModule, Module, CacheInterceptor } from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { AppController } from '../controllers/app.controller'
import { AppService } from '../services/app.service'

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        ttl: Number(process.env.THROTTLE_TTL),
        limit: Number(process.env.THROTTLE_LIMIT),
      }),
    }),
    CacheModule.registerAsync({
      useFactory: () => ({
        ttl: Number(process.env.CACHE_TTL),
        max: Number(process.env.CACHE_MAX_ITEMS),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {
  //
}
