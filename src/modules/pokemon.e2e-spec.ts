import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { PokemonModule } from './pokemon.module'
import { PokemonService } from '../services/pokemon.service'
import { mockDataBasedOnInputUrl, POKEMON_RESPONSE } from '../../__mock__/pokemon.factory'
import * as PokemonUtils from '../utils/pokemon.utils'

describe('PokemonController (e2e)', () => {
  let app: INestApplication
  const OLD_ENV = process.env

  beforeAll(() => {
    jest.resetModules()
    process.env.POKEMON_BASE_URL = 'https://test.pokeapi.co/api/v2'
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PokemonModule],
      providers: [PokemonService],
    }).compile()

    app = moduleFixture.createNestApplication()

    await app.init()
  })

  it('/pokemon (GET) success response', () => {
    jest.spyOn(PokemonUtils, 'fetchData').mockImplementation(mockDataBasedOnInputUrl)

    return request(app.getHttpServer())
      .get('/pokemon?limit=10&offset=0&type=psychic&noOfEvolutions=1')
      .expect(200, POKEMON_RESPONSE)
  })

  it('/pokemon (GET) missing query parameters cause bad request', () => {
    const BAD_REQUEST = {
      statusCode: 400,
      message: [
        'limit must not be greater than 20',
        'limit must be a number conforming to the specified constraints',
        'limit should not be empty',
        'offset must be a number conforming to the specified constraints',
        'offset should not be empty',
      ],
      error: 'Bad Request',
    }

    jest.spyOn(PokemonUtils, 'fetchData').mockImplementation(mockDataBasedOnInputUrl)

    return request(app.getHttpServer()).get('/pokemon').expect(BAD_REQUEST)
  })

  it('/pokemon (GET) internal server error', () => {
    const INTERNAL_SERVER_ERROR = {
      status: 500,
      error: 'Internal server error',
    }

    jest.spyOn(PokemonUtils, 'fetchData').mockImplementation(() => Promise.reject(null))

    return request(app.getHttpServer())
      .get('/pokemon?limit=10&offset=0&type=psychic&noOfEvolutions=1')
      .expect(500)
      .expect(INTERNAL_SERVER_ERROR)
  })
})
