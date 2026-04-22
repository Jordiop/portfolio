export interface Album {
  id: number
  title: string
  artist: string
  year: number
  genre: string
  coverUrl: string
  spotifyUrl?: string
  appleMusicUrl?: string
  color: string
}

export function useMusic() {
  const albums: Album[] = [
    {
      id: 0,
      title: "To Pimp a Butterfly",
      artist: "Kendrick Lamar",
      year: 2015,
      genre: "Hip-Hop",
      coverUrl: "https://i.scdn.co/image/ab67616d00001e02cdb645498cd3d8a2db4d05e1",
      spotifyUrl: "",
      color: "#e0c97f"
    },
    {
      id: 1,
      title: "DAMN.",
      artist: "Kendrick Lamar",
      year: 2017,
      genre: "Hip-Hop",
      coverUrl: "https://i.scdn.co/image/ab67616d0000b2738b52c6b9bc4e43d873869699",
      spotifyUrl: "",
      color: "red"
    },
    {
      id: 2,
      title: "Toxicity",
      artist: "System of a Down",
      year: 2001,
      genre: "Metal",
      coverUrl: "https://m.media-amazon.com/images/I/81O5BH0QI4L._UF894,1000_QL80_.jpg",
      spotifyUrl: "",
      color: "#6b9fd4"
    },
    {
      id: 3,
      title: "Utopia",
      artist: "Travis Scott",
      year: 2023,
      genre: "Hip-Hop",
      coverUrl: "https://upload.wikimedia.org/wikipedia/en/2/23/Travis_Scott_-_Utopia.png",
      spotifyUrl: "",
      color: "#c97a9e"
    },
    {
      id: 4,
      title: "Kaos Nomada",
      artist: "Hard GZ",
      year: 2016,
      genre: "Hip-Hop",
      coverUrl: "https://i.scdn.co/image/ab67616d0000b2730dd473ac4f086520c7fcc9a9",
      spotifyUrl: "",
      color: "#52b788"
    },
    {
      id: 5,
      title: "Hybrid Theory",
      artist: "Linkin Park",
      year: 2000,
      genre: "Nu Metal",
      coverUrl: "https://i.scdn.co/image/ab67616d0000b2732cd7568f8895a3c031c2e2fb",
      spotifyUrl: "",
      color: "#f4845f"
    },
    {
      id: 6,
      title: "Rodeo",
      artist: "Travis Scott",
      year: 2015,
      genre: "Hip-Hop",
      coverUrl: "https://i.scdn.co/image/ab67616d0000b273d3b5affd8824b4ed301b7137",
      spotifyUrl: "",
      color: "#e0c97f"
    },
    {
      id: 7,
      title: "Good Kid, M.A.A.D City",
      artist: "Kendrick Lamar",
      year: 2012,
      genre: "Hip-Hop",
      coverUrl: "https://i.scdn.co/image/ab67616d0000b273d58e537cea05c2156792c53d",
      spotifyUrl: "",
      color: "#e0c97f"
    },
    {
      id: 8,
      title: "Me muevo con dios",
      artist: "Cruz Cafuné",
      year: 2023,
      genre: "Hip-Hop",
      coverUrl: "https://i.scdn.co/image/ab67616d00001e024102f96ba4b1df4dfe8bc35f",
      spotifyUrl: "",
      color: "#6b9fd4"
    },
    {
      id: 9,
      title: "Heroes & Villains",
      artist: "Metro Boomin",
      year: 2023,
      genre: "Hip-Hop",
      coverUrl: "https://i.scdn.co/image/ab67616d00001e02c4fee55d7b51479627c31f89",
      spotifyUrl: "",
      color: "#6b9fd4"
    }
  ]

  return { albums }
}
