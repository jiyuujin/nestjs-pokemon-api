import * as dotenv from 'dotenv'
import helmet from 'helmet'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './modules/app.module'

dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })

  app.use(helmet())

  const options = new DocumentBuilder()
    .setTitle('Pokemon API')
    .setDescription('A publicly available service to fetch pokemon')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('api', app, document)

  await app.listen(process.env.PORT || 8080)
}

bootstrap()
