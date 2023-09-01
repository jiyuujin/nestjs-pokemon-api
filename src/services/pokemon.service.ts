import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import {
  PokemonResponse,
  DetailedResult,
  PokemonRawResponse,
  PokemonSpeciesRawResponse,
} from '../interfaces/pokemon.interface'
import { fetchData, isArrayWithNonZeroLength } from '../utils/pokemon.utils'

@Injectable()
export class PokemonService {
  private extractSpeciesName(evolutionChain, collector): void {
    const {
      species: { name },
      evolves_to: evolvesTo,
    } = evolutionChain

    collector.push(name)

    if (isArrayWithNonZeroLength(evolvesTo)) {
      this.extractSpeciesName(evolvesTo[0], collector)
    }
  }

  private getEvolutionSequence(evolutionChain): string[] {
    const evolutionSequence = []

    this.extractSpeciesName(evolutionChain, evolutionSequence)

    return evolutionSequence
  }

  private getNumberOfEvolutions(evolutionSequence, name): number {
    if (!isArrayWithNonZeroLength(evolutionSequence)) {
      return 0
    }

    const indexOfName = evolutionSequence.indexOf(name)

    return evolutionSequence.length - 1 - indexOfName
  }

  private getPokemonGeneric(limit, offset): Promise<PokemonRawResponse> {
    const pokemonUrl = `${process.env.POKEMON_BASE_URL}/pokemon?offset=${offset}&limit=${limit}`

    return fetchData(pokemonUrl)
  }

  private getPokemonSpecies(id): Promise<PokemonSpeciesRawResponse> {
    const pokemonSpeciesUrl = `${process.env.POKEMON_BASE_URL}/pokemon-species/${id}`

    return fetchData(pokemonSpeciesUrl)
  }

  async getPokemon(limit, offset, type, noOfEvolutions): Promise<PokemonResponse> {
    try {
      const { next, previous, results } = await this.getPokemonGeneric(limit, offset)
      const evolutionData = {}
      let detailedResults: DetailedResult[] = await Promise.all(
        results.map(async ({ url: pokemonDetailUrl }): Promise<DetailedResult> => {
          const {
            name,
            id,
            types: typesRaw,
            sprites: {
              other: {
                'official-artwork': { front_default: imageUrl },
              },
            },
          } = await fetchData(pokemonDetailUrl)
          const types = typesRaw.map(({ type: { name } }) => name)

          if (type && !types.includes(type)) {
            return null
          }

          const {
            evolution_chain: { url: evolutionChainUrl },
          } = await this.getPokemonSpecies(id)

          if (!evolutionData[evolutionChainUrl]) {
            const { chain } = await fetchData(evolutionChainUrl)

            evolutionData[evolutionChainUrl] = this.getEvolutionSequence(chain)
          }

          const evolutionSequence = evolutionData[evolutionChainUrl]
          const numberOfEvolutions = this.getNumberOfEvolutions(evolutionSequence, name)

          if (noOfEvolutions != undefined && noOfEvolutions !== numberOfEvolutions) {
            return null
          }

          return {
            name,
            id,
            types,
            imageUrl,
            evolutionSequence,
            numberOfEvolutions,
          }
        }),
      )

      detailedResults = detailedResults.filter(Boolean)

      return { next, previous, detailedResults }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error?.message || 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
