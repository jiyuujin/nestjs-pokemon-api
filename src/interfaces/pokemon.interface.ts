export interface PokemonResponse {
  next: string | null
  previous: string | null
  detailedResults: DetailedResult[]
}

export interface DetailedResult {
  name: string
  id: number
  types: string[]
  imageUrl: string
  evolutionSequence: string[]
  numberOfEvolutions: number
}

export interface PokemonRawResponse {
  next: string | null
  previous: string | null
  results: any
}

interface EvolutionChain {
  url: string
}

export interface PokemonSpeciesRawResponse {
  evolution_chain: EvolutionChain
}
