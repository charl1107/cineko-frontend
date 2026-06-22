const ANILIST_API = "https://graphql.anilist.co"

const RELATIONS_QUERY = `
  query($idMal: Int) {
    Media(idMal: $idMal) {
      id
      title { romaji english }
      relations {
        edges {
          relationType
          node {
            id
            title { romaji english }
            type
            episodes
            idMal
          }
        }
      }
    }
  }
`

export interface AniListNode {
  id: number
  title?: { romaji?: string; english?: string }
  type: string
  episodes?: number
  idMal?: number
}

export interface AniListMedia {
  id: number
  title?: { romaji?: string; english?: string }
  relations?: { edges: { relationType: string; node: AniListNode }[] }
}

export async function fetchAniListRelations(malId: string | number): Promise<AniListMedia | null> {
  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: RELATIONS_QUERY,
      variables: { idMal: Number(malId) },
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`AniList ${res.status}: ${text.slice(0, 200)}`)
  }

  const json = await res.json()
  return (json.data?.Media as AniListMedia) || null
}

export interface SeasonItem {
  number: number
  name: string
  malId?: number
  isCurrent: boolean
  relation: string
}

export function buildSeasonList(media: AniListMedia | null, currentTitle: string): SeasonItem[] {
  if (!media) return []

  const edges = media.relations?.edges || []
  const items: SeasonItem[] = []

  for (const edge of edges) {
    const type = (edge.relationType || "").toUpperCase()
    if (type !== "PREQUEL" && type !== "SEQUEL") continue
    const node = edge.node
    if (node.type !== "ANIME") continue

    items.push({
      number: 0,
      name: node.title?.english || node.title?.romaji || "Unknown",
      malId: node.idMal,
      isCurrent: false,
      relation: type,
    })
  }

  items.push({
    number: 0,
    name: currentTitle,
    malId: undefined,
    isCurrent: true,
    relation: "CURRENT",
  })

  const order: Record<string, number> = { PREQUEL: 0, CURRENT: 1, SEQUEL: 2 }
  items.sort((a, b) => (order[a.relation] ?? 1) - (order[b.relation] ?? 1))
  items.forEach((item, i) => { item.number = i + 1 })

  return items
}
