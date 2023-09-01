import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common'
import { PokemonService } from '../services/pokemon.service'
import { PokemonQueryParams } from '../validators/pokemon.validator'
import { PokemonResponse } from '../interfaces/pokemon.interface'

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {
    //
  }

  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async getPokemon(@Query() pokemonQueryParams: PokemonQueryParams): Promise<PokemonResponse> {
    const { limit, offset, type, noOfEvolutions } = pokemonQueryParams

    return this.pokemonService.getPokemon(limit, offset, type, noOfEvolutions)
  }
}
